console.log("Inside notes...");
	console.log(param('url'));

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
      chrome.runtime.sendMessage({action: 'endexamearly', reason: reasongiven});
    }


    

  });

   $("#return_exam_one, #return_exam_two").click(function() {
    console.log("end exam");

    $("#ldb_titlebox").show();
    $("#reason_div").hide();     

    chrome.runtime.sendMessage({action: 'cancelendexamearly'});

  });


