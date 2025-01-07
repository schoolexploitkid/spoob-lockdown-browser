// protect the window
console.log("protect");

var GLOBAL_lock = null;
var GLOBAL_ctrl_state = false;

var GLOBAL_protected = [];
var GLOBAL_scroll = null;
var GLOBAL_scroll_lock = null;
var GLOBAL_overlay = false;
var GLOBAL_escape_mode = false;
var GLOBAL_count_mode = false;
var GLOBAL_count = 0;
var GLOBAL_report_mode = false;
var GLOBAL_block_esc = false;



console.log("protect loaded");

$(document).ready(function() {

    setInterval(blockFrame, 2000);

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

    document.addEventListener('contextmenu', event => event.preventDefault());

    chrome.runtime.sendMessage({ action: 'reportmode' }, function(response) {
        //console.log('REPORTMODE');
        //console.log(response);

        GLOBAL_report_mode = response.reportmode;
    });

    $(window).scroll(function(event) {
        GLOBAL_scroll = $(window).scrollTop();
    });

    //showFrame();
    //setInterval(showframe, 2000);
});


function getDocHeight() {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
}

function handleMessages(request, sender, sendResponse){

    //console.log("handleMessages " + request.action);

    if (request.action == "focuslost"){
        //handleFocusConfirm();
    }

    if (request.action == "displaychange"){
        setTimeout(function(){ confirm("Alert: There was an attempt to add an additional display. The exam will now close."); }, 150); 
        setTimeout(function(){ chrome.runtime.sendMessage({action: 'endexamexit', reason: '***cbekeynotallowedexit***'}); }, 4000);    
    }

    // Added for screenshot blocking
    if (request.action == "screenshot"){
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
}


function blockFrame() {

/*
    window.frames["mainframe"].contentDocument.oncontextmenu = function(){
        alert("no way!");
         return false; 
        };
        */

    
    $('frame, iframe').each(function(i, obj) {

        //console.log("Blocking frame");
        //console.log(obj);

        var contents = $(obj).contents();

        //console.log(contents);

         $(contents).on('contextmenu', function(e) {  
            console.log("right click");
             e.preventDefault();    
             return false;
        });
                                           
        $(contents).find("body").on('contextmenu', function(e) {  
            //console.log("right click");
             e.preventDefault();    
             return false;
        });

             
    });
}

function showframe() {


    


    if (!GLOBAL_overlay) {
        GLOBAL_overlay = true;

        var height = getDocHeight();

        $("body").append('<div id="overlay-ldb" tabindex=-1 style="display:none;opacity:1.5;background-color:#efefef;position:fixed;width:100%;top:0px;left:0px;z-index:10000;height:100%;"><span id="overlay-ldb-text" style="display:block;padding:150px;width:80%;font-family: Verdana;font-size:24px;font-weight:300;text-align:left;position:relative;top:125px;"></span></div>');    
    }

    $('iframe, textarea, frame[name = "pageFrame"]').each(function(i, obj) {

        var knowby = obj.id || obj.name;

        if (!GLOBAL_protected.includes(obj.id)) {
            //GLOBAL_protected.push(obj.id);



            var contents = $(obj).contents(); // contents of the iframe



            var bod = $(contents).find("body");




        }
    });


}



function handleHide(e) {

    //console.log("handleHide");
    GLOBAL_scroll_lock = GLOBAL_scroll;

    //$("body").css("display", "none");

    var height = getDocHeight();



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


    //console.log("GLOBAL COUNT = " + GLOBAL_count);



    if (GLOBAL_count > 1) {


        if (!GLOBAL_report_mode) {
            //setTimeout(function() { confirm("ALERT: There was an attempt to use the ALT or CTRL key. This event has been reported to your instructor and the exam will now end."); }, 150);
            setTimeout(function() { $("#overlay-ldb-text").html("ALERT: Using CTRL or ALT is not allowed during the exam. \n\nPress ESC to return to exam."); }, 150);
            //setTimeout(function() { chrome.runtime.sendMessage({ action: 'endexamearly', reason: '***cbekeynotallowedexit***' }); }, 4000);
            //GLOBAL_block_esc = true; 
        } else {
            //setTimeout(function() { confirm("ALERT: There was an attempt to use the ALT or CTRL key. This event has been reported to your instructor."); }, 150);
            setTimeout(function() { $("#overlay-ldb-text").html("ALERT: Using CTRL or ALT is not allowed during the exam. \n\nPress ESC to return to exam."); }, 150);
            //setTimeout(function() { chrome.runtime.sendMessage({ action: 'reportexamkey', reason: '***cbekeynotallowedreport***' }); }, 4000);
        }

    } else {
        if (!GLOBAL_report_mode) {
            //setTimeout(function() { confirm("Using CTRL or ALT is not allowed during the exam. Doing so again will result in the exam ending and the event being reported to your instructor.\n\nClick OK below to close this message. Press ESC to return to exam."); }, 350);
            setTimeout(function() { $("#overlay-ldb-text").html("Using CTRL or ALT is not allowed during the exam. \n\nPress ESC to return to exam."); }, 350);
        } else {
            //setTimeout(function() { confirm("Using CTRL or ALT is not allowed during the exam. Doing so again will result in the event being reported to your instructor.\n\nClick OK below to close this message. Press ESC to return to exam."); }, 350);
            setTimeout(function() { $("#overlay-ldb-text").html("Using CTRL or ALT is not allowed during the exam. \n\nPress ESC to return to exam."); }, 350);
        }
    }


}

function handleShow(e) {
    //$("body").css("display", "block");    


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

    if (e.ctrlKey) {
        //e.preventDefault();
        //e.stopPropagation();
        $("#overlay-ldb-text").html("");
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
    }


    // 27 is ESC
    if (GLOBAL_escape_mode && e.which == 27) {
        // escaping from the lock
        GLOBAL_escape_mode = false;
        GLOBAL_count_mode = false;
        handleShow(e);
    }


    //if ( (e.ctrlKey && e.altKey) || (e.ctrlKey && e.shiftKey) || (e.altKey)) {
    
    if ((e.ctrlKey) || (e.altKey)) {

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
        //console.log("+ or - pushed");

        if (GLOBAL_lock != null) {
            clearTimeout(GLOBAL_lock);
            GLOBAL_lock = null;

            // only show if we are not in lockdown
            if (GLOBAL_escape_mode == false) {
                handleShow(e);
            }

        }

        return true;

    } else {

        //if (e.ctrlKey || e.altKey) {
        if (e.ctrlKey) {

            e.preventDefault();
            e.stopPropagation();

            handleHide(e);



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
            if (GLOBAL_escape_mode == false) {
                handleShow(e);
            }
        }
    }

    if (!e.ctrlKey) return;

}

function handleKeyUp(e) {
    if (e.ctrlKey) {
        GLOBAL_ctrl_state = true;
    } else {
        GLOBAL_ctrl_state = false;
    }

    e = e || window.event; //Get event

    //if (!e.ctrlKey && !e.altKey) {
    if (!e.ctrlKey) {
        if (GLOBAL_escape_mode == false) {
            handleShow(e);
        }
    }

    if (e.ctrlKey) return;
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
    console.log("CONTENT WINDOW IS NOW READY");

    var contents = $("#content_window").contents(); // contents of the iframe

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

//-----------------------------------------------------------------------------------------------------