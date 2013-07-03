define([

],function(

){


  function getSaveAs ( defp, got ){
    if( typeof defp == 'function'){
      got = defp;
      defp = undefined;
    }
    var saveas = document.createElement('input');
    saveas.setAttribute('type',"file");
    saveas.setAttribute('nwsaveas',"true");
    console.log( defp );
    if(defp){
      saveas.setAttribute('nwworkingdir', defp);
    }
    saveas.addEventListener('change',function(){
      got( this.value );
    })
    saveas.click();
  }
  function getDirectory( defp, got ){
    if( typeof defp == 'function'){
      got = defp;
      defp = undefined;
    }
    var saveas = document.createElement('input');
    saveas.setAttribute('type',"file");
    saveas.setAttribute('nwdirectory',"true");
    if(defp){
      saveas.setAttribute('nwworkingdir', defp);
    }
    saveas.addEventListener('change',function(){
      got( this.value );
    })
    saveas.click();
  }
  return  {
    getSaveAs : getSaveAs,
    getDirectory:getDirectory
  }
});