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
  '../libs/canvas/squared',
  'src/helpers/simplepack',
  'underscore'
],function(
  pixel,
  squared,
  packers,
  __
){
  var paths = 'D:/backup/nwtest/mergeFile/source/';
  var imgs  = ['12QS94042Z-M438.jpg',
               'window.png',
               '163172_800x600.jpg',
               '165609_800x600.jpg'];
  var keys  = ["origin",       
               "squared",      
               "scar-horizon", 
               "scar-vertical"]; 
  var counter = imgs.length;
  function fin () {
    counter --;
    if( counter === 0 ){
      main();
    }
  }
  imgs.forEach(function( name, idx ) {
    var img = new Image();
    img.onload = function() {
      imgs[ idx ] = img;
      fin();
    };
    img.src = paths + name;
  });
  function main () {
    keys.forEach(function( name, idx ) {
      var paper = new pixel.Canvas( imgs[idx] );
      paper.drawTo( $('#origin>#'+name)[0] );
    });

    function simbinpack () {
      var binpack = new packers.BinPack();
      binpack.pack([imgs[1]]);
      
      drawProcessing( binpack, 'origin' );

      return binpack;
    }
    function drawpacktoCanvas( pack, selector ){
      if( pack.layout ){
        pack = pack.layout;
      }
      var paper  = new pixel.Canvas( pack.w, pack.h );
      console.log( pack.w, pack.h );
      pack.draw(paper.ctx);
      paper.drawTo( $( selector )[0] );
    }
    function drawProcessing ( pack, name ){
      console.log( name );
      drawpacktoCanvas(pack, '#processing>#' + name );
    }
    function simsquaredpack () {
      var spliter = new squared.Squared( new pixel.PixelCanvas(imgs[1]).trim().canvas );
      spliter.setBorder(30,6,6,6);
      var splited = spliter.splited;

      var binpack = new packers.BinPack();
      binpack.pack([splited.upleft,
                    splited.upright,
                    splited.downleft,
                    splited.downright]);

      var horizonpack  = new packers.HorizonPack(); 
      horizonpack.pack([splited.midleft,
                        splited.midright]);
      
      var verticalpack = new packers.VerticalPack();
      verticalpack.pack([splited.upmid,
                         splited.downmid]);

      var finpack      = new packers.FinPack();
      
      finpack
        .addPack(binpack)
        .addPack(horizonpack)
        .addPack(verticalpack)
        .updateLayout();
     
      drawProcessing( finpack, 'squared' );
      
      return finpack;
    }
    function simscarhorpack(){
      var spliter = new squared.ScalableHorizon( new pixel.PixelCanvas(imgs[1]).trim().canvas  );
      spliter.setBorder(6);
      var splited = spliter.splited;
      
      var binpack = new packers.BinPack();
      binpack.pack([splited.left,
                    splited.right]);
      var verticalpack = new packers.VerticalPack();
      verticalpack.pack([splited.mid]);

      var finpack = new packers.FinPack();
      finpack
        .addPack(binpack)
        .addPack(verticalpack)
        .updateLayout();
      drawProcessing( finpack, 'scar-horizon' );
      return finpack;
    }
    function simscarverpack(){
      var spliter = new squared.ScalableVertical( new pixel.PixelCanvas(imgs[1]).trim().canvas );
      spliter.setBorder(30,7);
      var splited = spliter.splited;

      var binpack = new packers.BinPack();
      binpack.pack([splited.up,
                    splited.down]);
      var horizonpack = new packers.HorizonPack();
      horizonpack.pack([splited.mid]);
      var finpack = new packers.FinPack();
      finpack
        .addPack(binpack)
        .addPack(horizonpack)
        .updateLayout();
      drawProcessing( finpack, 'scar-vertical' );
      return finpack;
    }


    function simfinpack () {
      var finpack = new packers.FinPack();
      finpack
        .addPack(simbinpack())
        .addPack(simsquaredpack())
        .addPack(simscarhorpack())
        .addPack(simscarverpack())
        .updateLayout();
      drawpacktoCanvas(finpack,'#fin');
    }

    simfinpack();
  }
});