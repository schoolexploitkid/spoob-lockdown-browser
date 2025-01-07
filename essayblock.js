console.log("essayblock ............. ") ;

 $(document).ready(function(){

  

  
  targetBlockCheck();
  

  

  setInterval(function () {targetBlockCheck();}, 450);

    
 });

 

 function targetBlockCheck() {
  //console.log("targetblockcheck <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
  

	chrome.storage.local.get([ 'systemstate' ], function(result){        
        const start = result.systemstate.examStarted;
        if (start) {
          targetBlock();            
        } 
    });
}


 function targetBlock() {  
  //console.log("targetblock");

  var htmlElement = document.querySelector("html");
  $(htmlElement).css("top", "0px");

  $("iframe").each(function() {

    //console.log("Found iframe-" + $(this).attr("src"));
 
     var content = $(this).contents();
     var children = $(this).children();
 
    //console.log("looking for internal iframe");
    //console.log(content);
 
    $(this).bind("contextmenu",function(e){
      return false;
    });
 
     content.find('#tinymce').bind("contextmenu",function(e){
       return false;
     });
 
     content.find('#tinymce').each(function(i,obj) {

      //console.log("finding tiny mce");

      $(obj).parent().bind("contextmenu", function(e) {
        e.preventDefault();
        return false;
      });
       
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
         //console.log(">>>>>> Found Dialog");
       });
 
 
       tinycontent.find("*").each(function() {
         //console.log(">>Found " + $(this).attr("id"));
       });
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

 
  var wc = document.getElementsByClassName("d2l-htmleditor-wc");
  for (wc_i = 0; wc_i < wc.length; wc_i++) { 
    
  }
 
 
  
  //$('d2l-htmleditor').each(function() {
   // console.log("found an editor");
 // });
  


  var ldb_editors = document.getElementsByTagName('d2l-htmleditor');
      for (ldb_i = 0; ldb_i < ldb_editors.length; ldb_i++) { 
        var editorShadow = ldb_editors[ldb_i].shadowRoot; 
		        if (!editorShadow) { 
		            continue; 
		        } 

            
            var linkMenus = editorShadow.querySelectorAll('d2l-htmleditor-link-display-context-menu');
            for (lm = 0; lm < linkMenus.length; lm++) {
              var lmShadow = linkMenus[lm].shadowRoot;
              if (!lmShadow) {
                continue;
              }
              //console.log("found link menus");
            }
      }   


      //$("frameset").each(function() {
        //console.log("found frameset");
      //});

      //$("frame").each(function() {
      //  console.log("found frame");
      //});

  
  
  $("iframe").each(function() {

    
    

      var content = $(this).contents();

      
      var jeditors = content.find('d2l-htmleditor');
      
      

      
      content.find("[aria-label='Insert/edit link']").remove();
      content.find("[aria-label='Insert/edit media']").remove();
      content.find("[aria-label='Insert Quicklink']").remove();

      content.find("[aria-label='Add content']").remove();
      content.find("[aria-label='Source code']").remove();
      content.find("[aria-label='flickr']").remove();
      content.find("[aria-label='More External Tools']").remove();
      content.find("[aria-label='More external tools']").remove();
      content.find("[aria-label='Meerdere externe tools']").remove();
      content.find("[aria-label='eksterne']").remove();
      content.find("[aria-label='externas']").remove();

      content.find("[aria-label='Insert Image']").remove();
      content.find("[aria-label='Links']").remove();
      content.find("[aria-label='Images']").remove();
      content.find("[aria-label='Documents']").remove();
      content.find("[aria-label='External Tools']").remove();
      content.find("[aria-label='Record/Upload Media']").remove();

      content.find("[aria-label='Apps']").remove();
      content.find("[aria-label='Embed']").remove();
      content.find("[aria-label='rce-edit-btn']").remove();
      content.find("[aria-label='rce-fullscreen-btn']").remove();
      content.find("#aria_85961695913491697580830303").remove();
      content.find("[aria-label='Powered by Tiny']").remove();
      content.find("[aria-label='Help']").remove();
      

      

  });

 

  

  $(".bb-editor-root").each(function() {
    
    
    $(this).find("[aria-label='Insert/edit link']").remove();
    $(this).find("[aria-label='Insert/edit media']").remove();
    $(this).find("[aria-label='Insert/edit local files']").remove();    
    $(this).find("[aria-label='Insert Quicklink']").remove();
    $(this).find("[aria-label='Insert content']").remove();
  });
  

   $("#aria_85961695913491697580830303").remove();
   $("[aria-label='Help']").remove();
   $("[aria-label='Source code']").remove();
   $("[aria-label='Powered by Tiny']").remove();
   $("[aria-label='Add content']").remove();
   $("[aria-label='Insert Quicklink']").remove();
   $("[aria-label='Insert Image']").remove();
   $("[aria-label='Links']").remove();
   $("[aria-label='Images']").remove();
   $("[aria-label='Documents']").remove();
   $("[aria-label='External Tools']").remove();
   $("[aria-label='Record/Upload Media']").remove();

   $("[aria-label='Google Drive (LTI 1.3)']").remove();
   $("[aria-label='Learn360']").remove();

   $("[aria-label='Apps']").remove();
   $("[aria-label='Embed']").remove();
   $("[aria-label='rce-edit-btn']").remove();
   $("[aria-label='rce-fullscreen-btn']").remove();

   $(".atto_image_button").remove();
   $(".mce_pdw_toggle").remove();
   $(".mce_image").remove();
   $(".mce_moodlemedia").remove();
   $(".atto_link_button").remove();
   $(".links_group").remove();
   $(".m-t-2").remove();
   $(".m-b-1").remove();

   $(".mce_sContentImage").remove();


   

   

   
	

   


   

};