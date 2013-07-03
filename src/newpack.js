define([
  'ko',
  'underscore'
],function(
  ko,
  __
){
  var events = global.require('events');

  var newpackPopup = _.extend(new events.EventEmitter(),{
    name      : ko.observable('some'),
    type      : ko.observable(''),
    minheight : ko.observable(''),
    minwidth  : ko.observable(''),
    border    : ko.observable(''),
    classname : ko.observable(''),

    validateborder : function( val ) {
      if( val != '' && !val.match(/^\d+(\s\d+)*$/) ){
        return 'invalid border sets';
      }

      var mn = val.split(/\s+/);
      var n  = mn.length;
      switch( this.type() ){
        case 'single' :
          return '';
        case 'box' :
          if(n < 5 && n > 0 && !val.match(/^\s*$/)){
            return '';
          }
          return 'invalid border sets';
        case 'horizon' :
        case 'vertical' :
          if(n < 3 && n > 0 && !val.match(/^\s*$/)){
            return '';
          }
          return 'invalid border sets';
      }
    },
    reset     : function() {
       this.type('');     
       this.minheight('');
       this.minwidth(''); 
       this.border('');
    },

    save     : function() {
      this.emit ( 'save', this.getdata() );
    },
    cancel   : function() {
      this.hide();
      this.reset();
    },
    enable   : function() {
      var type = this.type();
      var border = this.border();
      if( this.name() == '' ){
        return false;
      }
      if( type == 'single' ){
        return true;
      }
      if(  type != 'horizon' && this.minheight() == '' ){
        return false;
      }
      if( type != 'vertical' && this.minwidth() == '' ){
        return false;
      }
      if(  this.validateborder( border ) != '' ){
        return false;
      }
      return true;
    },
    getdata  : function() {
      return {
        name      : this.name(),     
        type      : this.type(),     
        minheight : this.minheight(),
        minwidth  : this.minwidth(), 
        border    : this.border(),
        classname : this.classname()
      };
    }
  });
  
  return newpackPopup;
});