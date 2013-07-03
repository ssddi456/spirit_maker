define([
  'underscore',
  'libs/packnode'
],function(
  __,
  Node
){
  function BinPack ( w, h ){
    this.w = w;
    this.h = h;
    this.root = undefined;
    this.type = 'BinPack';
    // keep interface
    this.bins = 
    this.used = [];
  }
  var fn = BinPack.prototype;
  fn.pack = function( imgs ){
    var len = imgs.length;
    var maxH = 0;
    var maxW = 0;
    // predicate an rect with avg size of all box
    // usually this is not big enough 
    if( !this.w && !this.h ){
      var total =_.reduce(imgs,function( pre, img ){
        maxH = Math.max(maxH,img.height);
        maxW = Math.max(maxW,img.width);
        return { 
          w : pre.w + img.width,
          h : pre.h + img.height
        }
      },{
        w : 0,
        h : 0
      });
      imgs = imgs.sort(function( a,b ){
        return b.height - a.height;
      });
      var arvg = {
        w : total.w/len,
        h : total.h/len
      }
      var sq = Math.sqrt(len);
      // at least, it must contain the edge size
      this.w = Math.max( maxW, Math.ceil( arvg.w * sq ) );
      this.h = Math.max( maxH, Math.ceil( arvg.h * sq ) );
    }

    this.root = new Node();
    this.root.w = this.w;
    this.root.h = this.h;
    
    // use temp arrs to acc up tracing
    var unused = this.unused = [ this.root ];
    var i = 0, img, node, errors = [];
    for(; i < len; i++){
      img = imgs[i];
      node = this.fit( imgs[i] );
      if( node ){
        node.split( img );
        this.used.push(node);
        unused.splice( unused.indexOf(node), 1);
        unused.push( node.right );
        unused.push( node.down  );
      } else {
        this.grow( img );
      }
    }
    // remove temp arr;
    this.unused = undefined;

    // trim outer white space
    _.extend(this, this.getBBox());
  };
  fn.draw = function ( ctx ){

    for(var i = 0, n = this.used.length, node; node = this.used[i],  i< n; i++){
      node.draw( ctx );
    }
    
  }
  // if an image cannot fit in to any node, we should grow the canvas
  // use new img as root node, set prev root as an child
  // then add an empty node to keep the tree structure
  fn.grow = function( imgdata ){
    if( !this.unused ){
      return;
    }
    var bbox = this.getBBox();
    var newroot = new Node();
    var oldroot = this.root;
    oldroot.upleft = newroot;
    this.root = newroot;

    newroot.used = true;
    newroot.imgdata  = imgdata;
    newroot.w = imgdata.width;
    newroot.h = imgdata.height;

    this.w = Math.max(this.w, imgdata.width);
    this.h = Math.max(this.h, imgdata.height);

    if( imgdata.height <= imgdata.width ){
      // grow height
      newroot.right = new Node({
        h      : imgdata.height,
        x      : imgdata.width,
        w      : this.w - newroot.w,
        upleft : newroot
      });


      newroot.down = oldroot;

      oldroot.upleft = newroot;
      
      this.used.push( newroot );
      this.unused.push( newroot.right );

      // move all down
      oldroot.walk(function( node ){
        node.y += newroot.h; 
      });
    } else {
      // grow width
      newroot.down = new Node({
        h      : this.h - newroot.h,
        w      : imgdata.width,  
        y      : imgdata.height,
        upleft : newroot
      });
      
      newroot.right = oldroot;

      oldroot.upleft = newroot;

      this.used.push( newroot );
      this.unused.push( newroot.down );

      // move all to right
      oldroot.walk(function(node){
        node.x += newroot.w;
      });
    }


  };
  fn.fit  = function( img ){
    if( this.used ){
      var minfit = Infinity;
      var fit;
      for(var i = 0, n = this.unused.length, node; node = this.unused[i], i< n;i++){
        if( node.fit( img )){
          var delta = node.w * node.h - img.width * img.height;
          if( delta == Math.min(delta, minfit) ){
            minfit = delta;
            fit = node;
          }
        };
      }

      return fit;
    }
  };
  // get the really used square size 
  fn.getBBox = function(){
    var maxW = 0;
    var maxH = 0;
    this.root.walk(function( item ) {
      if(item.used){
        var w = item.x + item.w;
        var h = item.y + item.h;
        if( 
          !maxH && maxH !== 0 ||
          !maxW && maxW !== 0 ||
          !w    && w    !== 0 ||
          !h    && h    !== 0 
        ){
          throw item
        }
        maxH = Math.max( maxH, item.y + item.h );
        maxW = Math.max( maxW, item.x + item.w );
      }
    });
    return {
      w : maxW,
      h : maxH
    }
  }

  return BinPack;
});