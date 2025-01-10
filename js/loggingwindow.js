onload = function() {
    console.log("calling onload LOGGING adding communication port");

chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {

        
        console.log("Logging: " + request.message);

        if (request.message) {
            var prev = $("#cbereview").text();
            var next = prev + "\n" + request.message;

            $("#cbereview").text(next);
        }

        
        if (request.action) {
            var prev = $("#cbereview").text();
            var next = prev + "\nACTION: " + request.action;

            $("#cbereview").text(next);
        }

        var psconsole = $("#cbereview");
        if(psconsole.length)
           psconsole.scrollTop(psconsole[0].scrollHeight - psconsole.height());

        

       
        });
}