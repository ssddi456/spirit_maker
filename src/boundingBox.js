define([
],function(

){
  function boundingBox ( rectsrc ){
    this.topleft  = {x : rectsrc.x, y: rectsrc.y};
    this.topright = {x : rectsrc.x + rectsrc.width, y: rectsrc.y};
    this.botleft  = {x : rectsrc.x, y: rectsrc.y + rectsrc.heigth };
    this.botright = {x : rectsrc.x + rectsrc.width, y: rectsrc.y + rectsrc.heigth};
  }
});