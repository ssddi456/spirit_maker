define([
  './projectlist',
  'underscore',
],function(
  projectlist,
  __
){
  var fs = global.require('fs');
  var path = global.require('path');
  var async = global.require('async');

  return function( data, fileprocessed ) {
    var project = projectlist.curproject();
    if( !project ){
      fileprocessed( 'project not specific' );
      return;
    }
    project = project.toJSON();
    var files;
    if( data.files && data.files.length ){
      files = Array.prototype.filter.call(data.files,function( file ){
        return file.type.indexOf('image') != -1;
      });

      if( files.length ){
        async.mapLimit( files, 5, function( file, filecopy ){
          console.log( 'copy ' ,file );
          // if file is in source folder, 
          // then source and target is the same File, 
          // which cause the source to be an empty,
          // so prevent it , but treat as copy success
          if( path.dirname(file.path) == project.sourceDir ){
            filecopy(null, file.name);
            return;
          }
          var dist = fs.createReadStream( file.path )
            .pipe(fs.createWriteStream( path.join( project.sourceDir, file.name )))
          dist.on('finish',function(){
            filecopy(null, file.name);
          });
          dist.on('error',function(e){
            filecopy(e);
          });
        },fileprocessed);
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
            var localpath = path.join( project.sourceDir, name );
            request.get(src)
              .pipe(fs.createWriteStream(localpath))
              .on('finish',function(){
                imgGot(null, name);
              })
              .on('error',function(err){
                console.log( err );
                imgGot(err)
              })
          },fileprocessed);
        }
      }
    }
  }
});