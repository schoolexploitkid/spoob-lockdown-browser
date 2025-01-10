
const GLOBAL_endwait = chrome.i18n.getMessage("end_waittext");
const GLOBAL_endexit = chrome.i18n.getMessage("end_continuetext");
const GLOBAL_endcontinue = chrome.i18n.getMessage("continue_button");
const GLOBAL_endpleasewait = chrome.i18n.getMessage("end_pleasewaittext");



const GLOBAL_screenwidth = screen.width;
const GLOBAL_screenheight = screen.height-30;



$(document).ready(function() {
    $("#ldb_subtitle").html(GLOBAL_endwait);
    $("#ldb_subtitle2").html(GLOBAL_endexit);
    $("#end_exam").html(GLOBAL_endcontinue);
    $("#please_wait_done").html(GLOBAL_endpleasewait);
    
    var smode = param('mode');
    console.log("SMODE IS [" + smode + "]");

    if (smode == 'false') {		
      console.log("showing sub2 and results");
      $("#ldb_subtitle2").show();
      $("#results").show();  
      $("#please_wait_done").hide();  	

      //chrome.runtime.sendMessage({action: 'showContinue-modefalse'});    	
    } else {		

      console.log("hiding sub2 and results");

      $("#ldb_subtitle2").hide();
      $("#results").hide();  
      $("#please_wait_done").show();  	

      setTimeout(function() {showContinue();}, 300000);
    }
});

	//var webview = document.getElementById("inlineFrameExample");
	//webview.src = param('url');

  //console.log("loading in the DIV");
  //$( "#results" ).load( "https://respondus.instructure.com/login/canvas" );
	

	function param(name) {
    	return (location.search.split(name + '=')[1] || '').split('&')[0];
	}

  function showContinue() {
    chrome.runtime.sendMessage({action: 'showContinue-timeout'});

    $("#results").show();
    $("#ldb_subtitle2").show();
    $("#please_wait_done").hide();
  }

	

  $("#end_exam").click(function() {
    console.log("end exam");

    $("#results").hide();

     chrome.runtime.sendMessage({action: 'endexam'});

  });




  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  	
  	console.log("-----------------------------------------------EXAMENDJS Message received:" + request.action);


  	if (request.action == 'examenddone' ) {
  		$("#results").show();
  		$("#ldb_subtitle2").show();
      $("#please_wait_done").hide();

      chrome.runtime.sendMessage({action: 'showContinue-examenddone'});
  	}

  });



//PROTECT



  window.onresize = function() {
    console.log('been resized');
    maxWindow();          
}

window.onfocus = function() {
    console.log("Lost focus");
    maxWindow();       
}

window.onblur = function() {
    console.log("had a blur");
    maxWindow();     
}

//-----------------------------------------------------------------------------------------------------



function maxWindow() {
  console.log("maxWindow! " + GLOBAL_screenwidth + "," + GLOBAL_screenheight);
  console.log("avail " + screen.availWidth + "," + screen.availHeight);
    window.moveTo(0, 0);
    top.window.resizeTo(GLOBAL_screenwidth, GLOBAL_screenheight);    
    
    chrome.runtime.sendMessage({action: 'onresize'});

    /*
    if (false) {

    } else if (document.layers || document.getElementById) {
        if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < screen.availWidth) {
            top.window.outerHeight = screen.availHeight;
            top.window.outerWidth = screen.availWidth;
        }
    }
    */
}

