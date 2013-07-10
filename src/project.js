define([
  './vm/spirit',
  'ko',
  'underscore'
],function(
  spirit,
  ko,
  __
){
  var emitter = global.require('events').EventEmitter;
  var fsExtra = global.require('fs-extra');
  var path = global.require('path');
  
  var keys = ['name','sourceDir','outputSpirit','outputLess', 'packs'];
  function Project ( optn ) {
    var self = this;
    optn = optn || {};
    this.name         = ko.observable( optn.name         || '' );
    this.sourceDir    = ko.observable( optn.sourceDir    || '' );
    this.outputSpirit = ko.observable( optn.outputSpirit || '' );
    this.outputLess   = ko.observable( optn.outputLess   || '' );
    this.packs        = ko.observable( optn.packs        || [] );
    emitter.call(this);

    keys.forEach(function(name){
      self[name].subscribe(function( val ){
        self.emit('change',{ 
          type : name,
          val  : val
        });
      });
    });

    var debounced= _.debounce(function() {
                    fsExtra.outputJSONSync( 
                      path.join(this.sourceDir(),'./.spirit-project'),
                      this.toJSON() );
                  }.bind(this),300);
    this.save = function(){ 
                  debounced(); 
                  return this;
                };

    this.on('change', this.save );
  }

  function dim() {}
  dim.prototype = spirit.prototype;
  var fn = Project.prototype = new dim();
  
  fn.constructor = Project;
  fn.toJSON = function(){
    return {
      name         : this.name(),        
      sourceDir    : this.sourceDir(),   
      outputSpirit : this.outputSpirit(),
      outputLess   : this.outputLess(),
      packs        : this.packs()
    }
  };

  fn.load = function() {
    try{
      Project.call( this, 
        fsExtra.readJSONSync( 
          path.join(this.sourceDir(),'./.spirit-project')));
    } catch(e){
      this.save();
    }
    return this;
  };
  
  return Project;
});