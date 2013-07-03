define([
  'underscore',
  'libs/canvas/pixel',
  'libs/binpacker',
  'libs/packnode'
],function(
  __,
  pixel,
  BinPack,
  Node
){
  function HorizonPack () {
    this.w    = 0;
    this.h    = 1;
    this.hori =
    this.used = [];
    this.type = 'HorizonPack';
  }
  var hpfn = HorizonPack.prototype;
  hpfn.pack = function( imgs ){
    var self = this;
    _.each(imgs,function( imgdata ){
      var w = imgdata.w || imgdata.width;
      var h = imgdata.h || imgdata.height;
      var node = new Node(self.w, 0, w, h, imgdata );
      node.used = true;
      self.used.push( node );
      self.w += w;
    });
  };
  hpfn.draw = function( ctx ) {
    _.each(this.used,function( node ) {
      node.draw( ctx );
    });
  };


  function VerticalPack () {
    this.w    = 1;
    this.h    = 0;
    this.vert =
    this.used = [];
    this.type = 'VerticalPack'
  }
  var vpfn = VerticalPack.prototype;
  vpfn.pack = function( imgs ){
    var self = this;
    _.each(imgs,function( imgdata ){
      var w = imgdata.w || imgdata.width;
      var h = imgdata.h || imgdata.height;
      var node = new Node(0, self.h, w, h, imgdata );
      node.used = true;
      self.used.push( node );
      self.h += h;
    });
  }

  vpfn.draw = hpfn.draw;

  function FinPack () {
    this.w      = 0;
    this.h      = 0;
    // HorizonPack
    // VerticalPack
    // BinPack
    // Bin-HorizonPack
    // Bin-VerticalPack
    this.type   = 'FinPack';
    this.used   = [];
    this.bins   = [];
    this.hori   = [];
    this.vert   = [];

    this.minwidth  = 300;
    this.minheight = 300;
  }
  var pfn = FinPack.prototype;
  pfn.addPack = function( pack ) {
    if( pack.hori ){
      this.hori = this.hori.concat(pack.hori);
    }
    if( pack.vert ){
      this.vert = this.vert.concat(pack.vert);
    }
    if( pack.bins ){
      this.bins = this.bins.concat(pack.bins);
    }
    if( pack.minwidth && this.minwidth ){
      this.minwidth = Math.max( this.minwidth, pack.minwidth );
    }
    if( pack.minheight && this.minheight ){
      this.minheight = Math.max( this.minheight, pack.minheight );
    }
    this.updateType();
    return this;
  }
  pfn.updateType = function() {
    var types = [];
    this.bins.length && types.push('Bin');
    this.hori.length && types.push('Horizon');
    this.vert.length && types.push('Vertical');

    this.type = types.join('-')+'Pack';
    return this;
  }
  pfn.updateLayout = function() {
    var self = this;
    var imgs = [['bins',BinPack], ['hori',HorizonPack], ['vert',VerticalPack]]
                .filter(function(k){
                  return self[k[0]].length != 0;
                }).map(function( k ) {
                  k.push(
                    _.flatten(
                      self[k[0]]
                        .map(function( node ) {
                          return node.imgdata;
                        }) ) );
                  return k; 
                });
    
    var finpack = new BinPack();
    var papers =  imgs.map(function( k ) {
                    var packer = new k[1];
                    packer.pack(k[2]);
                    var paper = new pixel.Canvas( 
                                  k[0] == 'vert' ? self.minwidth : packer.w,
                                  k[0] == 'hori' ? self.minheight: packer.h
                                );
                    packer.draw(paper.ctx);
                    if( k[0] == 'vert' ){
                      paper.ctx.drawImage(paper.canvas,
                        0, 0, 1,           paper.height,
                        0, 0, paper.width, paper.height);
                    } else if ( k[0] == 'hori' ){
                      paper.ctx.drawImage(paper.canvas,
                        0, 0, paper.width, 1,       
                        0, 0, paper.width, paper.height);
                    }
                    paper.type   = k[0];
                    paper.source = packer.used;
                    return paper;
                  });
    finpack.pack(papers);
    finpack.root.walk(function(node){
      if( node.used ){
        var source = node.imgdata.source;
        var m;
        for(var i = 0, n = source.length; m = source[i], i<n;i++){
          m.x = m.x ? m.x + node.x : node.x ;
          m.y = m.y ? m.y + node.y : node.y ;
        }
      }
    });
    this.layout = finpack;

    return this;
  }
  pfn.eachNode = function( handle ){
    this.bins.forEach(handle);
  }
  pfn.draw = function( ctx ) {
    if( !this.layout ){
      this.updateLayout();
    }
    this.layout.draw( ctx );
  };
  pfn.map = function (handle){
    if( !this.layout ){
      this.updateLayout();
    }
    this.layout.root.walk(function(node){
      if( node.used ){
        var source = node.imgdata.source;
        var key    = node.imgdata.type;
        for ( var i = 0, n = source.length; i < n; i ++ ){
          handle.call( source[i], source[i], key );
        }
      }
    });
  }
  return {
    HorizonPack  : HorizonPack,
    VerticalPack : VerticalPack,
    FinPack      : FinPack,
    BinPack      : BinPack
  };
});