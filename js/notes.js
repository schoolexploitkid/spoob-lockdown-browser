console.log("Inside notes...");
	console.log(param('url'));

	//var webview = document.getElementById("inlineFrameExample");
	//webview.src = param('url');

  console.log("loading in the DIV");
  //$( "#results" ).load( "https://respondus.instructure.com/login/canvas" );
	

	function param(name) {
    	return (location.search.split(name + '=')[1] || '').split('&')[0];
	}

  $("#continue_exam").click(function() {
    console.log("continue exam");

     chrome.runtime.sendMessage({action: 'resumeexam'});

  });

