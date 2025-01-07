

/*
// disable right click
window.oncontextmenu = function(event) {

	console.log("Getting context menu...");
    event.preventDefault();
    event.stopPropagation();
    return false;
};
*/

console.log("Content running");


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

  	console.log("Message: " + request.message);

    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);

      // This line is new!
      chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
    }
  }
);





