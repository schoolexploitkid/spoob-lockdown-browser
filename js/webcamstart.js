console.log("Inside webcamstart...");


var GLOBAL_timeout = null;
const GLOBAL_server = "https://smc-service-cloud-cbe.respondus2.com";
//const GLOBAL_server = "https://qa-app.respondus2.com";
var GLOBAL_profile_url = null;
var GLOBAL_sid = null;
var GLOBAL_profile_id = null;
var GLOBAL_profile_s = null;
var GLOBAL_bypass = false;

var GLOBAL_feedback = false;
var GLOBAL_incoming_es = "";
var GLOBAL_incoming_history = "";

var GLOBAL_slvpMode = false;
var GLOBAL_ping = null; 
var GLOBAL_endtimer = null;
const GLOBAL_drm = GLOBAL_server + "/MONServer/drmcheck.shtml";


checkServerAccess(GLOBAL_drm, 5000);

//getInstitutionProfile();


//console.log(param('url'));

//var webview = document.getElementById("inlineFrameExample");
//webview.src = param('url');

//console.log("loading in the DIV");
//$( "#results" ).load( "https://respondus.instructure.com/login/canvas" );


function param(name) {
    return (location.search.split(name + '=')[1] || '').split('&')[0];
}



function checkProfileMessage(incoming) {

    var pos = incoming.indexOf("CBE-LOCATEEXAMPROFILE-DONE");

    var pos2 = incoming.indexOf("SBXCMD:");
    var pos3 = incoming.indexOf("post_robot");

    if (pos != -1) {
        getInstitutionProfileMessage(incoming);        
    } else if (pos2 == -1 && pos3 == -1) {
        // there is an error
        var pos2 = incoming.indexOf("::");
        var incomingRemain = incoming.substring(pos2+2);
        var server = encodeURI(param('server'));

        //console.log(incomingRemain);
        //console.log(server);

        $("#errorMessageProfileText").html(incomingRemain);
        $("#errorMessageProfileURL").html(server);
        $("#errorMessageProfile").show();

    } else {
        //console.log("SBXCMD = " + incoming);       


        if (incoming.indexOf("recstart=1") != -1) {
            //recording started get SID
            var pos = incoming.indexOf("sid=");
            var part = incoming.substring(pos + 4);
            var pos2 = part.indexOf("&pwd");
            var sidout = part.substring(0, pos2);

            var pos3 = part.indexOf("&slvp=1");
            var pos4 = part.indexOf("&scr=1");

            if (pos3 != -1) {
                GLOBAL_slvpMode = true;
                chrome.runtime.sendMessage({ action: "svlpmode" });
            }

            if (pos4 != -1) {
                chrome.runtime.sendMessage({ action: "screenrecmode" });
            }

            GLOBAL_sid = sidout;

            //console.log("SID RECEIVED");

        }


        if (incoming.indexOf("examstart=1") != -1) {
            chrome.runtime.sendMessage({ action: "resumeexam", monitor: true, sid: GLOBAL_sid, pid: GLOBAL_profile_id, ps: GLOBAL_profile_s }, function(response) {
                //console.log("sent resume exam");
            });
            GLOBAL_feedback = true;
            pingDead();

        }

        if (incoming.indexOf("ssfront=1") != -1) {
            chrome.runtime.sendMessage({ action: "showwebcam" }, function(response) {
                //console.log("sent resume exam");
            });

        }

        if (incoming.indexOf("ssback=1") != -1) {
            chrome.runtime.sendMessage({ action: "hidewebcam" }, function(response) {
                //console.log("sent resume exam");
            });

        }

        if (incoming.indexOf("ssexitfaq=1") != -1) {
            chrome.runtime.sendMessage({ action: "closefaq" }, function(response) {
                //console.log("sent close faq");
            });
        }
       

    }
    

}

window.addEventListener("message", (event) => {    

    //console.log("MESSAGE RECEIEVED ");
    //console.log(event);

    //checkProfileMessage(event.data);
    

}, false);

// -----------------------------------------------------------------------------
// check that the institution has a license
// -----------------------------------------------------------------------------



$("#susclose").click(function() {
    //console.log("susclose");

    
    var maxretry = 1;
    pingDead();

    while (maxretry > 0) {
        chrome.runtime.sendMessage({ action: "closesus", monitor: true }, function(response) {
            
            if (!chrome.runtime.lastError) {
                maxretry = 0;
            } else {
                console.log("ERROR SENDING RETRY" + chrome.runtime.lastError.message);
            }

            
        });

        maxretry--;
    }    

});


$("#continue_exam").click(function() {
    //console.log("Continue Exam" + GLOBAL_sid);


    chrome.runtime.sendMessage({ action: "resumeexam", monitor: true, sid: GLOBAL_sid, pid: GLOBAL_profile_id, ps: GLOBAL_profile_s }, function(response) {

        //console.log("sent resume exam");
    });

    GLOBAL_feedback = true;


});

$("#end_exam_link").click(function(e) {
    console.log("end exam");
    e.stopPropagation();
    e.preventDefault();

    $("#errorExitButton").hide();
     chrome.runtime.sendMessage({action: 'endexam', link: 'https://support.respondus.com/hc/en-us/articles/4416216293659-Chromebook-There-is-a-problem-with-the-URL-for-this-exam'});
  });

  $("#end_exam").click(function() {
    console.log("end exam click");
    $("#errorExitButton").hide();
     chrome.runtime.sendMessage({action: 'endexam'});
  });



$("#not_enabled").click(function() {
    console.log("not enabled");

    chrome.runtime.sendMessage({ action: 'notenabled', starturl: GLOBAL_profile_url });

    GLOBAL_feedback = false;

});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received message from background");
    console.log(request);

    if (request.action == 'endofexam' || request.action == 'endexam') {
        //console.log("ENDING EXAM");
        endExam();
    } else if (request.action == 'endofexamwait') {
        endExamWait();
    } else if (request.action == 'endofexamabnormal') {
        if (GLOBAL_slvpMode) {
            endExamAbnormal();
        } else {
            endExam();
        }
                
    } else if (request.action == 'feedback') {
        console.log("Got the feedback call");
        switchToFeedback();
    } else {
        console.log("NOT ENDING EXAM " + request.action);
    }


});

function endExamWait() {
    //console.log("Sending message to mainframe...with wait");
    var receiver = document.getElementById('mainframe').contentWindow;
    receiver.postMessage('end_exam_received', GLOBAL_server);

    if (GLOBAL_endtimer != null) { clearTimeout(GLOBAL_endtimer); }
    GLOBAL_endtimer = setTimeout(performExamEnd, 300000 );
}

function endExam() {
    //console.log("Sending message to mainframe...");
    var receiver = document.getElementById('mainframe').contentWindow;
    receiver.postMessage('end_exam_received', GLOBAL_server);    

    if (GLOBAL_endtimer != null) { clearTimeout(GLOBAL_endtimer); }
    GLOBAL_endtimer = setTimeout(performExamEnd, 300000 );
}

function endExamAbnormal() {
    console.log("Sending message to mainframe...abnormal");
    var receiver = document.getElementById('mainframe').contentWindow;
    receiver.postMessage('end_exam_abnormally', GLOBAL_server);   

    if (GLOBAL_endtimer != null) { clearTimeout(GLOBAL_endtimer); }
    GLOBAL_endtimer = setTimeout(performExamEnd, 300000 ); 
}

function switchToFeedback() {
    // timer expired before webcam returned   
    //console.log("collectFeedback 2");
    collectFeedback();
}

function collectFeedbackNow() {

    console.log("collectFeedbackNow sid = " + GLOBAL_sid);

    var fullurl = GLOBAL_server + "/MONServer/chromebook/student_feedback2.do?token=d376f4219b4640749903a5e93f3e9dd7&env=chromeos&sid=" + GLOBAL_sid;
    $("#mainframe").attr("src", fullurl);
}

function collectFeedback() {

    if (GLOBAL_timeout != null) {
        clearTimeout(GLOBAL_timeout);
        GLOBAL_timeout = null;
    }

    // protect against double feedback calls
    //console.log("............................................collectFeedback " + GLOBAL_feedback);

    if (GLOBAL_feedback) {

        collectFeedbackNow();
        GLOBAL_feedback = false;
    }


}


function proctorCallback(details) {

    

    var messageout = { cancel: false };

    var commandTab = details.tabId;
    var commandurl = details.url;

    if (commandurl.indexOf("live_proctoring_continue.do") != -1) {
        var pos = commandurl.indexOf("?x=");

        if (pos != -1) {
            var confirmcode = commandurl.substring(pos + 3);
            console.log("confirmcode = " + confirmcode);
            monitorNotEnabled();
        }
    }

    if (commandurl.indexOf("live_proctoring_start_cancel.do") != -1) {
        //console.log("USER CANCELLED>..........");
        var exiturl = chrome.runtime.getURL('examend.html');

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            var activeTab = tabs[0].id;
            chrome.tabs.update(activeTab, { url: exiturl });
        });
        
    }



    return messageout;
}




function smbxCallback(details) {
    var messageout = { cancel: false };
    console.log("smbxCallback");

    var commandTab = details.tabId;
    var commandurl = details.url;

    console.log("commandurl = " + commandurl);

    //we have started getting page loads
    if (commandurl.indexOf("initial_check.do") != -1 || commandurl.indexOf("termsofservice.do") != -1) {
        $("#titleMessage").hide();
    }

    if (commandurl.indexOf("startup_sequence_done.do") != -1) {

        console.log("startup_sequence_done.do");
        console.log("get the sid");

        var pos = commandurl.indexOf("sid=");
        var part = commandurl.substring(pos + 4);
        var pos2 = part.indexOf("&pwd");
        var sidout = part.substring(0, pos2);

        //console.log(sidout);

        GLOBAL_bypass = true;

        // the user has bypassed monitor
        chrome.runtime.sendMessage({ action: "resumeexam", monitor: false, sid: sidout, pid: GLOBAL_profile_id, ps: GLOBAL_profile_s }, function(response) {
            console.log("sent resume exam");
            pingDead();
        });

        GLOBAL_feedback = true;

    }

    if (commandurl.indexOf("window_close.do") != -1) {
        // the user has declined the Terms of Service
        chrome.runtime.sendMessage({ action: "declineexam", monitor: false }, function(response) {
            console.log("sent decline exam");
        });

        pingDead();
    }



    //console.log("Detected " + commandurl + " on tab:" + commandTab );

    if (commandurl.indexOf("exam_end_done.do") != -1) {
        performExamEnd();                  
    }


    

    return messageout;


}

function performExamEnd() {

    if (GLOBAL_endtimer != null) {
        clearTimeout(GLOBAL_endtimer);
        GLOBAL_endtimer = null;
    }

    chrome.runtime.sendMessage({ action: "examenddone" }, function(response) {
        console.log("sent examenddone");
    });
            


    // videos are done uploading        
    GLOBAL_timeout = setTimeout(switchToFeedback, 1000);

    if (!GLOBAL_bypass) {
        // collect feedback
        console.log("collectFeedback 1");
        //collectFeedback();
    }

}

function smbxCallbackError(details) {
    console.log("smbxCallbackError");

    var commandTab = details.tabId;
    var commandurl = details.url;
    var commanderror = details.error;

    console.log("Detected " + commandurl + " on tab:" + commandTab + " with error:" + commanderror);

    return {};


}

function smbxCallbackRedirect(details) {
    console.log("smbxCallbackRedirect");

    var commandTab = details.tabId;
    var commandurl = details.url;
    var commanderror = details.error;

    console.log("Detected " + commandurl + " on tab:" + commandTab + " with error:" + commanderror);


}

function checkServerAccess(url, timeout) {

    console.log(url);

        const controller = new AbortController();
        const signal = controller.signal;
        const options = { mode: 'no-cors', signal };
        return fetch(url, options)
          .then(setTimeout(() => { controller.abort() }, timeout))
          .then( function(response) {
            if (response.status == 200) {
                getInstitutionProfile();
            } else {
                window.open(GLOBAL_drm);
                window.close();
            }            
            console.log('Check server response:', response.statusText, response.status);
          })
          .catch(function(error) {
            console.error('Check server error:', error.message);
            window.open(GLOBAL_drm);
            window.close();
          });
    
}

function getInstitutionProfile() {

    console.log("getInstitutionProfile");

    var manifestData = chrome.runtime.getManifest();
    var authorName = manifestData.author;


    var course = param('courseid');
    var exam = param('examid');
    var server = encodeURI(param('server'));
    var inst = param('inst');
    GLOBAL_incoming_history = param('history');


    console.log(server);



    var parameters = "c=" + course + "&e=" + exam + "&u=" + server + "&a=" + authorName;

    if (inst) {
        parameters = parameters + "&i=" + inst;
    }
    

    var sessionbase = GLOBAL_server + '/MONServer/chromebook/locate_exam_profile4.do?' + parameters;

    
    

    console.log("calling " + sessionbase);

    $("#launch-frame").attr("src", sessionbase);


}





function getInstitutionProfileMessage(incoming) {
    var entry = "3487HJKHD932JKHDHF187JH";

    var pos = incoming.indexOf("::");
    var incomingRemain = incoming.substring(pos+2);

    

    var binary_string = window.atob(incomingRemain);

    var bf = new Blowfish(entry, "ecb");
    var decrypted = bf.decrypt(binary_string);        


    //console.log(decrypted);
    //chrome.runtime.sendMessage({ action: "LOGMODE", log: decrypted }, function(response) {
    //    console.log("sent log");
    //});


    var obj = JSON.parse(decrypted);

    console.log("getInstitutionProfileMessage");
    console.log(obj);

    GLOBAL_incoming_es = obj.sssecret;

    GLOBAL_profile_url = obj.profileurl;
    GLOBAL_profile_id = obj.profileid;
    


    var exallowed = obj.allow_external_domains;    
    var passrequired = obj.has_test_password;

    console.log("monitorrequired = " + obj.monitorrequired);
    console.log("monitorenabledinprofile = " + obj.monitor_enabled_in_profile);
    console.log("ext enabled = " + obj.extension_enabled);

    

    //obj.ldbenabled = true;
    //obj.extension_enabled = true;

     if (GLOBAL_incoming_history == 'y') {
        obj.monitorrequired = false;
        obj.liveproctoringenabled = false;
    }
    
    GLOBAL_profile_s = 'XXXXX';

    if (exallowed) {
        
        chrome.runtime.sendMessage({ monitorinprofile: obj.monitor_enabled_in_profile, monitor: obj.monitorrequired, passrequired: passrequired, examid: obj.exam_id, action: "restarturl", exdomain: obj.external_domains, calc: obj.calculator_mode, starturl: GLOBAL_profile_url, profileid: GLOBAL_profile_id, locked: obj.locked, reportmode: obj.blockedkeyaction, allowlist: obj.extension_allow_list, liveproctor: obj.liveproctoringenabled }, function(response) {
            console.log("sent restarturl");
        });

    } else {
        chrome.runtime.sendMessage({ monitorinprofile: obj.monitor_enabled_in_profile, monitor: obj.monitorrequired, examid: obj.exam_id, action: "restarturl", calc: obj.calculator_mode, starturl: GLOBAL_profile_url, profileid: GLOBAL_profile_id, locked: obj.locked, reportmode: obj.blockedkeyaction, allowlist: obj.extension_allow_list, liveproctor: obj.liveproctoringenabled, passrequired: obj.has_test_password }, function(response) {
            console.log("sent restarturl");
        });
    }

    

    console.log(obj);

    




    const monitorissue = (obj.monitorrequired == true && obj.monitor_enabled_in_profile == false);
    if (obj.ldbenabled == true) {
        if (obj.extension_enabled == true) {

            if (!monitorissue) {
            

                console.log("ldbenabled and extension_enabled and no monitor issue!");
                if (obj.monitorrequired) {
                    
                console.log(obj);
                    
                    if (obj.lmstype == 'SCHOOLOGY') {
                        chrome.runtime.sendMessage({ action: "monitornotsupported", monitor: false }, function(response) {
                            console.log("sent monitor not supported");
                        });

                    } else {
                        if (obj.monitorlicense != 'NOT_LICENSED') {                        

                            var course = param('courseid');
                            var exam = param('examid');
                            // has a license start sequence
                            beginStartupSequenceNew(course, exam, obj.profileid);

                        } else {
                            alert("Not licensed for monitor");
                        }

                    }

                } else {
                    console.log("MONITOR NOT REQUIRED");
                    console.log(obj);

                    if (obj.liveproctoringenabled) {
                        getInitInfo(obj.institutionid, obj.profilename, obj.secret, obj.profileid);
                    } else {
                        monitorNotEnabled();
                    }


                }
            } else {
                // hide the spinner
                $("#titleMessage").hide();
                // show the problem
                $("#monitorProfileMessage").fadeIn();
                

            }
        } else {
            // hide the spinner
            $("#titleMessage").hide();
            // show the problem
            $("#extensionMessage").fadeIn();
        }
    } else {
        // ldb is not enabled...
        chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
            var activeTab = tabs[0];
            console.log("sending resume exam");
            chrome.runtime.sendMessage({ action: "resumeexamnoldb", monitor: false }, function(response) {
                console.log("sent resume exam");
                console.log("removing " + activeTab.id);
                pingDead();
                
            });
            GLOBAL_feedback = false;

            setTimeout(function() { chrome.tabs.remove(activeTab.id); }, 1000);

        });

    }


}



function monitorNotEnabled() {

    // monitor is not enabled so proceed to exam without delay
    chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
        var activeTab = tabs[0];
        console.log("sending resume exam");

        
        chrome.runtime.sendMessage({ action: "resumeexam", monitor: false, sid: GLOBAL_sid, pid: GLOBAL_profile_id, ps: GLOBAL_profile_s }, function(response) {
            console.log("sent resume exam");
            console.log("removing " + activeTab.id);
            //
        });


        GLOBAL_feedback = false;

        setTimeout(function() { chrome.tabs.remove(activeTab.id); }, 2000);


    });
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


function getInitInfo(ins, server, s1, profileid) {

    console.log("getInitInfo");

    var d = new Date();
    var t = d.getTime().toString();

    var token = 'token';

    //t = '1609803836590';



    var shatime = CryptoJS.SHA256(t);

    var shatoken = CryptoJS.SHA256(token);

    var inner = shatime + "90a4dde52cd05a1503b1385773913fa4" + shatoken;



    var mdky = CryptoJS.SHA256(inner);



    var parameters = "k=" + token + "&t=" + t + "&s=" + mdky;

    var xhr = new XMLHttpRequest();
    var sessionbase = GLOBAL_server + '/MONServer/chromebook/init.do';

    var callhttp = sessionbase;

    xhr.open("POST", callhttp, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {

                var sessioncode = xhr.responseText;

                var course = param('courseid');
                var exam = param('examid');

                // start the proctoring
                startLiveProctoring(sessioncode, token, profileid, course, exam)


            } else {
                console.log("ERROR " + xhr.status + "," + xhr.responseText);
            }

        }
    }

    xhr.send(parameters);





}

function startLiveProctoring(sessioncode, token, profileid, course, exam) {
    console.log("startLiveProctoring");

    var d = new Date();
    var t = d.getTime().toString();



    var nonce = uuidv4();
    var lang = 'EN';

    var s2 = "2abca49704aecef3f4922b3a9ec931f0";

    var shatime = CryptoJS.SHA256(t);
    var shatoken = CryptoJS.SHA256(token);
    var shaprofileid = CryptoJS.SHA256(profileid);
    var shaexam = CryptoJS.SHA256(exam);
    var shacourse = CryptoJS.SHA256(course);
    var shanonce = CryptoJS.SHA256(nonce);
    var shalang = CryptoJS.SHA256(lang);

    var inner = s2 + shatoken + shaprofileid + shacourse + shaexam + shanonce + shalang + shatime + sessioncode;

    var mdky = CryptoJS.SHA256(inner);

    var parameters = encodeURI("k=" + token + "&p=" + profileid + "&c=" + course + "&e=" + exam + "&l=" + lang + "&n=" + nonce + "&t=" + t + "&s=" + mdky);

    console.log(parameters);

    var sessionbase = GLOBAL_server + '/MONServer/chromebook/live_proctoring_start.do';

    var fullurl = sessionbase + "?" + parameters;

    console.log("calling " + fullurl);

    $("#titleMessage").hide();

    $("#mainframe").attr("src", fullurl);


    var proctorFilter = { urls: ["<all_urls>"] };
    var opt_extraInfoSpec = []; // blocking
    chrome.webRequest.onBeforeRequest.addListener(proctorCallback, proctorFilter, opt_extraInfoSpec);

}

function checkMonitorLicense(ins, server, s1, profileid) {

    


    var d = new Date();
    var t = d.getTime();

    var ky = ins + server + t + s1;

    var mdky = hex_md5(ky);

    parameters = "institutionId=" + ins + "&serverName=" + server + "&time=" + t + "&mac=_" + mdky;

    console.log("calling check_monitor_license5 with " + parameters);

    var xhr = new XMLHttpRequest();
    var sessionbase = GLOBAL_server + '/MONServer/chromebook/check_monitor_license5.do';

    var callhttp = sessionbase;

    xhr.open("POST", callhttp, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {

                console.log(xhr.responseText);
                // licensing mode - 
                // profile id - d376f4219b4640749903a5e93f3e9dd7
                // profile uri - null
                // isMonitorOnly
                // isEnableHelpCenter
                // disableEarlyExitData
                // forceDashboardAutAutoLaunch

                // check license and deny access if not licensed


                var course = param('courseid');
                var exam = param('examid');
                // has a license start sequence
                beginStartupSequence(course, exam, profileid, s1);

            } else {
                console.log("ERROR " + xhr.status + "," + xhr.responseText);
            }

        }
    }

    xhr.send(parameters);
}

// -----------------------------------------------------------------------------
// institution has a license so start the SuS
// -----------------------------------------------------------------------------
function pingAlive() {
    
    chrome.runtime.sendMessage({ action: "susping" }, function(response) {
            
        });
}

function pingDead() {
    if (GLOBAL_ping != null) {
     clearTimeout(GLOBAL_ping);
     GLOBAL_ping = null;
    }
}

function beginStartupSequence(courseid, examid, token, s1) {

    //store_log("INFO", "beginStartupSequence: parameters " + parameters);

    console.log("Starting startup sequence...2" + courseid + "," + examid);

    GLOBAL_ping = setInterval(function() { pingAlive() }, 1000); 
    console.log("started ping interval");

    chrome.storage.local.get(['ldb_user_cookie'], function(result) {
        //chrome.cookies.get({url:'https://respondus.instructure.com', name:'ldb_user_cookie'}, function(cookie) {
        console.log("USER cookie: " + result.ldb_user_cookie);
        console.log(result.ldb_user_cookie);

        var obj = JSON.parse(result.ldb_user_cookie);

        var version = "4.0";

        //var token = "d376f4219b4640749903a5e93f3e9dd7"; // profile id

        var fullname = obj.name;
        var pos = fullname.indexOf(" ");

        var firstn = fullname.substring(0, pos);
        var lastn = fullname.substring(pos + 1);

        console.log("Name is f:" + firstn + " l:" + lastn);

        var userName = obj.id;

        var loginId = null;
        if (obj.login_id) {
            loginId = obj.login_id;
        }


        //var s1 = "1CJYK0HalhhEebT0";

        var d = new Date();
        var t = d.getTime();

        var ky = token + courseid + userName + firstn + lastn + examid + version + t + s1;

        var mdky = hex_md5(ky);

        // loginId is optional not used in Bb
        if (loginId != null) {
            parameters = "os=CBE&lang=en&token=" + token + "&courseRefId=" + courseid + "&examId=" + examid + "&userName=" + userName + "&firstName=" +
                firstn + "&lastName=" + lastn + "&loginId=" + loginId + "&version=" + version + "&time=" + t + "&mac=_" + mdky;
        } else {
            parameters = "os=CBE&lang=en&token=" + token + "&courseRefId=" + courseid + "&examId=" + examid + "&userName=" + userName + "&firstName=" +
                firstn + "&lastName=" + lastn + "&version=" + version + "&time=" + t + "&mac=_" + mdky;
        }


        var sessionbase = GLOBAL_server + '/MONServer/chromebook/startup_sequence.do';

        console.log(sessionbase);

        var fullurl = sessionbase + "?" + parameters;

        console.log("calling " + fullurl);

        $("#mainframe").attr("src", fullurl);

        var webcamFilter = { urls: ["<all_urls>"] };
        var opt_extraInfoSpec = []; //blocking

        chrome.webRequest.onBeforeRequest.addListener(smbxCallback, webcamFilter, opt_extraInfoSpec);

    });


}

function beginStartupSequenceNew(courseid, examid, token) {

    //store_log("INFO", "beginStartupSequence: parameters " + parameters);

    console.log("Starting startup sequence..." + courseid + "," + examid);

    GLOBAL_ping = setInterval(function() { pingAlive() }, 1000); 

    chrome.storage.local.get(['ldb_user_cookie'], function(result) {
        //chrome.cookies.get({url:'https://respondus.instructure.com', name:'ldb_user_cookie'}, function(cookie) {
        console.log("USER cookie: " + result.ldb_user_cookie);
        console.log(result.ldb_user_cookie);

        var fullname = "unknown user";
        var firstn = "unknown";
        var lastn = "unknown";
        var userName = "unknown_user";
        var loginId = null;

        if (result.ldb_user_cookie) {
            var obj = JSON.parse(result.ldb_user_cookie);

            var version = "4.0";

            //var token = "d376f4219b4640749903a5e93f3e9dd7"; // profile id

            fullname = obj.name;
            fullname = fullname.trim();

            var pos = fullname.indexOf(" ");

            firstn = "Unknown";
            lastn = fullname;

            if (pos != -1) {
                firstn = fullname.substring(0, pos);
                lastn = fullname.substring(pos + 1);
            }

            

            console.log("Name is f:" + firstn + " l:" + lastn);

            userName = obj.id;
            
            if (obj.login_id) {
                loginId = obj.login_id;
            }
        }
        


        //var s1 = "1CJYK0HalhhEebT0";

        

        // loginId is optional not used in Bb
        if (loginId != null) {
            parameters = "os=CBE&lang=en&token=" + token + "&courseRefId=" + courseid + "&examId=" + examid + "&userName=" + userName + "&firstName=" +
                firstn + "&lastName=" + lastn + "&loginId=" + loginId + "&version=" + version;
        } else {
            parameters = "os=CBE&lang=en&token=" + token + "&courseRefId=" + courseid + "&examId=" + examid + "&userName=" + userName + "&firstName=" +
                firstn + "&lastName=" + lastn + "&version=" + version;
        }

        console.log(parameters);

        
        parameters = encrypt_user_info(parameters, GLOBAL_incoming_es);

        console.log(GLOBAL_incoming_es);

        var sessionbase = GLOBAL_server + '/MONServer/chromebook/cbe_startup_sequence2.do';

        var fullurl = sessionbase + "?r=" + encodeURIComponent(parameters);

        console.log("calling " + fullurl);

        $("#mainframe").attr("src", fullurl);

        var webcamFilter = { urls: ["<all_urls>"] };
        var opt_extraInfoSpec = ["extraHeaders"]; 

        console.log("inserting the listener");
        chrome.webRequest.onBeforeRequest.addListener(smbxCallback, webcamFilter, opt_extraInfoSpec);

    });
  }

  function encrypt_user_info(input, key) {

    var bf = new Blowfish(key, "ecb");
    var diff = input.length % 8;

    // pad to 8 bytes margins
    input = (input + "        ").slice(0, input.length + (8 - diff));

    var blocked = bf.encrypt(input);
    var blocked = bf.base64Encode(blocked);
    return blocked;
}



window.addEventListener("message", (event) => {

    console.log("MESSAGE RECEIEVED ");
    console.log(event);

    checkProfileMessage(event.data);
    

}, false);