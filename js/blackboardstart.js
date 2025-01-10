console.log("Inside bbstart...");


var GLOBAL_timeout = null;
var GLOBAL_server = "https://smc-service-cloud-cbe.respondus2.com";
//var GLOBAL_server = "https://qa-app.respondus2.com";
const GLOBAL_drm = GLOBAL_server + "/MONServer/drmcheck.shtml";

const GLOBAL_bbstart = chrome.i18n.getMessage("blackboardstart");

$("#ldb_subtitle").html(GLOBAL_bbstart);


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



$( document ).ready(function() {
    setTimeout(function(){getInstitutionProfile();}, 100);
});




$('body').on('click', '#hidden-button', function(e) {   
    clearClip();    
});


function createClipboardButton(){
   console.log('created button');
   var button = document.createElement("button");
   button.classList.add("clearclipboard");
   document.getElementsByTagName("body")[0].appendChild(button);
   $('.clearclipboard').click(clearClipboard);
   $('.clearclipboard').click();
   button.style.visibility = 'hidden';
}

function clearClipboard(){ 


    console.log("clearClipboard();");
    
       // Create a temporary textarea element
       var textarea = document.createElement("textarea");
    
       // Set the text you want to copy
       var textToCopy = "Cleared";
       textarea.value = textToCopy;
    
       // Append the textarea to the DOM (it doesn't need to be visible)
       document.getElementsByTagName("body")[0].appendChild(textarea);
    
       // Select the text in the textarea
       textarea.select();
    
       // Execute the copy command
       var result = document.execCommand('copy');
    
       // Clean up by removing the temporary textarea from the DOM
       textarea.style.visibility = "hidden";
    
       console.log('cleared clipboard: ' + result);
    }

    createClipboardButton();



clearClip();
$('#hidden_button').click();

function clearClip() {
    
    var textArea = document.getElementById("hidden_text");    
    console.log("clearing clip");

    for (let i = 30; i < 38; i++) {
        textArea.value = i+"------"+i;
        document.body.appendChild(textArea);
        textArea.select();
        status = document.execCommand("copy");
    }

    
       
    console.log("clearing clip");
    

}



function getInstitutionProfile() {

    clearClip();

    console.log("getInstitutionProfile");

    var manifestData = chrome.runtime.getManifest();
    var authorName = manifestData.author;


    var course = param('courseid');
    var exam = param('examid');
    var server = param('server');

    var parameters = "c=" + course + "&e=" + exam + "&u=" + server + "&a=" + authorName;

    var sessionbase = GLOBAL_server + '/MONServer/chromebook/locate_exam_profile3.do?' + parameters;

    console.log("calling " + sessionbase);

    
    checkServerAccess(GLOBAL_drm, 5000, sessionbase);
    
}


function getBlackboardProfile(incoming) {
    var entry = "3487HJKHD932JKHDHF187JH";

    var pos = incoming.indexOf("::");
    var incomingRemain = incoming.substring(pos + 2);

    var binary_string = window.atob(incomingRemain);

    var bf = new Blowfish(entry, "ecb");
    var decrypted = bf.decrypt(binary_string);

    var obj = JSON.parse(decrypted);

    console.log("BB PROFILE -----------------------------------------------------------------------------------");
    console.log(obj);

    var outmessage = { action: "blackboardstartconsole", payload: obj.has_text_password };    
    chrome.runtime.sendMessage( outmessage );

    console.log("BB PROFILE -----------------------------------------------------------------------------------");



    // check if enabled
    if (obj.extension_enabled && obj.ldbenabled) {

        console.log("extension enabled");

        var ss = obj.secret;
        var profileid = obj.profileid;
        var institutionid = obj.institutionid;
        GLOBAL_bbpass = obj.bb_password;

        var profilepath = obj.profile_path;

        var posweb = profilepath.indexOf("//webapps");
        GLOBAL_restart_url = profilepath.substring(0, posweb);
        

        var callhttp = profilepath + "get_user_info2.jsp";
        //callhttp = callhttp.replace("https", "http");

        var exitstamp = new Date().getTime();

        var tstring = "time=" + exitstamp;
        var mstring = hex_md5(tstring + ss);
        var rstring = "time=" + exitstamp + "&mac=" + mstring + "&mac2=" + mstring;

        var rout = encrypt_user_info(rstring, ss);
        callhttp = callhttp + "?r=" + encodeURIComponent(rout);

        // ok ready to start exam but need the user information
        var xhr2 = new XMLHttpRequest();


        xhr2.open("GET", callhttp, true);
        xhr2.withCredentials = true;
        xhr2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr2.onreadystatechange = function() {
            if (xhr2.readyState == 4) {

                if (xhr2.status == 200) {

                    var userinfo = decrypt_user_info(xhr2.responseText, ss);



                    // set Globals for the oncomplete
                    GLOBAL_complete_activeTab = activetab;
                    GLOBAL_complete_overlayTab = overlaytab;

                    var res = userinfo.split("$%$");
                    var outid = res[0];
                    var outname = res[2] + res[1];
                    var outinfo = { "id": outid, "name": outname };
                    var outJSON = JSON.stringify(outinfo);

                    storeWebCamInfo(serverin, course, exam, outid, outname, outname);

                    // set the user information
                    chrome.storage.local.set({ 'ldb_user_cookie': outJSON }, function(result) {
                        var outurl = chrome.extension.getURL('webcamstart.html');
                        outurl = outurl + "?" + "courseid=" + course + "&examid=" + exam + "&server=" + serverin;



                        chrome.tabs.create({ index: 1, url: outurl, active: true }, function(tab) {

                            chrome.tabs.remove(GLOBAL_complete_overlayTab);
                        });
                    });

                } else {
                    console.log("ERROR getUserInfo:" + xhr2.status + "," + xhr2.responseText);
                }

            }
        }

        xhr2.send();

    } else {

        chrome.tabs.create({ url: "blackboard_setup_error.html" }, function(tab) {
            chrome.tabs.remove(GLOBAL_complete_overlayTab);
            setTimeout(function() {

                chrome.tabs.remove(tab.id)
            }, 10000);
            cleanupEndExam();
        });


    }


}


function param(name) {
    return (location.search.split(name + '=')[1] || '').split('&')[0];
}


window.addEventListener("message", (event) => {

    

    var outmessage = { action: "bbprofile", payload: event.data };
    console.log("Sending message: " + outmessage);

    

    chrome.runtime.sendMessage( outmessage );
    

}, false);