$(document).ready( function() {
	console.log("document ready");

	$(".startup_header").append('<div id="exitbar" style="position: absolute; top: 15px; right:10px"><i id="kowlclose" class="fa fa-window-close"></i></div>');

	$("#kowlclose").click(function(e) {
		console.log("click");
		chrome.runtime.sendMessage({ action: "kowlclose" }, function(response) {
	        console.log("sent restarturl");
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

});