
$(window).on('load', function() {

    window.addEventListener('contextmenu', function(e){ 
          e.preventDefault(); 
      }, false);
  });

$(document).ready( function() {
	console.log("document ready");

    document.addEventListener('contextmenu', event => event.preventDefault());

    const currentUrl = window.location.href;

    if(currentUrl.indexOf("checkoutnow?") != -1){
        var exitButton = '<div id="exitbar" style="position: fixed; top: 0px; right:10px">'
                        + '<button id="ppalclose" style='
                        + '"color: white;'
                        + 'font-weight: 1000;'
                        + 'background-color:black;'
                        + 'border:0px;'
                        + 'border-radius:3px;' 
                        + 'font-size:14px;'
                        + '" class="">X</button></div>'

        $("body").append(exitButton);


        $("#ppalclose").click(function(e) {
            console.log("click");
            chrome.runtime.sendMessage({ action: "paypalclose" }, function(response) {
                console.log("sent paypalclose");
            });
        });
    }


    console.log("blockclick ready");

    $('body').on('click', 'a', function(e){
        var linkText = $(this).html();
        console.log("LINK click");
        if(linkText != "Cancel and return to Respondus, Inc."){
            e.preventDefault();
            e.stopPropagation();
            console.log("Blocked on body");
        }
    });
    
    $("a").on('click' , function(e) {
        console.log("TRAPPED THE CLICK ON a general link a");
        var linkText = $(this).html();
        // e.preventDefault();
        console.log("LINK click");
        if(linkText != "Cancel and return to Respondus, Inc."){
            e.preventDefault();
            e.stopPropagation();
            console.log("Blocked - on a");
        }	  
        // e.preventDefault();
    });


	window.onresize = function() {
    console.log('been resized');
    maxWindow();

    chrome.runtime.sendMessage({ action: 'onresize' }, function(response) {
        console.log('RESIZE ERROR');
    });
}

document.onkeydown = function(e) {
    handleKeyDown(e);  
}

function handleKeyDown(e) {	
    if (e.ctrlKey || (e.altKey)) {
        e.preventDefault();
        e.stopPropagation();
    }
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

});