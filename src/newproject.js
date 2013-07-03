define([
  './helpers/fileinput',
  './project',
  'ko',
  'underscore'
],function(
  fileinput,
  Project,
  ko,
  __
){
  var newprojectPopup = new Project();
  // project will automatic save itself on change
  // so prevent it
  newprojectPopup.removeAllListeners();
  
  _.extend(newprojectPopup,{
    save   : function() {
      this.emit('save', this.toJSON() )
    },
    enable : function() {
      return  this.name()         != '' &&
              !this.name().match(/\s/)  &&
              this.sourceDir()    != '' &&
              this.outputSpirit() != '' &&
              this.outputLess()   != '';
    },
    reset  : function() {
      this.name         = ko.observable( '' );
      this.sourceDir    = ko.observable( '' );
      this.outputSpirit = ko.observable( '' );
      this.outputLess   = ko.observable( '' );
      this.packs        = ko.observable( [] );
    },
    cancel : function() {
      this.hide();
      this.reset();
    },
    changeSourceDir : function(){
      var self = this;
      fileinput.getDirectory( 
        this.sourceDir(), 
        function( val ){
          self.sourceDir(val);
        });
    }
  });
  return newprojectPopup;
});