define([

],function(

){
  function loadImage ( imgs, done ) {
    imgs = Array.isArray( imgs )?imgs : [imgs];
    var counts = imgs.length;
    var doned = false;
    function fin () {
      counts --;
      if( counts == 0 && !doned ){
        "function" === typeof done && done( imgs);
        doned = true;
      }
    }
    imgs.forEach(function( img, idx ) {
      var _img = new Image();
      _img.onload = function() {
        console.log( idx, img );
        imgs[idx] = _img;
        fin();
      }
      _img.onerror =function( e ) {
        imgs[idx] = 'error';
        fin();
      }
      _img.src = img;
    })
  }
  return loadImage;
});