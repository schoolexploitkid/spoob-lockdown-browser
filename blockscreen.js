onload = function() {

document.onkeydown = function(e) {

       
            e = e || window.event; //Get event

            if (e.ctrlKey || e.altKey) {

                $("body").css("display", "none");
            } else {
                $("body").css("display", "block");
            }

            if (!e.ctrlKey) return;
        

    };

    document.onkeyup = function(e) {

       

            e = e || window.event; //Get event

            if (!e.ctrlKey && !e.altKey) {

                $("body").css("display", "block");
            }

            if (e.ctrlKey || e.altKey) return;
        

    };

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log("Received message from background");
        console.log(request);

        if (request.action == 'startofexam') {
            GLOBAL_started = true;
        } else if (request.action == 'endofexam') {
            GLOBAL_started = false;
        } 


    });

}