require.config({
  baseUrl: './',
  paths :{
    ko : '../libs/knockout-2.2.0',
    less:'../libs/less-1.4.0-beta.min',
    underscore :'../libs/underscore-min'
  }
});
require([
  'src/packers',
  'src/helpers/loadimage',
  'src/helpers/simplepack',
  '../libs/canvas/squared',
  '../libs/canvas/pixel',
  'ko',
  'underscore'
],function(
  packers,
  loadimage,
  simplepack,
  squared,
  pixel,
  ko,
  __
){
  var outputimg = 'd:/backup/nwtest/mergeFile/output/finpack-output.png';
  var outputless= 'd:/backup/nwtest/mergeFile/output/finpack-output.less';

  var util = global.require('util');
  var fs   = global.require('fs');
  
  // packed-url x  y
  var binsspirit = util.format.bind(util,'  background : url("%s") #fff -%spx -%spx no-repeat;\n  width: %spx;\n  height: %spx;\n');
  var horispirit = util.format.bind(util,'  background : url("%s") #fff -%spx -%spx repeat-x;\n  height: %spx;\n');
  var vertspirit = util.format.bind(util,'  background : url("%s") #fff -%spx -%spx repeat-y;\n  width : %spx;\n');
  // split-part source-name

  loadimage([
    'window.png',
    'window.png',
    'window.png'
  ].map(function(img, idx){
    try{
      return $('[source]').eq(idx).attr('src','D:/backup/nwtest/mergeFile/source/' + img )[0].src;
    }catch(e){
      return 'D:/backup/nwtest/mergeFile/source/' + img;
    }
  }),function(imgs){
    var pack    = new simplepack.FinPack()
                    .addPack( packers.box(imgs[0],     [30,6,6,6], { minwidth: 300, minheight: 400})  )
                    .addPack( packers.horizon(imgs[1], [6],        { minwidth: 200, minheight: 100})     )
                    .addPack( packers.vertical(imgs[2],[30,7],     { minwidth: 500, minheight: 200}) );
    var lessstr = ''; 
    var names   = {};
    var indexs  = 0;
    var partsless   = util.format.bind(util,'.box_%s( @name ) when (@name = @name%s){\n');
    pack.map(function(node,key){
      if( node.imgdata.name in names ){
        var _idx = names[node.imgdata.name];
      } else {
        var _idx = names[node.imgdata.name] = ++indexs;
        lessstr += '@name' + _idx + ':"'+ node.imgdata.name + '";\n';
      }
      switch ( key ){
        case 'bins' : 
          lessstr += partsless(node.imgdata.pos, _idx ) ;
          lessstr += binsspirit( outputimg, node.x, node.y, node.w, node.h );
          break;
        case 'hori' :
          lessstr += partsless(node.imgdata.pos, _idx ) ;
          lessstr += vertspirit( outputimg, node.x, node.y, node.w );
          break;
        case 'vert' :
          lessstr += partsless(node.imgdata.pos, _idx ) ;
          lessstr += horispirit( outputimg, node.x, node.y, node.h );
          break;
      }
      lessstr += '}\n'
    })

    var temp = new pixel.Canvas( pack.layout.w, pack.layout.h );
    pack.draw(temp.ctx);

    fs.writeFile( outputless,
      lessstr)
    fs.writeFile( outputimg, 
      temp.canvas.toDataURL().replace(/^data:image\/png;base64,/,''),
      'base64',function(err){
        if( !err ){
          $('#output').attr('src', outputimg )
        } else {
          console.log( 'write err', err );
        } 
      })
  });
});