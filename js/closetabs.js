console.log("Inside closetabs...");
	
const GLOBAL_header = chrome.i18n.getMessage("closetabs_header");
const GLOBAL_displayheader = chrome.i18n.getMessage("closetabs_displayheader");
const GLOBAL_bothheader = chrome.i18n.getMessage("closetabs_bothheader");
const GLOBAL_displayinfo = chrome.i18n.getMessage("closetabs_displayinfo");
const GLOBAL_tabinfo = chrome.i18n.getMessage("closetabs_tabinfo");
const GLOBAL_showfewer = chrome.i18n.getMessage("closetabs_showfewer");
const GLOBAL_showmore = chrome.i18n.getMessage("closetabs_showmore");
const GLOBAL_canvasinfo = chrome.i18n.getMessage("closetabs_canvasinfo");
const GLOBAL_closebutton = chrome.i18n.getMessage("closetabs_closebutton");

$("#base_header").html(GLOBAL_header);
$("#display_header").html(GLOBAL_displayheader);
$("#both_header").html(GLOBAL_bothheader);
$("#display_info").html(GLOBAL_displayinfo);
$("#tab_info").html(GLOBAL_tabinfo);
$("#lesscount").html(GLOBAL_showfewer);
$("#canvasclose").html(GLOBAL_canvasinfo);
$("#ok_button").html(GLOBAL_closebutton);

  
  var list = param("list");
  var exlist = param("exlist");
  var excount = param("excount");
  var cmode = param("cmode");
  var dmode = param("dmode");
  var tmode = param("tmode");

  $("#opentabs").html(decodeURIComponent(list));
  $("#opentabsextra").html(decodeURIComponent(exlist));

  if (excount > 0) {
      $("#extracount").html("+ " + decodeURIComponent(excount) + GLOBAL_showmore);
      $("#extracount").show();
  } else {
    $("#extracount").hide();
  }
  
  if (cmode == 'true') {
    $('#canvasclose').css('display', 'block');
    $('#generalclose').hide();
  } else {
    $('#canvasclose').hide();
    $('#generalclose').show();
  }

  if (dmode == 'true') {
    $('#base_header').hide();
    $('#display_header').show();
    $('#display_info').css('display', 'block');    
  } else {
    $('#base_header').show();
    $('#display_header').hide();
    $('#display_info').hide();
  }

  console.log("tmode = [" + tmode + "]");
  if (tmode == 'true') {
    console.log("doing false");
    $('#tablistdiv').hide();
    $('#tab_info').hide();
    $('#close_info_display').hide();       
  } else {
    console.log("dpoing true");
    $('#tablistdiv').show();
    $('#tab_info').show();
    $('#close_info_display').show();
  }

  if ((tmode == 'true') && (dmode == 'true')) {
    $('#display_header').hide();
    $('#base_header').hide();
    $('#both_header').show();
  }
	

	function param(name) {
    	return (location.search.split(name + '=')[1] || '').split('&')[0];
	}

  $("#extracount").click(function() {
     console.log("show extras");
     $("#extracount").hide();
     $("#opentabsextra").show();
     $("#lesscount").show();
  });


  $("#lesscount").click(function() {
     console.log("show extras");
     $("#extracount").show();
     $("#opentabsextra").hide();
     $("#lesscount").hide();
  });


  $("#ok_button").click(function() {
    console.log("close tabs");

    if (cmode == 'true') {
      chrome.runtime.sendMessage({action: 'closetabs', canvasmode: true});
    } else {
      chrome.runtime.sendMessage({action: 'closetabs'});
    }
     
     window.close();

  });

  $("#retry_button").click(function() {
    console.log("close tabs");

     chrome.runtime.sendMessage({action: 'closetabsretry'});
     window.close();

  });

  $("#cancel_button").click(function() {
	    window.close();
  });

