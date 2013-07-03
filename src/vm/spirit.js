define([
  './piclist',
  'ko',
  '../helpers/fileinput'
],function(
  piclist,
  ko,
  fileinput
){
  var path = global.require('path');
  var fs = global.require('fs-extra');
  var emitter = global.require('events').EventEmitter;
  var util = global.require('util');

  function Spirit ( optn ) {
    optn = optn || {};

    // TODO : more strict constructor protect
    if( optn.name == '' || 
        optn.sourceDir    == '' ||
        optn.outputSpirit == '' ||
        optn.outputLess   == ''
      ){
      throw new Error('illegal arguments');
    }
    this.name         = ko.observable( optn.name         );
    this.sourceDir    = ko.observable( optn.sourceDir    );
    this.outputSpirit = ko.observable( optn.outputSpirit );
    this.outputLess   = ko.observable( optn.outputLess   );

    this.piclist      = ko.observableArray([]);
    this.canvas       = document.createElement('canvas');
    this.ctx          = this.canvas.getContext('2d');
    emitter.call(this);
    var self = this;
    ['name','sourceDir','outputSpirit','outputLess'].forEach(function(name){
      self[name].subscribe(function( val ){
        self.emit('change',{ 
          type : name,
          val  : val
        });
      });
    });
  }
  util.inherits( Spirit, emitter );
  var sproto = Spirit.prototype;
  
  sproto.changeOutputSpirit = function(){
    var self = this;
    fileinput.getSaveAs( 
      path.dirname( this.outputSpirit() ), 
      function( val ){
        self.outputSpirit(val);
      })
  }

  sproto.changeOutputLess = function(){
    var self = this;
    fileinput.getSaveAs( 
      path.dirname( this.outputLess() ), 
      function( val ){
        self.outputLess(val);
      })
  }

  sproto.changeSourceDir = function(){
    var self = this;
    fileinput.getDirectory( 
      this.sourceDir(), 
      function( val ){
        fs.copy( self.sourceDir(), val, function(err){
          if(err){
            alert(err);
          } else {
            self.sourceDir(val);
          }
        });
      });
  }
  sproto.toJSON = function(){
    return {
      name         : this.name(),        
      sourceDir    : this.sourceDir(),   
      outputSpirit : this.outputSpirit(),
      outputLess   : this.outputLess()
    }
  }
  sproto.change = function( handle ){
    this.on('change', handle );
  }
  sproto.map = function( obj ){
     this.name        ( obj.name         );
     this.sourceDir   ( obj.sourceDir    );
     this.outputSpirit( obj.outputSpirit );
     this.outputLess  ( obj.outputLess   );
  }
  return Spirit;
});