console.log("essayright ............. ") ;
var essayrightmain = essayrightmain || {};
var extensionid = chrome.runtime.id;

var isFirstLoad = function(namespace, jsFile) {
  var isFirstTime  = namespace.firstLoad === undefined;
  namespace.firstLoad = false;

  if (!isFirstTime) {
      console.log('essayright is loaded twice');
  }

  return isFirstTime;
}

 $(document).ready( function() {

  targetBlockCheck();

  if (!isFirstLoad(essayrightmain, "essayright.js")) {
    return;
  } else {
    setInterval(function () {targetBlockCheck();}, 700);
  }
    
 });

 function targetBlockCheck() {
  //console.log("essayright check");
  targetBlock();

  /*
	chrome.storage.local.get([ 'systemstate' ], function(result){        
        const start = result.systemstate.examStarted;
        if (start) {
          targetBlock();            
        }
    });
    */
}


 function targetBlock() {  

  var htmlElement = document.querySelector("html");
  $(htmlElement).css("top", "0px");


  $("iframe").each(function() {

   // console.log("Found " + $(this).attr("id"));

    var content = $(this).contents();
    var children = $(this).children();

   // console.log("looking for internal iframe");
   // console.log(content);

    

    content.find('#tinymce').bind("contextmenu",function(e){
      return false;
    });

    content.find('#tinymce').each(function(i,obj) {
      
      $(obj).bind("contextmenu", function(e) {
          e.preventDefault();
          return false;
      });

      var tinycontent = $(obj).contents();

      //tinycontent.find("[aria-label='Insert Math Equation']").remove();

      tinycontent.find("[aria-label='Insert/edit link']").remove();
      tinycontent.find("[aria-label='Insert/edit media']").remove();
      tinycontent.find("[aria-label='Insert Quicklink']").remove();

      tinycontent.find("[aria-label='Add content']").remove();
      tinycontent.find("[aria-label='Source code']").remove();
      tinycontent.find("[aria-label='flickr']").remove();
      tinycontent.find("[aria-label='More External Tools']").remove();
      tinycontent.find("[aria-label='More external tools']").remove();
      tinycontent.find("[aria-label='Meerdere externe tools']").remove();
      tinycontent.find("[aria-label='eksterne']").remove();
      tinycontent.find("[aria-label='externas']").remove();

      tinycontent.find("[aria-label='Insert Image']").remove();
      tinycontent.find("[aria-label='Links']").remove();
      tinycontent.find("[aria-label='Images']").remove();
      tinycontent.find("[aria-label='Documents']").remove();
      tinycontent.find("[aria-label='External Tools']").remove();
      tinycontent.find("[aria-label='Record/Upload Media']").remove();

      document.querySelectorAll('[role="dialog"]').forEach(function (el){
        console.log(">>>>>> Found Dialog");
      });


      /*tinycontent.find("*").each(function() {
        console.log(">>Found " + $(this).attr("id"));
      });*/
  });

  

    /*
    $('#tinymce').bind("contextmenu",function(e){
      return false;
    });

    $("#tinymce").each(function(i,obj) {
        console.log("blocking context");
        console.log(obj);
        $(obj).bind("contextmenu", function(e) {
            e.preventDefault();
            return false;
        });
    });
    */
    

    

    
  });

}
