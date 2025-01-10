console.log("Inside earlyexamend...");
	console.log(param('url'));

  const GLOBAL_closebrowser = chrome.i18n.getMessage("examearly_closebrowser");
  const GLOBAL_buttonreturn = chrome.i18n.getMessage("examearly_buttonreturn");
  const GLOBAL_buttonclose = chrome.i18n.getMessage("examearly_buttonclose");
  const GLOBAL_providereason = chrome.i18n.getMessage("examearly_providereason");
  const GLOBAL_savereason = chrome.i18n.getMessage("examearly_savereason");
  

  $(document).ready(function(){
    $("#notclose").html(GLOBAL_closebrowser);
    $("#return_exam_one").html(GLOBAL_buttonreturn);
    $("#return_exam_two").html(GLOBAL_buttonreturn);
    $("#close_browser_one").html(GLOBAL_buttonclose);
    $("#providereason").html(GLOBAL_providereason);
    $("#close_browser_two").html(GLOBAL_savereason);
  });


	//var webview = document.getElementById("inlineFrameExample");
	//webview.src = param('url');

  console.log("loading in the DIV");
  //$( "#results" ).load( "https://respondus.instructure.com/login/canvas" );
	

	function param(name) {
    	return (location.search.split(name + '=')[1] || '').split('&')[0];
	}

  $("#end_exam").click(function() {
    console.log("end exam");

    $("#results").hide();

     chrome.runtime.sendMessage({action: 'endexam'});

  });

  $("#close_browser_exit").click(function() {
    console.log("end exam");

    chrome.runtime.sendMessage({action: 'endexamexit'});
    

    $("#ldb_titlebox").show();
    

  });


  $("#close_browser_one").click(function() {
    console.log("end exam");

    $("#ldb_titlebox").hide();
    $("#reason_div").show();     

  });

   $("#close_browser_two").click(function() {
    console.log("end exam");

    

    var reasongiven = $("#ldb_reason_text").val();

    if (reasongiven == null || reasongiven == '') {
      $("#ldb_reason_text").css("border-color", "red");
      $("#ldb_reason_text").css("border-width", "5px");

    } else {
      $("#ldb_titlebox").show();
      $("#reason_div").hide();    
      GLOBAL_max = false; 
      chrome.runtime.sendMessage({action: 'endexamearly', reason: reasongiven});
    }


    

  });

   $("#return_exam_one, #return_exam_two").click(function() {
    console.log("end exam");

    $("#ldb_titlebox").show();
    $("#reason_div").hide();     

    chrome.runtime.sendMessage({action: 'cancelendexamearly'});

  });


