const GLOBAL_server = "https://smc-service-cloud-cbe.respondus2.com";
//const GLOBAL_server = "https://qa-app.respondus2.com";
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
        var pos = sURLVariables[i].indexOf("="); //find first occurrance of =
        var sParameterName = sURLVariables[i].substring(0, pos);
        if (sParameterName == sParam) 
        {
            return sURLVariables[i].substring(pos+1);
        }
    }
}


$( document ).ready(function() {

    var aparam = getURLParameter("a");
    var lparam = getURLParameter("l");

    console.log("aparam" + aparam);
    console.log("lparam" + lparam);

    var parameters = "?a=" + aparam + "&l=" + lparam;
    var sessionbase = GLOBAL_server + '/MONServer/chromebook/cbe_launch.do' + parameters;

    console.log("calling " + sessionbase);

    checkServerAccess(GLOBAL_drm, 5000, sessionbase);

    

        
});


window.addEventListener("message", (event) => {

    var outmessage = { action: "autolaunch", payload: event.data };
    console.log("Sending message: " + outmessage);
    chrome.runtime.sendMessage( outmessage );

}, false);


