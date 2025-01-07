
var borderjs = borderjs || {};


//var extensionid = "cilcdkieeekklkigichambflmbjhbjae";
var extensionid = chrome.runtime.id;

console.log("border.js @ extension: " + extensionid);



setupAll();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    console.log("BORDERJS: " + request.action);

   

  });





function isFirstLoad(namesp, jsfile) {
	var isFirst = namesp.firstLoad === undefined;
	namesp.firstLoad = false;

	if (!isFirst) {
		console.log("BorderJS already was loaded");
	}

	return isFirst;
}

function setupAll() {
	console.log("Setup All running");

	divtab = document.createElement('div');
	divtab.id="ldb_header_div";
	//divtab.style.height = '100%';
	divtab.style.height = '50px';
	divtab.style.maxHeight = '50px';
	divtab.style.top = '0';
	divtab.style.left = '0';
	divtab.style.width = '100%';
	divtab.style.zIndex = '9999999';
	divtab.style.border = 'none';
	divtab.style.position = 'absolute';	
	divtab.style.pointerEvents = "none";



	tabs = document.createElement('iframe');
	tabs.setAttribute('src',"chrome-extension://" + extensionid + "/tabs/tabs.html");
	
	tabs.id = "ldb_header_frame";
	tabs.style.position = 'fixed';
	tabs.style.height = '50px';
	tabs.style.maxHeight = '50px';
	tabs.style.top = '0';
	tabs.style.left = '0';
	tabs.style.width = '100%';
	tabs.style.zIndex = '9999998';
	tabs.style.border = 'none';
	divtab.style.pointerEvents = "auto";

	divtab.appendChild(tabs);

	document.documentElement.appendChild(divtab);

	
	//document.documentElement.appendChild(tabs);
	

	

	


/*
	var find = $('*').filter(function () { 
        return $(this).css('position') == 'fixed';
    });

     

   
   jQuery.each( find, function(i, val) {
   		console.log(val);
   		var positiontop = $(val).css('top');
   		var positionleft = $(val).css('left');
   		var role = $(val).attr("role");

   		if (positionleft == "0px" && !role) {
   			var positionwidth = $(val).css('width');
   			//$('#top').css("margin-left", "55px");
   		}

   		if (positiontop == "0px" && !role) {
   			var positionheight = $(val).css('height');
   			//$('#top').css("margin-top", positionheight);
   		}
   });

  */
   
   /*
	if (! $("#top").length ) {
		$('head').append('<div id="top"></div>');
		$('#top').html('<ul id="respondus_tabbar" class="nav nav-tabs navbar-dark"></ul>');

		chrome.runtime.sendMessage({action: 'gettabline'}, function(response) {
	    	console.log('tabbar returned ' + response);
	    	$('#respondus_tabbar').html(response);
		  
		});

		var newurl = chrome.extension.getURL('images/icon_128.png');
	}
	*/
	
	

	

	//$('body').append("<div id='left'></div>");
	//$('body').append("<div id='right'></div>");
	//$('body').append("<div id='bottom'></div>");	

	

	//$("#main").css("z-index", "0");
	//$("#main").css("margin", "20px");
	//$("#main").css("margin-top", "60px");






	


	if (isFirstLoad(borderjs, "border.js")) {

		

		


		
	// manage the clicks
	$('body').unbind('click');
	$('body').on('click', 'a[target="_blank"], a[target="_new"], a[target="frame"], a[target="_parent"],a[target="_self"],a[target="_top"]', function(e){

		console.log("TRAPPED THE CLICK in " + extensionid);
	    e.preventDefault();
	    e.stopPropagation();


	    chrome.runtime.sendMessage(extensionid, {action: 'openlink', payload: $(this).prop('href')}, function(response) {
	    	console.log('Openlink message sent');		  
		});
		
	});
	
  var pgframe = $('frame[name="pageFrame"]', top.document)[0];

  if (pgframe) {

  	var frameDocument = pgframe.contentDocument;
		var framebody = $(frameDocument).find('body');

		console.log(frameDocument);
		console.log(framebody);

		$(frameDocument).css("margin", "100px");

		$(framebody).unbind('click');
		$(framebody).on('click', 'a', function(e){

			console.log("TRAPPED THE FRAME CLICK");

			const rs = $(this).attr('target').indexOf("app.readspeaker") == -1;

			if (rs) {

				e.preventDefault();
				e.stopPropagation();
				
				chrome.runtime.sendMessage(extensionid, {action: 'openlinkframe', payload: $(this).prop('href')}, function(response) {
					console.log('frame click message sent');		  
				});
			}
			
		});

  }
	
}


	
	


/*
	$('body').on('click', '.nav-item', function(e) {

		console.log("TRAPPED THE NAVITEM CLICK");
	    e.preventDefault();

	    chrome.runtime.sendMessage({action: 'tabclick', payload: this.id}, function(response) {
	    	console.log('Tab clicked');		  
		});
	});

	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	    console.log(sender.tab ?
	                "from a background script:" + sender.tab.url :
	                "from the extension");

	    if (request.action == "openlinkbk") {
	    	console.log("background opened a requestedtab " + request.tabid);
	    	$("#respondus_tabbar").append('<li id="' + request.tabid + '" class="nav-item"><a class="nav-link active" href="#">Exam Link 1</a></li>');
	    }

  });
  */

    //chrome.tabs.create({url: $(this).prop('href'), active: false});
    return false;

}