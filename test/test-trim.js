require.config({
  baseUrl: './',
  paths :{
    ko : '../libs/knockout-2.2.0',
    less:'../libs/less-1.4.0-beta.min',
    underscore :'../libs/underscore-min'
  }
});
require([
  '../libs/canvas/pixel'
],function(
  pixel
){

  var origin = $('#origin')[0];
  var originCtx = origin.getContext('2d');

  var trimed = $('#trimed')[0];
  var trimedCtx = trimed.getContext('2d');

  var source = new Image();
  source.onload = function() {
    origin.width = source.width;
    origin.height= source.height;
    originCtx.drawImage( source, 0, 0);

    var trimedPCanvas = new pixel.PixelCanvas( source ).trim();
    var trimedCanvas = trimedPCanvas.canvas;

    trimed.width  = trimedCanvas.width;
    trimed.height = trimedCanvas.height;
    trimedCtx.drawImage(trimedCanvas,0,0);
  }
  source.src = 'D:/backup/nwtest/mergeFile/source/cf4b59e1554307f6cdd6dd3611983c6e.png'
});