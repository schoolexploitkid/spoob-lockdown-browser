
const GLOBAL_server = "https://smc-service-cloud-cbe.respondus2.com";
//const GLOBAL_server = "https://qa-app.respondus2.com";

const GLOBAL_alt_server = "https://smc-service-cloud-alt.respondus2.com";
//const GLOBAL_alt_server = "https://qa-app-alt.respondus2.com";

var GLOBAL_review = null;
const GLOBAL_drm = GLOBAL_server + "/MONServer/drmcheck.shtml";

const GLOBAL_loading = chrome.i18n.getMessage("loading_exam");

$(document).ready(function(){
    $("#loading").html(GLOBAL_loading);    
});





function checkServerAccess(url, timeout, sessionbase) {

    console.log('checkServerAccess');
    console.log(url);

        const controller = new AbortController();
        const signal = controller.signal;
        const options = { mode: 'no-cors', signal };
        return fetch(url, options)
          .then(setTimeout(() => { controller.abort() }, timeout))
          .then( function(response) {
            if (response.status == 200) {
                $("#launch-frame").attr("src", sessionbase);
                
            }       
            console.log('Check server response:', response.statusText, response.status);
          })
          .catch(function(error) {
            console.error('Check server error:', error.message);
            window.open(GLOBAL_drm);
            setTimeout(window.close, 50);
          });
    
}

function getURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}


$( document ).ready(function() {

    $("#exit_button").click(function() {
        window.close();
    });

    var aparam = getURLParameter("a");
    var cparam = getURLParameter("c");
    var pparam = getURLParameter("p");
    var sparam = getURLParameter("s");
    GLOBAL_review = getURLParameter("review");



    console.log("aparam" + aparam);
    console.log("cparam" + cparam);
    console.log("pparam" + pparam);
    console.log("sparam" + sparam);

    var parameters = "?a=" + aparam + "&c=" + cparam;

    if (sparam != null && sparam != 'null') {
        parameters = parameters + "&x=" + sparam; // renamed to x
    }

    if (pparam != null) {
        parameters = parameters + "&p=" + pparam;        
    }


    var sessionbase = GLOBAL_server + '/MONServer/chromebook/cbe_handshake.do' + parameters;

    if (GLOBAL_review == 'true') {
        // need to use this for reviews to avoid session issue
        sessionbase = GLOBAL_alt_server + '/MONServer/chromebook/cbe_handshake.do' + parameters;
    }

    console.log("calling " + sessionbase);

    checkServerAccess(GLOBAL_drm, 5000, sessionbase);

    

        
});


window.addEventListener("message", (event) => {

    if (GLOBAL_review == 'true') {
        var outmessage = { action: "challengecookiereview", payload: event.data };
        console.log("Sending message: " + outmessage);
        chrome.runtime.sendMessage( outmessage );
    } else {
        var outmessage = { action: "challengecookie", payload: event.data };
        console.log("Sending message: " + outmessage);
        chrome.runtime.sendMessage( outmessage );
    }
    

}, false);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

    console.log("SECURITYB ACTION: " + request.action);

    if (request.action == 'schoologyfailedstart') {
        console.log("schoologystartissue");      
        
        $("#ldb_subtitle").hide();
        $("#ldb_schoology_issue").show();  

    }

});






