require.config({
  baseUrl: '../',
  paths :{
    ko : '../libs/knockout-2.2.0',
    less:'../libs/less-1.4.0-beta.min',
    underscore :'../libs/underscore-min'
  }
});
require([
  '../libs/canvas/pixel',
  '../libs/canvas/squared',
  'underscore'
],function(
  pixel,
  squared,
  __
){

  var origin = $('#origin')[0];
  var source = new Image();
  source.onload = function() {
    var _origin = new pixel.PixelCanvas( source );
    var trimed  = _origin.trim();
    trimed.drawTo(origin);
    
    var squaredc = new squared.Squared( trimed.canvas );
    squaredc.setBorder( 20, 30, 10, 20 );
    _.each(squaredc.splited,function( val, key ) {
      val.drawTo( $('#squared #'+key)[0] );
      val.drawTo( $('#squared-compact #'+key)[0] );
    });

    var scarhorizon = new squared.ScalableHorizon ( trimed.canvas );
    scarhorizon.setBorder(30);
    _.each(scarhorizon.splited,function( val, key ) {
      val.drawTo( $('#scarlabel-horizon #'+key)[0] );
    });

    var scarvertical= new squared.ScalableVertical( trimed.canvas );
    scarvertical.setBorder(30);
    _.each(scarvertical.splited,function( val, key ) {
      val.drawTo( $('#scarlabel-vertical #'+key)[0] );
    });
  }
  source.src = 'D:/backup/nwtest/mergeFile/source/87719.gif'
});