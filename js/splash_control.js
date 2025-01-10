

var GLOBAL_lmstype = "";
var GLOBAL_profileid = "";
var GLOBAL_dest = "";
var GLOBAL_defaultused = false;

var GLOBAL_urllist = null;
var GLOBAL_institution = "";
var GLOBAL_institution_code = "";
var GLOBAL_lock_start = false;
var GLOBAL_report_key = "";
var GLOBAL_currentProfileList = "";

var GLOBAL_preselectedId = "";

var LdbAssist = null;
var m_instanceID = null;
var m_sessionKey = null;
var m_bypass_mode = false;

onload = function() {

	//reset_log();
	
	console.log('Calling initlog');


	
	// convert init log into syncronous
	init_log();
	
	localize();

	  
	// set the version number
	var manifest = chrome.runtime.getManifest();
	$(".version-number").text(manifest.version);

	var listener = document.getElementById('listener');

	listener.addEventListener('load', moduleDidLoad, true);
	listener.addEventListener('message', handleMessage, true);

	store_log("INFO", "Checking managed options");
	checkManagedOptions();

}

/*
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });

  */

function checkManagedOptions() {
	store_log("INFO", "checkManagedOptions");
	chrome.storage.managed.get('DefaultInstitutionId', function (data) {   
		var option = data.DefaultInstitutionId;
		console.log("--------------------------------------------------------> RECEIVED THE OPTION " + data.DefaultInstitutionId);
		console.log(data);

		store_log("INFO", "Received option: "  + data.DefaultInstitutionId);

		GLOBAL_preselectedId = option; 


		$('errorspan').text("[" + option + "]");

	});

}


function getStarted() {

	store_log("INFO", "getStarted()");
	

	$("#cancellink").hide();
	$("#reportlink").hide();

	var manifest = chrome.runtime.getManifest();
	store_log("INFO", "Current version " + manifest.version);

	$("#entrytext").show();
	$("#institutionSearch").show();
	$("#main_header_text").show();
	$("#saveButton").show();
	$('[data-toggle="popover"]').popover({trigger: "manual", placement: "top"}); 

	$("#overlay-select-dest").hide();

	$("#entrytext").show();
	$("#institutionSearch").show();
	$("#main_header_text").show();
	$("#saveButton").show();

    // enable popovers
	$('[data-toggle="popover"]').popover({trigger: "manual", placement: "top"}); 
		
	


}

function localize() {
	$('.i8').each(function(index, element) {
		var intext = $(this).data("string");		
		element.innerHTML = chrome.i18n.getMessage(intext);
	});

	var lang = chrome.i18n.getUILanguage();
	console.log(lang);
}

function networkTest(retrycount) {
	GLOBAL_lock_start = true;
	  			getUserPrefs();
	}

function networkTest_disable(retrycount) {
	store_log("INFO", "Starting network test");
	var timeout = 20000;

	if (retrycount > 0) {
		$("#messagetext").text("Network test...attempt " + retrycount + " of 40");
	}

	var xhr = new XMLHttpRequest();
 	var sessionbase = 'https://smc-service-cloud.respondus2.com/test.shtml';

 	xhr.open("POST", sessionbase, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	//var timer = setTimeout( function() {nonetworkError();}, timeout);

	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
	  	if (xhr.status == 200) {
	  		// success
	  		$("#errortext").hide();
	  		//clearTimeout(timer);

	  		if (! GLOBAL_lock_start) {
	  			GLOBAL_lock_start = true;
	  			getUserPrefs();
	  			store_log("INFO", "Network test successful");
	  		}
	  		
	  		

		  } else {
		  	store_log("INFO", "Network test failed - waiting to retry attempt#" + retrycount);
		  	checkForRetry(retrycount, xhr.status, xhr.responseText);
		  	
		  }
		} else {
			// state is changing reset timer
			//clearTimeout(timer);
			//timer = setTimeout( function() {nonetworkError();}, timeout);
			
		}
	}
	
	xhr.send();

}

function checkForRetry(count, status, responseText) {

	store_log("INFO", "checkForRetry: count " + count);
	console.log(count);
	if (count > 40) {
		nonetworkError();
		//$("#errortext").show();
		//$("#errorinfo").text('Status ' + status + ': init failed: ' + responseText);
	} else {
		sleep(500).then(() => {
			count++;
			networkTest(count);
		});
		
	}

}

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function nonetworkError() {

	store_log("ERROR", "No access to internet");
	console.log("TIMER EXPIRED NO NETWORK");

	$("#errortext").show();
	$("#errorinfo").text('Cannot detect any access to Respondus servers. ');
	$("#messagetext").text("Network test...failed - no access to Respondus servers");
}


function moduleDidLoad() {

	$("#messagetext").text("Module loaded...");

	LdbAssist = document.getElementById('ldb_assist');

	networkTest(0);	
	
}

function handleMessage(message_event) {

	$("#messagetext").text("Handling message...");
	store_log("INFO", "Handling message..." + message_event.data);


	console.log("Handling message: " + message_event.data);

  	var inmessage = message_event.data;  	

  	var m1 = inmessage.indexOf("sessionKey::");
  	var m2 = inmessage.indexOf("setup::");
  	var m3 = inmessage.indexOf("urlget::");

  	if (m1 != -1) {
  		$("#messagetext").text("Handling message...sessionkey");
  		getSessionKey(inmessage.substr(m1+12));
  	} else if (m2 != -1) {
  		$("#messagetext").text("Handling message...institution");
  		var param = inmessage.substr(m2+7); 

  		console.log("getInstitutionList: " + param); 		
  		
  		getInstitutionList(param);
  	} else if (m3 != -1) {
  		$("#messagetext").text("Handling message...urlstorage");
  		var param = inmessage.substr(m2+9);

  		 
  		getURLStorage(param);
  	}


}

function checkMonitorLicense() {

	store_log("INFO", "checkMonitorLicense: ");

	$("#messagetext").text("Getting session key...");

	var insid = "1c06beb4149049fc99711cb8d1d2f68e";
	var ins = "988241484";
	var server = "Instructure Canvas";
	var s1 = "1CJYK0HalhhEebT0";
	var d = new Date();
	var t = d.getTime();

	var ky = ins + server + t + s1;

	console.log('Session key ' + m_sessionKey);

	var mdky = hex_md5(ky);

	parameters = "institutionId=" + ins + "&serverName=" + server + "&time=" + t + "&mac=_" + mdky;

	console.log("calling check_monitor_license5 with " + parameters);

 	var xhr = new XMLHttpRequest();
 	var sessionbase = 'https://smc-service-cloud.respondus2.com/MONServer/chromebook/check_monitor_license5.do';

 	var callhttp = sessionbase;

	xhr.open("POST", callhttp, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
	  	if (xhr.status == 200) {

	  		console.log(xhr.responseText);
	  		// licensing mode - TIERED_FREE
	  		// profile id - d376f4219b4640749903a5e93f3e9dd7
	  		// profile uri - null
	  		// isMonitorOnly
	  		// isEnableHelpCenter
	  		// disableEarlyExitData
	  		// forceDashboardAutAutoLaunch

	  		// check license and deny access if not licensed
	  		beginStartupSequence();


		    
		    	
		    } else {
		    	console.log("ERROR " + xhr.status + "," + xhr.responseText);
		    }

		  } 
		}
	
	xhr.send(parameters);
}

function beginStartupSequence(parameters) {

	store_log("INFO", "beginStartupSequence: parameters " + parameters);

	$("#messagetext").text("Starting startup sequence...");

	
	var token = "d376f4219b4640749903a5e93f3e9dd7"; // profile id
	var courseid = "1558671";
	var examId = "4214779"; //quizzes/xxxxxxx
	var userName = "student@respondus.com";
	var loginId = "student@respondus.com";
	var firstn = "Anthony";
	var lastn = "Ortega";
	var version = "1.0";


	var s1 = "1CJYK0HalhhEebT0";
	var d = new Date();
	var t = d.getTime();

	var ky = token + courseid + userName + firstn + lastn + examId + version + t + s1;

	console.log('Session key ' + m_sessionKey);

	var mdky = hex_md5(ky);

	parameters = "token=" + token + "&courseRefId=" + courseid + "&examId=" + examId + "&userName=" + userName + "&firstName=" + firstn + "&lastName=" + lastn + "&loginId=" + loginId + "&version=" + version + "&time=" + t + "&mac=_" + mdky;

 	var sessionbase = 'https://smc-service-cloud.respondus2.com/MONServer/chromebook/startup_sequence.do';

 	var fullurl = sessionbase + "?" + parameters;

 	chrome.windows.create({url:fullurl}, function() {
 		console.log("Windows created");
 	});

 	window.location = sessionbase + "?" + parameters;
}

function beginStartupSequence2(parameters) {

	store_log("INFO", "beginStartupSequence: parameters " + parameters);

	$("#messagetext").text("Starting startup sequence...");

	
	var token = "d376f4219b4640749903a5e93f3e9dd7"; // profile id
	var courseid = "1558671";
	var examId = "4214779"; //quizzes/xxxxxxx
	var userName = "student@respondus.com";
	var loginId = "student@respondus.com";
	var firstn = "Anthony";
	var lastn = "Ortega";
	var version = "1.0";


	var s1 = "1CJYK0HalhhEebT0";
	var d = new Date();
	var t = d.getTime();

	var ky = token + courseid + userName + firstn + lastn + examId + version + t + s1;

	console.log('Session key ' + m_sessionKey);

	var mdky = hex_md5(ky);

	parameters = "token=" + token + "&courseRefId=" + courseid + "&examId=" + examId + "&userName=" + userName + "&firstName=" + firstn + "&lastName=" + lastn + "&loginId=" + loginId + "&version=" + version + "&time=" + t + "&mac=_" + mdky;

	console.log("calling startup_sequence.do with " + parameters);

 	var xhr = new XMLHttpRequest();
 	var sessionbase = 'https://smc-service-cloud.respondus2.com/MONServer/chromebook/startup_sequence.do';

 	var callhttp = sessionbase;

	xhr.open("POST", callhttp, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
	  	if (xhr.status == 200) {

	  		console.log("Response from startup_sequence: -------------------------------------------> ");
	  		console.log(xhr.responseText);
	  		console.log("Response from startup_sequence: -------------------------------------------> ");
	  		$("body").html(xhr.responseText);
	  		
		    
		    	
		    } else {
		    	console.log("ERROR " + xhr.status + "," + xhr.responseText);
		    }

		  } 
		}
	
	xhr.send(parameters);
}

function getSessionKey(parameters) {

	store_log("INFO", "getSessionKey: parameters " + parameters);

	$("#messagetext").text("Getting session key...");
	

 	var xhr = new XMLHttpRequest();
 	var sessionbase = 'https://smc-service-cloud.respondus2.com/MONServer/chromebook/init.do';

 	var callhttp = sessionbase;

	xhr.open("POST", callhttp, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
	  	if (xhr.status == 200) {

		    m_sessionKey = xhr.responseText;

		    $("#messagetext").text("Got session key...");
		    store_log("INFO", "Got session key: bypass is " + m_bypass_mode);
		    


		    LdbAssist.postMessage('setup::' + m_instanceID + "::" + xhr.responseText);

		    console.log("BYPASS" + m_bypass_mode);

		    if (m_bypass_mode) {


		    	store_log("INFO", "IN bypass...with profile " + GLOBAL_profileid);
		    	//m_bypass_mode = false;
		    	var messagekey = "urlget::" + m_instanceID + "::" + m_sessionKey + "::" + GLOBAL_profileid;
		    	
		    	LdbAssist.postMessage(messagekey);
		    	console.log("Sending urlget message");

		    	//moveForward(GLOBAL_lmstype);
		    	
		    } else {

			    	$("#entrytext").show();
			    	$("#institutionSearch").show();
			    	$("#institutionSearch").focus();
			     
		    }

		  } else {
		  	
		  	$("#errorinfo").text("Network is unreachable: " + xhr.status);
		  	
		  	$("#errortext").show();
		  	
		  }
		} else {
			$("#messagetext").text("Session key state: " + xhr.readyState);
		}
	}
	
	xhr.send(parameters);
}



function getURLStorage(parameters) {

	store_log("INFO", "getURLStorage:parameters: " + parameters);

	console.log("getURLStorage " + parameters);

	GLOBAL_report_key = parameters;

	if (m_bypass_mode == true) {
		store_log('INFO', 'bypassing to getBlocking: ' + parameters);
		getBlocking(parameters);
		m_bypass_mode = false;
		
	} else {


	 	var xhr = new XMLHttpRequest();
	 	var sessionbase = 'https://smc-service-cloud.respondus2.com/MONServer/chromebook/profile.do';

	 	var callhttp = sessionbase;

		xhr.open("POST", callhttp, true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {

		  	console.log("profile.do readystate 4 " + xhr.status);

		  	if (xhr.status == 200) {

		  		console.log("profile.do status 200");

		  		// clear messaging
		  		$("#messagetext").text("");

		    	var urllist = JSON.parse(xhr.responseText);

		    	console.log("URLLIST");
		    	console.log(urllist);

		    	store_log("INFO", "profile.do: urllist" + urllist);


		    	// store the results
		    	chrome.storage.local.set({'urllist': urllist}, function() {		          
		          GLOBAL_lmstype = urllist.lmsType;
		          getBlocking(parameters);		          
		          
		        });

				} else {
					// do not show this error - clear and make them start again
				  	//$("#errortext").show();
				  	//$("#errorinfo").text('Status ' + xhr.status + ': getURLStorage failed: ' + xhr.responseText);

				  	store_log('ERROR', 'getURLStorage profile.do failed: ' + parameters);


				  	// clear the local storage to prevent confusion but do not touch the logs					  	
				  	resetprofile();	
				  	
				}


		  }
		}
		xhr.send(parameters);
	}
}

function resetprofile() {

	store_log("INFO", "resetprofile");
	
	chrome.storage.local.remove(["profileid","institutioninfo", "urllist", "blocking"],function(){
	 var error = chrome.runtime.lastError;
	    if (error) {
	        console.error(error);
	    } else {
	    	console.log("rest calling get user token");
	    	getUserToken();
	    	resetSplash();
	    	$("#messagetext").text("Profile was invalid - please select another");    
	    	store_log("INFO", "Profile was invalid - please select another");
	    }
	});
}

function sendLogMessage(name, email, message, hct) {
	console.log("sendLogMessage");

	// prepare system info
	var today = new Date();
	var str = today.toGMTString(); 
	var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	var navstr = navigator.userAgent;
	var manifest = chrome.runtime.getManifest();
	var version = manifest.version;
	var pako = window.pako;
	var bodytext = "computer.and.device$&$&$COMPUTER AND DEVICE$&$&$computer.and.device.date$&$&$Computer date and time$&$&$" + str +
				   "\ncomputer.and.device$&$&$COMPUTER AND DEVICE$&$&$computer.and.device.timezone$&$&$Computer timezone$&$&$" + zone +
					"\ncomputer.and.device$&$&$COMPUTER AND DEVICE$&$&$computer.and.device.model$&$&$Computer Model$&$&$Chromebook" +
					"\nos.and.software$&$&$OS & SOFTWARE$&$&$os.and.software.user.agent$&$&$User Agent$&$&$" + navstr +
					"\nos.and.software$&$&$OS & SOFTWARE$&$&$os.and.software.ldb.version$&$&$LDB version$&$&$" + version;
    //var resultAsBinString  = btoa(pako.gzip(bodytext));
    var resultAsBinString  = btoa(bodytext);
    
    console.log("metrics = " + resultAsBinString);
	

	var parameters = GLOBAL_report_key + "&m=" + message + "&h=" + hct + "&n=" + name + "&e=" + email + "&metrics=" + resultAsBinString;

	console.log(parameters);

	var xhr = new XMLHttpRequest();
 	var sessionbase = 'https://smc-service-cloud.respondus2.com/MONServer/chromebook/help_center_email.do';

 	var callhttp = sessionbase;

	xhr.open("POST", callhttp, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {

	  	if (xhr.status == 200) {

		  		// clear messaging
		  		$("#messagetext").text("");

		    	
		    	console.log(xhr.responseText);		        		        

			} else {
			  	$("#errortext").show();
			  	$("#errorinfo").text('Status ' + xhr.status + ': sendLogMessage failed: ' + xhr.responseText);
			}


	  }
	}
	xhr.send(parameters);
}


function stringToByteArray(str) {
    var array = new (window.Uint8Array !== void 0 ? Uint8Array : Array)(str.length);
    var i;
    var il;

    for (i = 0, il = str.length; i < il; ++i) {
        array[i] = str.charCodeAt(i) & 0xff;
    }

    return array;
}

function stringToAsciiByteArray(str)
{
    var bytes = [];
   for (var i = 0; i < str.length; ++i)
   {
       var charCode = str.charCodeAt(i);
      if (charCode > 0xFF)  // char > 1 byte since charCodeAt returns the UTF-16 value
      {
          throw new Error('Character ' + String.fromCharCode(charCode) + ' can\'t be represented by a US-ASCII byte.');
      }
       bytes.push(charCode);
   }
    return bytes;
}

function saveLogIssue(blocking, description, name, email, profile, institution) {

	console.log("saveLogIssue");

 	var xhr = new XMLHttpRequest();
 	var sessionbase = 'https://smc-service-cloud.respondus2.com/MONServer/chromebook/help_center.do';

 	var callhttp = sessionbase;

	xhr.open("POST", callhttp, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {

	  	if (xhr.status == 200) {

	  		var logtoken = xhr.responseText;

	  		console.log("LOGTOKEN " + logtoken);
	  		

	  		saveLogIssueContent(blocking, description, name, email, profile, institution, logtoken);	  		
	          	        

		} else {
		  	$("#errortext").show();
		  	$("#errorinfo").text('Status ' + xhr.status + ': saveLogIssue failed: ' + xhr.responseText);
		}


	  }
	}
	xhr.send(GLOBAL_report_key);
	
}


function saveLogIssueContent(blocking, description, name, email, profile, institution, logtoken) {

	console.log("saveLogIssueContent");
	console.log(blocking);


	// configure for AWS
	var config = new AWS.Config({
		accessKeyId: blocking.aws_key, secretAccessKey: blocking.aws_secret, region:'us-east-1'
	});
	AWS.config = config;
	var bucketName = "help-center-respondus-com/" + institution + "/" + logtoken;
	var s3 = new AWS.S3({
	        params: {
	            Bucket: bucketName
	        }
	    });

	// capture form information
	var bodyTextBase = name + "||" + email + "||" + description + "||" + profile + "||" + institution + "\r\n";

    chrome.storage.local.get('systemlog', function (obj) {  


    	if (typeof obj.systemlog != "undefined") {

    		var i;

    		var logsession = obj.systemlog.log_sessions;
    		console.log("logsession = " + logsession);
    		var logtimes = obj.systemlog.log_times;
    		var logcontent  = obj.systemlog.log_content;
    		var logloop = obj.systemlog.log_loop;

    		var valid_session = true;
    		var max_session = 5;
    		
    		var i = 1;
    		if (logloop) {
    			i = logsession + 1;
    			if (i > max_session) {
    				i = 1;
    				logloop = false; // same as normal
    			}
    		}

    		while(valid_session) {

    			console.log('Looping at ' + i + " logloop: " + logloop);
    			
    			var objKey = 'ldb-hc-log-session-' + logtimes[i] + ".dat";
    			console.log(bucketName + "/" + objKey);

    			var bodyText = logcontent[i];
    			console.log("BODYTEXT *** [" + bodyText + "] ****");

    			// gzip the text    		
    			var pako = window.pako;
    			var resultAsBinString  = pako.gzip(bodyText);

    			// Blowfish is at a different version than the rest of the Company
	  			// do not use it to store.
	  			var output = resultAsBinString;

	  			// use the metadata to indicate there is no blowfish encryption
		  		// elevel = 0	    		
	    		var params = {
			        Key: objKey,
			        ContentType: "binary/octet-stream",
			        CacheControl: "no-cache",
			        Metadata: {
					   "elevel": "0"
					},	 		        
			        ServerSideEncryption: "AES256",     		                
			        Body: output   
	    		};

	    		var req = s3.putObject(params);
	    		//req.httpRequest.headers['X-Amz-Server-Side-Encryption'] = 'AES256';
	    		console.log("Sending " + objKey);
	    		req.send(function (err, data) { console.log(err); console.log(data);  });

	    		i++;	    		
	    		if (logloop) {
	    			if (i > max_session) {	    				
	    				i = 1;
	    				logloop = false;
	    			} 
	    		} 
	    		if (logloop == false && i > logsession) {
		    		valid_session = false;
		    	}

	    		


    		}

    	}

    	
    });

    sendLogMessage(name, email, description, logtoken);

    

    

	 	
}

function getBlocking(parameters) {

	store_log("INFO", "getBlocking: parameters: " + parameters);


 	var xhr = new XMLHttpRequest();
 	var sessionbase = 'https://smc-service-cloud.respondus2.com/MONServer/chromebook/profile_options.do';

 	var callhttp = sessionbase;

	xhr.open("POST", callhttp, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {

	  	if (xhr.status == 200) {

	  		// clear messaging
	  		$("#messagetext").text("");

	    	var blocking = JSON.parse(xhr.responseText);
	    	console.log("BLOCKING..........");
	    	console.log(blocking);

	    	// store the results
	    	chrome.storage.local.set({'blocking': blocking}, function() {
	          // Notify that we saved.	          
	          moveForward(GLOBAL_lmstype);

	        });

			} else {
				store_log("ERROR", "profile_options.do FAILED: " + parameters);
			  	$("#errortext").show();
			  	$("#errorinfo").text('Status ' + xhr.status + ': getBlocking failed: ' + xhr.responseText);
			}


	  }
	}
	xhr.send(parameters);
}






function getUserPrefs() {

	store_log("INFO", "getUserPrefs()");

	$("#messagetext").text("Getting user prefs...");
	console.log("get user prefs");

	m_bypass_mode = false;

	chrome.storage.local.get('urllist', function (obj) {

		console.log("urllist..");
		console.log(obj);
                

        if (obj != null && obj.urllist != null && obj.urllist.startUrl != null ) {        

	        	console.log("bypass mode true...");
	        	console.log(obj.urllist);

	        	store_log("INFO", "Got URLLIST");
	        	

	        	chrome.storage.local.get('profileid', function (profileobj) {

	        		console.log("Got profile....");
	        		store_log("INFO", "Got profile - " + profileobj.profileid );
	        		GLOBAL_profileid = profileobj.profileid;

	        		
	        		chrome.storage.local.get('institutioninfo', function (instituiontobj) {
	        			console.log("Got institution...preselected:" + GLOBAL_preselectedId);

	        			if (GLOBAL_preselectedId) {
	        				$("#locktext").text("Lock to " + GLOBAL_preselectedId);
	        				store_log("INFO", "Locking to " + GLOBAL_preselectedId);
	        			}
	        			
	        			

	        			if (typeof instituiontobj != 'undefined') {

	        				var institutioninfo = instituiontobj.institutioninfo;


	        					
	        				if (!GLOBAL_preselectedId || institutioninfo.institutionid == GLOBAL_preselectedId) {
		        				
		        				m_bypass_mode = true;

		        				GLOBAL_profileid = profileobj.profileid;
		        				GLOBAL_lmstype = obj.urllist.lmsType;
			        			
			        			GLOBAL_institution = institutioninfo.institutionid;
			
			        			setSplash(institutioninfo.institutionid, institutioninfo.name, institutioninfo.profile, profileobj.profileid, institutioninfo.profilelist);
			        			getUserToken();

		        			} else {
									m_bypass_mode = false;
									getUserToken();
		        			}
		        			

	        			}
	        			

	        		});
	        		
	        			
	        	});
	        	
	        	
	        } else {
	        	getUserToken();
	        } 


    });
   
}

function clearUserPrefs() {
	//chrome.storage.local.clear();
}

function moveForward(lmstype) {

	store_log("INFO", "moveForward " + lmstype);
	timer = setTimeout( function() {moveForwardNow(lmstype);}, 1500);
}

function moveForwardNow(lmstype) {
	console.log("moveformward " + lmstype);
	var dest = "";

	store_log("INFO", "movForwardNow " + lmstype);

	if (lmstype == 'BLACKBOARD') {
		dest = "blackboard.html";
	} else if (lmstype == 'SCHOOLOGY') {
		dest = "schoology.html";
	} else if (lmstype == 'CANVAS') {
		dest = "canvas.html";
	} 


	

	dest = dest + "?session_id=" + m_sessionKey;

	GLOBAL_dest = dest;

	console.log("moving forwardNOW..." + dest);

	var h = $(window).height();
	var w = $(window).width();

	//chrome.app.window.create(dest, {bounds: {'width': w,'height': h}}, 
	chrome.app.window.create(dest, {state: "fullscreen"},
	function(created_window) {
		// show these for when the user returns
		
			$("#entrytext").show();
			$("#institutionSearch").show();
		    $("#institutionSearch").focus();
		    $("#cancellink").show();
		    $("#reportlink").show();
		
	});

	resetSplash();
}

function moveForwardOnCancel() {

	chrome.app.window.create(GLOBAL_dest, {state: "fullscreen"},
	function(created_window) {
		// show these for when the user returns
		$("#entrytext").show();
		$("#institutionSearch").show();
	    $("#institutionSearch").focus();
	    $("#cancellink").show();
	    $("#reportlink").show();
	    	    
	});

}

function setSplash(institutionid, institutionname, profilename, profileid, profilelist) {
	store_log("INFO", "setSplash: " + institutionid + "," + institutionname + "," + profilename + "," + profileid);
	setTimeout(function() { setSplashActual(institutionid, institutionname, profilename, profileid, profilelist); }, 6000);	
}

function setSplashActual (institutionid, institutionname, profilename, profileid, profilelist) {
	
	$("#institutionSearch").val(institutionname);

	$("#institutionList option").remove();
	$("#institutionList").prop('size', 1);
	$("#institutionList").append($('<option></option>').val(institutionid).html(institutionname));

	$("#institutionList").show();

	console.log(institutionid);
	console.log(institutionname);
	console.log(profilename);
	console.log(profileid);
	console.log(profilelist);

	if (profileid && profilelist) {

		console.log("Loading profile list");

		$("#profileList option").remove();

		console.log("Removed options");

		var sel = document.getElementById('profileList');
		console.log(sel);

		console.log("Adding select a server option");

		var opt1 = document.createElement('option');
	    	opt1.innerHTML = "Select a server";
	    	opt1.value = "none";
	    	sel.appendChild(opt1);

	    

		for (var i=0; i<profilelist.length; i++) {
			var opt = document.createElement('option');
	    	opt.innerHTML = profilelist[i].name;
	    	opt.value = profilelist[i].id;
	    	sel.appendChild(opt);
		}

		
		
		//$("#profileList").prop('size', 1);
		//$("#profileList").append($('<option></option>').val(profileid).html(profilename));
		$("#profileList").val(profileid);

		
		if (profilelist.length > 1) {
			$("#profileList").show();
		}
		
		
	}
	$('#saveButton').show();
}

function resetSplash() {

	store_log("INFO", "resetSplash()");

	// ticket 3399 do not clear choices
	//$('#institutionList').find('option').remove();
	//$('#institutionList').hide();
	//$('#profileList').find('option').remove();
	//$('#profileList').hide();
	//$('#saveButton').hide();
	//$("#institutionSearch").val('');
	$("#institutionSearch").val($('#institutionList option:selected').text());
	$("#institutionList option:not(:selected)").remove();
	$("#institutionList").prop('size', 1);

	$("#institutionList").prop('disabled', false);
	$("#profileList").prop('disabled', false);
	$("#institutionSearch").prop('disabled', false);
}


function searchForId(idKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === idKey) {
            return myArray[i];
        }
    }
}

function getInstitutionList(parameters) {
	store_log("INFO", "getInstitutionList() " + parameters);

	checkMonitorLicense(parameters);

	var xhr = new XMLHttpRequest();
 	var sessionbase = 'https://smc-service-cloud.respondus2.com/MONServer/chromebook/setup.do';

 	var callhttp = sessionbase; 	

 	$("#messagetext").text("Getting institution list...");

	xhr.open("POST", callhttp, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {

	  	if (xhr.status == 200) {

	  		$("#messagetext").text("Got institution list...");
	  		
	    		    
		    var resp = JSON.parse(xhr.responseText);
		    var institutionList = resp.institutions;

		    console.log("Got institution list..." + institutionList.length + " institutions found.");
		    console.log(institutionList);

		    console.log(institutionList.length);
		    store_log("INFO", "Institutions retrieved: " + institutionList.length + " institutions found.");

		    console.log("CHecking GLOBAL_preselectedId" + GLOBAL_preselectedId);
		    if (GLOBAL_preselectedId) {

		    	console.log("it has a value");
		    	// remove all other institutions from the list
		    	var foundelement = searchForId(GLOBAL_preselectedId, institutionList);
		    	if (foundelement) {
		    		institutionList = [foundelement];
		    		$("#institutionSearch").val(foundelement.name);		

		    		// need a slight delay to trigger keyup
		    		 setTimeout( function() {$("#institutionSearch").keyup();}, 10);

		    	}
		    } else {
		    	console.log("no value");
		    }
		    
		    		    
		    var timer = null;		    
			var banned = ["university", "college", "school"]; // banned words

		    $("#institutionSearch").keyup(function(){

		    	$('#institutionSearch').removeClass("noresult");
		    	$('#institutionSearch').popover("hide");

			    if (timer != null) {
			    	clearTimeout(timer);			    	
			    } 

			    // hide the dropdowns
			    $('#institutionList').hide();
			    $('#profileList').hide();
			    $('#saveButton').hide();


			    // only set if >3 and not restricted			    
			    var t = $("#institutionSearch").val().toLowerCase().trim();
			    var len = t.length;

			    if (len > 2) {

			    	let bannedParts = ["university", "universit", "universi", "univers", "univer", "unive", "univ", "uni",
			    					   "niversity", "iversity", "versity", "ersity", "rsity", "sity", "ity",
			    					   "college", "colleg", "colle","coll","col", "ollege", "llege", "lege", "ege",
			    					    "school", "schoo" , "scho", "sch", "chool", "hool", 'ool'
			    					     ];

			    	
			    	if (bannedParts.includes(t)) {
			    		console.log("Banned");
			    	} else {
			    		timer = setTimeout( function() {performSearch(institutionList, t);}, 500);
			    	}			 

			    	
			    }

			    

			    


			});

			$("#institutionList").change(function(){

				// hide the save and profile list				
				$('#saveButton').hide();
				$('#profileList').hide();

			    // load the profiles
			    var selectid = $("#institutionList").val();			

			    console.log("SELECTID = " + selectid);    

			    if (selectid != 'none') {

				    var pattern = new RegExp(selectid, 'i');
				    $.each(institutionList, function(i, v) {
				    	if (v.id.search(pattern) != -1) {

				    		var profileList = v.profiles;

				    		GLOBAL_currentProfileList = profileList;

				    		console.log("PROFILES " + profileList);

				    		// only show if there is more than one				    					    			
			    			var sel = document.getElementById('profileList');
			    			$('#profileList').find('option').remove();


			    			var opt1 = document.createElement('option');
						    	opt1.innerHTML = "Select a server";
						    	opt1.value = "none";
						    	sel.appendChild(opt1);

			    			for (var i=0; i<profileList.length; i++) {
				    			var opt = document.createElement('option');
						    	opt.innerHTML = profileList[i].name;
						    	opt.value = profileList[i].id;
						    	sel.appendChild(opt);
					    	}

					    	if (profileList.length > 1) {
					    		$('#profileList').show();
						    	} else {
						    		// select the one profile
						    		$('#profileList option:nth-child(2)').attr('selected', 'selected');
						    		$('#saveButton').show();
						    	}
				    		
				    	}
				    });
				}
			});

			$("#profileList").change(function(){
		    	$('#saveButton').show();
		        });


		    $("#saveButton").unbind('click').bind('click', function (e) {

		    	store_log("INFO", "Save button");
		    	
		    	e.stopPropagation();	
		    	e.preventDefault();
		    
		    	
		    	    	
		    	$("#institutionList").prop('disabled', true);
		    	$("#profileList").prop('disabled', true);
		    	$("#institutionSearch").prop('disabled', true);

		    	var institutionid = $("#institutionList").val();
		    	var institutiontext = $("#institutionList option:selected").text();
		    	var profiletext = $("#profileList option:selected").text();
		    	var selectid = $("#profileList").val();
		    	var messagekey = "urlget::" + m_instanceID + "::" + m_sessionKey + "::" + selectid;
		    	m_bypass_mode = false;


		    	// clear the local storage to prevent confusion but do not touch the logs		    	
		    	chrome.storage.local.remove(["profileid","institutioninfo", "urllist", "blocking"],function(){
				 var error = chrome.runtime.lastError;
				    if (error) {
				        console.error(error);
				    }
				});

		    	// store the results
		    	chrome.storage.local.set({'profileid': selectid}, function() {

		    		console.log("PROFILEsavebutton: " + selectid);
		    		store_log("INFO", "SaveButton - saved profile: " + selectid);

		    		var institutioninfo = {institutionid:institutionid, name:institutiontext, profile:profiletext, profilelist: GLOBAL_currentProfileList};

		    		store_log("INFO", "institutionid:" + institutionid + ", name:" + institutiontext + ", profile:" + profiletext);
		    		console.log("institutionid:" + institutionid + ", name:" + institutiontext + ", profile:" + profiletext);

		    		// update the globals
		    		GLOBAL_profileid = selectid;
		    		GLOBAL_institution = institutionid;

		    		chrome.storage.local.set({'institutioninfo': institutioninfo}, function() {

		    			if(chrome.runtime.lastError) { 
		    				console.log("Failed to set institution info");
		    				store_log("ERROR", "Failed to set the institution profile");
		    				$("#messagetext").text("Failed to set institution profile");

		    				chrome.storage.local.getBytesInUse(null, function (bytesInUse) {
		    					store_log("ERROR", "Current bytes in use " + bytesInUse);
		    				});

		    				

		    			} else {
		    				// Notify that we saved.
		          			LdbAssist.postMessage(messagekey);

		    			}

		    			
		    		});
		          
		        });

		    });

		    $("#report-issue-form").validate({
		    	rules: {
		    		reportIssueInput: {
			    		required: true
			    	},
		    		reportDetailsCheck: {
			    		required: true
			    	},
			    	userEmail: {
		            	required: false,
		            	email: true
		            },
	            	userEmailConfirm: {
		            	required: false,
		            	email: true,
		            	equalTo: "#report-email-input"
		            }	    		
		    	},
		    	messages: {
		    		reportIssueInput: chrome.i18n.getMessage("issue_details"),
		    		reportDetailsCheck: chrome.i18n.getMessage("agree_communicate"),
		    		userEmail: {
		    			email: chrome.i18n.getMessage("valid_email")
		    			},
		    		userEmailConfirm: {
		    			email: chrome.i18n.getMessage("valid_email"),
		    			equalTo: chrome.i18n.getMessage("same_value")
		    			}
		    	},		    	
		    	errorPlacement: function (error, element) {
				    if (element.attr("type") == "checkbox") {
				       error.insertAfter("#report-details-agree");
				    } else {
				        error.insertAfter($(element));
				    }
				}
		    });


		    $("#sendButton").click(function(){	

		    	store_log("INFO", "Sending log files...Report an Issue");

		    	if ($("#report-issue-form").valid()) {
		    		console.log("form valid");

		    		$("#report-issue-div").hide();
					$("#icon-div").show();
					$("#selection-div").show();

					var issue = $("#report-issue-input").val();
					var name = $("#report-name-input").val();
					var email = $("#report-email-input").val();
					var agree = $("#report-details-check:checked");

					console.log("name" + name);
					console.log("email" + email);

					chrome.storage.local.get('blocking', function (obj) {

						console.log(obj.blocking);
				                

				        if (obj != null && obj.blocking != null ) {
				        	
				        	console.log(obj.blocking);
				        	saveLogIssue(obj.blocking, issue, name, email, GLOBAL_profileid, GLOBAL_institution);

				        } 

			    	});

					resetReportIssue();
		    	}

		    	

				
		    });	 


			$("#cancelreportlink").click(function(){	
		    	$("#report-issue-div").hide();
				$("#icon-div").show();
				$("#selection-div").show();

				resetReportIssue();
		    });	 

		    $("#okButton,#canceltermslink").click(function(){	
		    	$("#report-issue-div").show();
				$("#terms-use-div").hide();
		    });

		    $("#cancellink").click(function(){	
		    	moveForwardOnCancel();
		    });	 

		    $("#reportlink").click(function(){	
		    	displayReportScreen();
		    });	
		    
		    $("#report-more-details-link").click(function(){	

		    	$("#report-issue-div").hide();
				$("#icon-div").hide();
				$("#selection-div").hide();
				$("#terms-use-div").show();
		    });	
		    		  

		    // success remove text
		    $("#messagetext").text("");

		} else {
			console.log("ERR:institutionList incorrect readyState: " + xhr.readyState);
		}
	  } else {
	  	    console.log("ERR:institutionList incorrect status: " + xhr.status);
	  }
	}
	xhr.send(parameters);
}



function resetReportIssue() {
	
	$("#report-issue-input").val('');
	$("#report-name").val('');
	$("#report-email").val('');
	$("#report-reemail").val('');
	$("#report-reemail").val('');
	$("#report-details-check").prop('checked', false);
	GLOBAL_urllist = null;
	
}


function displayReportScreen() {
	

	chrome.storage.local.get('blocking', function (obj) {

        if (obj != null && obj.blocking != null ) {

        	if (obj.blocking.enable_help_center) {
        		$("#icon-div").hide();
				$("#selection-div").hide();
				$("#report-issue-div").show();
        	}
        	
        	
        } 

        
    });
}



function performSearch(institutionList, searchPiece) {

	var match = 0;

	if (searchPiece.trim() != '') {

		$('#institutionList').find('option').remove();

		var sel = document.getElementById('institutionList');
		var pattern = new RegExp(searchPiece, 'i');

		//var opt1 = document.createElement('option');
	    //	opt1.innerHTML = "Select a institution...";
	   // 	opt1.value = "none";
	   // 	sel.appendChild(opt1);

		$.each(institutionList, function(i, v) {					

	        if (v.name.search(pattern) != -1) {


	        	var sel = document.getElementById('institutionList');
		    	var opt = document.createElement('option');
		    	opt.innerHTML = v.name;
		    	opt.value = v.id;
		    	sel.appendChild(opt);

		    	match++;

	            return;
	        }
	    });

	    if (match > 0) {

	    	if (match > 6) {
	    		match = 6;
	    	}

	    	$('#institutionList').show();
	    	$('#institutionList').attr('size',match+1);
	    	$('#institutionList').focus();

	    	if ( match ==1 ) {
	    		// only one possible choice
	    		$('#institutionList').find('option:eq(0)').prop('selected', true).trigger('change');
	    		
	    	}

	    } else {
	    	$('#institutionSearch').addClass("noresult");
	    	$('#institutionSearch').popover("show");
	    }
	    
	}
}




function getUserToken() {

	$("#messagetext").text("Getting user token..."); // new
	//var timeout = setTimeout( function() { defaultidused(); }, 1000*4);

	// if client is having trouble at this point then it is the proxy they have setup

	chrome.instanceID.getID( function (instanceID) {
		if(chrome.runtime.lastError) {
			$("#messagetext").text("Token error..." + chrome.runtime.lastError.message); // new
		} else {

				//clearTimeout(timeout);
				$("#messagetext").text("ID has returned..." + LdbAssist + "," + instanceID); 

				console.log("getting session key");

				if (GLOBAL_defaultused == false) {
					m_instanceID = instanceID;

					LdbAssist.postMessage('sessionKey::' + m_instanceID);

					$("#messagetext").text("Got id...");
				}
		}
		
	});

	

}

function defaultidused () {
	$("#messagetext").text("Using default id...");
	GLOBAL_defaultused = true;
	m_instanceID = 'DEFAULT_1234567890';
	LdbAssist.postMessage('sessionKey::' + m_instanceID);
}



$("#mathxl").click(function() {

	var dest = "http://www.mathxlforschool.com/login_school.htm";
	// save the destination
	

});