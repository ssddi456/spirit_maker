
// dived a bg into squared pieces
// scalable right + left
// scalable top   + bottom
// scalable two direction
define([
  './pixel'
],function(
  pixel
){
  function SquaredCanvas ( img ) {
    this.basecanvas = new pixel.Canvas( img );
  }
  var scfn = SquaredCanvas.prototype;
  scfn.setImage = function( img ) {
    var bcanvas = this.basecanvas.canvas;
    bcanvas.height = img.height;
    bcanvas.width  = img.width;

    this.basecanvas.ctx.drawImage( img, 0, 0);
    return this;
  }
  scfn.setBorder = function(up, right, down, left) {
    if( !arguments.length ){
      return;
    }

    this.up = up;
    switch (arguments.length){
      case 1:
        // global
        this.right =
        this.left  =
        this.down  = up;
        break;
      case 2:
        // up-down, right-left
        this.down  = up;
        this.right = 
        this.left  = right;
        break;
      case 3:
        // up right-left down
        this.down  = down;
        this.right = 
        this.left  = right;
        break;
      case 4:
        // up right left dowm
        this.right = right;
        this.left  = left;
        this.down  = down;
        break;
      default:
        return;
    }
    // type save
    this.up    = 1*this.up; 
    this.right = 1*this.right; 
    this.down  = 1*this.down; 
    this.left  = 1*this.left;

    this.updateBorders();
    return this;
  }

  scfn.updateBorders = function() {
    var bcanvas = this.basecanvas;
    var w  = bcanvas.canvas.width;
    var h  = bcanvas.canvas.height;
    var mw = w - this.left - this.right;
    var mh = h - this.up   - this.down;

    var splited = 
    this.splited = {
      upleft    : bcanvas.subCanvas( 0,              0,          this.left,  this.up ),
      upmid     : bcanvas.subCanvas( this.left,      0,          mw,         this.up ),
      upright   : bcanvas.subCanvas( this.left + mw, 0,          this.right, this.up ),

      midleft   : bcanvas.subCanvas( 0,              this.up,    this.left,  mh ),
      mid       : bcanvas.subCanvas( this.left,      this.up,    mw,         mh ),
      midright  : bcanvas.subCanvas( this.left+mw,   this.up,    this.right, mh ),
      
      downleft  : bcanvas.subCanvas( 0,              this.up+mh, this.left,  this.down ),
      downmid   : bcanvas.subCanvas( this.left,      this.up+mh, mw,         this.down ),
      downright : bcanvas.subCanvas( this.left+mw,   this.up+mh, this.right, this.down )
    };
    
    _.each(splited,function( node, pos ) {
      node.pos = 'squared_' + pos;
    });

  };
  function ScalableHorizon() {
    SquaredCanvas.apply( this, arguments );
  }
  var shfn = ScalableHorizon.prototype;
  shfn.setImage = scfn.setImage;
  shfn.setBorder= function( left, right ) {
    if(!arguments.length){
      return;
    }

    switch( arguments.length ){
      case 1 :
        this.left  =
        this.right = left;
      break;
      case 2:
        this.left  = left;
        this.right = right;
      break;
    }

    // type save
    this.right = 1*this.right; 
    this.left  = 1*this.left;

    this.updateBorders();
  };

  shfn.updateBorders = function() {
    var bcanvas = this.basecanvas;
    var w  = bcanvas.canvas.width;
    var h  = bcanvas.canvas.height;
    var mw = w - this.left - this.right;

    var splited = this.splited = {
      left    : bcanvas.subCanvas( 0,              0, this.left,  h ),
      mid     : bcanvas.subCanvas( this.left,      0, mw,         h ),
      right   : bcanvas.subCanvas( this.left + mw, 0, this.right, h )
    };
    _.each(splited,function(node, pos ) {
      node.pos = 'hori_' + pos;
    });
  };


  function ScalableVertical() {
    SquaredCanvas.apply( this, arguments );
  }
  var svfn = ScalableVertical.prototype;
  svfn.setImage = scfn.setImage;
  svfn.setBorder= function( up, down ) {
    if(!arguments.length){
      return;
    }

    switch( arguments.length ){
      case 1 :
        this.up  =
        this.down = up;
      break;
      case 2:
        this.up  = up;
        this.down = down;
      break;
    }
    // type save
    this.up    = 1*this.up; 
    this.down  = 1*this.down; 
    
    this.updateBorders(); 
  };

  svfn.updateBorders = function() {
    var bcanvas = this.basecanvas;
    var w  = bcanvas.canvas.width;
    var h  = bcanvas.canvas.height;
    var mh = h - this.up   - this.down;

    var splited = this.splited = {
      up     : bcanvas.subCanvas( 0, 0,           w,  this.up ),
      mid    : bcanvas.subCanvas( 0, this.up,     w,  mh ),
      down   : bcanvas.subCanvas( 0, this.up+mh,  w,  this.down )
    };
    _.each(splited,function(node, pos ) {
      node.pos = 'vert_' + pos
    });
  };
  return {
    Squared          : SquaredCanvas,
    ScalableHorizon  : ScalableHorizon,
    ScalableVertical : ScalableVertical
  };
});