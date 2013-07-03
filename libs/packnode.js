define([

],function(

){
  // bin tree nodes
  function Node ( x, y, w, h, imgdata ){

    this.right = undefined;
    this.down  = undefined;
    this.upleft= undefined;

    if( arguments.length == 1){
      _.extend(this,{
        x : 0,
        y : 0,
        w : 0,
        h : 0
      },x);
    } else{
      this.x = x || 0; 
      this.y = y || 0; 
      this.w = w || 0; 
      this.h = h || 0; 
      this.imgdata = imgdata;
    }

    if( 
      (!this.x && this.x !== 0) ||
      (!this.y && this.y !== 0) ||
      (!this.w && this.w !== 0) ||
      (!this.h && this.h !== 0) 
    ){
      throw this
    }
  }
  var nfn = Node.prototype;
  nfn.split = function( imgdata ){
    if( imgdata.nodeName ){
      switch ( imgdata.nodeName ){
        case 'IMG'   :
          var _imgdata = {
            img : imgdata
          }
          break;
        case 'CANVAS':
          var _imgdata = {
            canvas : imgdata
          }
          break;
      }
      _imgdata.width  = imgdata.width;
      _imgdata.height = imgdata.height;
      imgdata = _imgdata
    }

    this.down = new Node({
      w      : this.w,
      h      : this.h - imgdata.height,
      x      : this.x,
      y      : imgdata.height + this.y,
      upleft : this
    });

    this.right = new Node({
      w      : this.w - imgdata.width,
      h      : imgdata.height,
      x      : imgdata.width + this.x,
      y      : this.y,
      upleft : this
    });

    _.extend(this,{
      imgdata  : imgdata,
      used     : true,
      w        : imgdata.width,
      h        : imgdata.height
    })
  }
  nfn.fit  = function( img ){
    // deep first search
    if( this.used ){
      return this.right.fit( img ) || this.down.fit( img );
    }
    // check
    if( img.width <= this.w && img.height <= this.h ){
      return this; 
    }
  }
  var n = 3;
  // draw if fill with a img
  nfn.draw = function(ctx){
    if( this.imgdata ){
      ctx.drawImage(this.imgdata.img || this.imgdata.canvas,
        this.x, this.y);

      /*/ 
      // for dump test
      ctx.strokeRect(this.x, this.y, this.w, this.h);
      var canvas    = document.createElement('canvas');
      ctx           = canvas.getContext('2d');
      canvas.width  = this.w;
      canvas.height = this.h;
      ctx.drawImage( this.imgdata.img || this.imgdata.canvas,0,0);
      document.body.appendChild(canvas);
      /**/
    }
  }
  nfn.walk = function(handle){
    handle.call( this, this );
    // deap first
    if( this.right ){
      this.right.walk(handle);
    }
    if( this.down ){
      this.down.walk(handle);
    }
  }
  nfn.toJSON = function(){
    // prevent circle reference
    return {
      w : this.w,
      h : this.h,
      x : this.x,
      y : this.y,
      down : this.down.toJSON(),
      right: this.right.toJSON()
    }
  }

  return Node;  
});