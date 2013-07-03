define([
],function(
){
  function fileName ( filename ) {
    return filename.split('&').shift()
              .split('?').shift()
              .split('#').shift()
              .split('/').pop()
  }
  function Pixel ( r, g, b, a ){
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  var pxfn = Pixel.prototype;
  pxfn.equal = function( pixel ){
    return pixel.r == this.r &&
           pixel.g == this.g &&
           pixel.b == this.b &&
           pixel.a == this.a;
  }

  function EditablePixel ( r, g, b, a){
    this.origin = new Pixel(r,g,b,a);
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  var efn = EditablePixel.prototype;
  efn.isChanged = function(){
    return  !this.origin.equal(this);
  }
  efn.equal = pxfn.equal;
  efn.save = function(){
    this.origin.r = this.r;
    this.origin.g = this.g;
    this.origin.b = this.b;
    this.origin.a = this.a;
  }
  function Canvas( w, h) {
    if( w.nodeName){
      if( w.nodeName == "CANVAS" ){
        var canvas = w;
        if( canvas.name ){
          this.name = canvas.name;
        }
      } else if( w.nodeName == 'IMG'){
        var canvas = document.createElement('canvas');
        var img = w;
        if ( img.src ){
          this.name = fileName( decodeURIComponent(img.src) );
        }
        canvas.width  = img.width ;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage( img, 0, 0 );
      }
      this.source = w.source || w;
    } else {
      var canvas = document.createElement('canvas');
      canvas.width  = w || 400;
      canvas.height = h || 300;
    }
    var ctx = canvas.getContext('2d');
    this.width  = canvas.width;
    this.height = canvas.height;
    this.canvas = canvas;
    this.ctx    = ctx;      
  }
  var cfn = Canvas.prototype;
  cfn.subCanvas = function(top, left, width, height) {
    var ret = new Canvas(width,height);
    console.log( 'subCanvas', arguments );
    if( this.name ){
      ret.name = this.name;
    }
    if( this.source ){
      ret.source = this.source;
    }
    ret.ctx.drawImage( this.canvas, 
      top, left, width, height,
      0,   0,    width, height);
    return ret;
  }
  cfn.drawTo = function( canvas, optns ) {
    var ret = new Canvas(canvas);


    if( optns ){
      if( optns.height && optns.width ){
        ret.canvas.width  = optns.width;
        ret.canvas.height = optns.height;
        ret.ctx.drawImage( this.canvas, 
            0, 0, this.canvas.width, this.canvas.height,
            0, 0, optns.width,       optns.height);
        return ret;
      } else if ( optns.maxheight || optns.maxwidth ){
        var r;

        var rw = (optns.maxwidth  || Infinity )/ this.canvas.width;
        var rh = (optns.maxheight || Infinity )/ this.canvas.height;
        r = Math.min( Math.min( rw, rh ), 1);

        var w  = this.canvas.width  * r;
        var h  = this.canvas.height * r;
        ret.canvas.width = w;
        ret.canvas.height= h;
        ret.ctx.drawImage( this.canvas, 
            0, 0, this.canvas.width, this.canvas.height,
            0, 0, w,                 h);
        return ret;
      }
    }
     
    ret.canvas.width = this.canvas.width;
    ret.canvas.height = this.canvas.height;
    ret.ctx.drawImage( this.canvas, 0, 0);
    return ret;
  };
  cfn.toBase64=function() {
    return this.canvas.toDataURL().replace(/^data:image\/png;base64,/,'');
  };

  cfn.clean = function() {
    this.ctx.clearRect( 0, 0, this.width, this.height );  
  }
  // build a empty canvas
  function PixelCanvas ( w, h ){
    Canvas.call( this, w, h );

    w = this.canvas.width;
    h = this.canvas.height;

    this.pixels = [];
    var imgdata  = this.ctx.getImageData(0,0,w,h);
    this.imgdata = imgdata;
    var data = this.imgdata.data;
    var xi, yi, row,
        offset = 0;

    for( yi = 0; yi < h; yi ++){
      row = [];
      this.pixels.push(row);
      for(xi = 0; xi < w;xi ++){
        row.push( 
          new EditablePixel(
            data[offset++],
            data[offset++],
            data[offset++],
            data[offset++]
          )
        );
      }
    }
  }
  var pcfn =PixelCanvas.prototype;
  
  pcfn.subCanvas = cfn.subCanvas;
  pcfn.drawTo    = cfn.drawTo;
  pcfn.toBase64  = cfn.toBase64;
1
  pcfn.updateImageData = function(){
    var w = this.canvas.width;
    var h = this.canvas.height;
    var yi, xi, row, pixel,
    pixels = this.pixels;
    var offset = 0;
    var data = this.imgdata;
    for( yi = 0; yi < h; yi ++){
      row = pixels[yi];
      for(xi = 0; xi < w;xi ++){
        pixel = row[xi];
        if( pixel.isChanged() ){
          data[offset]   = pixel.r;
          data[offset+1] = pixel.g;
          data[offset+2] = pixel.b;
          data[offset+3] = pixel.a;
          pixel.save();
        }

        offset += 4;
      }
    }
  }
  pcfn.reload = function(){
    var w = this.canvas.width;
    var h = this.canvas.height;
    this.imgdata = this.ctx.getImageData( 0, 0, w, h );
    var data = this.imgdata.data;
    var xi, yi, row, pixel,
    offset = 0;

    for( yi = 0; yi < h; yi ++){
      row = this.pixels[yi];
      for(xi = 0; xi < w;xi ++){
        pixel = row[xi];
        pixel.r = data[offset++];
        pixel.g = data[offset++];
        pixel.b = data[offset++];
        pixel.a = data[offset++];
        pixel.save();
      }
    }
  }
  pcfn.getRow = function( n ){
    return this.pixels[n];
  }
  pcfn.getCol = function( n ){
    return this.pixels.reduce(function( pre, row ){
      pre.push(row[n]);
      return pre;
    },[]);
  }
  // remove same color border
  pcfn.trim = function(){
    var top    = 0;
    var ti, bi, ii, xlen = this.canvas.width, ylen = this.canvas.height;
    var row, col, smpl;
    var bottom = ylen;
    // from top to bottom
    for(ti = 0; ti < ylen ; ti++){
      row = this.getRow(ti);
      // init sample
      ii = 0;
      if( !smpl ){
        smpl= row[0];
        ii = 1;
      }
      // if set bg then check if is bgcolor
      if( this.bgcolor ){
        // smpl
        if( !this.bgcolor.equal(smpl) ){
          smpl = this.bgcolor;
          break;
        }
      } 

      // check each row
      for( ; ii < xlen; ii++ ){
        // if not same with bg  
        if ( !smpl.equal( row[ii]) ){
          // stop col scan
          top = ti;
          break;
        }
      }
      // if have a break, exit row loop
      if( ii != xlen ){
        break;
      }
    }
    // 
    for ( bi = ylen - 1; bi > top; bi-- ){
      row = this.getRow(bi);
      for(ii = 0; ii < xlen; ii++ ){
        if( !smpl.equal( row[ii] ) ){
          bottom = bi + 1;
          break;
        }
      }
      if( ii != xlen ){
        break;
      }
    }
    var left   = 0;
    var right  = 0;
    var li, ri;
    // check left and right
    // left boundry
    for ( li = 0; li < xlen; li ++ ){
      col = this.getCol(li);
      for(ii = top; ii < bottom; ii++ ){
        if( !smpl.equal(col[ii]) ){
          left = li;
          break;
        }
      }
      if( ii != bottom ){
        break;
      }
    }
    // right boundry
    for ( ri = xlen -1 ; ri > left; ri -- ){
      col = this.getCol(ri);
      for(ii = top; ii < bottom; ii ++){
        if( !smpl.equal(col[ii]) ){
          right = ri + 1;
          break;
        }
      }
      if( ii != bottom ){
        break;
      }
    }
    
    this.bbox = {
      left   : left,
      right  : right,
      top    : top,
      bottom : bottom,
      width  : right  - left,
      height : bottom - top
    };
    
    var newcanvas = document.createElement('canvas');
    newcanvas.width = this.bbox.width;
    newcanvas.height= this.bbox.height;

    newcanvas.getContext('2d')
      .drawImage(this.canvas, 
        left, top, newcanvas.width, newcanvas.height,
        0,    0,   newcanvas.width, newcanvas.height);
    if( this.name ){
      newcanvas.name = this.name;
    }
    if( this.source ){
      newcanvas.source = this.source;
    }

    return new PixelCanvas(newcanvas);
  }
  // scale canvas with out smooth
  pcfn.mosaiclize = function( size ) {
    var size = size || 5;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var xi, yi;

    var newcanvas = document.createElement('canvas');
    newcanvas.width = w * 5;
    newcanvas.height = h * 5;
    var ocanvas   = this.canvas;
    var nctx = newcanvas.getContext('2d');
    for( yi = 0; yi < h; yi ++){
      for( xi = 0; xi <w; xi ++){
        nctx.drawImage( ocanvas, xi, yi, 1, 1, xi * size, yi *size, size, size  );
      }
    }

    return new PixelCanvas(newcanvas);
  }
  return {
    Pixel         : Pixel,
    Canvas        : Canvas,
    EditablePixel : EditablePixel,
    PixelCanvas   : PixelCanvas
  };
});