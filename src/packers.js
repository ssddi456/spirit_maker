define([
  './helpers/simplepack',
  '../libs/canvas/pixel',
  '../libs/canvas/squared'
],function(
  simplepack,
  pixel,
  squared
){
  function simsinglepack (img){
    var ret = new simplepack.BinPack();
    img = new pixel.Canvas(img);
    img.pos = 'bin'
    ret.pack([ img ]);
    return ret;
  }

  function getCanvas ( img, optn ){
    if( optn.trim ){
      var _canvas = new pixel.PixelCanvas( img ).trim().canvas;
    } else {
      var _canvas = new pixel.Canvas( img ).canvas;

    }
    return _canvas;
  }

  function simsquaredpack ( img, borders, optn ) {

    var spliter = new squared.Squared( getCanvas( img, optn ) );

    optn = optn || {};

    spliter.setBorder.apply(spliter, borders);
    var splited = spliter.splited;

    var binpack = new simplepack.BinPack();
    binpack.pack([splited.upleft,
                  splited.upright,
                  splited.downleft,
                  splited.downright]);

    var horizonpack  = new simplepack.HorizonPack(); 
    horizonpack.pack([splited.midleft,
                      splited.midright]);
    
    var verticalpack = new simplepack.VerticalPack();
    verticalpack.pack([splited.upmid,
                       splited.downmid]);
    var finpack      = new simplepack.FinPack();
    optn.minwidth  && ( finpack.minwidth  = optn.minwidth  );
    optn.minheight && ( finpack.minheight = optn.minheight );
    
    finpack
      .addPack(binpack)
      .addPack(horizonpack)
      .addPack(verticalpack)
      .updateLayout();
   
    return finpack;
  }


  function simscarhorpack( img, borders, optn ){

    var spliter = new squared.ScalableHorizon( getCanvas( img, optn )  );

    optn = optn || {};

    spliter.setBorder.apply(spliter, borders);
    var splited = spliter.splited;
    
    var binpack = new simplepack.BinPack();
    binpack.pack([splited.left,
                  splited.right]);
    var verticalpack = new simplepack.VerticalPack();
    verticalpack.pack([splited.mid]);

    var finpack = new simplepack.FinPack();
    optn.minwidth  && ( finpack.minwidth  = optn.minwidth  );
    optn.minheight && ( finpack.minheight = optn.minheight );
    
    finpack
      .addPack(binpack)
      .addPack(verticalpack)
      .updateLayout();
    return finpack;
  }

  function simscarverpack( img, borders, optn ){
    var spliter = new squared.ScalableVertical( getCanvas( img, optn ) );

    optn = optn || {};
    
    spliter.setBorder.apply(spliter, borders);
    var splited = spliter.splited;

    var binpack = new simplepack.BinPack();
    binpack.pack([splited.up,
                  splited.down]);
    var horizonpack = new simplepack.HorizonPack();
    horizonpack.pack([splited.mid]);

    var finpack = new simplepack.FinPack();
    optn.minwidth  && ( finpack.minwidth  = optn.minwidth  );
    optn.minheight && ( finpack.minheight = optn.minheight );
    
    finpack
      .addPack(binpack)
      .addPack(horizonpack)
      .updateLayout();
    return finpack;
  }

  return {
    horizon : simscarhorpack,
    vertical: simscarverpack,
    box     : simsquaredpack,
    single  : simsinglepack
  }
});