define([
  'ko',
  'underscore'
],function(
  ko,
  __
){
  var keys = ['type','name','minwidth','minheight','border','classname','trim'];
  function Pack ( props ) {
    var self = this;
    props = props || {};
    _.each( keys ,function( key ) {
      self[key] = ko.observable( props[key] || '' ); 
    })
    this.subscribers = [];
  }
  var fn = Pack.prototype;
  fn.watch = function( handle ) {
    var self = this;
    _.each(keys,function( key ) {
      self.subscribers.push(self[key].subscribe( handle ))
    })
    return this;
  };
  fn.unwatch = function( ) {
    var self = this;
    _.each(this.subscribers,function( subscriber ) {
      subscriber.dispose();
    });
    return this;
  };
  fn.toJSON = function() {
    var ret = {};
    var self = this;
    _.each(keys,function(key) {
      ret[key] = self[key]();
    })
    return ret;
  }
  return Pack;
});