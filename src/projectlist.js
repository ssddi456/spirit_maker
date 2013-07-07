define([
  './project',
  'ko',
  'underscore'
],function(
  Project,
  ko,
  __
){  
  var fsExtra = global.require('fs-extra');
  var path    = global.require('path');
  var fs      = global.require('fs');
  
  var projects_file = path.join( process.env.APPDATA, 'spirit_maker/projects.json');
  
  if( !fs.existsSync ( projects_file ) ){
    var projects_folder=path.join( process.env.APPDATA, 'spirit_maker');
    if( !fs.existsSync( projects_folder ) ){
      fs.mkdirSync( projects_folder );
    }
  }

  function ProjectListFunc ( ProjectList ){

    $.extend ( ProjectList,{
        projects    : [],
        curproject  : false,
        
        addProject  : function( project ) {
          var self = this;
          if( _.isArray(project) ){
            _.each(project,function( project ) {
              self.addProject(project);
            });
            return this;
          }
          this.projects.push( new Project(project) );
          this.save();
          return this
        },
  
        toJSON      : function( ) {
          
          return _.map( this.projects(),function( project ) {
            var ret = project.toJSON();
            ret.packs = undefined;
            return ret;
          });
        },
        
        remove      : function( project ) {
          this.projects.remove( project );
          var projects = this.curproject();
          if( this.curproject() == project ){
            if(  projects.length ){
              this.curproject = projects[0] );
            } else {
              this.curproject( false );
            }
          } 
          this.save();
        },
        load        : function() {
          try{
            this.addProject( fsExtra.readJSONSync( projects_file  ));
            console.log( JSON.stringify(this) );
          } catch(e){
            console.log( 'projects load fail', e);
          }
        },
        save        : _.debounce(function() {
                        fsExtra.writeJSON ( projects_file, ProjectList.toJSON() );
                      },300)
      }
  
      ProjectList.load();
    })
  return ProjectList; 
});