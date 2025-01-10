var GLOBAL_log_current_log = 1;
var loglock = true;
var GLOBAL_log_init_complete = true;


async function init_log() {
  GLOBAL_log_init_complete = false;
  log_lock = true;

  console.log("INIT LOG");

  var logsum;
  var logtimes=[];
  var logcontent=[];
  var logloop = false;

  //chrome.storage.local.remove('systemlog', function (obj) {  
  //  console.log('resetting log files');
  //});
  

  chrome.storage.local.get('systemlog', function (obj) {  

    console.log('systemlog is ' + obj.systemlog);
    console.log(obj.systemlog);

    if (typeof obj.systemlog === "undefined") {

      console.log("LOG:NO LOG BUILDING NEW ONE");
      
      GLOBAL_log_current_log = 1;
      logtimes = [];
      logcontent = [];


    } else {
      
      var prevlog = obj.systemlog.log_sessions;
      logtimes = obj.systemlog.log_times;
      logcontent = obj.systemlog.log_content;
      logloop = obj.systemlog.log_loop;

      console.log("LOG:FOUND PREVLOG = " + prevlog);

      // rotate the logs at 5
      if (prevlog == 5) {
        GLOBAL_log_current_log = 1;
        logloop = true;
      } else {
        GLOBAL_log_current_log = prevlog+1;
      }

      console.log("Current log is " + GLOBAL_log_current_log );


    }

    var d = new Date();
    var n = d.getTime();
    logtimes[GLOBAL_log_current_log] = n;

    // add marker for the start of a new log
    logcontent[GLOBAL_log_current_log] = "********************************************** NEW SESSION BEGINING **********************************************" +"\r\n\r\n";

    

    logsum = {"log_sessions": GLOBAL_log_current_log, "log_times": logtimes, "log_content": logcontent, "log_loop": logloop};
    console.log("LOG:LOGSUM1");
    console.log(logsum);

    chrome.storage.local.set({'systemlog': logsum}, function() {
      console.log("LOG:stored log");
      console.log(logsum);

      loglock = false;

      getStarted();

      console.log("LOG:init log complete -------------------------------------------------------------------------------------------------------------------------------");
      GLOBAL_log_init_complete = true;
    });


  });

  // wait for init to complete
  var loop = 0;
  while (loop < 10 && GLOBAL_log_init_complete == false) {
    loop++;
    await new Promise(r => setTimeout(r, 200));
    console.log("loop is " + loop);
  }

}






function reset_log() {
  console.log("LOG:CALLING RESET LOG");
  chrome.storage.local.remove('systemlog', function() {
  });
}


function store_log(log_type, log_message) {

  console.log("store_log" + GLOBAL_log_init_complete);

  if (GLOBAL_log_init_complete) {
    store_log_action(log_type, log_message);
  }
  
  
}

function store_log_action(log_type, log_message) {
  console.log("LOG:Logging " + log_message + " lock " + loglock );

  

  var dbase = new Date();    
  var d = new Date(dbase.valueOf() + dbase.getTimezoneOffset() * 60000);

  var n = d.getFullYear()  + "-" + (d.getMonth()+1) + "-" +              d.getDate() + " " +
  d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()+ ":" + d.getMilliseconds() + " GMT" + " - ";

  // build log line
  var logline = n + log_type + ":" + log_message +"\r\n\r\n";

  chrome.storage.local.get('systemlog', function (obj) {  
    if (typeof obj.systemlog === "undefined") {
        console.log("LOG:log not initialized...")
      } else {
        
        var logcontent = obj.systemlog.log_content;
        var logloop = obj.systemlog.log_loop;
        var session = obj.systemlog.log_sessions;

        console.log('Session# ' + session);

        if (typeof logcontent[GLOBAL_log_current_log] === "undefined") {
            logcontent[session] = logline;
          } else {
            logcontent[session] += logline;
          }
        



        var logsum = {"log_sessions": obj.systemlog.log_sessions, "log_times": obj.systemlog.log_times, "log_content": logcontent, "log_loop": logloop};
        //console.log("LOG:LOGSUM2");
        //console.log(logsum);
        chrome.storage.local.set({'systemlog': logsum}, function() {
          console.log("LOG:stored log for store_log");
          console.log(logsum);
        });

      }


  });




}

function store_log_more(log_type, log_message) {

    //console.log("LOG:Logging " + log_message);

    // get the time in GMT time for the log
    var dbase = new Date();    
    var d = new Date(dbase.valueOf() + dbase.getTimezoneOffset() * 60000);

    var n = d.getFullYear()  + "-" + (d.getMonth()+1) + "-" +              d.getDate() + " " +
    d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()+ ":" + d.getMilliseconds() + " GMT" + " - ";

    // build log line
    var logline = n + log_type + ":" + log_message +"\r\n\r\n";

    // retrieve the current log
    chrome.storage.local.get('systemlog', function (obj) {  
       
       var logentry = {"log_sessions":"", "log_content":"", "log_length":""};
       var loglength = 0;       
       
       
       console.log(obj);

        if (typeof obj.systemlog === "undefined") {

          console.log("LOG:section 1");
          // first entry on this machine
          logentry.log_sessions = 1;
          
          
        } else {
          console.log("LOG:section 2");
          logentry = obj.systemlog;

          logline = logentry.log_content + logline;


          //console.log("LOG:logline: " + logline);
          
          
        }
        loglength = logline.length;
        logentry.log_content = logline;
        logentry.log_length = loglength;
        chrome.storage.local.set({'systemlog': logentry}, function() {
          });
    });

}