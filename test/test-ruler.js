require.config({
  baseUrl: './',
  paths :{
    ko : '../libs/knockout-2.2.0',
    less:'../libs/less-1.4.0-beta.min',
    underscore :'../libs/underscore-min'
  }
});

require([
  '../libs/canvas/pixel',
  '../src/helpers/loadimage',
  'underscore'
],function(
  pixel,
  loadimage,
  __
){
  loadimage(['../skin/登录2_MarkMan.png'],function( imgs ) {
    var $map = $('#ruler');
    
    var tpcanvas = new pixel.Canvas(imgs[0]);


    var pcanvas  = new pixel.PixelCanvas(imgs[0]);


    function pointer ( ctx, text, x, y) {
        
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x+10,y -10);
      ctx.lineTo(x+10 + ctx.measureText( text ).width, y-10);
      ctx.stroke();
      ctx.fillText( text, x+12,y -12 );

    }

    function color_picker ( ctx, x, y) {
      pointer(ctx, '#' + pcanvas.pixels[y][x].toHex(), x, y);
    }

    function hori_picker ( ctx, x, y ) {
      var pixels = pcanvas.pixels;
      var row    = pcanvas.getRow(y);
      var dcolor = row[x];
      var left   = x;
      var right  = x;

      var i, max;
      for (i = x, max = -1; i > max; i --){
        if( !dcolor.equal( row[i] ) ){
          left = i;
          break;
        }
      }
      
      if( i == max ){
        left = i;
      }
      for (i = x, max = row.length; i< max;i++){
        if( !dcolor.equal( row[i] ) ){
          right = i;
          break;
        }
      }
      
      if( i == max ){
        right = i;
      }
      if( right - left > 10 ){

        ctx.beginPath();
        ctx.moveTo( left, y );
        ctx.lineTo( right, y );
        ctx.stroke();

        pointer(ctx, left+','+y, left, y );
        pointer(ctx, right+','+y, right, y );

      }

      return {
        left : left,
        right: right
      }
    }
    function vert_picker ( ctx, x, y ) {
      var col    = pcanvas.getCol(x);
      var dcolor = col[y];
      
      var top    = y;
      var bottom = y;

      var i, max;
      for (i = y, max = -1; i > max; i --){
        if( !dcolor.equal( col[i] ) ){
          top = i;
          break;
        }
      }
      if( i == max ){
        top = i;
      }
      
      for (i = y, max = col.length; i< max;i++){
        if( !dcolor.equal( col[i] ) ){
          bottom = i;
          break;
        }
      }
      if( i== max ){
        bottom = i;
      }
      
      if( bottom  - top > 10 ){

        ctx.beginPath();
        ctx.moveTo( x, top );
        ctx.lineTo( x, bottom );
        ctx.stroke();

        pointer(ctx, x + ',' + top,    x, top );
        pointer(ctx, x + ',' + bottom, x, bottom );

      }

      return {
        top    : top,
        bottom : bottom
      }
    }
    pcanvas.drawTo( $map[0] );
    
    tpcanvas.ctx.font        = '20px monospace';
    tpcanvas.ctx.strokeStyle = '#ff0000';
    tpcanvas.ctx.fillStyle   = '#ff0000';
    
/*
    $map.on('mousemove',function(e) {
      var x = e.offsetX;
      var y = e.offsetY; 

      debounce_loop(function( ctx ) {
        

        color_picker( ctx, x, y );
        vert_picker ( ctx, x, y );
        hori_picker ( ctx, x, y );

      });
    });
*/

    var debouncelog = _.debounce(console.log.bind(console),100);
    
    function update_loop ( handle ) {
      pcanvas.drawTo(tpcanvas.canvas);
      handle(tpcanvas.ctx);
      tpcanvas.drawTo($map[0]);
    }
    var debounce_loop = _.debounce(update_loop,300);

  
    var beginPick;
    $map.on('click',function(e) {
      var _pos = {
          x : e.offsetX,
          y : e.offsetY
        };
      if( !beginPick ){
        beginPick = _pos;
        return;
      }
      
      var totrim = [Math.min( beginPick.x, _pos.x ), Math.min( beginPick.y, _pos.y), Math.abs( beginPick.x - _pos.x ), Math.abs( beginPick.y- _pos.y )];
      var totrim_c = pcanvas.subCanvas.apply( pcanvas, totrim);
      totrim_c = new pixel.PixelCanvas( totrim_c.canvas );
      totrim_c.trim();
      var bbox = totrim_c.bbox;

      debounce_loop(function(ctx) {
        ctx.strokeRect( bbox.left +totrim[0], bbox.top + totrim[1], bbox.width, bbox.height );
      });

      beginPick = undefined;
    });


  });
});