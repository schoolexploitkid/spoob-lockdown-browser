
const GLOBAL_server = "https://smc-service-cloud-cbe.respondus2.com";
//const GLOBAL_server = "https://qa-app.respondus2.com";

const GLOBAL_drm = GLOBAL_server + "/MONServer/drmcheck.shtml";

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

    var aparam = getURLParameter("a");


    console.log("aparam" + aparam);


    var parameters = "?a=" + aparam;
    
    var sessionbase = GLOBAL_server + '/MONServer/chromebook/help_center.do' + parameters;

    //sessionbase = "https://www.corporateonline.gov.bc.ca/";
    
    console.log("calling " + sessionbase);

    checkServerAccess(GLOBAL_drm, 5000, sessionbase);

    

        
});


window.addEventListener("message", (event) => {

    var outmessage = { action: "reportissueaction", payload: event.data };
    console.log("Sending message: " + outmessage);
    chrome.runtime.sendMessage( outmessage );

}, false);


