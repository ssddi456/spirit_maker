require.config({
  baseUrl: './',
  paths :{
    less:'libs/less-1.4.0-beta.min',
    underscore :'libs/underscore-min'
  }
});

require([
  './libs/canvas/pixel',
  './src/packdrawer',
  './src/newproject',
  './src/projectlist',
  './src/packlist',
  './src/dropimg',
  './src/newpack',
  
],function(
  pixel,
  packdrawer,
  newproject,
  projectlist,
  packlist,
  dropimg,
  newpack,
){

  var async = global.require('async');

  var gid = document.getElementById.bind(document);



  var popups = {};
  function addPopup ( name, obj ) {
    popups[name] = ko.observable(false);
    obj.show = function() {
      popups[name]( obj );
      obj.emit( 'show' );
    }
    obj.hide = function() {
      popups[name]( false );
      obj.emit( 'hide' );
    }
  }

  newpack.on('save',function( data ) {
    console.log(' trigger save', data );
    packlist.addPack( data );
    this.hide();
    this.reset();
  });
  

  packlist.on('changed',function(){
    var curproject = projectlist.curproject();
    if( curproject ){
      console.log( 'save project');
      curproject.packs( packlist.toJSON() );
      packdrawer( packlist.packs() );
    }
  });

  packlist.packs.subscribe(function(){
    var curproject = projectlist.curproject();
    if( curproject ){
      packdrawer( packlist.packs() );
      curproject.packs( packlist.toJSON() );
    }
  });
  projectlist.curproject.subscribe(function(project){
    if( project ){
      project.load();

      packlist.reset( project.packs() );
    }
  });
  projectlist.newproject = function(){
    newproject.show();
  }
  newproject.on('save',function( data ){
    console.log('project save', data);

    projectlist.addProject( data );
    projectlist.curproject( _.last(projectlist.projects()) );
    

    this.hide();
    this.reset();
  });

  
  addPopup ( 'newpack',    newpack );
  addPopup ( 'newproject', newproject );

  // drag and drops 

  $(document)
    .on('dragover',function(e){ 
      e.preventDefault()
    })
    .on('drop',function(e){ 
      e.preventDefault()
      if( !popups.newpack() && 
          projectlist.curproject() 
      ){
        dropimg( e.originalEvent.dataTransfer, 
          function( err, files ) {
            if( err ){
              return;
            }
            console.log( 'transfered', files );
            async.whilst(
              function(){ 
                return files.length
              },
              function( done){
                newpack.name( files.shift() );
                newpack.show();
                newpack.once('hide',done);
              },
              function( err ){
                console.log( 'done' );
                projectlist
                  .curproject()
                  .packs( packlist.toJSON() );
              })
          });
      }
    });

  // context menus
  function copyString (str){
    gui.Clipboard.get().set(str);
  }


  var previewCMN = {
    curpack  : ko.observable(false),
    copycss  : function(){
      copyString ( previewCMN.curpack().cssstr );
    },
    copyless : function(){
      copyString ( previewCMN.curpack().lessnames );
    },
    copylessstr: function(){
      copyString( previewCMN.curpack().lessstr );
    },
    cancopylessstr: function(){
      return previewCMN.curpack().classname() != '';
    }
  };

  var $preview     = $('#preview');
  var el;
  var maxpreview   = { maxwidth : 300, maxheight : 150};
  $('#packlist')
  // hover
    .on('mouseenter','table',function(e){
      var curpack =  ko.dataFor(this);
      previewCMN.curpack( curpack );
      new pixel.Canvas( curpack.img ).drawTo( $preview.find('canvas')[0], maxpreview );
      var $self = $(this);
      var offset = $self.offset();
      $preview.css({
        left:  offset.left + $self.width() - 10 ,
        top :  offset.top
      });
    })
    
    .on('mouseleave','table',function(e){
      if( $(e.relatedTarget).is( $preview ) || $.contains( $preview[0], e.relatedTarget ) ){
        return;
      }
      $(this).unbind('mousemove');
      previewCMN.curpack(false);
    });


  $preview.on('mouseleave',function(e){
    previewCMN.curpack(false);
  })


  // init bindings

  ko.applyBindings( packlist,    gid('packlist')    );
  ko.applyBindings( projectlist, gid('projectlist') );
  ko.applyBindings( popups,      gid('popup')       );
  ko.applyBindings( previewCMN,  gid('preview')     );


  avalon.scan();

  if( projectlist.projects().length == 0 ){
    newproject.show();
  }


});