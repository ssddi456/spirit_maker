define([
'ko',
'../helpers/fileinput'
],function(
ko,
fileinput
){
  function NewSpirit( validate, handle ){
    this.name         = ko.observable('');
    this.sourceDir    = ko.observable('');
    this.outputSpirit = ko.observable('');
    this.outputLess   = ko.observable('');

    this.createHandle   = handle;
    this.validateHandle = validate;
  }
  var nproto = NewSpirit.prototype;
  nproto.changeOutputSpirit = function(){
    var self = this;
    fileinput.getSaveAs(function(val){
      self.outputSpirit(val);
    })
  }
  nproto.changeOutputLess = function(){
    var self = this;
    fileinput.getSaveAs(function(val){
      self.outputLess(val);
    })
  }
  nproto.changeSourceDir = function(){
    var self = this;
    fileinput.getDirectory(function(val){
      self.sourceDir(val);
    })
  }
  nproto.toJSON = function(){
    return {
      name         : this.name(),        
      sourceDir    : this.sourceDir(),   
      outputSpirit : this.outputSpirit(),
      outputLess   : this.outputLess()
    }
  }
  nproto.validate = function(){
    var data = this.toJSON();
    console.log( 'validate', data.name         != '' &&       
           data.sourceDir    != '' &&  
           data.outputSpirit != '' &&
           data.outputLess   != '' && (
            typeof this.validateHandle == 'function' ? 
              this.validateHandle.call( this, data ) : 
              true ) );
    return data.name         != '' &&       
           data.sourceDir    != '' &&  
           data.outputSpirit != '' &&
           data.outputLess   != '' && (
            typeof this.validateHandle == 'function' ? 
              this.validateHandle.call( this, data ) : 
              true );
  }
  nproto.newSpirit = function(){
    this.createHandle.call( this, this.toJSON() );
  }
  nproto.reset = function (){
    this.name('');
    this.sourceDir('');
    this.outputSpirit('');
    this.outputLess('');
  }
  return  NewSpirit;
});