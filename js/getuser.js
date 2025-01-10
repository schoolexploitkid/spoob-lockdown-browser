var xhr = new XMLHttpRequest();
var sessionbase  = "/api/v1/users/self/profile";
xhr.open("GET", sessionbase, true);

xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {

    if (xhr.status == 200) {

        var result = xhr.responseText;
        var pos = result.indexOf(";");
        var userinfo = result.substring(pos+1);

        //console.log(result);

        //document.cookie = "ldb_user_cookie=" + userinfo;

        chrome.storage.local.set({'ldb_user_cookie': userinfo}, function(result) {
            console.log(result);
          console.log('getuser2 Value is set to ' + userinfo);
        });

      
        
                    
    } else {
        console.log("ERROR!! " + xhr.status + "," + xhr.responseText);
        chrome.runtime.sendMessage({ action: "errorreport", error: "Failed to get user info-getuser.js: " + xhr.responseText });
    }

  }
}
xhr.withCredentials = true;
xhr.send(null);