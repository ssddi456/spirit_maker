define([
  'ko'
],function(
  ko
){
  function piclist (){
    this.piclist = ko.observableArray();
  }
  return piclist;  
});