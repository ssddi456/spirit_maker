require.config({
  paths :{
    ko : 'libs/knockout-2.2.0',
    less:'libs/less-1.4.0-beta.min',
    underscore :'libs/underscore-min'
  }
})
require([
  'underscore',
  'src/helpers/simplepack',
  'ko',
  'less',
  'src/vm/piclist',
  'src/vm/spirit',
  'src/vm/newspirit'
],function(
  __,
  packers,
  ko,
  less,
  vmPiclist,
  vmSpirit,
  vmNewSpirit
){


  var fs      = global.require('fs-extra');
  var async   = global.require('async');
  var path    = global.require('path');
  var request = global.require('request');
  var util    = global.require('util');


  var mnEdit   = new window.gui.Menu();
  var mnitCopy = new window.gui.MenuItem({
                       label : 'copy less mixin'
                     });
  var mnitCopyName = new window.gui.MenuItem({
                       label : 'copy image name'
                     });

  mnEdit.append(mnitCopyName);
  mnEdit.append(mnitCopy);


  var configPath = 'src/config.json';
  function loadConfig(){
    return fs.readJsonSync(configPath);
  }
  function saveConfig( configSave ){
    fs.writeJSON(configPath,config,configSave);
  }
  var config = loadConfig();

  var spiritlist = { 
    spirits      : ko.observableArray(config.spirits),
    showSpirit   : function( spirit ){
      piclist.map(spirit);
      drawSpirit();
    }, 
    addSpirit    : function( spirit ){
      this.spirits.push(spirit);  
      config.spirits = this.spirits();
      saveConfig();
    },
    removeSpirit : function(){
      config.spirits = this.spirits();
      saveConfig();
    }
  };
  var piclist    = new vmSpirit(_.first( config.spirits ));
  
  var newspirit  = new vmNewSpirit();
  newspirit.createHandle = function( spirit ){
    spiritlist.addSpirit( spirit );
    this.reset();
  };
  newspirit.cancel = function(data, e ){
    $('#new-spirit').hide();
    this.reset();
  }


  var padding = 20;
  var offset  = {
    x : 20,
    y : 20
  }
  var cssTemplate = [
    '@name%s:"%s";',
    '.%s (@name) when(@name = @name%s){',
    '  height : %spx;',
    '  width : %spx;',
    '  background:url("%s/%s") %s -%spx -%spx %s;',
    '}'].join('\n');
  
  function formatCssTemplate( idx, spiritname, picname, height, width, refpath, imgname, defcolor, x, y, repeat){
    var args = Array.prototype.slice.call(arguments);
    args.splice(1,0,args[2]);
    args[3] = idx;
    return util.format.apply( util, [cssTemplate].concat(args) );
  }
  
  var mainTempCanvas = document.createElement('canvas');
  var mainTempCtx    = mainTempCanvas.getContext('2d');
  var mainCanvas     = document.getElementById('main-canvas');
  var mainCtx        = mainCanvas.getContext('2d');

  var isImage = function ( ){
    var imgTypeExt = ['.jpg','.jpeg','.png','.gif'];
    return function( name ){
      return imgTypeExt.indexOf(path.extname(name.toLowerCase())) != -1;
    }
  }();
  function drawSpirit(){
    var sourceDir = piclist.sourceDir();
    async.waterfall([
      function( done ){
        fs.readdir( sourceDir, function(err,list){
          if(err){
            done( err );
            return;
          } 
          done(err, list.filter(isImage));
        })
      },function(list, imgsgot ){
        async.mapLimit(list, 5, function( file, imggot ){
          var filename = path.join(sourceDir,file);
          var img = new Image();
          var _img = {
            img:img,
            name:file
          };
          img.onload = function(){
            _img.height = this.height;
            _img.width = this.width;
            imggot(null,_img);
          }
          img.onerror= function(){
            imggot('not found');
          }
          img.src = filename
        },imgsgot);
      }],
      function (err, imgs){
        if(err){
          console.log(err);
          return;
        }
        processData(imgs);
      });
  }

  function mapSpirit ( imgs ){
    var totalWidth  = 0;
    var totalHeight = 0;
    imgs = imgs.sort(function(a,b){
      return  b.height - a.height; 
    })
    imgs.reduce(function(img){


    },offset);
    return {
      totalWidth  : totalWidth,
      totalHeight : totalHeight,
      imgs        : imgs
    };
  }
  function processData(imgs){
    if( !imgs.length ){
      mainCtx.clearRect(0,0, mainCanvas.width, mainCanvas.height );
      piclist.piclist([]);
      return;
    }

    var img_packer = new packers.BinPack();
    img_packer.pack( imgs );

    mainCanvas.width  = mainTempCanvas.width  = img_packer.w;
    mainCanvas.height = mainTempCanvas.height = img_packer.h;
    
    img_packer.draw( mainTempCtx );
    window.img_packer = img_packer;
    var _imgs = [];
    img_packer.root.walk(function(node){
      var img = this.imgdata;
      if( img ){
        img.x = this.x;
        img.y = this.y;
        _imgs.push(img);
      }
    });

    piclist.piclist(_imgs);
  
    mainCtx.drawImage(mainTempCanvas,0,0);

    async.parallel([
      function ( imgwrite ){
        fs.writeFile( 
          piclist.outputSpirit(), 
          mainTempCanvas.toDataURL().replace(/^data:image\/png;base64,/,''),
          'base64',imgwrite)
      },
      function ( lesswrite ){
        var spiritname = path.basename( piclist.outputSpirit());
        var lessdir    = path.dirname( piclist.outputLess    );
        var spiritdir  = path.dirname( piclist.outputSpirit());
        var refdir     = path.resolve( spiritdir, lessdir );
        fs.writeFile(
          piclist.outputLess(),
          imgs.map(function(img, idx){
            return formatCssTemplate(
              idx, 
              piclist.name(),
              img.name,
              img.height, 
              img.width,
              refdir,
              spiritname,
              '#fff',
              img.x,
              img.y,
              'no-repeat');
          }).join('\n'),
          'utf-8',lesswrite)
      }],function(err){
        if(err){
          console.log(err);
        }
      })
  }

  $('#piclist')
    // detail funcs
    .on('click','.picitem thead',function(){
      $(this).siblings('tbody').toggle();
    })
    // highlight parts
    .on('mouseenter','.picitem',function(){
      $(this).addClass('highlight');
      var img = ko.dataFor(this);
      mainCtx.strokeRect(img.x, img.y, img.width, img.height);
    })
    .on('mouseleave','.picitem',function(){
      $(this).removeClass('highlight');
      clearHighlight()
    })
    // delete funcs
    .on('click','.picitem .remove',function(e){
      e.stopPropagation();

      var img = ko.dataFor( $(this).parents('.picitem')[0] );
      // TODO : deal with illegal pic name 
      fs.unlink( img.img.src.replace(/^file:\/\/\//,'') ,function(e){
        if(e){
          console.log( 'unlink fail', e );
        } else {
          drawSpirit()
        }
      });
    })
    // edit spirit name
    .on('click','.spirit-name',function(){
      $(this).hide().next().show().focus();
    })
    .on('blur' ,'.spirit-name',function(){
      $(this).hide().prev().show();
    })
    // drag&drop support
    .on('dragenter',function(){
      $(this).css('background','#f00')
    })
    .on('dragleave',function(){
      $(this).css('background','#fff')
    })
    .on('drop',function(e){
      $(this).css('background','#fff')
      e.stopPropagation();
      e.preventDefault();
      e = e.originalEvent;
      var data = e.dataTransfer;
      var files
      if( data.files && data.files.length ){
        files = Array.prototype.filter.call(data.files,function( file ){
          return file.type.indexOf('image') != -1;
        });

        if( files.length ){
          async.mapLimit( files, 5, function( file, filecopy ){
            console.log( file );
            var dist = fs.createReadStream( file.path )
              .pipe(fs.createWriteStream( path.join( piclist.sourceDir(), file.name )))
            dist.on('end',function(){
              filecopy(null);
            })
            dist.on('close',function(){
              filecopy();
            })
            dist.on('finish',function(){
              filecopy();
            })
            dist.on('error',function(e){
              filecopy(e);
            })
          },drawSpirit);
        }
      } else {
        var html = _.find(data.types,function(type){
          return type =='text/html';
        }); 
        if ( html ){
          var $item = $( data.getData(html) );
          var $imgs = $item.find('img').add( $item.filter('img') );
          if( $imgs.length ){
            var srcs = _.map($imgs,function(item){
                              return item.src;
                            });
            async.mapLimit(srcs,5,function(src,imgGot){
              var name = path.basename(src);
              var localpath = path.join( piclist.sourceDir(), name );
              request.get(src)
                .pipe(fs.createWriteStream(localpath))
                .on('finish',function(){
                  imgGot();
                })
                .on('error',function(err){
                  console.log( err );
                  imgGot(err)
                })
            },drawSpirit);
          }
        }
      }
    })
    .on('contextmenu','.picitem',function(e){
      var self = this;
      var kodata = ko.dataFor(this);
      
      e.preventDefault();
      var e = e.originalEvent;
      mnitCopy.click = function( e ){
        window.gui.Clipboard.get().set(
          util.format('.%s("%s");', piclist.name(), kodata.name )
        );
      }
      mnitCopyName.click = function(){
        window.gui.Clipboard.get().set( kodata.name );
      }
      mnEdit.popup(e.x, e.y);
    });

  $('#addSpirit').click(function(){
    $('#new-spirit').show();
  });

  function inRange ( start, end, val ){
    return val == Math.max(start,Math.min(val,end));
  }
  var preidx;
  function findClickItem(x, y){
    var arr = piclist.piclist();
    var ret = {};
    _.find( arr, function( img, idx ){
      if( inRange(img.x, img.x+ img.width,  x) &&
          inRange(img.y, img.y+ img.height, y)
      ){
        ret.cidx = idx;
        ret.cimg = img;
        return true;
      }
    });
    return ret;
  }
  function highlightItem(e){
    var x = e.offsetX;
    var y = e.offsetY;
    var item = findClickItem(x,y);
    var cimg = item.cimg;
    var cidx = item.cidx;
    if( typeof cidx != 'undefined' ){
      if( preidx == cidx ){
        return;
      }
      $('#piclist .highlight').removeClass('highlight');
      clearHighlight();

      $('#piclist .picitem').eq(cidx).addClass('highlight');
      mainCtx.strokeRect(cimg.x, cimg.y, cimg.width, cimg.height);
      preidx = cidx;
    } else {
      $('#piclist .highlight').removeClass('highlight');
      clearHighlight();
      preidx = undefined;
    }
  }
  function clearHighlight (){
    mainCtx.clearRect(0,0, mainCanvas.width, mainCanvas.height);
    mainCtx.drawImage(mainTempCanvas,0,0);
  }
  var $mainCanvas = $(mainCanvas);
  $mainCanvas
    .on('mousemove',highlightItem)
    .on('mouseleave',function(){
      $('#piclist .highlight').removeClass('highlight');
      clearHighlight();
    })
    // copy less mixin
    .on('contextmenu',function(e){
      e.preventDefault();
      e = e.originalEvent;
      var item = findClickItem( e.offsetX, e.offsetY);
      if( item ){
        mnitCopy.click = function(){
          window.gui.Clipboard.get().set(
            util.format('.%s("%s");', piclist.name(), item.cimg.name )
          );
        };
        mnitCopyName.click = function(){
          window.gui.Clipboard.get().set( item.cimg.name );
        };
        mnEdit.popup(e.x,e.y);
      }
    });
  $(document)
    .on('dragover',function(e){ 
      e.preventDefault()
    })
    .on('drop',function(e){ 
      e.preventDefault()
    });

  drawSpirit();

  ko.applyBindings(piclist,   $('#piclist')[0] );
  ko.applyBindings(spiritlist,$('#spirit-list')[0]);
  ko.applyBindings(newspirit, $('#new-spirit')[0]);
});