
let platform = navigator.userAgentData.platform;
let platwin = platform.indexOf("Windows") == -1;


//console.log("PROTECT CANVASNEW!!!! " + platform + "," + platwin);



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

$(document).ready(function() {

    

    $(window).scroll(function(event) {
        GLOBAL_scroll = $(window).scrollTop();
    });

    showframeCheck();
    setInterval(showframeCheck, 2000);

    chrome.runtime.sendMessage({ action: 'reportmode' }, function(response) {
        console.log('REPORTMODE');
        console.log(response);

        GLOBAL_report_mode = response.reportmode;
    });

});

function showframeCheck() {
    chrome.storage.local.get([ 'systemstate' ], function(result){        
        const start = result.systemstate.examStarted;

        console.log("start = [" + start + "]");
        if (start == true) {
            console.log("start is TRUE");
            showframe();
            document.addEventListener('contextmenu', event => event.preventDefault());
        }
    });
}


function showframe() {

    console.log("showFrame>>>");





    if (!GLOBAL_overlay) {
        GLOBAL_overlay = true;

        var height = getDocHeight();

        $("body").append('<div id="overlay-ldb-canvas" tabindex=-1 style="display:none;opacity:1.5;background-color:#efefef;position:fixed;width:100%;top:0px;left:0px;z-index:10000;height:100%;"><span id="overlay-ldb-canvas-text" style="display:block;padding:150px;width:80%;font-family: Verdana;font-size:24px;font-weight:300;text-align:left;position:relative;top:125px;"></span></div>');    
        

        document.onkeydown = function(e) {    
            console.log("document onkeydown " + e.which);
             
            handleKeyDown(e);    
        }

        document.onkeyup = function(e) {    
            console.log("document onkeyup " + e.which);
                
            handleKeyUp(e);    
        }
    }

    $('div[data-automation="sdk-take-component"]').each(function(i, obj) {
        $(this).unbind('click');
        $(this).on('click', 'a[target="_blank"], a[target="_new"], a[target="frame"], a[target="_parent"],a[target="_self"],a[target="_top"]', function(e){
        
            console.log("TRAPPED THE CLICK BORDERJS div content_window");
            e.preventDefault();
            e.stopPropagation();


            chrome.runtime.sendMessage({action: 'openlink', payload: $(this).prop('href')}, function(response) {
                console.log('Tab opened');          
            });
            
        });
    }); 

    $('iframe, textarea, frame[name = "pageFrame"]').each(function(i, obj) {

        

        console.log("Found iframe or textarea or pageFrame>>>");

        var knowby = obj.id || obj.name;

        if (!GLOBAL_protected.includes(obj.id)) {
            //GLOBAL_protected.push(obj.id);

            var contents = $(obj).contents(); // contents of the iframe            

            var bod = $(contents).find("body");


            
            
            $(bod).unbind('click');
            $(bod).on('click', 'a[target="_blank"], a[target="_new"], a[target="frame"], a[target="_parent"],a[target="_self"],a[target="_top"]', function(e){
         
                console.log("TRAPPED THE CLICK BORDERJS content_window");
                e.preventDefault();
                e.stopPropagation();


                chrome.runtime.sendMessage({action: 'openlink', payload: $(this).prop('href')}, function(response) {
                    console.log('Tab opened');          
                });
                
            });
            
            

            $('a').each(function() {
                const sidebar = $(this).data("automation");

                if (sidebar != 'sdk-sidebar-item-button') {

                    console.log("updating link");
                    $(this).attr('target','_new');  

                    $(this).unbind('click').click(function(e) {
                        e.preventDefault();
                        e.stopPropagation();                        
                        const href = $(this).prop('href');
                        
                        chrome.runtime.sendMessage({action: 'openlink', payload: href}, function(response) {
                            console.log('Tab opened');          
                        });                                        
                    });      
                }
            });



            $(contents).find("body").on('keydown', function(e) {
                
                if (platwin) {
                    handleKeyDown(e);
                }
                
            });

            $(contents).find("body").on('keyup', function(e) {
                
                if (platwin) {
                    handleKeyUp(e);
                }
                
            });
        }
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


function handleHide(e) {
    console.log("handleHide " + platwin)
    

    if (platwin === true) {
        handleHideInner(e);
    }
    
}

function handleHideInner(e) {

    console.log("handleHide");
    GLOBAL_scroll_lock = GLOBAL_scroll;

    //$("body").css("display", "none");

    var height = getDocHeight();




    $("#overlay-ldb-canvas-text").css("top", GLOBAL_scroll + 125);
    $("#overlay-ldb-canvas").css("height", height);    

    $("#overlay-ldb-canvas").css("display", "block");
    //$("body").css("overflow", "hidden");

}

function handleHideConfirm(e) {
    console.log("handleHideConfirm " + platwin);
    if (platwin === true) {
        handleHideConfirmInner(e);
    }
    
}

function handleHideConfirmInner(e) {


    GLOBAL_scroll_lock = GLOBAL_scroll;

    //$("body").css("display", "none");

    var height = getDocHeight();

    

    $("#overlay-ldb-canvas-text").css("top", GLOBAL_scroll + 125);
    $("#overlay-ldb-canvas").css("height", height);    

    $("#overlay-ldb-canvas").css("display", "block");
    //$("body").css("overflow", "hidden");

    GLOBAL_count++;

    if (GLOBAL_count_mode === false) {

        GLOBAL_count_mode = true;
    }


    console.log("GLOBAL COUNT = " + GLOBAL_count);

    if (GLOBAL_count > 1) {

        if (!GLOBAL_report_mode) {
            
            setTimeout(function() { $("#overlay-ldb-canvas-text").html("<span style='color:#AE0015'>ALERT:</span> Using ALT is not allowed during the exam. \n\nPress ESC to return to exam."); }, 150);
            //setTimeout(function() { chrome.runtime.sendMessage({ action: 'endexamearly', reason: '***cbekeynotallowedexit***' }); }, 4000);
            //GLOBAL_block_esc = true; 
        } else {
            
            setTimeout(function() { $("#overlay-ldb-canvas-text").html("<span style='color:#AE0015'>ALERT:</span> Using ALT is not allowed during the exam. \n\nPress ESC to return to exam."); }, 150);
            //setTimeout(function() { chrome.runtime.sendMessage({ action: 'reportexamkey', reason: '***cbekeynotallowedreport***' }); }, 4000);
        }


    } else {
        if (!GLOBAL_report_mode) {
            setTimeout(function() { $("#overlay-ldb-canvas-text").html("<span style='color:#AE0015'>Warning:</span> Using ALT is not allowed during the exam. \n\nPress ESC to return to exam."); }, 350);
        } else {
            setTimeout(function() { $("#overlay-ldb-canvas-text").html("<span style='color:#AE0015'>Warning:</span> Using ALT is not allowed during the exam. \n\nPress ESC to return to exam."); }, 350);

        }
    }


}

function handleShow(e) {
    //$("body").css("display", "block");    


    if (!GLOBAL_block_esc) {
        $("#overlay-ldb-canvas").css("display", "none");
        $("body").css("overflow", "visible");
    }

    if (GLOBAL_scroll_lock != null) {

        $("body").scrollTop(GLOBAL_scroll_lock);
        GLOBAL_scroll_lock = null;
    }
}

function handleKeyDown(e) {

    
    


    if (e.ctrlKey) {
        $("#overlay-ldb-canvas-text").html("");
        GLOBAL_escape_mode = false;
        handleShow(e);
    }


    

    /*
    if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
    }
    */

    
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
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
        GLOBAL_count_mode = false;
        handleShow(e);
    }


    
    //if ((e.ctrlKey) || (e.altKey)) {
    if ((e.altKey)) {    

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

            // only show if we are not in lockdown
            if (GLOBAL_escape_mode == false) {
                handleShow(e);
            }

        }

        return true;

    } 
    
    
    
    else {

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



            //setTimeout(function(){ alert("Use of the CRTL or ALT shortcut keys including screen captures are not allowed during an exam. Each attempt is recorded and will be shown to your instructor. After 3 recorded attempts you will be removed from the Exam. To exit release the ALT key or hit ESC."); }, 250); 



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
    if (!e.altKey) {
        if (GLOBAL_escape_mode == false) {
            handleShow(e);
        }
    }

    //if (e.ctrlKey) return;
}







