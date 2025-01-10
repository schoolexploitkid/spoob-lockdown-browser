console.log("Inside bbpass...");


var GLOBAL_timeout = null;
var GLOBAL_server = "https://smc-service-cloud-cbe.respondus2.com";
//var GLOBAL_server = "https://qa-app.respondus2.com";


const GLOBAL_bbpass = chrome.i18n.getMessage("password");
const GLOBAL_bbpassenter = chrome.i18n.getMessage("password_enter");
const GLOBAL_bbsubmit = chrome.i18n.getMessage("submit_button");
const GLOBAL_bberror = chrome.i18n.getMessage("password_error");

const examid = param("examid");

$(document).ready(function() {
    $("#passtitle").html(GLOBAL_bbpass);
    $("#passtext").html(GLOBAL_bbpassenter);
    $("#passenter").html(GLOBAL_bbsubmit);
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




$('body').on('click', '#passenter', function(e) {   
    const v = $("#passin").val();
    checkPassword(v);
});

function checkPassword(passin) {
    var sessionbase = GLOBAL_server + '/MONServer/chromebook/verify_test_pw.do';

    var shapass= CryptoJS.SHA256(passin);

    var parameters = "x=" + examid + "&p=" + shapass;
    

    var callhttp = sessionbase + "?" + parameters;

    

    fetch(sessionbase, {
        method: "POST",
        body:new URLSearchParams(parameters)
    })
       .then(response => response.text())
       .then(data => {if (data === 'true') {
            console.log("true");
            chrome.runtime.sendMessage({action: 'bbvalidpass'}, function(response) {
                console.log('sent message');              
            });
       } else {
            console.log("false");
            $("#passwordIndicator").html(GLOBAL_bberror);
            $("#passin").css("border-color", "red");
            setTimeout(function(){$("#passwordIndicator").html("&nbsp;");$("#passin").css("border-color", "#387da6");}, 1500);
       } })
       .catch(error => console.log("error", error));
}





function param(name) {
    return (location.search.split(name + '=')[1] || '').split('&')[0];
}


