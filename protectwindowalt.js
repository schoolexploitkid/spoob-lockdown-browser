// protect the window
var protectwindowalt = protectwindowalt || {};
console.log("protect ALT");

var GLOBAL_lock = null;
var GLOBAL_ctrl_state = false;

var GLOBAL_protected = [];
var GLOBAL_scroll = null;
var GLOBAL_scroll_lock = null;
var GLOBAL_overlay = false;
var GLOBAL_escape_mode = false;
var GLOBAL_count = 0;
var GLOBAL_report_mode = false;

var GLOBAL_focus_count = 0;
var GLOBAL_screenshot_count = 0;
var GLOBAL_report_mode = false;

var GLOBAL_lms_domain = null; 
var GLOBAL_exam_exit = false; 
var GLOBAL_block_esc = false;

var GLOBAL_noalt = chrome.i18n.getMessage("no_alt_ctrlshift");

var GLOBAL_focuswarn = chrome.i18n.getMessage("focuswarn");
var GLOBAL_focusexit = chrome.i18n.getMessage("focusexit");

var GLOBAL_screenshotwarn = chrome.i18n.getMessage("screenshotwarn");
var GLOBAL_screenshotexit = chrome.i18n.getMessage("screenshotexit");

var GLOBAL_displayadded = chrome.i18n.getMessage("displayadded");




console.log("protect loaded");

checkInstall();
setInterval(checkInstall, 2000);

$(window).on('load', function() {
  
  console.log("window is loaded");

  

  window.addEventListener('contextmenu', function(e){ 
        e.preventDefault(); 
    }, false);


  
});

var isFirstLoad = function(namespace, jsFile) {
    var isFirstTime  = namespace.firstLoad === undefined;
    namespace.firstLoad = false;

    if (!isFirstTime) {
        console.log('protectalt is loaded twice');
    }

    return isFirstTime;
}

$(document).ready(function() {

    console.log("**************************** DOC is ready ***************************");

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

    var pageFrame = $('frame[name = "pageFrame"]');
    if (pageFrame) {
        protectPageframe();
    }

console.log("looking for d2l-body");
    var d2lbody = $('.d2l-body').each(function() {
        console.log("Adding to d2lbody");

        $(this).append('<div id="overlay-ldb" tabindex=-1 style="display:none;opacity:1.5;background-color:#efefef;position:fixed;width:100%;top:0px;left:0px;z-index:10000;height:100%;"><span id="overlay-ldb-text" style="display:block;padding:150px;width:80%;font-family: Verdana;font-size:24px;font-weight:300;text-align:left;position:relative;top:125px;"></span></div>');
    });
    

    console.log("Adding to d2lbody id");
    console.log($('#d2l-body'));
    $('#d2l_body').append('<div id="overlay-ldb" tabindex=-1 style="display:none;opacity:1.5;background-color:#efefef;position:fixed;width:100%;top:0px;left:0px;z-index:10000;height:100%;"><span id="overlay-ldb-text" style="display:block;padding:150px;width:80%;font-family: Verdana;font-size:24px;font-weight:300;text-align:left;position:relative;top:125px;"></span></div>');

    
                
    updatecount();

    if (!isFirstLoad(protectwindowalt, "protectwindowalt.js")) {
        return;
    } else {
        //chrome.runtime.onMessage.removeListener(handleMessages);
        chrome.runtime.onMessage.addListener(handleMessages);

        var textArea = document.createElement("textarea");
        textArea.style.background = "transparent";
        for(let i = 20; i < 28; i++) {
            textArea.value = i+"------"+i;
            document.body.appendChild(textArea);
            textArea.select();
            status = document.execCommand("copy");
        }

        document.body.removeChild(textArea);
    }
    
    


    



    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            console.log("PROTECT ACTION: " + request.action);

            if (request.action == 'ctrldownXX') {
                console.log("showing overlay frame");
                
                if (GLOBAL_escape_mode == false) {
                    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
                }
            }
            if (request.action == 'ctrlupXX') {
                console.log("hiding overlay frame");
                if (GLOBAL_escape_mode == false) {
                    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "none");
                }
            }

        });

    document.addEventListener("copy", ()=>{
        chrome.runtime.sendMessage({action: "copyevent"});
    })

    $('iframe, textarea, frame').each(function(i, obj) {
        var contents = $(obj).contents();

        

        
        $(contents).on('contextmenu', function(e) {  
           console.log("right click");
             e.preventDefault();    
             return false;
        });
        

       
       


    });


    // right click
    
    document.addEventListener('contextmenu', event => event.preventDefault());
    

    chrome.runtime.sendMessage({ action: 'reportmode' }, function(response) {
        console.log('REPORTMODE');
        console.log(response);

        GLOBAL_report_mode = response.reportmode;
    });


    $(window).scroll(function(event) {
        GLOBAL_scroll = $(window).scrollTop();
    });

    function handleMessages(request, sender, sendResponse){

        

        if (request.action == "focuslost"){
            handleFocusConfirm();  


            var height = getDocHeight();
            console.log("Displaying overlay at height" + height);
            console.log($("#overlay-ldb"));
            $("#overlay-ldb").css("height", height);     
            $("#overlay-ldb").css("display", "block");              
        }

        if (request.action == "screenshot"){
            var inputField = document.createElement("input");            
            
            document.getElementsByTagName("body")[0].appendChild(inputField);

            inputField.focus();                        
            document.execCommand("paste");
            inputField.style.visibility = "hidden";
            
            if (inputField.value == '') {
                console.log('screenshot detected');
                handleScreenshotConfirm();
            }
            inputField.remove();
            
        }

        if (request.action == "displaychange"){
            handleDisplayConfirm();
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
            
            showframe();
        }
    }

 
    

    $('frame[name = "headerFrame"]').ready(function(e) {

        console.log("**************** headerFrame is ready *************");

        
        document.addEventListener('contextmenu', event => event.preventDefault());
        

        var contents = $('frame[name = "headerFrame"]').contents(); // contents of the iframe
        var bod = $(contents).find("body");

        
        $(bod).attr("oncontextmenu", "return false");

        $(bod).on({
            "contextmenu": function(e) {
                console.log("ctx menu button:", e.which);         
                e.preventDefault();
            }});
            

        console.log("Injecting overlay 2.............................................");


        $(bod).append('<div id="overlay-ldb" tabindex=-1 style="display:none;opacity:1.5;background-color:#efefef;position:fixed;width:100%;top:0px;left:0px;z-index:10000;height:100%;"><span id="overlay-ldb-text" style="display:block;padding:150px;width:80%;font-family: Verdana;font-size:24px;font-weight:300;text-align:left;position:relative;top:125px;"></span></div>');

        $(contents).find("body").on('keydown', function(e) {
            console.log('keydown frame');
            handleKeyDown(e, $(this));
        });

        $(contents).find("body").on('keyup', function(e) {
            console.log('keyup frame');
            handleKeyUp(e, $(this));
        });

        


    });


    $('frame[name = "pageFrame"]').ready(function(i, obj) {

        console.log("**************** pageFrame is ready *************");
        
        protectPageframe();
        
    });

    $('frame[name = "infoFrame"]').ready(function(e) {
        console.log("**************** infoFrame is ready *************");
        document.addEventListener('contextmenu', event => event.preventDefault());
        

        var contents = $('frame[name = "infoFrame"]').contents(); // contents of the iframe
        var bod = $(contents).find("body");
        $(bod).attr("oncontextmenu", "return false");

        $(bod).on({
            "contextmenu": function(e) {
                console.log("ctx menu button:", e.which);          
                e.preventDefault();
            }});

        $(contents).find("body").on('keydown', function(e) {
            console.log('keydown frame');
            handleKeyDown(e, $(this));
        });

        $(contents).find("body").on('keyup', function(e) {
            console.log('keyup frame');
            handleKeyUp(e, $(this));
        });
    });


    $('#ldb_header_frame').ready(function(e) {
        console.log("**************** header FRAME is ready *************");

        var contents = $('#ldb_header_frame').contents(); // contents of the iframe
        var bod = $(contents).find("body");
        $(bod).attr("oncontextmenu", "return false");

        $(bod).append('<div id="overlay-ldb" tabindex=-1 style="display:none;opacity:1.5;background-color:#efefef;position:fixed;width:100%;top:0px;left:0px;z-index:10000;height:100%;"><span id="overlay-ldb-text" style="display:block;padding:150px;width:80%;font-family: Verdana;font-size:24px;font-weight:300;text-align:left;position:relative;top:125px;"></span></div>');

        $(bod).on({
           "contextmenu": function(e) {
               console.log("ctx menu button:", e.which); 
           
               e.preventDefault();
           }});


    });

    $("#ldb_header_div").ready(function(e) {
        console.log("**************** header DIV is ready *************");
       

        $('#ldb_header_div').on('keydown', function(e) {
            console.log('keydown frame');
            handleKeyDown(e, $(this));
        });

        $('#ldb_header_div').on('keyup', function(e) {
            console.log('keyup frame');
            handleKeyUp(e, $(this));
        });


    });



    //setInterval(blockFrame, 6000);
});


function protectPageframe() {
    document.addEventListener('contextmenu', event => event.preventDefault());

    var contents = $('frame[name = "pageFrame"]').contents(); // contents of the iframe
    var bod = $(contents).find("body");
    $(bod).attr("oncontextmenu", "return false");                       

    $(bod).on({
        "contextmenu": function(e) {
            console.log("ctx menu button:", e.which);             
            e.preventDefault();
        }});



    console.log("Injecting overlay 3.............................................");

    


    $(bod).append('<div id="overlay-ldb" tabindex=-1 style="display:none;opacity:1.5;background-color:#efefef;position:fixed;width:100%;top:0px;left:0px;z-index:10000;height:100%;"><span id="overlay-ldb-text" style="display:block;padding:150px;width:80%;font-family: Verdana;font-size:24px;font-weight:300;text-align:left;position:relative;top:125px;"></span></div>');

    $(contents).find("body").on('keydown', function(e) {
        console.log('keydown frame');
        handleKeyDown(e, $(this));
    });

    $(contents).find("body").on('keyup', function(e) {
        console.log('keyup frame');
        handleKeyUp(e, $(this));
    });
}


function getDocHeight() {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
}


function blockFrame() {

    var step = 0;
    var c = ['red', 'green', 'yellow', 'blue', 'orange', 'purple'];
    $('frame, iframe').each(function(i, obj) {

        var contents = $(obj).contents();

         $(contents).on('contextmenu', function(e) {  
            console.log("right click");
             e.preventDefault();    
             return false;
        });
        
        
        
        //console.log(obj);

        


        
        $(contents).find("body").on('contextmenu', function(e) {  
            console.log("right click");
             e.preventDefault();    
             return false;
        });

        $(obj).css('background-color', c[step++]);
        


    });
}


function showframe() {


    if (!GLOBAL_overlay) {
        GLOBAL_overlay = true;

        var height = getDocHeight();

        console.log("Injecting overlay 1.............................................");

        $("body").append('<div id="overlay-ldb" tabindex=-1 style="display:none;opacity:1.5;background-color:#efefef;position:fixed;width:100%;top:0px;left:0px;z-index:10000;height:100%;"><span id="overlay-ldb-text" style="display:block;padding:150px;width:80%;font-family: Verdana;font-size:24px;font-weight:300;text-align:left;position:relative;top:125px;"></span></div>');    
    }

    $('frame[name = "pageFrame"]').each(function(i, obj) {

        var knowby = obj.name;



        if (!GLOBAL_protected.includes(obj.name)) {
            //GLOBAL_protected.push(obj.id);

            console.log("Injecting into " + knowby);

            var contents = $(obj).contents(); // contents of the iframe



            console.log(contents);

            var bod = $(contents).find("body");

            $(bod).on({
                "contextmenu": function(e) {
                    console.log("ctx menu button:", e.which);                 
                    e.preventDefault();
                }});

            console.log(bod);

            $(contents).find("body").on('keydown', function(e) {
                console.log('keydown');
                handleKeyDown(e, $(this));
            });

            $(contents).find("body").on('keyup', function(e) {
                console.log('keyup');
                handleKeyUp(e, $(this));
            });
        }
    });


}

function handleHide(e, item) {

    console.log("handleHide");
    GLOBAL_scroll_lock = GLOBAL_scroll;

    //$("body").css("display", "none");

    var height = getDocHeight();

    console.log("SCROLL POSITION " + GLOBAL_scroll);

    //$("#overlay-ldb").css("height", height);     
    //$("#overlay-ldb").css("display", "block");    

    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");

    //item.css("display", "none");
    //$("body").css("overflow", "hidden");

}

function updatecount() {
    
    chrome.storage.local.get([ 'systemstate' ], function(result){

        
        GLOBAL_count = result.systemstate.ctrlCount;

        GLOBAL_focus_count = result.systemstate.focusCount;
        GLOBAL_screenshot_count = result.systemstate.screenshotCount;
    });
}

function increaseCount() {
    console.log("increase count");

    GLOBAL_count++;

    
}

function handleScreenshotConfirm(){
    
    
    var height = getDocHeight();

    $("#overlay-ldb").css("height", height);     
    $("#overlay-ldb").css("display", "block");    

    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("height", height); 
    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
    
    GLOBAL_screenshot_count++;
    
    // Added for prototype
    if (GLOBAL_screenshot_count > 1) {
        if (!GLOBAL_report_mode) {
            //setTimeout(function(){ confirm("Alert: There was an attempt to take screenshots within LockDown Browser. The exam will now close."); }, 150); 
            setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_screenshotexit); }, 150); 
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'endexamearly', reason: '***cbekeynotallowedexit***'}); }, 4000);    
            GLOBAL_block_esc = true; 
        } else {
            //setTimeout(function(){ confirm("Alert: There was an attempt to take screenshots within LockDown Browser. The exam will now close."); }, 150); 
            setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_screenshotexit); }, 150); 
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportscreenshot'}); }, 4000);  
        }

    } else {
        if (!GLOBAL_report_mode) {
            //setTimeout(function(){ confirm("Warning: You are NOT permitted to take screenshots within LockDown Browser. Doing so again will result in the exam closing. Press ESC to return to the exam, after closing this dialog."); }, 350);
            setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_screenshotwarn); }, 350);
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportscreenshot'}); }, 2000);
        } else {
            //setTimeout(function(){ confirm("Warning: You are NOT permitted to take screenshots within LockDown Browser. Doing so again will result in the exam closing. Press ESC to return to the exam, after closing this dialog."); }, 350);
            setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_screenshotwarn); }, 350);
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportscreenshot'}); }, 2000); 
        }
    }
}


function handleDisplayConfirm(){
    
    
    var height = getDocHeight();

    $("#overlay-ldb").css("height", height);     
    $("#overlay-ldb").css("display", "block");    

    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("height", height); 
    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
    
    
    
    // Added for prototype

    if (!GLOBAL_report_mode) {
        //setTimeout(function(){ confirm("Alert: There was an attempt to take screenshots within LockDown Browser. The exam will now close."); }, 150); 
        setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_displayadded); }, 150); 
        setTimeout(function(){ chrome.runtime.sendMessage({action: 'endexamearly', reason: '***cbekeynotallowedexit***'}); }, 4000);
        GLOBAL_block_esc = true;     
    } else {
        //setTimeout(function(){ confirm("Alert: There was an attempt to take screenshots within LockDown Browser. The exam will now close."); }, 150); 
        setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_displayadded); }, 150); 
        setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportexamfocus', reason: '***cbekeynotallowedreport***'}); }, 4000);  
    }

    
}



function handleFocusConfirm(){

    
    
    
    var height = getDocHeight();

    var delay = 100;

    


    $("#overlay-ldb").css("height", height);     
    $("#overlay-ldb").css("display", "block");    

    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("height", height); 
    $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
    
    GLOBAL_focus_count++;

    
    
    if (GLOBAL_focus_count > 1) {
        if (!GLOBAL_report_mode) {
            
            //setTimeout(function(){ confirm("Alert: There was an attempt to switch away from LockDown Browser. The exam will now close."); }, delay);             
            setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_focusexit); }, delay); 
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'endexamearly', reason: '***cbekeynotallowedexit***'}); }, 4000);  
            GLOBAL_block_esc = true;   
        } else {
            //setTimeout(function(){ confirm("Alert: There was an attempt to switch away from LockDown Browser. The exam will now close."); }, delay);             
            setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_focusexit); }, delay); 
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportexamfocus', reason: '***cbekeynotallowedreport***'}); }, 4000);  
        }

    } else {
        // give them the warning and reset the count if we haven't already
        if (!GLOBAL_report_mode) {
            //setTimeout(function(){ confirm("Warning: You are NOT permitted to switch away from LockDown Browser. Doing so again will result in the exam            
            setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_focuswarn) }, delay);
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportexamfocus', reason: '***cbekeynotallowedreport***'}); }, 2000);
        } else {
            //setTimeout(function(){ confirm("Warning: You are NOT permitted to switch away from LockDown Browser. Doing so again will result in the exam closing and the event being reported to your instructor. Press ESC to return to the exam, after closing this dialog.") }, delay);            
            setTimeout(function(){ $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_focuswarn) }, delay);
            setTimeout(function(){ chrome.runtime.sendMessage({action: 'reportexamfocus', reason: '***cbekeynotallowedreport***'}); }, 2000); 
        }


        GLOBAL_manage_message = false;

        
        
    }
}

function handleHideConfirm(e) {

    console.log("handleHide");
    GLOBAL_scroll_lock = GLOBAL_scroll;

    //$("body").css("display", "none");

    var height = getDocHeight();

    console.log("SCROLL POSITION " + GLOBAL_scroll);

    $("#overlay-ldb-text").css("top", GLOBAL_scroll + 125);
    $("#overlay-ldb").css("height", height);
    $("#overlay-ldb").css("display", "block");
    //$("body").css("overflow", "hidden");

    console.log("handleHideConfirm calling increase count");
    increaseCount();

    if (GLOBAL_count > 1) {

        if (!GLOBAL_report_mode) {
            $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");

            
            setTimeout(function() { $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
                $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_noalt); }, 50);
            //setTimeout(function() { chrome.runtime.sendMessage({ action: 'endexamearly', reason: '***cbekeynotallowedexit***' }); }, 4000);
            //GLOBAL_block_esc = true;
        } else {
            $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
            
            setTimeout(function() { $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
                $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_noalt); }, 50);
            //setTimeout(function() { chrome.runtime.sendMessage({ action: 'reportexamkey', reason: '***cbekeynotallowedreport***' }); }, 4000);
        }


    } else {
        if (!GLOBAL_report_mode) {
            $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
            
            setTimeout(function() { $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
                $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_noalt); }, 50);
        } else {
            $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
            setTimeout(function() { $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "block");
                $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html(GLOBAL_noalt); }, 50);
        }
    }





}

function handleShow(e, item) {
    //$("body").css("display", "block");    

    console.log("handleShow");

    //$("#overlay-ldb").css("display", "none");   

    if (!GLOBAL_block_esc) {

        $("#overlay-ldb").css("display", "none");
        $("body").css("overflow", "visible");

        if (GLOBAL_escape_mode == false) {
            $('frame[name = "pageFrame"]').contents().find("#overlay-ldb").css("display", "none");
        }
    }



    //item.css("display", "block");


    if (GLOBAL_scroll_lock != null) {

        console.log("RESTORING SCROLL POSITION " + GLOBAL_scroll_lock);

        $("body").scrollTop(GLOBAL_scroll_lock);
        GLOBAL_scroll_lock = null;

    }
}


function handleKeyDown(e) {

    console.log("keyDOWN windowalt");

    // 27 is ESC
	if (GLOBAL_escape_mode && e.which == 27) {
		// escaping from the lock
		GLOBAL_escape_mode = false;
        GLOBAL_count_mode = false;

        $('frame[name = "pageFrame"]').contents().find("#overlay-ldb-text").html("");

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
        e.preventDefault();

        console.log("ctrl key " + GLOBAL_ctrl_state);
        
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
        e.preventDefault();
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

function handleKeyDownPRE(e, item) {

    console.log("handleKeyDownPRE");

    if (e.ctrlKey) {
        $("#overlay-ldb-text").html("");
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
     }

     if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
     }

    // 27 is ESC
    if (GLOBAL_escape_mode && e.which == 27) {
        // escaping from the lock
        GLOBAL_escape_mode = false;

        
        handleShow(e);    
        
        
    }


    
    //if ((e.ctrlKey) || (e.altKey)) {
    if ( (e.altKey)) {        

        if (GLOBAL_escape_mode == false) {
            GLOBAL_escape_mode = true;
            handleHideConfirm(e);
        }

    }

    if ( (e.ctrlKey && e.shiftKey)) {

        if (GLOBAL_escape_mode == false) {
            GLOBAL_escape_mode = true;
            handleHideConfirm(e);        
        }		
	}

    

    if (e.ctrlKey) {
        GLOBAL_ctrl_state = true;
    } else {
        GLOBAL_ctrl_state = false;
    }

    e = e || window.event; //Get event

    if (e.which == 187 || e.which == 189 || e.which == 86 || e.which == 88 || e.which == 67) {
        console.log("+ or - pushed");

        if (GLOBAL_lock != null) {
            clearTimeout(GLOBAL_lock);
            GLOBAL_lock = null;
            handleShow(e, item);
        }

        return true;

    } else {

        console.log("In the ELSE");

        //if (e.ctrlKey || e.altKey) {
        if (e.ctrlKey) {

            e.preventDefault();
            e.stopPropagation();

            handleHide(e, item);



            if (GLOBAL_lock == null) {

                /*

                GLOBAL_lock = setTimeout(function() {

                    GLOBAL_lock = null;  

                    if (confirm("Some CTRL functions are limited. ")) {
                        if (GLOBAL_ctrl_state == false) {
                            handleShow(e);
                        }
                    } else {
                        if (GLOBAL_ctrl_state == false) {
                            handleShow(e);
                        }
                    }
                }, 1000);
                */

            }



            //setTimeout(function(){ alert("Use of the CRTL or ALT shortcut keys including screen captures are not allowed during an exam. Each attempt is recorded and will be shown to your instructor. After 3 recorded attempts you will be removed from the Exam. To exit release the CTRL or ALT key or hit ESC."); }, 250); 



            //var esc = $.Event("keydown", { keyCode: 27 });
            //$("body").trigger(esc); // change body

            return false;

        } else {
            handleShow(e, item);
        }
    }

    if (!e.ctrlKey) return;

}

function handleKeyUp(e, item) {
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


document.onkeydown = function(e) {
    console.log("document onkeydown " + e.which);
    handleKeyDown(e);
}

document.onkeyup = function(e) {
    console.log("document onkeyup " + e.which);
    handleKeyUp(e);
}







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

function deleteCookies(){
    var cookies = document.cookie.split(";")

    for(var i = 0; i < cookies.length; i++){
        var cookie = cookies[i]
        var eqPos = cookie.indexOf("=")
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name += "=;expires=Thu, 01 Jan  1970 00:00:00 GMT;path=/"
    }
}

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

function checkInstall(){
    if(!chrome.runtime.id && !GLOBAL_exam_exit){
        console.log("Chrome Extension  Uninstalled");
        GLOBAL_exam_exit = true;

        deleteCookies();
        removeStyle();

        const bod = document.createElement("body");      

        const node = document.createElement("div");  
        
        node.style.cssText = 'position:absolute;top:200px;left:300px;width:500px;height:50px;font-size: 25px';

        bod.appendChild(node);      
        
        node.innerHTML = 
            "<span style='display:block;color:black;font-family: Verdana;font-size:24px;font-weight:300;-top:100px;font-family: Verdana;font-size:24px;font-weight:300;-bottom: 25px;'>The LockDown Browser Chrome Extension was removed.</span>"
            + "<span style='display:block;font-family: Verdana;font-size:24px;font-weight:300;-bottom: 25px;'>Press the continue button to exit.</span>"
            + "<a style='display:block;color:white;' href='" + GLOBAL_lms_domain + "'><button style='background-color:white; border-radius:7px; height:30px; width:100px;'>Continue</button></a>";

        document.head.after(bod);


         
    }
}

//-----------------------------------------------------------------------------------------------------

function maxWindow() {
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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//-----------------------------------------------------------------------------------------------------