define([
  './pack',
  'ko',
  'underscore'
],function(
  Pack,
  ko,
  __
){
  var emitter = global.require('events').EventEmitter;
  var changeHandle =  _.debounce(function changeHandle () {
                       console.log( 'trigger handle');
                       PackList.emit('changed');
                      },300);
  var PackList = new emitter();
  _.extend(PackList,{
    packs   : ko.observableArray(),

    addPack : function( pack ) {
      var self = this;
      if( _.isArray(pack) ){
        _.each(pack,function( pack ) {
          self.addPack(pack);
        })
        return this
      }
      this.packs.push( new Pack(pack).watch( changeHandle ) );
      return this
    },
    
    toJSON  : function() {
      return _.map(this.packs(),function( pack ) {
        return pack.toJSON();
      });
    },
    
    remove : function( pack ) {
      pack.unwatch();
      this.packs.remove( pack );
      return this;
    },

    removeAll : function() {
      var self = this;
      _.each(this.packs(),function( pack ) {
        pack.unwatch();
        self.packs.remove(pack);
      })
      return this;
    },
    reset    : function( newpacks ) {
      this.packs().forEach(function( pack ) {
        pack.unwatch();
      });
      this.packs( newpacks.map(function( pack ) {
        return new Pack(pack).watch( changeHandle );
      }))
    }
  });

  return PackList;
});