

// protect the window
var protectwindowmain = protectwindowmain || {};
var extensionid = chrome.runtime.id;

console.log("protect");

var GLOBAL_lock = null;
var GLOBAL_max = true;
var GLOBAL_ctrl_state = false;

var GLOBAL_protected = [];
var GLOBAL_scroll = null;
var GLOBAL_scroll_lock = null;
var GLOBAL_overlay = false;
var GLOBAL_escape_mode = false;
var GLOBAL_count_mode = false;
var GLOBAL_count = 0;

var GLOBAL_focus_count = 0;
var GLOBAL_screenshot_count = 0;
var GLOBAL_report_mode = false;

var GLOBAL_lms_domain = null; 
var GLOBAL_exam_exit = false; 
var GLOBAL_block_esc = false;

const GLOBAL_noaltpro = chrome.i18n.getMessage("no_alt_ctrlshift");

const GLOBAL_focuswarn = chrome.i18n.getMessage("focuswarn");
const GLOBAL_focusexit = chrome.i18n.getMessage("focusexit");

const GLOBAL_screenshotwarn = chrome.i18n.getMessage("screenshotwarn");
const GLOBAL_screenshotexit = chrome.i18n.getMessage("screenshotexit");

const GLOBAL_displayadded = chrome.i18n.getMessage("displayadded");




showframeCheckInstall();
setInterval(showframeCheckInstall, 3500);


$(window).on('load', function() {
  
  console.log("window is loaded");

    
  window.addEventListener('contextmenu', function(event){ 
        event.preventDefault(); 
        
    }, false);
    

  
});


var isFirstLoad = function(namespace, jsFile) {
    var isFirstTime  = namespace.firstLoad === undefined;
    namespace.firstLoad = false;

    if (!isFirstTime) {
        console.log('protectmain is loaded twice');
    }

    return isFirstTime;
}

$(document).ready(function() {

    GLOBAL_lms_domain= window.location.protocol + "//" + window.location.host;

    
    navigator.clipboard.write = function(text) {
      chrome.runtime.sendMessage({action: "copyeventdetected"});
      return Object.getPrototypeOf(navigator.clipboard).writeText.call(navigator.clipboard, text);
    };

    navigator.clipboard.writeText = function(text) {
      chrome.runtime.sendMessage({action: "copyeventdetected"});
      return Object.getPrototypeOf(navigator.clipboard).writeText.call(navigator.clipboard, text);
    };

    document.addEventListener("copy", ()=>{
        chrome.runtime.sendMessage({action: "copyeventdetected"});
    });
    

    $(window).bind("beforeunload", function(){ return(false); });
    $("body").bind("beforeunload", function(){ return(false); });
    $(window).off('beforeunload');
    window.addEventListener("beforeunload", function (e) { console.log("IN LISTENER"); return false; });




    updatecount();

    if (!isFirstLoad(protectwindowmain, "protectwindow.js")) {
        return;
    } else {
        //chrome.runtime.onMessage.removeListener(handleMessages);
        chrome.runtime.onMessage.addListener(handleMessages);

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
    
                console.log("PROTECT ACTION: " + request.action);
    
                if (request.action == 'ctrldownXX') {
                    console.log("showing overlay frame");
                    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
                }
                if (request.action == 'ctrlupXX') {
                    console.log("hiding overlay frame");
                    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "none");
                }
    
            });

        var textArea = document.createElement("textarea");
        textArea.style.background = "transparent";

        console.log("CLEARING CLIPBOARD");
        for(let i = 10; i < 18; i++) {
            textArea.value = i+"------"+i;
            document.body.appendChild(textArea);
            textArea.select();
            status = document.execCommand("copy");
        }

       

        document.body.removeChild(textArea);

    }

    // right click
     
    document.addEventListener('contextmenu', event => event.preventDefault());   
    

    // hide the weird header
    $("header").hide();

    // schoology
    $(".lrn-assess-skip-to-content-link").each(function(e) {
        $(this).remove();
    });
    
    $(".skip").each(function(e) {
        $(this).remove();
    });

    /*

    $('a').each(function() {
                $(this).attr('target','_blank');        
            });
            */

	$(window).scroll(function (event) {
    	GLOBAL_scroll = $(window).scrollTop();    	
	});

   

    var url = window.location.href;

    // V3CHANGE
    // schoology exam
    if (url.indexOf("assignment") != -1 && url.indexOf("assessment") != -1) {
        console.log("schoology exam.....................");
        $('a').each(function() {
                $(this).attr('target','_blank');        
            });
    }


    if (url.indexOf("submitted") == -1 && url.indexOf("review") == -1 && url.indexOf("history") == -1) {

        console.log("Setting target on " + url);

        // Bb launch (exam) 
        if (url.indexOf("launch") != -1) {
            $('a').each(function() {
                $(this).attr('target','_blank');        
            });
        }

         

    }

   


    chrome.runtime.sendMessage({ action: 'reportmode' }, function(response) {
        console.log('REPORTMODE');
        console.log(response);

        GLOBAL_report_mode = response.reportmode;
    });

});

function handleMessages(request, sender, sendResponse){

    //chrome.runtime.sendMessage({action: 'handleMessagesProtectWindow', reason: request.id});


    if (request.action == "focuslost") {
        handleFocusConfirm();
    }

    if (request.action == "displaychange") {
        handleDisplayConfirm();
    }

    if (request.action == "screenshot") {

        var inputField = document.createElement("input");
        document.getElementsByTagName("html")[0].appendChild(inputField);

        inputField.focus();                        
        document.execCommand("paste");
        inputField.style.visibility = "hidden";
        
        if (inputField.value == '') {
            console.log('screenshot detected');
            handleScreenshotConfirm();
        }

        
        
    }

    if (request.action == "ctrldownXX") {
        if (GLOBAL_escape_mode == false) {
            $("#overlay-ldb-text").html("");
        }
        if (GLOBAL_ctrl_state == false) {
            
            GLOBAL_ctrl_state = true;

            handleHide();
        }
    }

    if (request.action == "ctrlupXX") {
        GLOBAL_block_esc = false;
        GLOBAL_ctrl_state = false;        

        if (GLOBAL_escape_mode == false) {
            $("#overlay-ldb").css("display", "none");    
    	    $("body").css("overflow", "visible");
        }
        
    }

    if (request.action == "altdownXX") {
        GLOBAL_escape_mode = true;
        handleHideConfirm();
    }

    if (request.action == "altupXX") {    
        
        showframeCheckInstall();
    }

    if (request.action == "escupXX") {    
        
        // escaping from the lock
		GLOBAL_escape_mode = false;
        GLOBAL_count_mode = false;

		handleShow();
    }

    

    if (request.action == 'pasteinval') {
        var $focused = $(':focus');
        $focused.val(request.value);
    }


}



function getDocHeight() {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
}

function getDocHeight2() {
    var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, html.scrollHeight);
    
    return height;
}




function showframeCheckInstall() {

    // also checkInstall
    checkInstall();


	if (!GLOBAL_overlay) {
		GLOBAL_overlay = true;

		var height = getDocHeight();		


		$("body").append('<div id="overlay-ldb" tabindex=-1 style="display:none;opacity:1.5;background-color:#efefef;position:fixed;width:100%;top:0px;left:0px;z-index:10000;height:100%;"><span id="overlay-ldb-text" style="display:block;padding:150px;width:80%;font-family: Verdana;font-size:24px;font-weight:300;text-align:left;position:relative;top:125px;"></span></div>');	
        
	}

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
	
	$('iframe, textarea, frame[name = "pageFrame"]').each(function(i, obj) {

		var knowby = obj.id || obj.name;

		if (!GLOBAL_protected.includes(obj.id)) {
			//GLOBAL_protected.push(obj.id);
			
			var contents = $(obj).contents(); // contents of the iframe			

			var bod = $(contents).find("body");

			

			$(contents).find("body").on('keydown', function(e) { 
		         
		         handleKeyDown(e);  
		     });

		      $(contents).find("body").on('keyup', function(e) { 
		         
		         handleKeyUp(e);  
		     });

		}    	
	});

	
}



function handleHide(e) {

	console.log("handleHide");
	GLOBAL_scroll_lock = GLOBAL_scroll;

	//$("body").css("display", "none");

	var height = getDocHeight();

	
    console.log(height);

	$("#overlay-ldb-text").css("top", GLOBAL_scroll + 125);
	$("#overlay-ldb").css("height", height);     
    $("#overlay-ldb").css("display", "block");    
	//$("body").css("overflow", "hidden");
	
}



function handleHideConfirm(e) {

	
	GLOBAL_scroll_lock = GLOBAL_scroll;

	//$("body").css("display", "none");

	var height = getDocHeight();
	

	$("#overlay-ldb-text").css("top", GLOBAL_scroll + 125);
	$("#overlay-ldb").css("height", height);     
    $("#overlay-ldb").css("display", "block");    
	//$("body").css("overflow", "hidden");

	GLOBAL_count++;

    if (GLOBAL_count_mode === false) {        
        GLOBAL_count_mode = true; 

        
    }
        
        console.log("count " + GLOBAL_count + "report " + GLOBAL_report_mode);

    if (GLOBAL_count > 1) {
        
        
        if (!GLOBAL_report_mode) {
            
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_noaltpro); }, 150); 
            //setTimeout(function(){ chrome.runtime.sendMessage({action: 'endexamearly', reason: '***cbekeynotallowedexit***'}); }, 4000);     
            //GLOBAL_block_esc = true; 
        } else {
            
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_noaltpro); }, 150); 
            //setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportexamkey', reason: '***cbekeynotallowedreport***'}); }, 4000);             
        }
        
    } else {

        if (!GLOBAL_report_mode) {
            
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_noaltpro); }, 350); 
        } else {
            
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_noaltpro); }, 350); 
        }
    }
	
	
}

function handleShow(e) {
		
    if (!GLOBAL_block_esc) {
        $("#overlay-ldb").css("display", "none");    
    	$("body").css("overflow", "visible");
    }



	if (GLOBAL_scroll_lock != null) {
		$("body").scrollTop(GLOBAL_scroll_lock);
		GLOBAL_scroll_lock = null;

	} 	
}



function handleKeyDown(e) {

    console.log("protectwindow handlekeydown")

    // 27 is ESC
	if (GLOBAL_escape_mode && e.which == 27) {
		// escaping from the lock
		GLOBAL_escape_mode = false;
        GLOBAL_count_mode = false;

		handleShow(e);
	}

    if ( (e.altKey)) {

        if (GLOBAL_escape_mode == false) {
            GLOBAL_escape_mode = true;
            handleHideConfirm(e);        
        }
		
	}

    if ( (e.ctrlKey && e.shiftKey)) {
        e.preventDefault(); 

        if (GLOBAL_escape_mode == false) {
            GLOBAL_escape_mode = true;
            handleHideConfirm(e);        
        }		
	} else if (e.ctrlKey) {
        //e.preventDefault(); 
        
        if (GLOBAL_ctrl_state == false) {
            GLOBAL_ctrl_state = true;

            if (GLOBAL_escape_mode == false) {
                $("#overlay-ldb-text").html("");
            }
            
            handleHide(e);
        }
        
    }
    
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        //e.preventDefault();
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
     }

     if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
     }
    
    e = e || window.event; //Get event

    if (e.which == 187 || e.which == 189 || e.which == 86 || e.which == 88 || e.which == 67) {
        console.log("+ or - pushed");

        if (GLOBAL_lock != null) {
			clearTimeout(GLOBAL_lock);
			GLOBAL_lock = null;   

			// only show if we are not in lockdown
			if (GLOBAL_escape_mode == false) {
				handleShow(e);				
			}
			
        }

        return true;

    } 

    

}

function handleKeyUp(e) {

    console.log("handleKeyup " + GLOBAL_escape_mode);
    console.log(e);

 if (e.ctrlKey) {
    	GLOBAL_ctrl_state = true;
    } else {
    	GLOBAL_ctrl_state = false;
    }

    e = e || window.event; //Get event

    //if (!e.ctrlKey && !e.altKey) {
    if (!e.altKey) {
    	if (GLOBAL_escape_mode == false) {
        	handleShow(e);
        }
    }

    //if (e.ctrlKey) return;
}

// ---------------------------------------------------------------

function updatecount() {
    
    chrome.storage.local.get([ 'systemstate' ], function(result){

        
        GLOBAL_count = result.systemstate.ctrlCount;

        GLOBAL_focus_count = result.systemstate.focusCount;
        GLOBAL_screenshot_count = result.systemstate.screenshotCount;
    });
}

function handleScreenshotConfirm(){
    
    
    var height = getDocHeight();

    $("#overlay-ldb").css("height", height);     
    $("#overlay-ldb").css("display", "block");   
    $("#overlay-ldb").focus();  
    
    GLOBAL_screenshot_count++;
    
    // Added for prototype
    if (GLOBAL_screenshot_count > 1) {
        if (!GLOBAL_report_mode) {
            //setTimeout(function(){ confirm("Alert: There was an attempt to take screenshots within LockDown Browser. The exam will now close."); }, 150); 
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_screenshotexit); }, 150); 
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'endexamexit', reason: '***cbekeynotallowedexit***'}); }, 4000);     
            GLOBAL_block_esc = true; 
        } else {
            //setTimeout(function(){ confirm("Alert: There was an attempt to take screenshots within LockDown Browser. The exam will now close."); }, 150); 
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_screenshotexit); }, 150); 
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportscreenshot'}); }, 4000);  
        }

    } else {
        if (!GLOBAL_report_mode) {
            //setTimeout(function(){ confirm("Warning: You are NOT permitted to take screenshots within LockDown Browser. Doing so again will result in the exam closing. Press ESC to return to the exam, after closing this dialog."); }, 350);
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_screenshotwarn); }, 350);
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportscreenshot'}); }, 2000);
        } else {
            //setTimeout(function(){ confirm("Warning: You are NOT permitted to take screenshots within LockDown Browser. Doing so again will result in the exam closing. Press ESC to return to the exam, after closing this dialog."); }, 350);
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_screenshotwarn); }, 350);
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportscreenshot'}); }, 2000); 
        }
    }
}

function handleFocusConfirm(){
    
        
    GLOBAL_scroll_lock = GLOBAL_scroll;    
    var height = getDocHeight();
    

    $("#overlay-ldb-text").css("top", GLOBAL_scroll + 125);
    $("#overlay-ldb").css("height", height);     
    $("#overlay-ldb").css("display", "block");    
    $("#overlay-ldb").focus();   
    
    GLOBAL_focus_count++;
    
    if (GLOBAL_focus_count > 1) {
        if (!GLOBAL_report_mode) {
            //setTimeout(function(){ confirm("Alert: There was an attempt to switch away from LockDown Browser. The exam will now close."); }, 150); 
            
            
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_focusexit); }, 150);             
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'endexamexit', reason: '***cbelostfocusexit***'}); }, 4000);     
            GLOBAL_block_esc = true; 
        } else {
            
            
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_focusexit); }, 150); 
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportexamfocus', reason: '***cbelostfocusreport***'}); }, 4000);  
        }

    } else {
        // give them the warning and reset the count if we haven't already
        if (!GLOBAL_report_mode) {
            //setTimeout(function(){ confirm("Warning: You are NOT permitted to switch away from LockDown Browser. Doing so again will result in the exam closing and the event being reported to your instructor. Press ESC to return to the exam, after closing this dialog."); }, 350);
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_focuswarn); }, 350);
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportexamfocus', reason: '***cbelostfocusreport***'}); }, 2000);
        } else {
            //setTimeout(function(){ confirm("Warning: You are NOT permitted to switch away from LockDown Browser. Doing so again will result in the exam closing and the event being reported to your instructor. Press ESC to return to the exam, after closing this dialog."); }, 350);
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_focuswarn); }, 350);
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportexamfocus', reason: '***cbelostfocusreport***'}); }, 2000); 
        }

        
        
    }
}

function handleDisplayConfirm(){
    
    
    var height = getDocHeight();


    $("#overlay-ldb").css("height", height);     
    $("#overlay-ldb").css("display", "block");  
    $("#overlay-ldb").focus();   
    
    
    
    
        if (!GLOBAL_report_mode) {
            //setTimeout(function(){ confirm("Alert: There was an attempt to add an additional display. The exam will now close."); }, 150); 
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_displayadded); }, 150); 
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'endexamexit', reason: '***cbekeynotallowedexit***'}); }, 4000);     
            GLOBAL_block_esc = true; 
        } else {
            //setTimeout(function(){ confirm("Alert: There was an attempt to add an additional display. The exam will now close."); }, 150); 
            setTimeout(function(){ $("#overlay-ldb-text").html(GLOBAL_displayadded); }, 150); 
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportexamfocus', reason: '***cbekeynotallowedreport***'}); }, 4000);  
        }

     
}


// ---------------------------------------------------------------





document.onkeydown = function(e) {
    console.log("document onkeydown " + e.which);
    handleKeyDown(e);  
}

document.onkeyup = function(e) {
    console.log("document onkeyup " + e.which);
    handleKeyUp(e);     
}

// canvas NEXT exams
$("#root").keydown(function(e) {
	console.log("root onkeydown " + e.which);
    handleKeyDown(e);  
});

$("#root").keyup(function(e) {
	console.log("root onkeyup " + e.which);
    handleKeyUp(e);     
});


 


$("#content_window").ready(function(e) {
	console.log("CONTENT WINDOW IS NOW LOADED");

    var i = document.getElementById('content_window');

    console.log("javascript content");
    //console.log(document.getElementById('content_window').contentDocument);


	var contents = $("#content_window").contents(); // contents of the iframe

    console.log("Contents are...");
    console.log(contents);
        

	$(contents).find("body").on('keydown', function(e) { 
         console.log('keydown'); 
         
         handleKeyDown(e);  
     });

      $(contents).find("body").on('keyup', function(e) { 
         console.log('keyup'); 
         
         handleKeyUp(e);  
     });

      
      


});






window.onresize = function() {
    console.log('been resized');
    maxWindow();

    chrome.runtime.sendMessage({ action: 'onresize' }, function(response) {
        console.log('RESIZE ERROR');
    });
}

window.onfocus = function() {
    console.log("Lost focus");
    maxWindow();

    chrome.runtime.sendMessage({ action: 'onfocus' }, function(response) {
        console.log('FOCUS WARNING');
    });
}

window.onblur = function() {
    console.log("had a blur");
    maxWindow();

    chrome.runtime.sendMessage({ action: 'onblur' }, function(response) {
        console.log('BLUR WARNING');
    });

}


//-----------------------------------------------------------------------------------------------------

function deleteCookies(){
    var cookies = document.cookie.split(";")

    for(var i = 0; i < cookies.length; i++){
        var cookie = cookies[i]
        var eqPos = cookie.indexOf("=")
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name += "=;expires=Thu, 01 Jan  1970 00:00:00 GMT;path=/"
    }
}

// Added for uninstall detection
function removeStyle(){
    // Remove linked style sheets
    const links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
    if (links[i].rel === 'stylesheet') {
        links[i].parentNode.removeChild(links[i]);
    }
    }

    // Remove style elements
    const styles = document.getElementsByTagName('style');
    for (let i = 0; i < styles.length; i++) {
    styles[i].parentNode.removeChild(styles[i]);
    }
}

// Added for uninstall  detection
function checkInstall(){
    if(!chrome.runtime.id && !GLOBAL_exam_exit){
        console.log("Chrome Extension  Uninstalled");
        GLOBAL_exam_exit = true;

        deleteCookies();
        removeStyle();
        document.body.innerHTML = 
            "<h1 style='padding-top:100px;'>The LockDown Browser Chrome Extension was removed.</h1><br>"
            + "<h2>Press the continue button to exit.</h2>"
            + "<br><a stye='color:white;' href='" + GLOBAL_lms_domain + "'><button style='background-color:#387da6s; border-radius:7px; height:30px; width:100px;'>Continue</button></a>";
    }
}

//-----------------------------------------------------------------------------------------------------

function maxWindow() {

    if (GLOBAL_max) {
        window.moveTo(0, 0);
        top.window.resizeTo(screen.availWidth, screen.availHeight);

        if (false) {

        } else if (document.layers || document.getElementById) {
            if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < screen.availWidth) {
                top.window.outerHeight = screen.availHeight;
                top.window.outerWidth = screen.availWidth;
            }
        }

    }
    
}

//-----------------------------------------------------------------------------------------------------