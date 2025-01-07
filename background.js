// background.js
// -----------------------------------------------------------------------------

/*
originalSetTimeout = setTimeout;
originalClearTimeout = clearTimeout;
activeTimers = 0;

setTimeout = function(func, delay) {
    console.log("I see what you are doing " + activeTimers);
    activeTimers++;
    return originalSetTimeout(func, delay);
};

clearTimeout = function(timerID) {
    console.log("I see what you are doing " + activeTimers);
    activeTimers--;
    originalClearTimeout(timerID);
};

*/



const myreload = chrome.runtime.reload;
const mytabremove = chrome.tabs.remove;
const mywindowsupdate = chrome.windows.update;
const mytabsupdate = chrome.tabs.update;

const checkForMod = async function() {
    //readFileAndGenerateHash("protectwindow.js", "54f751ce8c5274bf08c7804531a823a69e50957401a64e1b473541bd2f9db3d4");    
}

async function readFileAndGenerateHash(fileName, expectedHash) {    
    return new Promise((resolve, reject) => {
      const url = chrome.runtime.getURL(fileName);
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok.");
          }
          return response.arrayBuffer();
        })
        .then(buffer => {
          // Convert ArrayBuffer to WordArray
          const wordArray = CryptoJS.lib.WordArray.create(buffer);
          
          // Generate SHA-256 hash
          const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);

          console.log(fileName + ":HASH = " + hash);

          if (hash != expectedHash) {
            reject(new Error("Hash does not match file"));
          } else {
            console.log("Hash matches for " + fileName);
            resolve(hash);
          }
  
          
        })
        .catch(error => {
          reject(new Error("Failed to fetch the file: " + error.message));
        });
    });
  }

const checkForLaunch = function () {
    //console.log("checkforlaunch");
    

    chrome.storage.local.get('reflaunch', function(result) {
        //console.log(result);
        
        if (result.reflaunch) {
            const obj = JSON.parse(result.reflaunch);
            //console.log("result exists launching " + obj.processing);
            systemState.reset();
            
            
            setTimeout(function() { checkForLaunchInner(obj.processing, obj.launch, obj.tab, obj.url); }, 500);            
            chrome.storage.local.remove('reflaunch');
        } else {
            systemState.updateAll();
        }

        
    });
    
}

const checkForLaunchInner = function (processing, ref, tab, url) {
    systemState.processing = processing;
    systemState.cookieUrlSet = url;
    systemState.handshakeUrlSet = url;

    if (processing == 'canvas') {
        systemState.canvasExamModeSet = 'QNext';
    }

    if (processing == 'schoology') {
        if (ref.ldbenabled == true) {
            systemState.unsecuredSet = false;
        } else {
            systemState.unsecuredSet = true;
        }
    }

    //console.log("calling extract with " + ref + " and tab: " + tab);
    systemState.examTabSet = tab;
    extractAutoLaunchRemoteInner(ref);
}






chrome.runtime.onStartup.addListener(function() {

    console.log("onStartup");

    GLOBAL_startup_detected = true;        
});









chrome.system.display.onDisplayChanged.addListener(function() {
    maxDisplayCheck();    
});





// import scripts
// -----------------------------------------------------------------------------

try {
  importScripts('js/blowfish.js', 'js/md5.js', 'js/crypto-js.min.js');
} catch (e) {
  console.error(e);
}




// -----------------------------------------------------------------------------
// setup the global variables for state management
// -----------------------------------------------------------------------------


const manifestData = chrome.runtime.getManifest();

const authorName = manifestData.author;
const osversion = "cros"; 

const GLOBAL_MAX_TABS = 6;
const GLOBAL_base_tabs = 1;
const GLOBAL_base_displays = 1;

const version = manifestData.version;
const GLOBAL_os = osversion;
const GLOBAL_server = "https://smc-service-cloud-cbe.respondus2.com"; // CORS needs setting
//const GLOBAL_server = "https://qa-app.respondus2.com";
const GLOBAL_drm = GLOBAL_server + "/MONServer/drmcheck.shtml";
const GLOBAL_screen = "fullscreen";

console.log("OS=" + GLOBAL_os + " alias=" + authorName + " version=" + version + " server=" + GLOBAL_server);

var GLOBAL_tabgroup = null;
var GLOBAL_drmactive = false;
var GLOBAL_openlink_check = false;




/*
chrome.tabs.create({ index: 0, url: "data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=", active: true }, function(tab) {
    setTimeout(function(){ chrome.tabs.reload(tab.tabId); }, 500);              
});
*/
/*
chrome.tabs.create({ index: 0, url: "data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=", active: true }, function(tab) {                
});
*/






// *************************************************************************
const systemState = {
    
        lmsProcessing : "nonestate",
        currentTab: -1,
        examTabId: -1,
        webcamTabId: -1,
        preExamStarted: false,
        examStarted: false,
        attemptStarted: false,
        bbpass: "",
        logId: -1,
        resumeUrl: "",
        resumeUrl2: "",            
        monitorRunning: false,
        restartUrl: "",
        reviewMode: false,
        d2lReviewMode: false,
        d2lExamMode: "",
        schoologyReviewMode: false,
        bbReviewMode: false,
        canvasReviewMode: false,
        canvasExamMode: "",
        deferredHandshake: null,
        examWindow: -1,
        feedbackWaiting: false,
        feedbackOn: false,
        feedbackExit: true,
        reportMode: false,
        earlyExitMode: false,
        earlyExitWindow: -1,
        unsecured: true,
        monitorBypassed: false,
        sequenceSid: null,
        startingTab: -1,
        handshakeTabId: -1,
        token: 0,
        examId: 0,
        courseId: 0,
        lastName: "",
        firstName: "",
        userName: "",
        ps: "",
        cacheOuturl: "",
        lmsChallenge: "",
        nonSecureMode: false,
        cookieUrl: "",
        handshakeUrl: "",
        tabSetup: false,
        serverId: 0,
        domain: "",
        extlist: [],
        tabIds: [],
        tabNames: [],
        allowExtString: "",
        logString: "",
        issueString: "",
        susReady: false,
        windowCheckInProgress: false, 
        screenLocked: false,          
        temporaryTabIds: [],      
        systemTabIds: [],    
        focusCount: 0,                
        ctrlCount: 0,                 
        copyEvent: false,             
        screenshotCount: 0,
        liveproctor: false, 
        validresume: 0,
        svlpmode: false,    
        canvasreviewurl: "",
        screenrecmode: false,
        tabletmode: false,
        beforeunload: false,
        drmTabId: -1,
        drmDisabled: false,
        paypalId: -1,
        calculatorMode: 'DISABLED',   
        serverExamId: -1,   
        calculatorTabId: null,  
        externalDomainList: "",
        passRequired: false,
        defferedSecurity: false,
        institutionId: -1,

    saveState() {
        //console.log("saveState Saving to storage");

        const outflow = {
            lmsProcessing : this.lmsProcessing,
            currentTab: this.currentTab,
            examTabId: this.examTabId,
            webcamTabId: this.webcamTabId,
            preExamStarted: this.preExamStarted,
            examStarted: this.examStarted,
            attemptStarted: this.attemptStarted,
            bbpass: this.bbpass,
            logId: this.logId,
            resumeUrl: this.resumeUrl,
            resumeUrl2: this.resumeUrl2,
            reviewMode: this.reviewMode,            
            monitorRunning: this.monitorRunning,
            restartUrl: this.restartUrl,
            d2lReviewMode: this.d2lReviewMode,
            d2lExamMode: this.d2lExamMode,
            schoologyReviewMode: this.schoologyReviewMode,
            bbReviewMode: this.bbReviewMode,
            canvasReviewMode: this.canvasReviewMode,
            canvasExamMode: this.canvasExamMode,
            deferredHandshake: this.deferredHandshake,
            examWindow: this.examWindow,
            feedbackWaiting: this.feedbackWaiting,
            feedbackOn: this.feedbackOn,
            feedbackExit: this.feedbackExit,
            reportMode: this.reportMode,
            earlyExitMode: this.earlyExitMode,
            earlyExitWindow: this.earlyExitWindow,
            unsecured: this.unsecured,
            monitorBypassed: this.monitorBypassed,
            sequenceSid: this.sequenceSid,
            startingTab: this.startingTab,
            handshakeTabId: this.handshakeTabId,
            token: this.token,
            courseId: this.courseId,
            examId: this.examId,
            lastName: this.lastName,
            firstName: this.firstName,
            userName: this.userName,
            ps: this.ps,            
            cacheOuturl: this.cacheOuturl,
            lmsChallenge: this.lmsChallenge,
            nonSecureMode: this.nonSecureMode,
            cookieUrl: this.cookieUrl,
            handshakeUrl: this.handshakeUrl,
            tabSetup: this.tabSetup,
            serverId: this.serverId,
            domain: this.domain,
            extlist: this.extlist,
            tabIds: this.tabIds,
            tabNames: this.tabNames,
            allowExtString: this.allowExtString,
            logString: this.logString,
            issueString: this.issueString,
            susReady: this.susReady,
            windowCheckInProgress: this.windowCheckInProgress, 
            screenLocked: this.screenLocked,                   
            temporaryTabIds: this.temporaryTabIds,         
            systemTabIds: this.systemTabIds,    
            focusCount: this.focusCount,                       
            ctrlCount: this.ctrlCount,                         
            copyEvent: this.copyEvent,                         
            screenshotCount: this.screenshotCount,  
            liveproctor: this.liveproctor,
            validresume: this.validresume,
            svlpmode: this.svlpmode,
            canvasreviewurl: this.canvasreviewurl,
            screenrecmode: this.screenrecmode,
            tabletmode: this.tabletmode,
            beforeunload: this.beforeunload,
            drmTabId: this.drmTabId,
            drmDisabled: this.drmDisabled,
            paypalId: this.paypalId,
            calculatorMode: this.calculatorMode,
            serverExamId: this.serverExamId,
            calculatorTabId: this.calculatorTabId,
            externalDomainList: this.externalDomainList,            
            defferedSecurity: this.defferedSecurity,
            passRequired: this.passRequired,
            institutionId: this.institutionId,

        }

        chrome.storage.local.set({'systemstate': outflow}, function() {
           //console.log("saveState stored the current state");
        });
    },

    set institutionIdSet(value) {
        this.institutionId = value;
        this.saveState();
    },

    set preExamStartedSet(mode) {
        this.preExamStarted = mode;
        this.saveState();
    },

    set passRequiredSet(mode) {
        this.passRequired = mode;
        this.saveState();
    },

    set defferedSecuritySet(mode) {
        this.defferedSecurity = mode;
        this.saveState();
    },    

    set externalDomainListSet(list) {
        this.externalDomainList = list;
        this.saveState();
    },

    set calculatorTabIdSet(newid) {
        this.calculatorTabId = newid;
        this.saveState();
    },

    set serverExamIdSet(newid) {
        this.serverExamId = newid;
        this.saveState();
    },

    set calculatorModeSet(mode) {
        this.calculatorMode = mode;
        this.saveState();
    },

    set paypalIdSet(newid) {
        this.paypalId = newid;
        this.saveState();
    },

    set drmDisabledSet(mode) {
        this.drmDisabled = mode;
        this.saveState();
    },

    set drmTabIdSet(newid) {
        this.drmTabId = newid;
        this.saveState();
    },

    set beforeunloadSet(mode) {
        this.beforeunload = mode;
        this.saveState();
    },
    

    set tabletmodeSet(mode) {
        this.tabletmode = mode;
        this.saveState();
    },

    set screenrecmodeSet(mode) {
        this.screenrecmode = mode;
        this.saveState();
    },

    set canvasreviewurlSet(url) {
        this.canvasreviewurl = url;
        this.saveState();
    },

    set svlpmodeSet(mode) {
        this.svlpmode = mode;
        this.saveState();
    },

    set validresumeSet(mode) {
        this.validresume = mode;
        this.saveState();
    },

    set liveproctorSet(mode) {
        this.liveproctor = mode;
        this.saveState();
    },

    set susReadySet(mode) {
        this.susReady = mode;
        this.saveState();
    },

    set logStringAdd(log) {
        
        this.logString = this.logString + ":::" + log;
        
        this.saveState();
    },

    set issueStringSet(issue) {
        
        this.issueString = issue;
        
        this.saveState();
    },


    set processing(processState) {


        
        this.lmsProcessing = processState;
        
        this.saveState();
    },

    set currentTabSet(tabid) {
        
        this.currentTab = tabid;
        this.saveState();
    },

    set examState(examState) {

        //console.log("examState is being changed to " + examState);
        
        this.examStarted = examState;
        this.saveState();
    },

    set attemptState(attemptState) {

        
        this.attemptStarted = attemptState;
        this.saveState();
    },

    set examTabSet(tabId) {        
        
        this.examTabId = tabId;
        this.saveState();
    },    

    set bbPassword(passText) {
        
        this.bbpass = passText;
        this.saveState();
    },

    set resumeUrlSet(url) {
        this.resumeUrl = url;
        this.saveState();              
    },

    set resumeUrl2Set(url) {
        this.resumeUrl2 = url;
        this.saveState();              
    },

    set reviewModeSet(mode) {
        this.reviewMode = mode;
        this.saveState();
    },

    set monitorRunningSet(setting) {
        this.monitorRunning = setting;
        this.saveState();
    },

    set restartUrlSet(url) {
        
        this.restartUrl = url;
        this.saveState();
    },

    set d2lReviewModeSet(mode) {
        this.d2lReviewMode = mode;
        this.saveState();
    },
    set d2lExamModeSet(mode) {
        //console.log("saveState d2lExamMode " + mode);
        this.d2lExamMode = mode;
        this.saveState();
    },

    set webcamTabIdSet(tabId) {        
        this.webcamTabId = tabId;
        this.saveState();
    },

    set schoologyReviewModeSet(mode) {
        this.schoologyReviewMode = mode;
        this.saveState();
    },

    set canvasReviewModeSet(mode) {
        this.canvasReviewMode = mode;
        this.saveState();
    },

    set bbReviewModeSet(mode) {
        this.bbReviewMode = mode;
        this.saveState();
    },

    set canvasExamModeSet(mode) {
            this.canvasExamMode = mode;
            this.saveState();
        },

    set deferredHandshakeSet(handshake) {
        this.deferredHandshake = handshake;
        this.saveState();
    },

    set examWindowSet(winid) {
        this.examWindow = winid;
        this.saveState();
    },

    set feedbackWaitingSet(feedback) {
        this.feedbackWaiting = feedback;
        this.saveState();
    },

    set feedbackOnSet(feedback) {
        this.feedbackOn = feedback;
        this.saveState();
    },

    set feedbackExitSet(feedback) {
        this.feedbackExit = feedback;
        this.saveState();
    },

    set reportModeSet(mode) {
        this.reportMode = mode;
        this.saveState();
    },    

    set earlyExitModeSet(mode) {
        this.earlyExitMode = mode;
        this.saveState();
    },    

    set earlyExitWindowSet(win) {
        this.earlyExitWindow = win;
        this.saveState();
    },   

    set unsecuredSet(mode) {
        this.unsecured = mode;
        this.saveState();
    },    

    set monitorBypassedSet(mode) {
        this.monitorBypassed = mode;
        this.saveState();
    },    

    set sequenceSidSet(mode) {
        this.sequenceSid = mode;
        this.saveState();
    },    

    set startingTabSet(tab) {
        this.startingTab = tab;
        this.saveState();
    },    

    set handshakeTabIdSet(tab) {
        this.handshakeTabId = tab;
        this.saveState();
    },    

    set tokenSet(code) {
        this.token = code;
        this.saveState();
    },   

    set courseIdSet(code) {
        this.courseId = code;
        this.saveState();
    },   

    set examIdSet(code) {
        this.examId = code;
        this.saveState();
    },   

    set lastNameSet(name) {
        this.lastName = name;
        this.saveState();
    },    

    set firstNameSet(name) {
        this.firstName = name;
        this.saveState();
    },  

    set userNameSet(name) {
        this.userName = name;
        this.saveState();
    },  

    set psSet(pscode) {
        this.ps = pscode;
        this.saveState();
    },  

    set serverIdSet(id) {
        this.serverId = id;
        this.saveState();
    },  

    set domainSet(domain) {
        this.domain = domain;
        this.saveState();
    },  

    set cacheOuturlSet(url) {
        this.cacheOuturl = url;
        this.saveState();
    },  

    set lmsChallengeSet(url) {
        this.lmsChallenge = url;
        this.saveState();
    },  

    set nonSecureModeSet(mode) {
        this.nonSecureMode = mode;
        this.saveState();
    },  

    set cookieUrlSet(url) {
        this.cookieUrl = url;
        this.saveState();
    },  

    set handshakeUrlSet(url) {
        logToWindow("handshakeUrlSet to " + url);
        this.handshakeUrl = url;
        this.saveState();
    },  

    set tabSetupSet(mode) {
        this.tabSetup = mode;
        this.saveState();
    },  

    set extListSet(list) {

        //console.log("ext setting to " + list);
        this.extlist = list;
        this.saveState();
    },

    set tabIdsSet(list) {
        this.tabIds = list;
        this.saveState();
    },

    set tabNamesSet(list) {
        this.tabNames = list;
        this.saveState();
    },

    set tabIdsAdd(item) {
        this.tabIds.push(item);
        this.saveState();
    },

    set tabNamesAdd(item) {
        this.tabNames.push(item);
        this.saveState();
    },

    set tabIdsRemove(item) {
        const index = this.tabIds.indexOf(item);
        if (index > -1) {
            this.tabIds.splice(index, 1);
            this.tabNames.splice(index, 1);
        }
        
        this.saveState();
    },

    set tabNamesAdd(item) {
        this.tabNames.push(item);
        this.saveState();
    },

    set allowExtStringSet(item) {
        this.allowExtString = item;
        this.saveState();
    },

    
    set screenLockedSet(locked){
        this.screenLocked = locked;
        this.saveState();
    },

    // Added for prototype
    set temporaryTabIdsSet(tabIds){
        this.temporaryTabIds = tabIds;
        this.saveState();
    },

    set systemTabIdsSet(tabsIds) {
        this.systemTabIds = tabIds;
        this.saveState();
    },
    
    // Added for prototype
    set focusCountSet(count){
        this.focusCount = count;
        this.saveState();
    },
    
    // Added because missing
    set ctrlCountSet(count){
        this.ctrlCount = count;
        this.saveState();
    },

    // Added for screenshot blocking
    set copyEventSet(event){
        this.copyEvent = event;
        this.saveState();
    },

    // Added for screenshot blocking
    set screenshotCountSet(count){
        this.screenshotCount = count;
        this.saveState();
    },


    
       

    get getProcessing() {
        return this.lmsProcessing;
    },

    get examState () {
        
        return this.examStarted;
    },

    get attemptState () {
        
        return this.attemptStarted;
    },

    get bbPassword () {
        
        return this.bbpass;
    },

    get logIdValue() {
        return this.logId;
    },

    inProcessingState(checkState) {
        
        var result = false;
        if (checkState == this.lmsProcessing) {
            result = true;
        }
        return result;
    },

    updateAll() {

        

        chrome.storage.local.get('systemstate', function(obj) {
           //console.log("saveState restored the current state");
           //console.log(obj);
           
           const isEmpty = Object.keys(obj).length === 0;

           //console.log(isEmpty);

           

           if (!isEmpty) {    

               systemState['lmsProcessing'] = obj.systemstate.lmsProcessing;
               systemState['currentTab'] = obj.systemstate.currentTab;   
               systemState['examTabId'] = obj.systemstate.examTabId;
               systemState['webcamTabId'] = obj.systemstate.webcamTabId;
               systemState['examStarted'] = obj.systemstate.examStarted;        
               systemState['preExamStarted'] = obj.systemstate.preExamStarted;                              
               systemState['attemptStarted'] = obj.systemstate.attemptStarted;
               systemState['bbpass'] = obj.systemstate.bbpass;               
               systemState['logId'] = obj.systemstate.logId;    
               systemState['resumeUrl'] = obj.systemstate.resumeUrl;        
               systemState['resumeUrl2'] = obj.systemstate.resumeUrl2;     
               systemState['monitorRunning'] = obj.systemstate.monitorRunning;   
               systemState['restartUrl'] = obj.systemstate.restartUrl;  
               systemState['reviewMode'] = obj.systemstate.reviewMode;                                                 
               systemState['d2lReviewMode'] = obj.systemstate.d2lReviewMode;  
               systemState['d2lExamMode'] = obj.systemstate.d2lExamMode;  
               systemState['schoologyReviewMode'] = obj.systemstate.schoologyReviewMode;
               systemState['bbReviewMode'] = obj.systemstate.bbReviewMode;
               systemState['canvasReviewMode'] = obj.systemstate.canvasReviewMode;  
               systemState['canvasExamMode'] = obj.systemstate.canvasExamMode;  
               systemState['deferredHandshake'] = obj.systemstate.deferredHandshake;   
               systemState['examWindow'] = obj.systemstate.examWindow;   
               systemState['feedbackWaiting'] = obj.systemstate.feedbackWaiting;  
               systemState['feedbackOn'] = obj.systemstate.feedbackOn;
               systemState['feedbackExit'] = obj.systemstate.feedbackExit;
               systemState['reportMode'] = obj.systemstate.reportMode;
               systemState['earlyExitMode'] = obj.systemstate.earlyExitMode;
               systemState['earlyExitWindow'] = obj.systemstate.earlyExitWindow;
               systemState['unsecured'] = obj.systemstate.unsecured;
               systemState['monitorBypassed'] = obj.systemstate.monitorBypassed;
               systemState['sequenceSid'] = obj.systemstate.sequenceSid;
               systemState['startingTab'] = obj.systemstate.startingTab;   
               systemState['handshakeTabId'] = obj.systemstate.handshakeTabId;    
               systemState['token'] = obj.systemstate.token;   
               systemState['courseId'] = obj.systemstate.courseId;   
               systemState['examId'] = obj.systemstate.examId;    
               systemState['lastName'] = obj.systemstate.lastName; 
               systemState['firstName'] = obj.systemstate.firstName; 
               systemState['userName'] = obj.systemstate.userName; 
               systemState['ps'] = obj.systemstate.ps; 
               systemState['cacheOuturl'] = obj.systemstate.cacheOuturl;                
               systemState['lmsChallenge'] = obj.systemstate.lmsChallenge; 
               systemState['nonSecureMode'] = obj.systemstate.nonSecureMode;
               systemState['cookieUrl'] = obj.systemstate.cookieUrl;
               systemState['handshakeUrl'] = obj.systemstate.handshakeUrl;
               systemState['tabSetup'] = obj.systemstate.tabSetup;
               systemState['serverId'] = obj.systemstate.serverId; 
               systemState['domain'] = obj.systemstate.domain; 
               systemState['extlist'] = obj.systemstate.extlist; 
               systemState['tabIds'] = obj.systemstate.tabIds; 
               systemState['tabNames'] = obj.systemstate.tabNames; 
               systemState['allowExtString'] = obj.systemstate.allowExtString; 
               systemState['logString'] = obj.systemstate.logString;
               systemState['issueString'] = obj.systemstate.issueString;
               systemState['susReady'] = obj.systemstate.susReady;
               
               systemState['windowCheckInProgress'] = obj.systemstate.windowCheckInProgress; 
               systemState['screenLocked'] = obj.systemstate.screenLocked;                   
               systemState['temporaryTabIds'] = obj.systemstate.temporaryTabIds;          
               systemState['systemTabIds'] = obj.systemstate.systemTabIds;   
               systemState['focusCount'] = obj.systemstate.focusCount;                       
                   
               systemState['ctrlCount'] = obj.systemstate.ctrlCount;                         

               systemState['copyEvent'] = obj.systemstate.copyEvent;                         
               systemState['screenshotCount'] = obj.systemstate.screenshotCount;      

               systemState['liveproctor'] = obj.systemstate.liveproctor;      
               systemState['validresume'] = obj.systemstate.validresume;
               systemState['canvasreviewurl'] = obj.systemstate.canvasreviewurl;
               systemState['screenrecmode'] = obj.systemstate.screenrecmode;
               //console.log("exam state = " + obj.systemstate.examStarted);
               systemState['tabletmode'] = obj.systemstate.tabletmode;
               systemState['beforeunload'] = obj.systemstate.beforeunload;
               systemState['drmTabId'] = obj.systemstate.drmTabId;
               systemState['drmDisabled'] = obj.systemstate.drmDisabled;
               systemState['paypalId'] = obj.systemstate.paypalId;
               systemState['calculatorMode'] = obj.systemstate.calculatorMode;
               systemState['serverExamId'] = obj.systemstate.serverExamId;
               systemState['calculatorTabId'] = obj.systemstate.calculatorTabId;
               systemState['externalDomainList'] = obj.systemstate.externalDomainList;               
               systemState['defferedSecurity'] = obj.systemState.defferedSecurity;
               systemState['passRequired'] = obj.passRequired;       
               systemState['institutionId'] = obj.institutionId;                                                                
           } 

        });

    },

    resetLog() {
        this.logString = "";
    }, 

    reset() {

        console.log("Reset is called");
        restoreExtensions();

      
        this.lmsProcessing = "nonereset";
        this.currentTab = -1;
        //this.examTabId = -1;
        this.webcamTabId = -1;


        //this.examStarted = false;

        changeExamState(false, "state machine reset");
        changeAttemptState(false, "state machine reset");
        



        this.preExamStarted = false;
        this.attemptStarted = false;
        this.bbpass = "";
        //this.logId = -1;
        this.resumeUrl = "";
        this.resumeUrl2 = "";
        this.monitorRunning = false;
        //this.restartUrl = ""; This is not reset
        this.reviewMode = false;
        this.d2lReviewMode = false;
        this.d2lExamMode = "";
        this.bbReviewMode = false;
        
        
        this.schoologyReviewMode = false;
        this.canvasReviewMode = false;
        //this.canvasExamMode = "";
        this.deferredHandshake = null;
        this.examWindow = -1;
        this.feedbackWaiting = false;
        this.feedbackOn = false;
        this.feedbackExit = true;
        
        
        this.reportMode = false;
        this.earlyExitMode = false;
        this.unsecured = true;
        this.earlyExitWindow = -1;
        this.monitorBypassed = false;
        this.sequenceSid = null;
        this.startingTab = -1;
        this.handshakeTabId = -1;
        this.token = 0;
        this.courseId = 0;
        this.examId = 0;
        this.lastName = "";
        this.firstName = "";
        this.userName = "";
        this.ps = "";
        this.cacheOuturl = "";
        this.lmsChallenge = "";                    
        this.nonSecureMode = false;
        this.cookieUrl = "";
        this.handshakeUrl = "";
        this.tabSetup = false;

        this.serverId = 0;
        //this.domain = "";

        this.extlist = [];
        
        this.tabIds = [];
        this.tabNames = [];

        this.allowExtString = "";
        this.susReady = false;

        this.windowCheckInProgress = false; 
        this.screenLocked = false;          
        this.temporaryTabIds = [];   
        this.systemTabIds = [];       
        this.focusCount = 0;                
        this.ctrlCount = 0;                 
        this.copyEvent = 0;                 
        this.screenshotCount = 0;   
        this.liveproctor = false;       
        this.validresume = 0;     
        this.canvasreviewurl = "";   
        this.screenrecmode = false;   
        this.tabletmode = false;
        this.beforeunload = false;
        this.drmTabId = -1;
        this.drmDisabled = false;
        this.paypalId = -1;
        this.calculatorMode = 'DISABLED';
        this.serverExamId = -1;
        this.calculatorTabId = null;
        this.externalDomainList = "";
        
        this.defferedSecurity = false;
        this.passRequired = false;
        this.institutionId = -1;

        chrome.storage.local.remove('systemstate', function(obj) {
           //console.log("saveState removed systemstate");           
        });

        chrome.storage.local.remove('ldb_user_cookie', function(obj) {
            //console.log("saveState removed 'ldb_user_cookie'");           
         });
    },
    fullreset() {

        console.log("Full Reset is called");
      
        this.lmsProcessing = "nonereset";
        this.currentTab = -1;
        this.examTabId = -1;
        this.webcamTabId = -1;


        this.examStarted = false;

        changeExamState(false, "state machine reset");
        changeAttemptState(false, "state machine reset");

        this.preExamStarted = false;
        this.attemptStarted = false;
        this.bbpass = "";
        this.logId = -1;
        this.resumeUrl = "";
        this.resumeUrl2 = "";
        this.monitorRunning = false;
        this.restartUrl = ""; 
        this.reviewMode = false;
        this.d2lReviewMode = false;
        this.d2lExamMode = "";

        this.bbReviewMode = false;
                        
        this.schoologyReviewMode = false;
        this.canvasReviewMode = false;
        this.canvasExamMode = "";
        this.deferredHandshake = null;
        this.examWindow = -1;
        this.feedbackWaiting = false;
        this.feedbackOn = false;
        this.feedbackExit = true;        
        
        this.reportMode = false;
        this.earlyExitMode = false;
        this.unsecured = true;
        this.earlyExitWindow = -1;
        this.monitorBypassed = false;
        this.sequenceSid = null;
        this.startingTab = -1;
        this.handshakeTabId = -1;
        this.token = 0;
        this.courseId = 0;
        this.examId = 0;
        this.lastName = "";
        this.firstName = "";
        this.userName = "";
        this.ps = "";
        this.cacheOuturl = "";
        this.lmsChallenge = "";                    
        this.nonSecureMode = false;
        this.cookieUrl = "";
        this.handshakeUrl = "";
        this.tabSetup = false;

        this.serverId = 0;
        this.domain = "";

        this.extlist = [];
        
        this.tabIds = [];
        this.tabNames = [];

        this.allowExtString = "";
        this.susReady = false;

        this.windowCheckInProgress = false; 
        this.screenLocked = false;          
        this.temporaryTabIds = [];         
        this.systemTabIds  = [];
        this.focusCount = 0;                
        this.ctrlCount = 0;                 
        this.copyEvent = 0;                 
        this.screenshotCount = 0;    
        this.liveproctor = false;     
        this.validresume = 0; 
        this.canvasreviewurl = "";   
        this.screenrecmode = false;
        this.tabletmode = false;
        this.beforeunload = false;
        this.drmTabId = -1;
        this.drmDisabled = false;
        this.paypalId = -1;
        this.calculatorMode = 'DISABLED';
        this.serverExamId = -1;
        this.calculatorTabId = null;
        this.externalDomainList = "";
        
        this.defferedSecurity = false;
        this.passRequired = false;
        this.institutionId = -1;

        chrome.storage.local.remove('systemstate', function(obj) {
           //console.log("saveState removed systemstate");           
        });

        chrome.storage.local.remove('ldb_user_cookie', function(obj) {
            //console.log("saveState removed 'ldb_user_cookie'");           
         });

         
    },

    
}




// *************************************************************************

// Moved into state machine


var GLOBAL_blackboard_processing = false;
var GLOBAL_bbultra_processing = false;
var GLOBAL_canvas_processing = false;
var GLOBAL_d2l_processing = false;
var GLOBAL_moodle_processing = false;
var GLOBAL_schoology_processing = false;
var GLOBAL_bbultra_resumeurl = "";
var GLOBAL_bbultra_resumeurl2 = "";
var GLOBAL_exam_started = false;
var GLOBAL_exam_attempt_mode = false;
var GLOBAL_bbultra_review_mode = false;
var GLOBAL_current_tab = -1;
var GLOBAL_monitor_running = false;
var GLOBAL_d2l_review_mode = false; 
var GLOBAL_canvas_review_mode = false;
var GLOBAL_schoology_review_mode = false; 
var GLOBAL_exam_tabid = -1;
var GLOBAL_def_handshake = null;
var GLOBAL_exam_window = -1;
var GLOBAL_feedback_waiting = false;
var GLOBAL_feedback_on = false;
var GLOBAL_feedback_exit = true;
var GLOBAL_canvas_exam_mode = "";
var GLOBAL_d2l_state = "";
var GLOBAL_webcam_tabid = -1;
var GLOBAL_report_mode = false;
var GLOBAL_early_exit_mode = false; // set to false
var GLOBAL_unsecured = false;
var GLOBAL_early_exit_window = -1;
var GLOBAL_monitor_bypassed = false;
var GLOBAL_sequence_sid = null;
var GLOBAL_starting_tab = -1;
var GLOBAL_handshake_tabid = -1;
var GLOBAL_token = 0;
var GLOBAL_course_id = 0;
var GLOBAL_exam_id = 0;
var GLOBAL_last_name = "";
var GLOBAL_first_name = "";
var GLOBAL_user_name = "";
var GLOBAL_ps = "";
var GLOBAL_domain = "";
var GLOBAL_cache_outurl = "";
var GLOBAL_lms_challenge_value = "";
var GLOBAL_nonsecure_mode = false;
var GLOBAL_cookie_url = ""; 
var GLOBAL_tabs_setup = false;

var GLOBAL_tab_ids = [];
var GLOBAL_tab_names = [];

var GLOBAL_inject_ids = [];

var GLOBAL_resumetime = null;

// *************************************************************************


// TODO


var GLOBAL_previous_warning_windowid = -1;

var GLOBAL_user_info = false;

var GLOBAL_focus = false;
var GLOBAL_focus_issue = false;

var GLOBAL_schoology_security = -1;
var GLOBAL_schoology_delayed_close = -1;
var GLOBAL_schoology_delayed_timer = null;

var GLOBAL_loadingJson = false;
var GLOBAL_exam_check = null;

var GLOBAL_canvas_start_interval = null;


// -------------------------------------------------------------------------------------

var GLOBAL_startup_detected = false;
var GLOBAL_exam_browser_id = -1;
var GLOBAL_issue_token = -1;
var GLOBAL_issue_hct = -1;
var GLOBAL_count = 0;





// -------------------------------------------------------------------------------------
// check if we need to recover stored state


checkForMod();
checkForLaunch();

console.log("Restarting...");

setTimeout(function() { logToWindow("Restarting..."); }, 2000);

var today = new Date();
var GLOBAL_start_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        

// -------------------------------------------------------------------------------------

chrome.action.onClicked.addListener(function(tab) {
    //console.log("browserAction");
    clearAll();

});


// ---------------------------------------------------------------------------------------





var GLOBAL_delay_activate = null;

chrome.tabs.onActivated.addListener(function(outsidetab) {
    console.log("onActivated");

    /*
    if (systemState.preExamStarted == true) {
        holdPreexam();
    }
    */
    

    // abnormal condition detected    
    if (GLOBAL_startup_detected && (systemState.examStarted || systemState.attemptStarted) ) {
        chrome.tabs.create({ active: true, index: 0, url: 'exam_startup_error.html' }, function(tab) {
            console.log('normal1');
            mywindowsupdate(tab.windowId, { state: "normal" }); // KEEP NORMAL
            clearExamTabs(tab.id);
            resetExamInfo();
            clearKeyCookies();
        }); 
    } else {
        //not an issue we are not in the middle
        GLOBAL_startup_detected = false;
    }

    
    if (systemState.examStarted || systemState.attemptStarted) {
        var invalid = true;

        console.log("Comparing [" + outsidetab.tabId + "] to [" + systemState.examTabId + "] " + systemState.currentTab);
        if (systemState.earlyExitWindow == outsidetab.tabId) {
            console.log("EARLYMATCH!");
            invalid = false;
        }
        if (systemState.webcamTabId == outsidetab.tabId) {
            console.log("WEBMATCH!");
            invalid = false;
        }
        if (systemState.examTabId == outsidetab.tabId) {
            console.log("EXAMMATCH!");
            invalid = false;
        }
        if (systemState.currentTab == outsidetab.tabId) {
            console.log("CURRENTMATCH!");
            invalid = false;
        }

        
        for (var i = 1; i < systemState.tabIds.length; i++) {
            
            if (systemState.tabIds[i] == outsidetab.tabId )
                {                                                 
                invalid = false;
                }
        }

        console.log("detecting invalid = " + invalid + " examtabid=" + systemState.examTabId);

        if (invalid == true) {
            //removeTab(outsidetab.tabId, "activatedTab");
            

            if (systemState.defferedSecurity == false) {
                console.log("shift to examtabid");
                setTimeout(function(){mytabsupdate(systemState.examTabId, { active: true});}, 100);
            }
            
            
            mywindowsupdate(systemState.examWindow, { state: GLOBAL_screen });
            if (GLOBAL_delay_activate != null) {
                clearTimeout(GLOBAL_delay_activate);
            }

            GLOBAL_delay_activate = setTimeout(function() {console.log('normal2');mywindowsupdate(systemState.examWindow, { state: "normal" });mywindowsupdate(systemState.examWindow, { state: GLOBAL_screen }); }, 1000);


            
        } else {
            if (systemState.earlyExitWindow == outsidetab.tabId) {
                console.log("shift to earlyexit");
                setTimeout(function(){mytabsupdate(systemState.earlyExitWindow, { active: true});}, 100);
            }
            if (systemState.webcamTabId == outsidetab.tabId) {
                console.log("shift to webcam");
                setTimeout(function(){mytabsupdate(systemState.webcamTabId, { active: true});}, 100);
            }
            if (systemState.currentTab == outsidetab.tabId) {
                console.log("shift to current");
                setTimeout(function(){mytabsupdate(systemState.currentTab, { active: true});}, 200);
            }
        }

    }
    
    


    
    
});

chrome.tabs.onRemoved.addListener(function(removedtab) {

    console.log("tab removed " + removedtab);

    removeFromTabs(removedtab);

    // notify all open tabs of the change
    chrome.tabs.query({}, function(tabs) {
        var message = { action: "removelinkbk", tabid: removedtab };
        for (var i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, message);
        }
    });

    if (systemState.paypalId == removedtab) {
        systemState.paypalIdSet = -1;
    }

    if (systemState.inProcessingState('d2l') && systemState.examTabId == removedtab) {
            // d2l closed the exam
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {

                if (tabs && tabs.length > 0) {
                    systemState.examTabSet = tabs[0].id;
                }
                
            
        });

    }
       
});
// ---------------------------------------------------------------------------------------



/*
chrome.alarms.create({ periodInMinutes: 1.0 })
chrome.alarms.onAlarm.addListener(() => {
  console.log('LDB pinging LMS exam');
  systemState.updateAll();
});
*/

//console.log("registering enabled");

chrome.management.onEnabled.addListener(
  function(extInfo) {
      //console.log("onEnabled");
      //console.log(extInfo);

  }
);

chrome.management.onDisabled.addListener(
  function(extInfo) {
      //console.log("onDisabled");
      //console.log(extInfo);

  }
);

/*
chrome.loginState.onSessionStateChanged.addListener(
  function(ss) {
      console.log("onSessionStateChanged");
      console.log(ss);

  }
)
*/



// ---------------------------------------------------------------------------------------


chrome.webRequest.onBeforeRequest.addListener(
    function (details) {            
        if (details.method == "POST" && details.initiator.indexOf("respondus") != -1) {            
            //console.log('POST MESSAGE');
            //console.log(JSON.stringify(details)); 
        }
    },
    { urls: ["<all_urls>"]},
    ["extraHeaders", "requestBody"]
);


chrome.runtime.getPlatformInfo(function(platformInfo) {
    var os = platformInfo.os;
    console.log("Platform os is " + os);

    if (os == GLOBAL_os) {        

        var drmCompleteFilter = { urls: [GLOBAL_drm], types: ["main_frame"] };
        chrome.webRequest.onCompleted.addListener(drmActive, drmCompleteFilter, []);

        var autosaveFilterCanvasOld = { urls: ["*://*/courses/*/quizzes/*/submissions/backup*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeSendHeaders.addListener(autoSaveDetectCanvasOld, autosaveFilterCanvasOld, ["requestHeaders", "extraHeaders"]);

        // inject into the faq page 
        var faqCompleteFilter = { urls: ["*://*/MONServer/chromebook/faq.do", "*://*/MONServer/ldb/faq.do"], types: ["main_frame"] };
        chrome.webRequest.onCompleted.addListener(injectFaq, faqCompleteFilter, []);

        
        var setupLDBfilter = { urls: ["*://*/course/*/common-assessment/*", "*://*/quizzes.respondus.launch/courses/*/assignments/*", "*://*/ultra/courses/*/outline*", "*://*/webapps/assessment/take/launchAssessment.jsp*", "*://*/courses/*/quizzes", "*://*/course/*/materials*", "*://*/mod/quiz/view.php*", "*://*/assignment/*/assessment"], types: ["main_frame"] };
        chrome.webRequest.onBeforeSendHeaders.addListener(setupBaseSettings, setupLDBfilter, ["requestHeaders", "extraHeaders"]);

        var cleanLDBfilter = { urls: ["*://*/webapps/assessment/take/launchAssessment.jsp*", "*://*/*/user/quiz_summary.d2l*", "*://*/assignment/*/assessment", "*://*/course/*/materials*", "*://*/mod/quiz/view.php*", "*://*/course/*/common-assessment/*"], types: ["main_frame"] };
        //chrome.webRequest.onBeforeSendHeaders.addListener(clearBaseSettings, cleanLDBfilter, ["requestHeaders", "extraHeaders"]);

        // Canvas
        var cleanCanvasfilter = { urls: ["*://*/courses/*/quizzes/*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeSendHeaders.addListener(clearCanvas, cleanCanvasfilter, ["requestHeaders", "extraHeaders"]);
        

        var handshakeCanvasFilter = { urls: ["*://*/respondus/ldb_handshake*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeSendHeaders.addListener(findHandshakeCanvasCheck, handshakeCanvasFilter, ["requestHeaders", "extraHeaders"]);

        var handshakeCanvasReviewFilter = { urls: ["*://*/courses/*/quizzes/*/history*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeSendHeaders.addListener(findHandshakeCanvasReview, handshakeCanvasReviewFilter, ["requestHeaders", "extraHeaders"]);

        var handshakeCanvasCompleteFilter = { urls: ["*://*/courses/*/quizzes/*/history*"], types: ["main_frame"] };
         chrome.webRequest.onCompleted.addListener(canvasReviewLoadComplete, handshakeCanvasCompleteFilter, []);

        var canvasExamFilterPrestartRedirect = { urls: ["*://*/quizzes.respondus.prestart*"] };
        chrome.webRequest.onBeforeRequest.addListener(reactToPrestartCanvasRedirect, canvasExamFilterPrestartRedirect, []);

        var canvasEndExamFilter = { urls: ["*://*/courses/*/quizzes/*/submissions*"], types: ["main_frame"] };
        chrome.webRequest.onCompleted.addListener(canvasEndExam, canvasEndExamFilter, []);

        var canvasDecodeFilter = { urls: ["*://*/courses/*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeRequest.addListener(canvasAttempt, canvasDecodeFilter, []);

        //var resetCanvasFilter = { urls: ["*://*/courses/*/quizzes/*"], types: ["main_frame"] };
        //chrome.webRequest.onHeadersReceived.addListener(resetCanvasEnv, resetCanvasFilter, []);

        var canvasFailFilter = { urls: ["*://*/*lockdown_browser_required"], types: ["main_frame"] };
        chrome.webRequest.onBeforeRequest.addListener(canvasFailOnRequired, canvasFailFilter, []);


        // Canvas QN
        var canvasExamFilterQuiz = { urls: ["*://*/quizzes.respondus.launch/courses/*/assignments/*.json"] };
        chrome.webRequest.onHeadersReceived.addListener(canvasFilterCallbackQuiz, canvasExamFilterQuiz, []);

        var handshakeCanvasQuizFilter = { urls: ["*://*/quizzes.respondus.landing*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeSendHeaders.addListener(findHandshakeQuizCanvas, handshakeCanvasQuizFilter, ["requestHeaders", "extraHeaders"]);

        var startCanvasQuizFilter = { urls: ["*://*/quizzes.respondus.start*"], types: ["main_frame"] };
        chrome.webRequest.onCompleted.addListener(canvasQuizStarted, startCanvasQuizFilter, []);




        // Moodle
        var moodlePrestartFilter = { urls: ["*://*/blocks/lockdownbrowser/autoprestart.php*"], types: ["main_frame"] };
        //chrome.webRequest.onCompleted.addListener(reactToPrestartMoodle, moodlePrestartFilter, ["responseHeaders", "extraHeaders"]);

        var moodleSubmittedFilter = { urls: ["*://*/mod/quiz/processattempt.php*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeRequest.addListener(moodleExamSubmitted, moodleSubmittedFilter, []);

        // Schoology
        var handshakeSchoologyFilter = { urls: ["*://*/login/ldb_launch*", "*://*/apps/ldb/start*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeSendHeaders.addListener(findHandshakeSchoology, handshakeSchoologyFilter, ["requestHeaders", "extraHeaders"]);

        var schoologyExamFilterPrestartRedirect = { urls: ["*://*/*/ldb/start_finished*"] };
        chrome.webRequest.onCompleted.addListener(reactToPrestartSchoology, schoologyExamFilterPrestartRedirect, []);

        var schoologyExamFilterExit = { urls: ["*://*/apps/ldb/exit*"] };
        chrome.webRequest.onBeforeRequest.addListener(exitExamSchoology, schoologyExamFilterExit, []);

        var schoologyViewAssessmentFilter = { urls: ["*://*/*/assessment_view/*"] };
        chrome.webRequest.onBeforeRequest.addListener(schoologyViewAssessment, schoologyViewAssessmentFilter, []);

        chrome.webRequest.onCompleted.addListener(schoologyViewAssessmentComplete, schoologyViewAssessmentFilter, []);




        // D2L
        //var handshakeD2LFilter = { urls: ["*://*/d2l/lms/quizzing/user/quiz_summary.d2l*", "*://*/*/user/quiz_summary.d2l*"] };
        //chrome.webRequest.onBeforeSendHeaders.addListener(findHandshakeD2L, handshakeD2LFilter, ["requestHeaders", "extraHeaders"]);

        var d2lExamFilterPrestartRedirect = { urls: ["*://*/d2l/lms/quizzing/user/attempt/quiz_respondus_prestart_page_auto.d2l*"] };
        chrome.webRequest.onCompleted.addListener(findHandshakeD2L, d2lExamFilterPrestartRedirect, []);

        var d2lSubmittedFilter = { urls: ["*://*/d2l/lms/quizzing/user/quiz_submissions.d2l*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeRequest.addListener(d2lExamSubmitted, d2lSubmittedFilter, []);



        //Blackboard


        var blackboardReviewFilter = { urls: ["*://*/webapps/assessment/review/review.jsp*", "*://*/review.jsp*"] };
        chrome.webRequest.onBeforeRequest.addListener(blackboard_review_callback, blackboardReviewFilter, []);

        var blackboardSubmittedFilter = { urls: ["*://*/webapps/assessment/take/submitted.jsp*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeRequest.addListener(blackboard_submitted_callback, blackboardSubmittedFilter, []);

        var blackboardListFilter = { urls: ["*://*/webapps/blackboard/content/listContent.jsp*", "*://*/webapps/blackboard/content/launchLink.jsp*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeRequest.addListener(blackboard_list_callback, blackboardListFilter, []);


        // BlackboardUltra
        var blackboardUltraFilter = { urls: ["*://*/webapps/assessment/proctoring/vendor/respondus_handshake_review*", "*://*/webapps/assessment/proctoring/vendor/respondus_handshake_take*"], types: ["main_frame"] };
        chrome.webRequest.onBeforeRequest.addListener(findHandshakeBbUltra, blackboardUltraFilter, []);


        var loginSuccessFilter = { urls: ["*://*/*login_success=1", "*://*/courses*"], types: ["main_frame"] };
        chrome.webRequest.onCompleted.addListener(onCompleteUserInfo, loginSuccessFilter, ["responseHeaders"]);


    }
});



//function logToWindow(message) {
const logToWindow = function (message) {

    //console.log("Sending message " + message + " logid=" + systemState.logId);


    if (systemState.logId && systemState.logId > 0) {
        chrome.tabs.sendMessage(systemState.logId, { "message": message });
    } 

    console.log("LOG: " + message);


    if (systemState.examStarted == true) {    
        var d = new Date();
        const result = d.toUTCString();


        systemState.logStringAdd = result + ": " + message;
    }


    

      

    /*
    
    chrome.tabs.query({ lastFocusedWindow: true }, function(tabs) {
            for (const tab of tabs) {
                if (tab.url.indexOf("logging") != -1) {
                var activetab = tab.id;   
                console.log("Sent to tab " + activetab);         
                chrome.tabs.sendMessage(activetab, { "message": message });  
            }
        }
        
    });
    */
}



chrome.alarms.create("myAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.2} );

chrome.alarms.onAlarm.addListener(function(alarm) {
  ping("ALARM");
});


function ping(code) {
    
    chrome.tabs.query({ lastFocusedWindow: true }, function(tabs) {
        for (const tab of tabs) {

            if (tab.url.indexOf("logging") != -1) {
            var activetab = tab.id;
            chrome.tabs.sendMessage(activetab, { "message": "PING " +  code + " " + GLOBAL_start_time + " examTabId: " + systemState.examTabId + " restart: " + systemState.restartUrl + " lms: " + systemState.getProcessing});   
        }
        }
        
    });
}

const tabUpdateWithUrl = function(tabId, newUrl) {
    if (tabId >= 0) {
        console.log("tabUpdateWIthURL " + newUrl);
        mytabsupdate(tabId, { url: newUrl, active: true });
    }
        
}

const tabUpdateShow = function(tabId) {
    if (tabId >= 0) {
        console.log("tabUpdateShow " + tabId);
        mytabsupdate(tabId, { active: true });    
    }
}

const removeTab = function (id, source) {
    console.log("Removing tab " + id + " from " + source);

    if (id > 0) {                
        mytabremove(id);        
    }
    
}

const changeExamWindow = function (newId, source) {
    console.log("changeexamwindow to " + newId + " from " + source);
    systemState.examWindowSet = newId;
}

const changeExamState = function (state, source) {
       
    console.log("Current state: " + systemState.examState + " Exam state " + state + " from " + source);
    logToWindow("Exam state " + state + " from " + source);

    // only act the first time it switches
    if (state == true && systemState.examState == false) {
        beginCheck();
        
        changePreExamState(false, "changeExamState");

        clearClipboardText();
        clearFormData();

        illegalExtensionCheck();

        systemState.resetLog();

        chrome.storage.local.set({ 'ctrlcount': 0 }, function(result) {
                
        });

        if (systemState.examWindow == -1) {
            console.log("Exam window is not set");
        }
    } 

    if (state == false && systemState.examState == true)  {
        endCheck();   
        clearClipboardText();     
    }

    systemState.examState = state;
}

const changeAttemptState = function (state, source) {

    console.log('changeAttemptState to ' + state + " from " + systemState.attemptState + " by " + source);

    if (state == true && systemState.attemptState == false) {
        beginCheck();

        changePreExamState(false, "changeAttemptState");
        

        illegalExtensionCheck();
    }

    if (state == false && systemState.attemptState == true)  {
        endCheck();        
    }
    

    systemState.attemptState = state;
}

var GLOBAL_preexamtab = -1;
var GLOBAL_preexamtimer = null;
const changePreExamState = function(state, source) {

    console.log("changing preexam state: ", state, source);

    if (state == true && systemState.preExamStarted == false) {
        console.log("creating preexam page");
        chrome.tabs.create({ url: chrome.runtime.getURL('preexam.html'), active: true }, function(tab) {            
            GLOBAL_preexamtab = tab.id;
            systemState.currentTabSet = tab.id;

            GLOBAL_preexamtimer = setInterval(function() { holdPreexam(); }, 150); 
        });    
    }

    if (state == false && systemState.preExamStarted == true)  {        
        

        setTimeout(function() {clearInterval(GLOBAL_preexamtimer);chrome.tabs.remove(GLOBAL_preexamtab);}, 2000);
        
    }

    systemState.preExamStartedSet = state;
}

const holdPreexam = function() {
    console.log("Holding preexam");
    chrome.tabs.update(GLOBAL_preexamtab, {active: true});
}


const deploydrm = function() {
    //console.log("deploydrm");
    
    if (!systemState.drmDisabled && systemState.drmTabId == -1) {

        chrome.tabs.create({ url: GLOBAL_drm, active: true }, function(tab) {            
            systemState.drmTabIdSet = tab.id;
        });        
        
        
    }
    
    
}



const drmActive = function() {
    

    setTimeout(function() {tabUpdateShow(systemState.drmTabId);}, 50);

    console.log("DRM shift to exam");
    setTimeout(function() {tabUpdateShow(systemState.examTabId);}, 500);

    setTimeout(function() {chrome.windows.create({ tabId: systemState.drmTabId, focused: false} );}, 500);
}

const clearCanvas = function (details) {

    if (details.url.indexOf("take") == -1 && details.url.indexOf("viewing") == -1 && details.url.indexOf("refresh_ldb") == -1 
        && details.url.indexOf("lockdown_browser_required") == -1) {
         

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            var url = tabs[0].url;
            var domain = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
            var domainurl = { url: domain };

            //console.log("clearCanvas " + domain + " from " + details.url);

            const deadcookies = ['rldbrv', 'rldbcv'];

            
            chrome.cookies.getAll(domainurl, function(cookies) {

                if (cookies && cookies.length > 0) {
                    for (const cookie of cookies) {

                        if ( deadcookies.includes(cookie.name) ) {
                            //console.log('removing cookie ' + cookie.name);
                            chrome.cookies.remove({name: cookie.name, url: domain});
                        }
                                        
                    }         
                }

                
                   

                
            });



        });
    } else {
        console.log("Did not clear cookies");
    }

}

const clearAll = function () {

    logToWindow("clearAll");

const deadcookies = ['rldbci', 'rldbsi', 'rldbcv', 'rldbrv', 'canvas_session', '_legacy_normandy_session', '_MS'];

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {

        var url = tabs[0].url;

        var domain = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];


        var details = { url: domain };

        chrome.cookies.getAll(details, function(cookies) {

            //console.log(cookies);

            var removelist = "";
            for (const cookie of cookies) {

                // Oct21 T/SS requested all cleared
                //console.log('removing cookie ' + cookie.name);
                removelist = removelist + cookie.name + ",";
                chrome.cookies.remove({ name: cookie.name, url: domain });

                /*
                if ( deadcookies.includes(cookie.name) ) {
                    console.log('removing cookie ' + cookie.name);
                    chrome.cookies.remove({name: cookie.name, url: domain});
                }
                */
            }

            chrome.runtime.sendMessage( '', {
                type: 'notification',
                message: "Cookies have been cleared: " + removelist
              });

            
        });

    });

}

const autoSaveDetectCanvasOld = function(details) {
    console.log("autsave detected///");
}

const injectFaq = function (details) {

    //console.log("injectFaq");

    chrome.scripting.executeScript( {
              target: {tabId: details.tabId},
              files: ["jquery-3.4.1.min.js", "protectwindow.js", "js/inject/faqbutton.js"]
            }, function(e) {
                //console.log('done injecting faq');
            });

}



// DELETE?
async function canvasFailOnRequired(details) {
    console.log("lockdown_browser_required 2");
    console.log(details);

   }

const canvasFailOnRequired2 = async function (details) {

    //console.log("lockdown_browser_required 3");

    logToWindow("canvasFailOnRequired");
       
    
        await chrome.cookies.get({
            name: "rldbcv",
            url: details.url
        }, function(cookie) {
            
            //console.log(cookie);

            if (cookie!= null) {
                // something has gone wrong try to recover
                //chrome.tabs.goBack(details.tabId); 
                //findHandshakeCanvas(details);

                systemState.processing = 'canvas';

                var chalval = cookie.value;

                
                var outurl = chrome.runtime.getURL('security_b.html');
                outurl = outurl + "?a=" + authorName + "&c=" + chalval + "&s" + systemState.sequenceSid;

                const takeactive = !systemState.preExamStarted;
                chrome.tabs.create({ index: 0, url: outurl, active: takeactive }, function(tab) {
                    mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN          
                });

                }
        });
    

    /*
        chrome.cookies.remove({
                "name": "_legacy_normandy_session",
                "url": details.url
            }, function(cookie) { 
                console.log("clearBaseSettings _legacy_normandy_session"); 
                chrome.tabs.goBack(details.tabId); 

               
                
            });
            */

}

const clearBaseSettings = function (details) {

    logToWindow("clearBaseSettings");


    //console.log("clearBaseSettings " + details.url);

    var headers = details.requestHeaders;
    var domain = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

    var challenge = null;
    for (var i = 0; i < headers.length; i++) {
        if (headers[i].name == 'Cookie') {

            //console.log(headers[i].value);

            var cookArray = headers[i].value.split(";");

            var newheaders = "";
            for (var j = 0; j < cookArray.length; j++) {
                var pos = cookArray[j].indexOf("rldbci");
                var pos2 = cookArray[j].indexOf("rldbrv");
                var pos3 = cookArray[j].indexOf("rldbcv");
                var pos4 = cookArray[j].indexOf("rldbsi");
                var pos5 = cookArray[j].indexOf("_MS");


                if (pos == -1 && pos2 == -1 && pos3 == -1 && pos4 == -1 && pos5 == -1) {
                    newheaders = newheaders + cookArray[j] + ";";
                } else {
                    //console.log("blocking " + cookArray[j]);
                }
            } // end for

            //console.log(newheaders);
            //headers[i].value = newheaders;

        }
    }

    if (systemState.examStarted == false) {

//console.log("removing from domain = " + domain);

        if (details.url.indexOf("assessment") != -1 || details.url.indexOf("courses") != -1) {
            chrome.cookies.remove({
                "name": "rldbci",
                "url": domain
            }, function(cookie) { //console.log("clearBaseSettings rldbci"); 
            });
        }

        
       /*
        chrome.cookies.remove({
            "name": "rldbrv",
            "url": domain
        }, function(cookie) { console.log("clearBaseSettings rldbrv"); });

        chrome.cookies.remove({
            "name": "rldbcv",
            "url": domain
        }, function(cookie) { console.log("clearBaseSettings rldbrv"); });


            */


        chrome.cookies.remove({
            "name": "_MS",
            "url": domain
        }, function(cookie) { //console.log("clearBaseSettings MS"); 
        });
    }

    //console.log(headers);
    return { requestHeaders: headers };


}


const setupBaseSettings = function (details) {

    //console.log("setupBaseSettings");

    logToWindow("setupBaseSettings");

    systemState.reviewModeSet = false; // end review mode

    var domain = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

    chrome.contentSettings.popups.set({
        primaryPattern: domain + "/*",
        setting: "allow"
    });

    if (GLOBAL_resumetime != null) {
        clearTimeout(GLOBAL_resumetime);
        GLOBAL_resumetime = null;
    }


    var domain = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

    systemState.domainSet = domain;

    // Canvas
    if (details.url.indexOf("quizzes") != -1) {
        chrome.cookies.set({
            "name": "LDB",
            "url": domain,
            "value": "1"
        }, function(cookie) {});
    }

    

    // D2L
    if (details.url.indexOf("quiz_summary") != -1) {
        chrome.cookies.remove({
            "name": "rldbrv",
            "url": domain
        }, function(cookie) {});
    }

    

    // Schoology
    if (details.url.indexOf("assessment") != -1 || details.url.indexOf("materials") != -1) {

        chrome.cookies.set({
            "name": "cbLDB",
            "url": domain,
            "value": "1"
        }, function(cookie) {});

        if (details.url.indexOf("materials") != -1) {
            chrome.cookies.remove({
                "name": "rldbrv",
                "url": domain
            }, function(cookie) {});

            chrome.cookies.remove({
                "name": "rldbci",
                "url": domain
            }, function(cookie) {});
        }

    }

    // ALL
    chrome.cookies.set({
        "name": "cbLDBex",
        "url": domain,
        "value": "1"
    }, function(cookie) {});


    // ending exam
    if (details.url.indexOf("rldbqn=1") != -1) {
        cleanupSecondaryTabs();
    }

}

// --------------------------------------------------------------------------------------------------------

const canvasFilterCallbackQuiz = function (details) {

    logToWindow("canvasFilterCallbackQuiz");

    
    

    systemState.cookieUrlSet = details.url;
    systemState.handshakeUrlSet = details.url;

    if (!GLOBAL_loadingJson) {
        GLOBAL_loadingJson = true; // prevent reading the JSON causing another loop

        systemState.examTabSet = details.tabId;

        fetch(details.url)
                .then(response => response.text())
                .then(data => {let dataObj = JSON.parse(data); canvasJsonExtract(dataObj.rldbLink, details.url);})
                .catch(error => console.log("error", error))        
    }

    messageout = { cancel: false };

    return messageout;

}

const canvasJsonExtract = function (teststring, url) {

    logToWindow("canvasJsonExtract");

    

    var matchresult = url.match(/courses\/(\d+)\/assignments\/(\d+).json/i);
    var course = matchresult[1];
    var exam = matchresult[2];
    exam = exam + "_QN";

    var server = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    var index = teststring.substring(5, 7);

    

    extractAutoLaunchCanvas(teststring);
}

var GLOBAL_canvas_reload = null;

const canvasTooLongLoad = function() {    
    GLOBAL_canvas_reload = null;
    setTimeout(function(){ chrome.tabs.reload(systemState.examTabSet); }, 500); 
}

const finalLoadQuizClassic = function (details) {

    logToWindow("finalLoadQuizClassic");

    if (GLOBAL_canvas_reload != null) {
        clearTimeout(GLOBAL_canvas_reload);
        GLOBAL_canvas_reload = null;
    }

    console.log("finalLoadQuizClassic reloading");

    chrome.webRequest.onCompleted.removeListener(finalLoadQuizClassic);

    // page completed loading
    setTimeout(function(){ chrome.tabs.reload(details.tabId); }, 500); 

}

const canvasQuizStarted = function (details) {
    //console.log("Canvas quiz has started");
    //console.log(GLOBAL_canvas_start_interval);

    if (GLOBAL_canvas_start_interval != null) {
        //console.log("clearing interval");

        clearInterval(GLOBAL_canvas_start_interval);
        GLOBAL_canvas_start_interval = null;     
    }

}

const findHandshakeQuizCanvas = function (details) {

    logToWindow("findHandshakeQuizCanvas");

    //console.log("findHandshakeQuizCanvas");

    systemState.handshakeTabIdSet = details.tabId;


    // challenge in the url
    var pos = details.url.indexOf("rldbcv");
    if (pos != -1) {
        systemState.processing = 'canvas';

        var chalval = details.url.substring(pos + 7);

        var outurl = chrome.runtime.getURL('security_b.html');
        outurl = outurl + "?a=" + authorName + "&c=" + chalval + "&s" + systemState.sequenceSid;



        logToLocalStorage("creating tab: " + outurl);

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            var activetab = tabs[0].id;

            const takeactive = !systemState.preExamStarted;
            chrome.tabs.create({ index: 0, url: outurl, active: takeactive }, function(tab) {
                mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN          
            });
        });

    }
}

const resetCanvasEnv = function (details) {

    logToWindow("resetCanvasEnv");

       // console.log("resetCanvasEnv");

    var url = details.url;
    var pos = url.indexOf("quizzes/");
    var part = url.substring(pos + 8);
    var pos2 = part.indexOf("/");

    var pos3 = url.indexOf("take");



    if (pos2 == -1 && pos3 == -1) {

        var domain = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

        chrome.cookies.remove({
            "name": "rldbrv",
            "url": domain
        }, function(cookie) {

            GLOBAL_rvector_ready = false;
        });

        chrome.cookies.remove({
            "name": "rldbcv",
            "url": domain
        }, function(cookie) {

            GLOBAL_rvector_ready = false;
        });

        // close any webcams
        // at end of exams it comes back to here
        if (systemState.monitorRunning == false) {

            chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
                if (tabs.length > 0) {
                    var activetab = tabs[0].id;

                }
            });
        }


        // reset exam
        changeExamState(false, "resetCanvasEnv");
        

    }

}

const findHandshakeCanvasPrep = async function (details) {

    logToWindow("findHandshakeCanvasPrep");

    //console.log("review mode: " + systemState.canvasReviewMode);

    // check if they are coming from review mode    
    if (systemState.canvasReviewMode === true) {
        systemState.currentTabSet = systemState.examTabId;
        var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode;
        tabUpdateWithUrl(systemState.examTabId, outurl);

    } else {

        var headers = details.requestHeaders;
        var domain = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

        // set the exit
        systemState.restartUrlSet = domain;

        var challenge = null;
        for (var i = 0; i < headers.length; i++) {
            if (headers[i].name == 'Cookie') {

                let pos = headers[i].value.indexOf("rldbcv");
                if (pos != -1) {


                    let part = headers[i].value.substring(pos);
                    let pos2 = part.indexOf(";");
                    challenge = part.substring(7, pos2);

                    //console.log("FOUND RLDBCV " + challenge);

                }

            }
        }

        chrome.cookies.set({
            "name": "rldbci",
            "url": domain,
            "value": "1"
        }, function(cookie) {

        });

        //await findHandshakeCanvas(details);

        //findHandshakeCanvasDirect(challenge, details);

        //console.log("findHandshakeCanvasPrep");
        //console.log(details);

        /*
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            var activetab = tabs[0].id;
            setupTabManagementSingle(activetab, 'Canvas2');
        });
        */

    }

}

const findHandshakeCanvasReview = async function (details) {
    await findHandshakeCanvas(details);
}

const findHandshakeCanvasCheck = function (details) {

    findHandshakeCanvas(details);

}

const findHandshakeCanvasInner = async function (tabIdIn, tabUrlIn, resetChallenge) {

    logToWindow("findHandshakeCanvaInner");

    //console.log("findHandshakeCanvasInner");

    if (resetChallenge) {
        systemState.lmsChallengeSet = "";
    }
    

    systemState.examTabSet = tabIdIn;
    

    await chrome.cookies.get({
        name: "rldbcv",
        url: tabUrlIn
    }, function(cookie) {

        //console.log("rldbcv cookie");
        //.log(cookie);

        if (cookie != null && cookie.value != null) {

            //console.log(cookie);

            systemState.processing = 'canvas';

            systemState.startingTabSet = tabIdIn;

            //console.log("checking cookie " + cookie.value + " compared to " + systemState.lmsChallenge);
            logToWindow("checking cookie " + cookie.value + " compared to " + systemState.lmsChallenge);

             if (cookie.value != systemState.lmsChallenge) {
             //if (true) {

                //systemState.reset();

                // console.log("new cookie ");
                systemState.lmsChallengeSet = cookie.value;
                systemState.handshakeTabIdSet = tabIdIn;

                systemState.cookieUrlSet = tabUrlIn;

                //pre exam mode                
                //changePreExamState(true, "findHandshakeCanvasInner");
                

                var outurl = chrome.runtime.getURL('security_b.html');
                outurl = outurl + "?a=" + authorName + "&c=" + cookie.value + "&s=" + systemState.sequenceSid;

                var domain = tabUrlIn.substring(0, tabUrlIn.indexOf("//") + 2) + tabUrlIn.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

                systemState.domainSet = domain;
                systemState.restartUrlSet = domain;

                GLOBAL_rvector_ready = true;
                systemState.canvasExamModeSet = 'QOriginal';

                logToLocalStorage("creating tab2: " + outurl);

                systemState.handshakeTabIdSet = tabIdIn;



                var pos = tabUrlIn.indexOf("target_url=");                
                if (pos != -1) {

                    
                    var tarurl = tabUrlIn.substring(pos + 11);
                    

                    var domain = tabUrlIn.substring(0, tabUrlIn.indexOf("//") + 2) + tabUrlIn.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
                    

                    

                    systemState.handshakeUrlSet = domain + decodeURIComponent(tarurl);

                    
                } else {
                    if (tabUrlIn.indexOf("viewing") != -1) {
                        systemState.handshakeUrlSet = tabUrlIn;
                    } else {
                        systemState.handshakeUrlSet = systemState.canvasreviewurl;
                    }

                }

                console.log("handshake is " + systemState.handshakeUrl);

                 console.log("creating " + outurl);


                 if (systemState.handshakeUrl.indexOf("viewing=1") != -1) {
                     moveTabsToCurrentWindow();

                     chrome.tabs.query({}, function(tabs) {
                         var displayflags = {
                        singleUnified: true
                    };

                         chrome.system.display.getInfo(displayflags, function(displayinfo) {

                            const dispmode = displayinfo.length > GLOBAL_base_displays;

                            var validtabs = GLOBAL_base_tabs;
                            var currentTabs = tabs.length;
                            var tablist = "<li>LockDown Browser for Chromebook (this tab)</li>";
                            var tablistextra = "";
                            var extracount = 0;

                            for (var i = 0; i < tabs.length; ++i) {
                                //console.log("checking tab " + i);
                                if (tabs[i].url.indexOf(chrome.runtime.id) != -1 || tabs[i].title.indexOf("Files") == 0 || tabs[i].title.indexOf("Settings") == 0 || tabs[i].url.indexOf(GLOBAL_drm) != -1) {
                                    currentTabs--;
                                } else {

                                    if (tabs[i].id != systemState.examTabId) {
                                        if (i<11) {
                                            tablist = tablist + "<li>" + tabs[i].title + "</li>";
                                        } else {
                                            tablistextra = tablistextra + "<li>" + tabs[i].title + "</li>";
                                            extracount++;
                                        }
                                    }
                                    

                                    const url = tabs[i].url;
                                    var domain = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

                                    //console.log("domain = " + domain);

                                    

                                } // end else

                            } // end for 

                            const tabmode = currentTabs > validtabs;
                            if ( tabmode || dispmode ) {
                                var domain = tabUrlIn.substring(0, tabUrlIn.indexOf("//") + 2) + tabUrlIn.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];                                      
                                mytabsupdate(systemState.handshakeTabId, {url: domain}, function(tab) {
                                    chrome.tabs.reload(tab.id);
                                });

                                //systemState.fullreset();
                                //tabCloseCleanup();
                                resetExamInfo();

                                
                                var details = { url: domain };
                                chrome.cookies.getAll(details, function(cookies) {                                              
                                    for (const cookie of cookies) {
                                        chrome.cookies.remove({ name: cookie.name, url: domain });                            
                                    }
                                });

                                 var errorouturl = chrome.runtime.getURL('closetabserror.html') + "?list=" + encodeURIComponent(tablist) 
                                     + "&exlist=" + encodeURIComponent(tablistextra) + "&excount=" + extracount + "&cmode=true" +
                                     "&tmode=" + tabmode + "&dmode=" + dispmode;

                                 
                                 chrome.tabs.create({ url: errorouturl, active: true }, function(tab){
                                    console.log('normal3');
                                     mywindowsupdate(tab.windowId, { state: "normal" });

                                 });

                             } else {

                                 // review mode
                                 systemState.canvaseReviewModeSet = true;
                                 outurl = outurl + "&review=true";
                                 

                                const takeactive = !systemState.preExamStarted; 
                                chrome.tabs.create({ index: 0, url: outurl, active: takeactive }, function(tab) {
                                    

                                    mywindowsupdate(tab.windowId, { state: "normal" }); //NORMAL
                                    mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN           

                                });

                             }

                         
                          });

                    });
                 } else {
                     //console.log("opening non viewing " + outurl);

                    
                     const takeactive = !systemState.preExamStarted; 
                    chrome.tabs.create({ index: 0, url: outurl, active: takeactive }, function(tab) {

                        console.log('normal5');

                        mywindowsupdate(tab.windowId, { state: "normal" }); //NORMAL
                        mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN           

                    });
                 }

                




            }



        }

    });

}

const findHandshakeCanvas = async function (details) {
    findHandshakeCanvasInner(details.tabId, details.url, false);
    }

const findHandshakeCanvas2 = async function (details) {

    logToWindow("findHandshakeCanvas");

    //console.log("findHandshakeCanvas");
    //console.log(details);

    systemState.examTabSet = details.tabId;

    await chrome.cookies.get({
        name: "rldbcv",
        url: details.url
    }, function(cookie) {

        //console.log("rldbcv cookie");
        //console.log(cookie);

        if (cookie != null && cookie.value != null) {

            //console.log(cookie);

            systemState.processing = 'canvas';

            systemState.startingTabSet = details.tabId;

            //console.log("checking cookie " + cookie.value + " compared to " + systemState.lmsChallenge);
            logToWindow("checking cookie " + cookie.value + " compared to " + systemState.lmsChallenge);

             if (cookie.value != systemState.lmsChallenge) {
             //if (true) {

                //systemState.reset();

                // console.log("new cookie ");
                systemState.lmsChallengeSet = cookie.value;
                systemState.handshakeTabIdSet = details.tabId;

                systemState.cookieUrlSet = details.url;

                var outurl = chrome.runtime.getURL('security_b.html');
                outurl = outurl + "?a=" + authorName + "&c=" + cookie.value + "&s=" + systemState.sequenceSid;

                var domain = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

                systemState.domainSet = domain;
                GLOBAL_rvector_ready = true;
                systemState.canvasExamModeSet = 'QOriginal';

                logToLocalStorage("creating tab2: " + outurl);

                systemState.handshakeTabIdSet = details.tabId;
                var pos = details.url.indexOf("target_url=");
                logToWindow("findHandshakeCanvas checking for target_url " + pos);
                logToWindow("findHandshakeCanvas inside " + details.url);
                if (pos != -1) {


                    logToWindow("pos is not -1");
                    var tarurl = details.url.substring(pos + 11);
                    logToWindow("tarurl = " + tarurl);

                    var domain = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
                    logToWindow("domain = " + domain);    

                    logToWindow("setting hardshakeUrl to: " + "domain: " + domain + " and " + tarurl);

                    systemState.handshakeUrlSet = domain + decodeURIComponent(tarurl);

                    logToWindow("hardshakeUrl = " + systemState.handshakeUrl);
                }

                 //console.log("creating " + outurl);

                const takeactive = ! systemState.preExamStarted;
                chrome.tabs.create({ index: 0, url: outurl, active: takeactive }, function(tab) {

                    console.log('normal6');

                    mywindowsupdate(tab.windowId, { state: "normal" }); //NORMAL
                    mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN           

                });




            }



        }

    });

}

const canvasReviewLoadComplete = function (details) {

    logToWindow("canvasReviewLoadComplete");

    //console.log("canvasReviewLoadComplete processing:" + systemState.processing + " exam: " + systemState.examStarted);
    //console.log(details);

    
}





// ---------------------------------------------------------------------------------------------------------------

const findHandshakeSchoology = function (details) {

    logToWindow("findHandshakeSchoology");


    // challenge in the url
    var pos = details.url.indexOf("rldbcv");
    if (pos != -1) {
        systemState.processing = 'schoology';
        
        
        systemState.cookieUrlSet = details.url;

        var chalval = details.url.substring(pos + 7);

        var outurl = chrome.runtime.getURL('security_b.html');
        outurl = outurl + "?a=" + authorName + "&c=" + chalval + "&s=" + systemState.sequenceSid;

        const takeactive = !systemState.preExamStarted; 
        chrome.tabs.create({ index: 0, url: outurl, active: takeactive }, function(tab) {
            console.log('normal7');
            mywindowsupdate(tab.windowId, { state: "normal" }); //NORMAL
            mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN          
        });

    }
}


// ---------------------------------------------------------------------------------------------------

const schoologyViewAssessment = function (details) {
    // schoology is in review

    console.log("schoologyViewAssessment " + systemState.examStarted + "process: " + systemState.processing);

    if (GLOBAL_schoology_security != -1) {
        removeTab(GLOBAL_schoology_security, "schoologyViewAssessment security");
        GLOBAL_schoology_security = -1;
    }

    if (systemState.examStarted == true || systemState.attemptStarted == true) {
        changeAttemptState(true, "schoologyViewAssessment2");   // 7648
    }

    //if (systemState.examStarted == true) {
         
    //} 
    if (systemState.inProcessingState('schoology')) {
        changeAttemptState(true, "schoologyViewAssessment1"); 
        
        setupTabManagementSingle(details.tabId, 'Schoology');                 
    } 

    
    


      
}

const schoologyViewAssessmentComplete = function (details) {
    var serverin = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    
    chrome.cookies.remove({
        "name": "rldbrv",
        "url": serverin
    }, function(cookie) {
    }); 

    chrome.cookies.remove({
        "name": "rldbcv",
        "url": serverin
    }, function(cookie) {
    }); 

   
    /*
    chrome.cookies.remove({
        "name": "rldbsi",
        "url": serverin
    }, function(cookie) {
    }); 
    */
}

const exitExamSchoology = function (details) {

    logToWindow("exitExamSchoology");

    

    var messageout = { redirectUrl: chrome.runtime.getURL('examend.html') };

    const currenturl = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    
                        

//console.log("current=" + currenturl);

    chrome.cookies.getAll({ url: currenturl }, function(cookies) {   
        //console.log(cookies);                                           
        for (const cookie of cookies) {
            //console.log("removing " + cookie.name + " in " + currenturl);
            if (cookie.name.indexOf("rldb") == 0) {
                chrome.cookies.remove({ name: cookie.name, url: currenturl }); 
            }
            
        }
    });

    //cleanupSecondaryTabs();

    //cleanupEndExam();

    systemState.examTabSet = details.tabId;

    var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode;

    console.log("updating with exam exit " + details.tabId + " url: " + outurl);
    tabUpdateWithUrl(details.tabId, outurl);

    //return messageout;
}

// ---------------------------------------------------------------------------------------------------

const findHandshakeD2LRetry = function (tabId, url) {

    console.log("d2l retry " + systemState.susReady);

    if (systemState.susReady == true) {   
        findHandshakeD2LInner(tabId, url);
    } else {
        setTimeout(function() { findHandshakeD2LRetry(tabId, url); }, 1000);
    }
}

const findHandshakeD2LInner = function (tabId, url) {
    console.log("d2l inner ");
    chrome.cookies.get({
            name: "rldbcv",
            url: url
        }, function(cookie) {

            console.log("findHandshakeD2L cookie");
            console.log(cookie);


            if (cookie != null && cookie.value != null) {

                

                systemState.d2lExamModeSet = "secure_a";

                //console.log("Set exam tab " + tabId);
                systemState.examTabSet = tabId;

                systemState.cookieUrlSet = url;

                var outurl = chrome.runtime.getURL('security_b.html');
                outurl = outurl + "?a=" + authorName + "&c=" + cookie.value + "&s=" + systemState.sequenceSid;

                console.log("calling sec b");

                const takeactive = !systemState.preExamStarted; 
                chrome.tabs.create({ index: 0, url: outurl, active: takeactive }, function(tab) {
                    console.log('normal8');
                    mywindowsupdate(tab.windowId, { state: "normal" }); //NORMAL
                    mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN           
                });
            }

        });
}


const findHandshakeD2L = function (details) {

    logToWindow("findHandshakeD2L");

    console.log("findHandshakeD2L sus=" + systemState.susReady);
    console.log(details);

    chrome.windows.getCurrent(null, function(window) {
        console.log('normal9');
        //mywindowsupdate(window.id, { state: "normal" }); //NORMAL
        mywindowsupdate(window.id, { state: GLOBAL_screen }); //FULLSCREEN
        changeExamWindow(window.id, "findhandshaked2l");
    });

    var domain = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    chrome.contentSettings.popups.set({
        primaryPattern: domain + "/*",
        setting: "allow"
    });

    systemState.processing = 'd2l';

    // check SuS
    findHandshakeD2LRetry(details.tabId, details.url);    
}

const d2lExamSubmitted = function (details) {

    logToWindow("d2lExamSubmitted");

    //console.log("EXAMSUBMITTED..." + systemState.examStarted);

    //exam is complete notify the webcam
    notifyWebcam(true);
}

// ------------------------------------------------------------------------------------------------------------------



const findHandshakeBbUltra = function (details) {    

    //console.log("findHandshakeBbUltra");
    //console.log(details.url);

    logToWindow("findHandshakeBbUltra");




    var outmessage = { cancel: false };
    var pos = details.url.indexOf("rldbcv");
    if (pos != -1) {
        //GLOBAL_blackboard_processing = true;

        systemState.processing = 'ultra';


        systemState.cookieUrlSet = details.url;

        var chalval = details.url.substring(pos + 7);

        //console.log("Found chalval: " + chalval);

        if (chalval != systemState.lmsChallenge) {

            systemState.lmsChallengeSet = chalval;

            //console.log("Calling securityB " );

            var outurl = chrome.runtime.getURL('security_b.html');
            outurl = outurl + "?a=" + authorName + "&c=" + chalval + "&s=" + systemState.sequenceSid;
            systemState.resumeUrl2Set = details.url;

           
            tabUpdateWithUrl(details.tabId, outurl);

            
        }
    
    }

    //return {cancel: false};
    return outmessage;
}


const hideBlackboardElementsCheck = function (url) {

    hideBlackboardElements(url);

    if (systemState.drmDisabled == false) {
        //console.log("deploying drm");
        deploydrm();
    }
}


const hideBlackboardElements = function (url) {

    logToWindow("hideBlackboardElements");

    //GLOBAL_blackboard_processing = true;

    systemState.processing = 'blackboard';

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activetab = tabs[0].id;

        // move to the first position
        chrome.tabs.move(tabs[0].id, { index: 0 }, function(tab) {});

        GLOBAL_complete_activeTab = activetab;
        //systemState.examTabSet = activetab;

        systemState.examTabSet = activetab;

        GLOBAL_complete_url = url;
        systemState.restartUrlSet = url;

        // go full screen
        chrome.windows.getCurrent(function(browser) {
            console.log('normal10');
            mywindowsupdate(browser.id, { state: "normal" });
            mywindowsupdate(browser.id, { state: GLOBAL_screen });
            changeExamWindow(browser.id, "hideblackboardelement");

            setupBlackboardTabManagement(activetab, null);

            

            var serverin = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

            var course = param(url, 'course_id');
            var exam = param(url, 'content_id');

            var parameters = "courseid=" + course + "&examid=" + exam + "&server=" + serverin;
            var outurl = 'blackboard_start.html?' + parameters;

            chrome.tabs.create({ windowId: browser.id, index: 0, active: true, url: outurl }, function(tab) {
                GLOBAL_complete_overlayTab = tab.id;
                GLOBAL_complete_activeTab = activetab;

                systemState.currentTabSet = tab.id;
                console.log("updating " + tab.id + " for blackboard start");
                tabUpdateShow(tab.id);

                setTimeout(function() {tabUpdateShow(tab.id);}, 200);
                setTimeout(function() {tabUpdateShow(tab.id);}, 300);
                setTimeout(function() {tabUpdateShow(tab.id);}, 400);

                
            });
        });
    });

}

const blackboard_list_callback = function (details) {

    logToWindow("blackboard_list_callback exam:" + systemState.examState + " attempt: " + systemState.attemptState + " unsecure: " + systemState.unsecured);


    // if we see the list of exams and we are already in exam mode we must be done

    if ( (systemState.examState || systemState.attemptState) && systemState.unsecured == false ) {


        systemState.processing = 'none';
        //GLOBAL_blackboard_processing = false;
              
        changeExamState(false, "blackboard_list_callback");
        
        //changeAttemptState(false, "blackboard_list_callback");

        

        GLOBAL_complete_activeTab = -1;
        GLOBAL_complete_url = "";
        GLOBAL_complete_overlayTab = -1;

        systemState.examTabSet = details.tabId;
        var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode;

        //chrome.tabs.update(details.tabId, {url: details.tabId, active: true });

        tabUpdateWithUrl(details.tabId, outurl);
              

        var messageout = { redirectUrl: outurl };
        return messageout;
    }



}

const blackboard_submitted_callback = function (details) {

    logToWindow("blackboard_submitted_callback");


    //exam is complete notify the webcam
    notifyWebcam(true);
}

const blackboard_review_callback = function (details) {


    if (systemState.examStarted == false && systemState.attemptStarted == false) {

        moveTabsToCurrentWindow();

    chrome.tabs.query({}, function(tabs) {
        
        var validtabs = GLOBAL_base_tabs;
        var currentTabs = tabs.length;
        var commonDomain = "";

        // remove our tabs
        for (var i = 0; i < tabs.length; ++i) {
            //console.log(tabs[i].url);
            if (tabs[i].url.indexOf(chrome.runtime.id) != -1 || tabs[i].title.indexOf("Files") == 0 || tabs[i].title.indexOf("Settings") == 0 || tabs[i].url.indexOf(GLOBAL_drm) != -1)  {
                currentTabs--;
            }
        }

        // one extra for Bb
        validtabs++;

               

        console.log("-----> validtabsBb = " + validtabs + " vs " + currentTabs + " examstarted" + systemState.examStarted + "attemptStarted" + systemState.attemptStarted);
        
        
            if (currentTabs <= validtabs) {

                systemState.validresumeSet = 1;
                                
                // this is exam submissions not an exam
                 blackboard_review_callbackValid(details);
            } else {
                systemState.validresumeSet = 2;

                //console.log("closetabs7");
                var outurl = chrome.runtime.getURL('closetabserror.html');
                chrome.tabs.create({ url: outurl, active: true }, function(tab){
                    console.log('normal11');
                    mywindowsupdate(tab.windowId, { state: "normal" });

                    
                                
                    tabCloseCleanup();
                    resetExamInfo();
                    
                    

                });                
                
            }
        

    });
} else {
            
            systemState.validresumeSet = 1;
            // this is exam submissions not an exam
             blackboard_review_callbackValid(details);
        }
    



   
}

const blackboard_review_callbackValid = function (details) {
    var url = details.url;
    GLOBAL_complete_url = url;

    


    // NEW SECTION
    console.log("reviewmode: " + systemState.reviewMode +  "exam: " + systemState.examStarted);
    if (systemState.reviewMode == false && systemState.examStarted == false) {

        systemState.examTabSet = details.tabId;

        systemState.reviewModeSet = true;
    
        var serverin = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

        var course = param(url, 'course_id');
        var exam = param(url, 'content_id');

        var parameters = "courseid=" + course + "&examid=" + exam + "&server=" + serverin;
        var outurl = 'blackboard_startreview.html?' + parameters;

        chrome.tabs.create({ index: 0, active: true, url: outurl }, function(tab) {
            GLOBAL_complete_overlayTab = tab.id;    
            
        });
    } else if (systemState.reviewMode == false) {
        systemState.reviewModeSet = true;
        GLOBAL_complete_url = details.url;
        console.log("REVIEW URL " + GLOBAL_complete_url);
        blackboard_review_callbackValidStep2();
    }

}


const blackboard_review_callbackValidStep2 = function () {

    logToWindow("blackboard_review_callbackstep2-->valid");


    //console.log("blackboard_review_callback" + systemState.unsecured + ", " + systemState.attemptStarted);
    systemState.unsecuredSet = false;
    

    /*
    var url = details.url;
    GLOBAL_complete_url = url;


    // NEW SECTION
    console.log("reviewmode: " + systemState.reviewMode);
    if (systemState.reviewMode == false) {

        systemState.reviewModeSet = true;
    
        var serverin = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

        var course = param(url, 'course_id');
        var exam = param(url, 'content_id');

        var parameters = "courseid=" + course + "&examid=" + exam + "&server=" + serverin;
        var outurl = 'blackboard_startreview.html?' + parameters;

        chrome.tabs.create({ index: 0, active: true, url: outurl }, function(tab) {
            GLOBAL_complete_overlayTab = tab.id;    
            
        });
        */
        
        

        
        //exam complete time to blackboard_review_callback
        changeExamState(false, "blackboard_review_callbackValid");
        
        
        console.log("Exam is unsecured? " + systemState.unsecured);
        console.log("Attempt " + systemState.attemptStarted);

        const url = GLOBAL_complete_url;


        if (systemState.unsecured == false) {

            

                changeAttemptState(true, "blackboard_review_callback");     

                
                cleanupSecondaryTabs();


                chrome.windows.getCurrent(null, function(window) {
                    
                    mywindowsupdate(window.id, { state: GLOBAL_screen }); //FULLSCREEN
                    changeExamWindow(window.id, "blackboardreviewcall");
                });


                
                var domain = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

                var attempt_id = param(url, "attempt_id");
                var course_id = param(url, "course_id");
                var content_id = param(url, "course_id");

                systemState.restartUrlSet = domain;


                var instring = 'attempt_id=' + attempt_id + '&course_id=' + course_id + '&Q9c48ntZrPs';
                var md5string = hex_md5(instring);

                //console.log(instring);

                chrome.cookies.set({
                    "name": "_MS",
                    "url": domain,
                    "value": md5string
                }, function(cookie) {
                    tabUpdateWithUrl(systemState.examTabId, url);
                    
                });

                chrome.cookies.set({
                    "name": "LDB",
                    "url": domain,
                    "value": "1"
                }, function(cookie) {

                });

                //setTimeout(function(){ chrome.tabs.reload(details.tabId); }, 500); 
                //systemState.examTabSet = details.tabId;
            

        } else {
            tabUpdateWithUrl(systemState.examTabId, url);
        }
            
    
    

}

var GLOBAL_bbpass = "";
var GLOBAL_complete_activeTab = 0;
var GLOBAL_complete_url = "";
var GLOBAL_complete_overlayTab = 0;

const getBlackboardProfileReview = function (incoming) {
    logToWindow("getBlackboardProfile");


    var entry = "3487HJKHD932JKHDHF187JH";

    //alert({html:"profile successful"});

    var pos = incoming.indexOf("::");
    var incomingRemain = incoming.substring(pos + 2);

    var binary_string = atob(incomingRemain);

    var bf = new Blowfish(entry, "ecb");
    var decrypted = bf.decrypt(binary_string);

    var obj = JSON.parse(decrypted);

    console.log("BB PROFILE REVIEW -----------------------------------------------------------------------------------");
    console.log(obj);
    console.log("BB PROFILE END -----------------------------------------------------------------------------------");

    systemState.restartUrlSet = obj.profileurl;
    systemState.unsecuredSet = !obj.ldbenabled;

    

    console.log("setting unsecured " + systemState.unsecured + "ldbenabled: " + obj.ldbenabled);

    removeTab(GLOBAL_complete_overlayTab, "getBlackboardProfileReview");
    if (obj.extension_enabled && obj.ldbenabled) {
        changeAttemptState(true, "bbprofile-review");

        blackboard_review_callbackValidStep2();
    }






    


}

const getBlackboardProfile = function (incoming) {

    logToWindow("getBlackboardProfile");


    var entry = "3487HJKHD932JKHDHF187JH";

    //alert({html:"profile successful"});

    var pos = incoming.indexOf("::");
    var incomingRemain = incoming.substring(pos + 2);

    var binary_string = atob(incomingRemain);

    var bf = new Blowfish(entry, "ecb");
    var decrypted = bf.decrypt(binary_string);

    var obj = JSON.parse(decrypted);

    console.log("BB PROFILE -----------------------------------------------------------------------------------");
    console.log(obj);
    console.log("BB PROFILE END -----------------------------------------------------------------------------------");

    systemState.restartUrlSet = obj.profileurl;

    var profileurl = obj.profileurl;
    systemState.unsecuredSet = !obj.ldbenabled;

    

    console.log("setting unsecured " + systemState.unsecured);


    // check if enabled
    if (obj.extension_enabled && obj.ldbenabled) {

        
        // review setup







        //console.log("extension enabled");

        var ss = obj.secret;
        var profileid = obj.profileid;
        var institutionid = obj.institutionid;

        systemState.bbPassword = obj.bb_password;
        
        //GLOBAL_bbpass = obj.bb_password;

        var profilepath = obj.profile_path;

        var posweb = profilepath.indexOf("//webapps");
        systemState.restartUrlSet = profilepath.substring(0, posweb);


        var callhttp = profilepath + "get_user_info2.jsp";
        //callhttp = callhttp.replace("https", "http");

        callhttp = callhttp + "?r=" + obj.user_info_auth;

        console.log(callhttp);

         fetch(callhttp)
                .then(response => response.text())
                .then(data => {console.log("decrypt user info time..........."+data); decrypt_user_info(data, profileid);})
                .catch(error => console.log("error", error));      
        

    } else {

        if (obj.ldbenabled == true) {

            chrome.tabs.create({ url: "blackboard_setup_error.html" }, function(tab) {                
                removeTab(GLOBAL_complete_overlayTab, "getBlackboardProfile overlay");
                setTimeout(function() {
                    removeTab(tab.id, "getBlackboardProfile");                    
                }, 10000);

                //console.log("calling cleanup end exam");
                cleanupEndExam();
            });

        } else {

            chrome.windows.getCurrent(null, function(window) {
                console.log('normal2');
                mywindowsupdate(window.id, { state: "normal" }); //NORMAL                
            });


            //remove overlay            
            removeTab(GLOBAL_complete_overlayTab, "getBlackboardProfile overlay2");


            /*
            changeExamState(false, "bbprofile ldbfalse");
            changeAttemptState(false, "bbprofile ldbfalse");
            */


            //chrome.windows.getCurrent(null, function(window) {
            //     mywindowsupdate(window.id, { state: "normal" }); //NORMAL                
            // });
        }

    } // end else


}

// need to delay the submit or access denied sometimes happens
const blackboardInjectPass = function (pass) {

    

   
    document.getElementsByName("password")[0].type="hidden";
    document.getElementsByName("password")[0].value=pass;
    

    var textArea = document.createElement("textarea");
    textArea.style.background = "transparent";
    textArea.value = "------";
    document.body.appendChild(textArea);
    textArea.select();
    status = document.execCommand("copy");

    document.body.removeChild(textArea);

    setTimeout(function() {document.getElementsByTagName("form")[0].submit();}, 1000);

    

    //document.body.removeChild(textArea);


    
}


var blockdouble = null;

const blackboardInjectCode = function () {

    logToWindow("blackboardInjectCode");

    if (blockdouble == null) {
        blockdouble = 1;

        setTimeout(function() {
          blockdouble = null;
        }, 5000);
          
        chrome.scripting.executeScript(
        {
          //target: {tabId: GLOBAL_complete_activeTab},
          target: {tabId: systemState.examTabId},
          func: blackboardInjectPass,
          args: [systemState.bbPassword]
        },
        () => { 
            //console.log("Completed sending password " + systemState.examTabId);    
            //console.log(chrome.runtime.lastError);  

            // add a listenter to watch for the exam loading to complete  
            var opt_blackboardCompleteblock = ["responseHeaders"];
            var blackboardCompleteFilter = { urls: ["*://*/webapps/assessment/take/launch.jsp*"], types: ["main_frame"] };
            chrome.webRequest.onCompleted.addListener(blackboardExamLoadComplete, blackboardCompleteFilter, opt_blackboardCompleteblock);             
        });
    }

}



const blackboardExamLoadComplete = function (details) {

    logToWindow("blackboardExamLoadComplete");

    chrome.webRequest.onCompleted.removeListener(blackboardExamLoadComplete);

    
    removeTab(GLOBAL_complete_overlayTab, "blackboardExamLoadComplete overlay");

    chrome.tabs.query({ 'title': 'LockDown Browser for Chromebook' }, function(tabs) {

        if (tabs.length > 0) {
            var activetab = tabs[0].id;
            removeTab(activetab, "blackboardExamLoadComplete LDB");            
        }

    });

    mytabsupdate(GLOBAL_complete_activeTab, { active: true }, function() {


        GLOBAL_complete_activeTab = 0;
        GLOBAL_complete_overlayTab = 0;
    });

}

// ----------------------------------------------------------------------------------------------

const sendHelpLogs = function (t, hct) {

    //console.log("sendHelpLogs");

    var log = systemState.logString;
    

    var d = new Date();
    var timestamp = d.getTime();

    var sessionbase = GLOBAL_server + '/MONServer/chromebook/upload_log.do';
    var parameters = "token=" + t + "&hct=" + hct + "&timestamp=" + timestamp + "&content=" + encodeURIComponent(log);    
    var callhttp = sessionbase + "?" + parameters;
    

    //console.log(callhttp);


    fetch(sessionbase, {        
        method: "POST",
        body:new URLSearchParams(parameters)
    })
        .then(response => response.text())
        .then(data => {console.log("help logs sent")})
        .catch(error => console.log("error", error));


    const manifestData = chrome.runtime.getManifest();
    var sessionbase2 = GLOBAL_server + '/MONServer/chromebook/upload_info.do';
    var parameters2 = "token=" + t + "&hct=" + hct;
    parameters2 = parameters2 + "&info=Extension Version=" + manifestData.version;
    parameters2 = parameters2 + "|||" + "Extension Alias=" + manifestData.author;
    parameters2 = parameters2 + "|||" + "Extension Id=" + chrome.runtime.id;

    //console.log("issueString = " + systemState.issueString);

    if (systemState.issueString != "") {
        parameters2 = parameters2 + systemState.issueString;
    }

    console.log(parameters2);
            
    fetch(sessionbase2, {        
        method: "POST",
        body:new URLSearchParams(parameters2)
    })
        .then(response => response.text())
        .then(data => {console.log("help info sent")})
        .catch(error => console.log("error", error));    

}


// ----------------------------------------------------------------------------------------------

const recordKeyViolationMonitor = function (reasonIn) {

    logToWindow("recordKeyViolationMonitor");

    //var xhr = new XMLHttpRequest();
    var sessionbase = GLOBAL_server + '/MONServer/chromebook/add_flag.do';

    var exitstamp = new Date().getTime();
    var timenow = new Date().getTime();
    
    var parameters = "sid=" + systemState.sequenceSid + "&code=" + reasonIn;    

    var callhttp = sessionbase + "?" + parameters;

    fetch(callhttp)
        .then(response => response.text())
        .then(data => {console.log("recordKeyViolation sent")})
        .catch(error => console.log("error", error));



        /*
    xhr.open("POST", callhttp, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {

            } else {
                console.log("ERROR has occurred");
                console.log("ERROR " + xhr.status + "," + xhr.responseText);
            }

        }
    }

    xhr.send(parameters);
    */

}

const recordKeyViolationNoMonitor = function (reasonIn) {

    logToWindow("recordKeyViolationNoMonitor");


    //var xhr = new XMLHttpRequest();
    var sessionbase = GLOBAL_server + '/MONServer/chromebook/non_monitor_exit2.do';

    var exitstamp = new Date().getTime();
    var timenow = new Date().getTime();

    chrome.storage.local.get(['ldb_user_cookie'], function(result) {

        //console.log(result.ldb_user_cookie);

        var obj = JSON.parse(result.ldb_user_cookie);
        var version = "4.0";

        var fullname = obj.name;
        var pos = fullname.indexOf("\u0000");

        if (pos == -1) {
            pos = fullname.indexOf(" ");
        }

       // console.log("fullname: " + fullname);

        var firstn = fullname.substring(0, pos);
        var lastn = fullname.substring(pos + 1);

        var userName = obj.id;

        var loginId = null;
        if (obj.login_id) {
            loginId = obj.login_id;
        }

        var parameters = "token=" + systemState.token + "&courseRefId=" + systemState.courseId + "&examId=" + systemState.examId;
        parameters = parameters + "&userName=" + userName + "&firstName=" + firstn + "&lastName=" + lastn;
        parameters = parameters + "&reason=" + reasonIn + "&timestamp=" + exitstamp;

        var callhttp = sessionbase + "?" + parameters;

        fetch(callhttp)
            .then(response => response.text())
            .then(data => {console.log("recordKeyViolationNoMon sent")})
            .catch(error => console.log("error", error));


        /*

        xhr.open("POST", callhttp, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {

                } else {
                    console.log("ERROR has occurred");
                    console.log("ERROR " + xhr.status + "," + xhr.responseText);
                }

            }
        }

        xhr.send(parameters);

        */

    });

}

const recordEarlyExitNoMonitor = function (reasonIn) {

    logToWindow("recordEarlyExitNoMonitor");

    //console.log('recordEarlyExitNoMonitor ' + reasonIn);

    changeExamState(false, "recordEarlyExitNoMonitor");


    //var xhr = new XMLHttpRequest();
    var sessionbase = GLOBAL_server + '/MONServer/chromebook/non_monitor_exit2.do';

    var exitstamp = new Date().getTime();
    var timenow = new Date().getTime();

    chrome.storage.local.get(['ldb_user_cookie'], function(result) {
        //chrome.cookies.get({url:'https://respondus.instructure.com', name:'ldb_user_cookie'}, function(cookie) {


        var obj = JSON.parse(result.ldb_user_cookie);

        var version = "4.0";

        //var token = "d376f4219b4640749903a5e93f3e9dd7"; // profile id

        var fullname = obj.name;
        var pos = fullname.indexOf("\u0000");

        if (pos == -1) {
            pos = fullname.indexOf(" ");
        }

        //console.log("fullname: " + fullname);

        var firstn = fullname.substring(0, pos);
        var lastn = fullname.substring(pos + 1);



        var userName = obj.id;

        var loginId = null;
        if (obj.login_id) {
            loginId = obj.login_id;
        }




        //var instring = systemState.token + systemState.courseId + systemState.examId + systemState.userName + systemState.firstName + systemState.lastName + exitstamp + reasonIn + timenow + systemState.ps;
        var instring = systemState.token + systemState.courseId + systemState.examId + userName + firstn + lastn + exitstamp + reasonIn + timenow + systemState.ps;
        var md5string = "_" + hex_md5(instring);

        var parameters = "token=" + systemState.token + "&courseRefId=" + systemState.courseId + "&examId=" + systemState.examId;
        parameters = parameters + "&userName=" + userName + "&firstName=" + firstn + "&lastName=" + lastn;
        parameters = parameters + "&reason=" + reasonIn + "&timestamp=" + exitstamp;



        var callhttp = sessionbase + "?" + parameters;

        fetch(callhttp)
            .then(response => response.text())
            .then(data => {console.log("recordKeyViolationNoMon sent")})
            .catch(error => console.log("error", error));

        
    });






}

const recordEarlyExitMonitor = function (reasonIn) {

    logToWindow("recordEarlyExitMonitor");

    changeExamState(false, "recordEarlyExitMonitor");

    //var xhr = new XMLHttpRequest();
    var sessionbase = GLOBAL_server + '/MONServer/chromebook/monitor_exit2.do';

    var exitstamp = new Date().getTime();
    var timenow = new Date().getTime();

    var instring = systemState.token + systemState.sequenceSid + exitstamp + reasonIn + timenow + systemState.ps;
    var md5string = "_" + hex_md5(instring);

    var parameters = "sid=" + systemState.sequenceSid + "&reason=" + reasonIn;
    parameters = parameters + "&timestamp=" + exitstamp;


    var callhttp = sessionbase + "?" + parameters;

    fetch(callhttp)
        .then(response => response.text())
        .then(data => {console.log("recordKeyViolationNoMon sent")})
        .catch(error => console.log("error", error));


   
}


// ---------------------------------------------------------------------------------------


const extractAutoLaunchRemoteCheck = function (ref) {

    extractAutoLaunchRemote(ref);    
}

const extractAutoLaunchRemote = function (ref) {
    // push off launch
    //extractAutoLaunchRemoteInner(ref);

    //console.log("tabid = " + systemState.examTabId);

    var outinfo = { 'processing': systemState.lmsProcessing, 'launch': ref, 'tab': systemState.examTabId, 'url' : systemState.cookieUrl };
    var outJSON = JSON.stringify(outinfo);

    //console.log("outJSON=" + outJSON + " proc=" + systemState.lmsProcessing);

    chrome.storage.local.set({ 'reflaunch': outJSON}, function(result) {
        myreload();
    });

}

const extractAutoLaunchRemoteInner = function (ref) {

    logToWindow("extractAutoLaunchRemoteInner");

    //console.log("extractAutoLaunchRemoteInner");

    var refShort = "";
    var pos = ref.indexOf("rldb:");
    if (pos != -1) {
        refShort = ref.substring(pos + 5);
    }

    var parameters = "?a=" + authorName + "&l=" + refShort;

    var outurl = chrome.runtime.getURL('security_a.html');
    outurl = outurl + parameters;

    logToLocalStorage("extractAutoLaunchRemote: " + outurl);

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

        console.log(tabs);

        //chrome.tabs.move(tabs[0].id, { index: 0 }, function(tab) {
            chrome.tabs.move(systemState.examTabId, { index: 0 }, function(tab) {
                //console.log("setting tab " + tabs[0].id + " sysexam:" + systemState.examTabId);
            systemState.startingTabSet = tabs[0].id;

            const takeactive = !systemState.preExamStarted;
            
            chrome.tabs.create({ index: 0, url: outurl, active: takeactive }, function(tab) {      
                //console.log("create tab");
                //console.log(tab);            
                console.log('normal14');      
                mywindowsupdate(tab.windowId, { state: "normal" }); //normal
                mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN   
                
                changeExamWindow(tab.windowId, "autolaunchremote");
            });
            
        });



    });



}


const extractAutoLaunchCanvas = function (ref) {

    logToWindow("extractAutoLaunchCanvas");

    ref = ref.replace('\n', '');


    systemState.processing = 'canvas';
    systemState.canvasExamModeSet = 'QNext'; // must be the newer exams

    //console.log("setting processing to " + systemState.processing);

    extractAutoLaunchRemoteCheck(ref);

}


const extractAutoLaunchBbUltra = function (ref, tabid) {

    logToWindow("extractAutoLaunchBbUltra " + ref);

    systemState.examTabSet = tabid;

    // incoming ref may have return characters in it
    ref = ref.replace('\n', '');

    systemState.processing = 'ultra';

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        var activetab = tabs[0].id;

        // ULTRA extra tab removal chrome.tabs.remove(activetab);

        extractAutoLaunchRemoteCheck(ref);
    });

}

const extractAutoLaunchMoodle = function (ref) {

    logToWindow("extractAutoLaunchMoodle");


    // incoming ref may have return characters in it
    ref = ref.replace('\n', '');

    systemState.processing = 'moodle';
    extractAutoLaunchRemoteCheck(ref);


}

const extractAutoLaunchSchoology = function (ref) {

    logToWindow("extractAutoLaunchSchoology");

    console.log(ref);


    // incoming ref may have return characters in it
    ref = ref.replace('\n', '');

    // remove the new tab quickly 
    chrome.tabs.query({ 'title': 'data*' }, function(tabs) {

        if (tabs.length > 0) {
            var activetab = tabs[0].id;
            //console.log("tab removed"); 
            setTimeout(function(){ removeTab(activetab, "extractAutoLaunchSchoology"); }, 200);     
            
        }

    });

    systemState.processing = 'schoology';
    extractAutoLaunchRemoteCheck(ref);
}

const extractAutoLaunchD2L = function (ref, tabId) {

    logToWindow("extractAutoLaunchD2L");

    // incoming ref may have return characters in it
    ref = ref.replace('\n', '');

    // remove the new tab quickly 
    chrome.tabs.query({ 'title': 'data*' }, function(tabs) {

        if (tabs.length > 0) {
            var activetab = tabs[0].id;
            removeTab(activetab, "extractAutoLaunchD2L")            
        }

    });

    

    systemState.processing = 'd2l';
    extractAutoLaunchRemoteCheck(ref, tabId);
}

const extractAutoLaunchCanvasContinued = function (plaintext) {

    logToWindow("extractAutoLaunchCanvasContinued");


    //console.log("extractAutoLaunchCanvasContinued");

    var u1 = plaintext.indexOf("<u>");
    var u2 = plaintext.indexOf("</u>");

    var newurl = plaintext.substring(u1 + 3, u2 - u1 + 3);

    var domain = newurl.substring(0, newurl.indexOf("//") + 2) + newurl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    systemState.restartUrlSet = domain;



    // May 2022 = switch to using
    var su1 = plaintext.indexOf("<si>");
    var su2 = plaintext.indexOf("</si>");

    var username = plaintext.substring(su1 + 4, su2);

    var sf1 = plaintext.indexOf("<sf>");
    var sf2 = plaintext.indexOf("</sf>");

    var firstname = plaintext.substring(sf1 + 4, sf2);

    var sl1 = plaintext.indexOf("<sl>");
    var sl2 = plaintext.indexOf("</sl>");

    var lastname = plaintext.substring(sl1 + 4, sl2);

    // get exam id and course id
    var x1 = plaintext.indexOf("<xi>");
    var x2 = plaintext.indexOf("</xi>");

    systemState.examIdSet = plaintext.substring(x1 + 4, x2);

    var c1 = plaintext.indexOf("<ci>");
    var c2 = plaintext.indexOf("</ci>");

    systemState.courseIdSet = plaintext.substring(c1 + 4, c2);

    var t1 = plaintext.indexOf("<tl>");
    var t2 = plaintext.indexOf("</tl>");

    var textualName = plaintext.substring(t1 + 4, t2);

    var in1 = plaintext.indexOf("<inst>");
    var in2 = plaintext.indexOf("</inst>");

    var institutionid = plaintext.substring(in1 + 6, in2);

    systemState.institutionIdSet = institutionid;

    var monitorexampos = textualName.indexOf("+ Webcam");


    GLOBAL_testing_url = newurl;
    systemState.canvasExamModeSet = 'QNext'; // must be the newer exams

    logToLocalStorage("extractAutoLaunchCanvasContinued: " + newurl);

    //console.log("extractAutoLaunchCanvasContinued: going to " + newurl);

    var server = newurl.substring(0, newurl.indexOf("//") + 2) + newurl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

    storeWebCamInfo(server, systemState.courseId, systemState.examId, username, firstname, lastname);

    var outinfo = { "id": username, "name": firstname + " " + lastname };
    var outJSON = JSON.stringify(outinfo);

    chrome.storage.local.set({ 'ldb_user_cookie': outJSON }, function(result) {
        console.log('ldb_user_cookie: ' + outJSON);
        tabUpdateWithUrl(systemState.startingTab, newurl );
    });    

    
}


const extractAutoLaunchMoodleContinued = function (plaintext) {

    logToWindow("extractAutoLaunchMoodleContinued");



    var u1 = plaintext.indexOf("<u>");
    var u2 = plaintext.indexOf("</u>");

    var newurl = plaintext.substring(u1 + 3, u2 - u1 + 3);
    //newurl = newurl.replaceAll("&amp;", "&");
    newurl = newurl.split("&amp;").join("&");

    var domain = newurl.substring(0, newurl.indexOf("//") + 2) + newurl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    systemState.restartUrlSet = domain;

    var si1 = plaintext.indexOf("<si>");
    var si2 = plaintext.indexOf("</si>");

    var username = plaintext.substring(si1 + 4, si2);

    var sf1 = plaintext.indexOf("<sf>");
    var sf2 = plaintext.indexOf("</sf>");

    var firstname = plaintext.substring(sf1 + 4, sf2);

    var sl1 = plaintext.indexOf("<sl>");
    var sl2 = plaintext.indexOf("</sl>");

    var lastname = plaintext.substring(sl1 + 4, sl2);

    // get exam id and course id
    var x1 = plaintext.indexOf("<xi>");
    var x2 = plaintext.indexOf("</xi>");

    systemState.examIdSet = plaintext.substring(x1 + 4, x2);

    var c1 = plaintext.indexOf("<ci>");
    var c2 = plaintext.indexOf("</ci>");

    systemState.courseIdSet = plaintext.substring(c1 + 4, c2);


    var t1 = plaintext.indexOf("<tl>");
    var t2 = plaintext.indexOf("</tl>");

    var textualName = plaintext.substring(t1 + 4, t2);

    var in1 = plaintext.indexOf("<inst>");
    var in2 = plaintext.indexOf("</inst>");

    var institutionid = plaintext.substring(in1 + 6, in2);

    var monitorexampos = textualName.indexOf("+ Webcam");

    // GLOBAL_testing_url = newurl; this leads to unauthorized
    systemState.resumeUrlSet = newurl;
    systemState.processing = 'moodle';

    var server = newurl.substring(0, newurl.indexOf("//") + 2) + newurl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        const activetab = tabs[0].id;
        const currenturl = tabs[0].url;
        const domain = currenturl.substring(0, currenturl.indexOf("//") + 2) + currenturl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

        //console.log("MOODLE CURRENT: " + currenturl + ", " + activetab);

        chrome.cookies.set({
            "name": "rldbci",
            "url": server,
            "value": "1"
        }, function(cookie) {

            systemState.processing = 'moodle';

            systemState.examTabSet = activetab;
            systemState.currentTabSet = activetab;
        });

    });


    // setup the monitor
    var outinfo = { "id": username, "name": firstname + " " + lastname };
    var outJSON = JSON.stringify(outinfo);

    storeWebCamInfo(server, systemState.courseId, systemState.examId, username, firstname, lastname);

    // set the user information
    chrome.storage.local.set({ 'ldb_user_cookie': outJSON }, function(result) {
        console.log('ldb_user_cookie: ' + outJSON);
        var outurl = chrome.runtime.getURL('webcamstart.html');
        outurl = outurl + "?" + "courseid=" + systemState.courseId + "&examid=" + systemState.examId + "&server=" + server;

        
        chrome.tabs.create({ index: 0, url: outurl, active: true }, function(tab) {
            systemState.monitorRunningSet = true;
            

            console.log('normal15');
            mywindowsupdate(tab.windowId, { state: "normal" }); //FULLSCREEN 
            mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN   
            systemState.webcamTabIdSet = tab.id;


        });
    });

}


const extractAutoLaunchSchoologyContinued = function (plaintext) {

    logToWindow("extractAutoLaunchSchoologyContinued");

    systemState.processing = 'schoology';


    var u1 = plaintext.indexOf("<u>");
    var u2 = plaintext.indexOf("</u>");

    var newurl = plaintext.substring(u1 + 3, u2 - u1 + 3);

    


    var su1 = plaintext.indexOf("<su>");
    var su2 = plaintext.indexOf("</su>");


    var username = plaintext.substring(su1 + 4, su2);

    var sf1 = plaintext.indexOf("<sf>");
    var sf2 = plaintext.indexOf("</sf>");

    var firstname = plaintext.substring(sf1 + 4, sf2);

    var sl1 = plaintext.indexOf("<sl>");
    var sl2 = plaintext.indexOf("</sl>");

    var lastname = plaintext.substring(sl1 + 4, sl2);

    // get exam id and course id
    var x1 = plaintext.indexOf("<xi>");
    var x2 = plaintext.indexOf("</xi>");

    systemState.examIdSet = plaintext.substring(x1 + 4, x2);

    var c1 = plaintext.indexOf("<ci>");
    var c2 = plaintext.indexOf("</ci>");

    systemState.courseIdSet = plaintext.substring(c1 + 4, c2);


    var t1 = plaintext.indexOf("<tl>");
    var t2 = plaintext.indexOf("</tl>");



    var textualName = plaintext.substring(t1 + 4, t2);

    var in1 = plaintext.indexOf("<inst>");
    var in2 = plaintext.indexOf("</inst>");

    var institutionid = plaintext.substring(in1 + 6, in2);


    var monitorexampos = textualName.indexOf("+ Webcam");



    GLOBAL_testing_url = newurl;




    var domain = newurl.substring(0, newurl.indexOf("//") + 2) + newurl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    systemState.restartUrlSet = domain;

    



    chrome.cookies.set({
        "name": "rldbci",
        "url": domain,
        "value": "1"
    }, function(cookie) {


        // setup the monitor
        var outinfo = { "id": username, "name": firstname + " " + lastname };
        var outJSON = JSON.stringify(outinfo);

        storeWebCamInfo(domain, systemState.courseId, systemState.examId, username, firstname, lastname);

        // set the user information
        chrome.storage.local.set({ 'ldb_user_cookie': outJSON }, function(result) {
            console.log('ldb_user_cookie: ' + outJSON);
            var outurl = chrome.runtime.getURL('webcamstart.html');
            outurl = outurl + "?" + "courseid=" + systemState.courseId + "&examid=" + systemState.examId + "&server=" + domain + "&lms=schoology";

            systemState.cacheOuturlSet = outurl;

            

            chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
                var activetab = tabs[0].id;

                
            

                mytabsupdate(activetab, { active: true, url: GLOBAL_testing_url }, function(tab) {
                    //console.log(tab);

                    systemState.examTabSet = tab.id;
                    systemState.currentTabSet = activetab;
                    console.log('normal16');
                    mywindowsupdate(tab.windowId, { state: "normal" }); //FULLSCREEN 
                    mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN  
                    changeExamWindow(tab.windowId, "autoextractschoology");
                });
              });  

             


            /*
            chrome.tabs.create({ index: 0, url: outurl, active: true }, function(tab) {
                GLOBAL_webcam_tabid = tab.id;
                systemState.monitorRunningSet = true;

            });*/
            });
       

    }); //rldbci

}



const extractAutoLaunchD2LContinued = function (plaintext, sendtabid) {

    logToWindow("extractAutoLaunchD2LContinued");

    console.log("extractAutoLaunchD2LContinued " + systemState.d2lExamMode);

    var u1 = plaintext.indexOf("<u>");
    var u2 = plaintext.indexOf("</u>");

    var newurl = plaintext.substring(u1 + 3, u2 - u1 + 3);

    newurl = newurl.split("&amp;").join("&");

    var su1 = plaintext.indexOf("<su>");
    var su2 = plaintext.indexOf("</su>");

    var username = plaintext.substring(su1 + 4, su2);

    var sf1 = plaintext.indexOf("<sf>");
    var sf2 = plaintext.indexOf("</sf>");

    var firstname = plaintext.substring(sf1 + 4, sf2);

    var sl1 = plaintext.indexOf("<sl>");
    var sl2 = plaintext.indexOf("</sl>");

    var lastname = plaintext.substring(sl1 + 4, sl2);

    // get exam id and course id
    var x1 = plaintext.indexOf("<xi>");
    var x2 = plaintext.indexOf("</xi>");

    systemState.examIdSet = plaintext.substring(x1 + 4, x2);

    var c1 = plaintext.indexOf("<ci>");
    var c2 = plaintext.indexOf("</ci>");

    systemState.courseIdSet = plaintext.substring(c1 + 4, c2);


    var t1 = plaintext.indexOf("<tl>");
    var t2 = plaintext.indexOf("</tl>");

    var textualName = plaintext.substring(t1 + 4, t2);

    var in1 = plaintext.indexOf("<inst>");
    var in2 = plaintext.indexOf("</inst>");

    var institutionid = plaintext.substring(in1 + 6, in2);

    var monitorexampos = textualName.indexOf("+ Webcam");

    // GLOBAL_testing_url = newurl; this leads to unauthorized
    systemState.restartUrlSet = newurl;
    systemState.handshakeUrlSet = newurl;



    var server = newurl.substring(0, newurl.indexOf("//") + 2) + newurl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        console.log("getting current tab...");
        console.log(tabs);

        var activetab = tabs[0].id;

        GLOBAL_d2l_main_tab = activetab;

        //console.log("extractAutoLaunchD2LContinued CHANGING exam tab " + activetab);
        systemState.examTabSet = activetab;

        // use this as the autolaunch url until D2L fixes the autolaunch
        var currenturl = tabs[0].url;

        //console.log("current url = " + currenturl);

        GLOBAL_d2l_cookieurl = server;

        systemState.domainSet = server;

        //console.log("systemState.domain " + systemState.domain);

        chrome.cookies.set({
            "name": "rldbci",
            "url": server,
            "value": "1"
        }, function(cookie) {

        });




        // setup the monitor
        var outinfo = { "id": username, "name": firstname + " " + lastname };
        var outJSON = JSON.stringify(outinfo);

        storeWebCamInfo(server, systemState.courseId, systemState.examId, username, firstname, lastname);

        console.log("extractAutoLaunchD2LContinued checking " + currenturl);

        if  (currenturl.indexOf("quizzing/user/quiz_submissions") == -1) {            

            // set the user information
            chrome.storage.local.set({ 'ldb_user_cookie': outJSON }, function(result) {
                console.log('ldb_user_cookie: ' + outJSON);
                var outurl = chrome.runtime.getURL('webcamstart.html');
                outurl = outurl + "?" + "courseid=" + systemState.courseId + "&examid=" + systemState.examId + "&server=" + server + "&inst=" + institutionid;

                
                chrome.tabs.create({ index: 0, url: outurl, active: true }, function(tab) {

                    systemState.monitorRunningSet = true;
                    
                    
                    mywindowsupdate(tab.windowId, { state: "normal" }); //FULLSCREEN  
                    mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN   
                    systemState.webcamTabIdSet = tab.id;

                    mytabsupdate(GLOBAL_d2l_main_tab, { url: systemState.handshakeUrl, active: false }, function(tab) {
                        console.log("set exam tab " + tab.id);
                        systemState.examTabSet = tab.id;
                        changeExamWindow(tab.windowId, "extractd2l");
                    });

                });
            });

        } else {

            //console.log("d2l review mode is ON");
            
            systemState.restartUrlSet = currenturl;
            systemState.d2lReviewModeSet = true; 

            changeAttemptState(true, "d2lReviewMode");

            restartUrlCheckD2L();


           
        }


    });
    


}




const extractAutoLaunchBbUltraContinued = function (plaintext) {

    //console.log("extractAutoLaunchBbUltraContinued");

    logToWindow("extractAutoLaunchBbUltraContinued ");

    var u1 = plaintext.indexOf("<u>");
    var u2 = plaintext.indexOf("</u>");

    var newurl = plaintext.substring(u1 + 3, u2 - u1 + 3);
    //newurl = newurl.replaceAll("&amp;", "&");
    newurl = newurl.split("&amp;").join("&");



    var si1 = plaintext.indexOf("<si>");
    var si2 = plaintext.indexOf("</si>");

    var username = "";
    if (si1 != -1 && si2 != -1) {
        username = plaintext.substring(si1 + 4, si2);
    }



    var sf1 = plaintext.indexOf("<sf>");
    var sf2 = plaintext.indexOf("</sf>");

    var firstname = plaintext.substring(sf1 + 4, sf2);



    var sl1 = plaintext.indexOf("<sl>");
    var sl2 = plaintext.indexOf("</sl>");

    var lastname = plaintext.substring(sl1 + 4, sl2);



    // get exam id and course id
    var x1 = plaintext.indexOf("<xi>");
    var x2 = plaintext.indexOf("</xi>");

    systemState.examIdSet = plaintext.substring(x1 + 4, x2);



    var c1 = plaintext.indexOf("<ci>");
    var c2 = plaintext.indexOf("</ci>");

    systemState.courseIdSet = plaintext.substring(c1 + 4, c2);



    var t1 = plaintext.indexOf("<tl>");
    var t2 = plaintext.indexOf("</tl>");

    var textualName = plaintext.substring(t1 + 4, t2);



    var in1 = plaintext.indexOf("<inst>");
    var in2 = plaintext.indexOf("</inst>");

    var institutionid = plaintext.substring(in1 + 6, in2);

    var monitorexampos = textualName.indexOf("+ Webcam");

    // GLOBAL_testing_url = newurl; this leads to unauthorized
    systemState.resumeUrlSet = newurl;   
    systemState.processing = 'ultra';


    var server = newurl.substring(0, newurl.indexOf("//") + 2) + newurl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    systemState.restartUrlSet = server;

    logToWindow("GLOBAL_restart_url " + systemState.restartUrl);


    // setup the monitor
    var outinfo = { "id": username, "name": firstname + " " + lastname };
    var outJSON = JSON.stringify(outinfo);

    storeWebCamInfo(server, systemState.courseId, systemState.examId, username, firstname, lastname);

    var history = "";
    if (newurl.indexOf("attemptId") != -1) {
        systemState.reviewModeSet = true;
        systemState.bbReviewModeSet = true;
        history = "&history=y";
    }

    

    // set the user information
    chrome.storage.local.set({ 'ldb_user_cookie': outJSON }, function(result) {
        console.log('ldb_user_cookie: ' + outJSON);
        var outurl = chrome.runtime.getURL('webcamstart.html');
        outurl = outurl + "?" + "courseid=" + systemState.courseId + "&examid=" + systemState.examId + "&server=" + server + history;


        

        //console.log("Launching webcam " + outurl);
        chrome.tabs.create({ index: 1, url: outurl, active: true }, function(tab) {

            logToWindow("Created tab WEBCAM");

            systemState.monitorRunningSet = true;
            

            console.log('normal18');
            mywindowsupdate(tab.windowId, { state: "normal"}); //FULLSCREEN
            mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN   
            systemState.webcamTabIdSet = tab.id;

        });
    });

}


// ---------------------------------------------------------------------------------------------------------------------

const reactToPrestartMoodle = function reactToPrestartMoodle(details) {

    logToWindow("reactToPrestartMoodle");

    systemState.cookieUrlSet = details.url;

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        var activetab = tabs[0].id;
        systemState.examTabSet = activetab;
        systemState.currentTabSet = activetab;


        if (tabs[0].openerTabId) {
            removeTab(tabs[0].openerTabId, "reactToPrestartMoodle");
        }

        var pos = details.url.indexOf("rldbcv");

        if (pos != -1) {
            systemState.processing = 'moodle';

            var chalvalue = details.url.substring(pos + 7);

            var outurl = chrome.runtime.getURL('security_b.html');
            outurl = outurl + "?a=" + authorName + "&c=" + chalvalue + "&p=" + systemState.token + "&s=" + systemState.sequenceSid;

            const takeactive = !systemState.preExamStarted;
            chrome.tabs.create({ index: 0, url: outurl, active: takeactive }, function(tab) {
                console.log('normal19');
                mywindowsupdate(tab.windowId, { state: "normal" }); //FULLSCREEN  
                mywindowsupdate(tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN          
            });

        }


    });
}


const signalPrestartFinishedMoodle = function () {
    
    logToWindow("signalPrestartFinishedMoodle");

    
    changeExamState(true, "signalPrestartFinishedMoodle");



    chrome.scripting.executeScript( {
                target: {tabId: systemState.examTabId},
                files: ["js/inject/myscript.js"],
                world: chrome.scripting.ExecutionWorld.MAIN,
            });

    if (systemState.examWindow != -1) {
        console.log('normal20');
        mywindowsupdate(systemState.examWindow, { focused: true, drawAttention: false, state: "normal" });
        mywindowsupdate(systemState.examWindow, { focused: true, drawAttention: false, state: GLOBAL_screen });
    }

    setupTabManagementSingle(systemState.examTabId, 'Moodle');
}


const moodleExamSubmitted = function (details) {

    logToWindow("moodleExamSubmitted");

    if (details.url.indexOf("cmid") == -1) {
        systemState.reviewModeSet = true; 
    }

    //console.log("moodleexamsubmitted DISABLED");

    /*

    // check this is the final one
    if (details.url.indexOf("cmid") == -1) {
        //exam is complete notify the webcam
        notifyWebcam();
        cleanupSecondaryTabs();
    }
    */
}

const reactToPrestartCanvasRedirect = function (details) {

    logToWindow("reactToPrestartCanvasRedirect");

    //console.log("reactToPrestartCanvasRedirect----------------------------------------------------------------------" + details.url);
    //console.log(details);
    systemState.examTabSet = details.tabId;

    //console.log("Current tab = " + systemState.tabIds[0]);

    

    
    

   


    // --------------------------------------

    var history = "";
    if (details.url.indexOf("security_level=low&action=attempt") != -1) {
        history = "&history=y";
    }

    //console.log("opening webstart course=" + systemState.courseId + " exam=" + systemState.examId);
    var domain = details.url.substring(0, details.url.indexOf("//") + 2) + details.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

    storeWebCamInfo(domain, systemState.courseId, systemState.examId, "username", "firstname", "lastname");

    var outurl = chrome.runtime.getURL('webcamstart.html');
    outurl = outurl + "?" + "inst=" + systemState.institutionId + "&courseid=" + systemState.courseId + "&examid=" + systemState.examId + "&server=" + domain + history;

    
    chrome.tabs.create({ index: 0, url: outurl, active: true }, function(tab) {

        systemState.monitorRunningSet = true;
        
        //console.log("opening webcam reactToPrestartCanvasRedirect");
    });

    /*
    if (details.url.indexOf("security_level=low&action=attempt") != -1) {
        console.log("signalPrestartFinished");
        setTimeout(function() { signalPrestartFinished(); }, 1000);
    } else {
       
    }
    */
}

const deferSecurityRemoval = function() {
    console.log("DEFER");
    systemState.defferedSecuritySet = true;
    setTimeout(deferSecurityRemovalInner, 8000);
}

const deferSecurityRemovalInner = function() {
    console.log("DEFER INNER");
    chrome.tabs.query({ 'title': 'LockDown Browser*' }, function(tabs) {    
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.indexOf(chrome.runtime.id) != -1) {
                removeTab(tabs[i].id, "deferSecurityRemovalInner secB " + i);
            }
        }      
        systemState.defferedSecuritySet = false;     
                                       
    });
}

const reactToPrestartSchoology = function (details) {

    logToWindow("reactToPrestartSchoology");

    //console.log("reactToPrestartSchoology");
    //console.log(details);

    if (GLOBAL_schoology_delayed_timer != null) {
        clearTimeout(GLOBAL_schoology_delayed_timer);
        GLOBAL_schoology_delayed_timer = null;
    }

    if (details.url.indexOf("rldbsm=1") != -1) {
        console.log("schoology rldbsm found");
        systemState.schoologyReviewModeSet = true;  
        

              
        chrome.tabs.create({ index: 0, url: systemState.cacheOuturl + "&history=y", active: true }, function(tab) {
            systemState.webcamTabIdSet = tab.id;
            //systemState.monitorRunningSet = true;
        });


    } else {

        if (details.url.indexOf("prestart=1") != -1) {

            //console.log("prestart1");
            //console.log(details);

            systemState.examTabSet = details.tabId;

            //setTimeout(function() { signalPrestartFinished(); }, 1000);//V3CHANGE
            // check for review
            

            //console.log("create webstart page: " + systemState.cacheOuturl);
            chrome.tabs.create({ index: 0, url: systemState.cacheOuturl, active: true }, function(tab) {
                systemState.webcamTabIdSet = tab.id;
                //systemState.monitorRunningSet = true;
            });

            if (GLOBAL_schoology_delayed_close != -1) {
                // schoology has opened the exam tab remove the loader
                
                removeTab(GLOBAL_schoology_delayed_close, "reactToPrestartSchoology");
                GLOBAL_schoology_delayed_close = -1;
            }
            if (GLOBAL_schoology_security != -1) {                
                removeTab(GLOBAL_schoology_security, "reactToPrestartSchoology sec");
                GLOBAL_schoology_security = -1;
            }


        } else {

            

            

            GLOBAL_schoology_delayed_timer = setTimeout(function() { notifySchoology(); }, 5000);
            
  
            
        }
    }

}

const reactToPrestartD2L = function (details) {

    logToWindow("reactToPrestartD2L");

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        var activetab = tabs[0].id;
        //console.log("set exam tab " + activetab);
        systemState.examTabSet = activetab;
        setTimeout(function() { signalPrestartFinished(); }, 1000);
    });
}


// --------------------------------------------------------------------------------- MESSAGE

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        console.log("EXTERNAL = " + request);
    }
);

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {


        if (request.action == 'LOGMODE') {
            console.log(request);
        }

        if (request.action == 'reportmode') {
            sendResponse({reportmode: systemState.reportMode});
        }

        if (request.action == 'svlpmode') {
            systemState.svlpmodeSet = true;            
        }

         if (request.action == 'screenrecmode') {
             systemState.screenrecmodeSet = true;
         }

        console.log(request);
        //console.log(sender);

        
        if (request.action == 'escup') {
            
            var message = { action: "escupXX" };
            chrome.tabs.sendMessage(systemState.examTabId, message);
        }

        logToWindow("Request received: " + request.action);

        

        if (request.action == 'kowlclose') {
                        
            removeTab(sender.tab.id, "kowlclose");
        }


        if (request.action == 'ctrldown') {
            var message = { action: "ctrldownXX" };
            chrome.tabs.sendMessage(systemState.examTabId, message);
            
        }

        if (request.action == 'ctrlup') {
            var message = { action: "ctrlupXX" };
            chrome.tabs.sendMessage(systemState.examTabId, message);
        }

        if (request.action == 'altdown') {
            var message = { action: "altdownXX" };
            chrome.tabs.sendMessage(systemState.examTabId, message);
            
        }

        if (request.action == 'altup') {
            var message = { action: "altupXX" };
            chrome.tabs.sendMessage(systemState.examTabId, message);
        }

        

        if (request.action == 'copyeventdetected') {
            systemState.copyEventSet = true;
        }

        // bbprofile info
        if (request.action == 'bbprofile') {
            getBlackboardProfile(request.payload);
        }

        if (request.action == 'bbreviewprofile') {
            getBlackboardProfileReview(request.payload);
        }


        if (request.action == 'nobbpassfound') {
            console.log("no password found for bb - unsecured");
            //systemState.unsecuredSet = true;
        }
        

        if (request.action == 'bbpassfound') {
            //console.log("password found for blackboard: " + GLOBAL_blackboard_processing + " - " + systemState.examStarted);

            chrome.runtime.getPlatformInfo(function(platformInfo) {
                var os = platformInfo.os;

                if (os == GLOBAL_os) {
                    
                    hideBlackboardElementsCheck(sender.tab.url);
                }
            });

                    
        }

        if (request.action == 'reportissue') {
            const manifestData = chrome.runtime.getManifest();
            const authorName = manifestData.author;

            var outurl = chrome.runtime.getURL('security_c.html');
            outurl = outurl + "?a=" + authorName;

            chrome.tabs.create({ index: 0, url: outurl, active: true }, function(tab) {
                console.log('normal21');
                mywindowsupdate(tab.windowId, { state: "normal" }); //NORMAL      
            });
   

            
        }

        if (request.action == 'reportissueaction') {
            var returninfo = request.payload;

            if (returninfo.indexOf('CBE-REPORT-ISSUE-CLOSE') != -1) {                
                removeTab(sender.tab.id, 'reportissueaction');
            }

            if (returninfo.indexOf('CBE-REPORT-ISSUE-SEND') != -1) {
                
                sendHelpLogs(GLOBAL_issue_token, GLOBAL_issue_hct);
            }

            

        }

        if (request.action == 'pastein') {
            var message = { action: "pasteinval", value: 'OPPENHEIMER' };
            chrome.tabs.sendMessage(systemState.examTabId, message);
        }

        if (request.action == 'opencalculator') {
            //console.log("calculatormode = [" + systemState.calculatorMode +']');
            if (systemState.calculatorMode != 'DISABLED') {

                if (systemState.calculatorTabId == null) {
                        
                    var outurl = chrome.runtime.getURL('calc.html') + "?mode=" + systemState.calculatorMode;
                    chrome.tabs.create({ url: outurl }, function(tab) { 
                            systemState.calculatorTabIdSet = tab.id;       
                            
                            const calculator_label = chrome.i18n.getMessage("calculator_label");
                            addToTabs(tab.id, calculator_label);            
                            chrome.tabs.query({}, function(tabs) {
                                var message = { action: "openlinkbk", tabid: tab.id, label: calculator_label };
                                for (var i = 0; i < tabs.length; ++i) {
                                    chrome.tabs.sendMessage(tabs[i].id, message);
                                }
                            });
                    });

                } else {
                    tabUpdateShow(systemState.calculatorTabId);
                }
            }
        }

        if (request.action == 'paypalclose') {

            removeTab(systemState.paypalId, "paypalclose");
            systemState.paypalIdSet = -1;
           
        }

        //RESUME EXAM
        if (request.action == 'resumeexam') {

            //console.log("resume exam");
            
            checkResumeValid(request, sender);                        
           
        }


        // -------- AUTOLAUNCH
        if (request.action == "autolaunch") {

            //console.log("autolaunch with " + systemState.lmsProcessing);


            var incoming = request.payload;
            var pos = incoming.indexOf("::");
            if (pos != -1) {
                incoming = incoming.substring(pos + 2);
                //console.log(incoming);
            }
            
            //removeTab(sender.tab.id, "autolaunch 1");

            //deferSecurityRemoval();

            chrome.tabs.query({ 'title': 'LockDown Browser*' }, function(tabs) {                

                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].url.indexOf(chrome.runtime.id) != -1) {
                        removeTab(tabs[i].id, "autolaunch 2 - " + tabs[i].url);
                    }
                    
                }                  
                
            });

            // remove the security page
            if (systemState.inProcessingState('d2l') == false) {
                // remove it for all but D2L   
                

                
            }

            if (systemState.inProcessingState('d2l')) {                
                setTimeout(function() { extractAutoLaunchD2LContinued(incoming, sender.tab.id); }, 200);
            }

            if (systemState.inProcessingState('schoology')) {
                extractAutoLaunchSchoologyContinued(incoming);
            }

            if (systemState.inProcessingState('moodle')) {
                // wait for autolaunch to close
                setTimeout(function() {extractAutoLaunchMoodleContinued(incoming);}, 250);
            }

            if (systemState.inProcessingState('ultra')) {
                extractAutoLaunchBbUltraContinued(incoming);
                GLOBAL_challenge_state = 1;
            }

            if (systemState.inProcessingState('canvas') == true) {
                extractAutoLaunchCanvasContinued(incoming);
            }

        }

        if (request.action == "challengecookiereview") {

            deploydrm();

            changeAttemptState(true, 'challengecookiereview');
            // cnavas review

            console.log("challengecookie review");
            chrome.tabs.query({ 'title': 'LockDown Browser*' }, function(tabs) {    
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].url.indexOf(chrome.runtime.id) != -1) {
                        removeTab(tabs[i].id, "challengecookie secB review " + i);
                    }
                }                                          
            });

            var returninfo = request.payload;
            var pos = returninfo.indexOf("::");
            var responseval = returninfo.substring(pos + 2);
            var domain = systemState.cookieUrl.substring(0, systemState.cookieUrl.indexOf("//") + 2) + systemState.cookieUrl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

            //console.log("challengecookie set cookie");
            // set the cookie
            chrome.cookies.set({
                "name": "rldbrv",
                "url": domain,
                "value": responseval
            }, function(cookie) {
                console.log("launch review");
                chrome.tabs.create({ url: systemState.handshakeUrl, active:true }, function(tab) {
                        systemState.examTabSet = tab.id;
                        setTimeout(function() { chrome.tabs.reload(systemState.examTabId); }, 2000);
                        setTimeout(function() { tabUpdateShow(systemState.examTabId); }, 1500);
                    });
            });
        }

        // -------- RESPONSE COOKIE
        if (request.action == "challengecookie") {

            //deploydrm();

            // remove the security page if not Schoology
            /*
            if (systemState.inProcessingState('schoology') == false) {                
                removeTab(sender.tab.id, "challengecookie secB");
            } else {
                GLOBAL_schoology_security = sender.tab.id;
            }*/

            if (systemState.inProcessingState('schoology') == true) {     
                GLOBAL_schoology_security = sender.tab.id;
            } else if (systemState.inProcessingState('canvas') == true && systemState.canvasExamMode == 'QOriginal') {
                deferSecurityRemoval();
            } else if (systemState.inProcessingState('blackboard') == true) {
                deferSecurityRemoval();
            } else {
                removeTab(sender.tab.id, "challengecookie secB");
            }



            
            

            var returninfo = request.payload;
            var pos = returninfo.indexOf("::");
            var responseval = returninfo.substring(pos + 2);

            systemState.deferredHandshakeSet = responseval;

            var domain = systemState.cookieUrl.substring(0, systemState.cookieUrl.indexOf("//") + 2) + systemState.cookieUrl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

            //console.log("challengecookie setting rldbrv " + domain + "[" + responseval + "]");
            // set the cookie
            chrome.cookies.set({
                "name": "rldbrv",
                "url": domain,
                "value": responseval
            }, function(cookie) {

                //console.log(cookie);
                //console.log(chrome.runtime.lastError);

                
                // reload the search page

                if (systemState.inProcessingState('schoology')) {
                    //var scode = "var script = document.createElement('script');script.textContent = 'set_cookie_completed();';document.head.appendChild(script);";
                    //chrome.tabs.executeScript(GLOBAL_exam_tabid, { code: scode, runAt: 'document_end' });

                    chrome.scripting.executeScript( {
                      target: {tabId: systemState.examTabId },
                      files: ["js/inject/myscript.js"],
                      world: chrome.scripting.ExecutionWorld.MAIN,
                    },
                    (e) => { });

                    //changeAttemptState(true, "schoologyChallengeCookie");

                    
                    
                    
                }
                


                if (systemState.inProcessingState('moodle')) {
                    setTimeout(function() { signalPrestartFinishedMoodle(); }, 1000);
                }

                if (systemState.inProcessingState('d2l')) {

                    //console.log("GLOBAL_d2l_state: " + systemState.d2lExamMode);

                    if (systemState.d2lExamMode == 'secure_a') {
                        systemState.d2lExamModeSet = 'secure_b';
                        setTimeout(function() { signalPrestartFinished(); }, 1000);                        
                    }
                    
                }


                if (systemState.inProcessingState('canvas')) {

                    if (systemState.canvasReviewMode == true) {
                        //setTimeout(function() { chrome.tabs.reload(); }, 1000);

                        
                        mytabsupdate({ url: systemState.canvasreviewurl }, function() {
                            systemState.canvasreviewurlSet = "";
                            //
                        }); 
                        
                        
                    }


                    logToWindow("canvas processing checking targetURL " + systemState.handshakeUrl);
                    var targeturl = systemState.handshakeUrl;
                    var server = targeturl.substring(0, targeturl.indexOf("//") + 2) + targeturl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

                    // get the course and exam info
                    var matchresult = targeturl.match(/courses\/(\d+)\/quizzes\/(\d+)\/take/i);


                    var history = "";
                    var newquiz = false; 

                    if (matchresult == null) {
                        // new quiz version
                        matchresult = targeturl.match(/courses\/(\d+)\/assignments\/(\d+).json/i);
                        if (matchresult != null) {
                            matchresult[2] = matchresult[2] + "_QN";
                            newquiz = true;  
                        } else {
                            matchresult = targeturl.match(/courses\/(\d+)\/quizzes\/(\d+)\/history/i);

                            if (matchresult == null) {
                                matchresult = targeturl.match(/courses\/(\d+)\/quizzes\/(\d+)\?viewing=1/i);
                                if (matchresult != null) {
                                    newquiz = false; 
                                }                                
                                                               
                            } else {                                
                                newquiz = false;                                
                            }
                            
                            console.log("They are in Canvas review...");
                            history = "&history=y";
                            systemState.canvasReviewModeSet = true;
                        }
                    }

                    storeWebCamInfo(server, matchresult[1], matchresult[2], "username", "firstname", "lastname");

                    var outurl = chrome.runtime.getURL('webcamstart.html');                    
                    outurl = outurl + "?" + "courseid=" + matchresult[1] + "&examid=" + matchresult[2] + "&server=" + server + history;

                    systemState.cacheOuturlSet = outurl;

                    logToLocalStorage("tabscreate3: " + outurl);

                    //console.log("start webcam");

                    

                    if (newquiz === false) {
                        // need to delay newquiz but older we need to look immediately
                        chrome.tabs.create({ index: 0, url: outurl, active: true }, function(tab) {
                            systemState.monitorRunningSet = true;
                            
                        });
                    }




                  
                }

                if (systemState.inProcessingState('schoology') || systemState.inProcessingState('d2l') || systemState.inProcessingState('canvas')) {
                    chrome.cookies.set({
                        "name": "rldbci",
                        "url": domain,
                        "value": "1"
                    }, function(cookie) {

                    });
                }

                if (systemState.inProcessingState('ultra')) {

                    logToWindow("challengecookie receieved loading " + systemState.resumeUrl2);

                    chrome.tabs.create({ url: systemState.resumeUrl2 }, function(tab) {
                        systemState.examTabSet = tab.id;                        

                    });

                }



            });
        }

        

        if (request.action == 'reportexamkey') {

            var reasontext = request.reason;

            if (systemState.monitorRunning) {
                console.log("recordKeyViolationMonitor " + reasontext);
                recordKeyViolationMonitor(reasontext);
            } else {
                console.log("recordKeyViolationNoMonitor " + reasontext);
                recordKeyViolationNoMonitor(reasontext);
            }

            // Increment ctrlDown
            chrome.storage.local.get('systemstate', function(result){
                 var ctrlCountTemp = result.systemstate.ctrlCount;
                 ctrlCountTemp += 1;
                 systemState.ctrlCountSet = ctrlCountTemp;
            });
        }



        if (request.action == 'reportexamfocus'){
            chrome.storage.local.get('systemstate', function(result){
                var focusCountTemp = result.systemstate.focusCount;
                focusCountTemp += 1;
                systemState.focusCountSet = focusCountTemp;
            });
        }

        if (request.action == 'reportscreenshot'){
            chrome.storage.local.get('systemstate', function(result){
                var screenshotCountTemp = result.systemstate.screenshotCount;
                screenshotCountTemp += 1;
                systemState.screenshotCountSet = screenshotCountTemp;
            });
        }

        if(request.action == 'copyEvent'){
            systemState.copyEventSet = true;            
        }

        if (request.action == 'closetabs') {

            if (systemState.inProcessingState('moodle')) {
                // try reloading tab
            }

            if (systemState.inProcessingState('blackboard')) {
                chrome.tabs.query({ 'title': 'Enter Password*' }, function(tabs) {
                    if (tabs && tabs[0]) {
                        
                        removeTab(tabs[0].id, "enter password");
                    }

                });
            }

            
        }

        if (request.action == 'endexamexit') {

            chrome.history.deleteAll(function() {});

                chrome.tabs.query({}, function(tabs) {
                     
                var messageend = { action: 'endofexamabnormal' };
                for (var i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, messageend);
                }
            });



            //console.log("endcheck1");
            endCheck();

            //console.log("GLOBAL_early_exit_window = " + GLOBAL_early_exit_window);

            if (GLOBAL_early_exit_window != -1) {                
                removeTab(GLOBAL_early_exit_window, "early_exit_window");
                GLOBAL_early_exit_window = -1;                
            }
            
            //console.log("End monitor");

            var reasontext = request.reason;
            if (systemState.monitorRunning) {
                console.log("recordKeyViolationMonitor " + reasontext);
                recordKeyViolationMonitor(reasontext);
            } else {
                console.log("recordKeyViolationNoMonitor " + reasontext);
                recordKeyViolationNoMonitor(reasontext);
            }


            showEndExit();

        }

        if (request.action == 'examenddone') {

            systemState.svlpmodeSet = false;

            if (GLOBAL_early_exit_mode) {
                    chrome.tabs.query({ 'title': 'Webcam*' }, async function(tabs) {

                    console.log("Ending monitor");
                    console.log(tabs);

                    if (tabs && tabs.length > 0) {
                        var activetab = tabs[0].id;
                        await removeTab(activetab, "examenddone");
                        systemState.monitorRunningSet = false;
                    }
                    
                });
            }

        }

        if (request.action == 'endexamearly') {


            //console.log("GLOBAL_exam_tabid: " + systemState.examTabId);
            //console.log("GLOBAL_exam_window: " + systemState.examWindow);

            notifyWebcam(false);

            // CLEAR OTHER TABS
            for (var i = 1; i < systemState.tabIds.length; i++) {
                console.log("Clearing tab " + systemState.tabIds[i]);
                if (systemState.tabIds[i] != systemState.webcamTabId) {                                
                    removeTab(systemState.tabIds[i], "endexamearly clear");
                }
            }



            chrome.tabs.sendMessage(systemState.examWindow, 'suppressBeforeUnload', () => {
                chrome.runtime.lastError;

                injectBlockUnloadHideContent(systemState.examTabId);
                
                systemState.currentTabSet = systemState.examTabId;

                if (systemState.earlyExitWindow && systemState.earlyExitWindow > 0) {
                    
                    removeTab(systemState.earlyExitWindow, "earlyExitWindow");
                    systemState.earlyExitWindowSet = -1;
                }


                var reasontext = request.reason;

                systemState.feedbackExitSet = false;
                systemState.feedbackWaitingSet = false;

                changeExamState(false, "endexamearly");

                changeAttemptState(false, "endexamearly"); 
                
                


                if (systemState.monitorRunning) {
                    recordEarlyExitMonitor(reasontext);
                } else {
                    recordEarlyExitNoMonitor(reasontext);
                }

                if (systemState.inProcessingState('schoology')) {

                        const currenturl = systemState.restartUrl;
                        

                        console.log("current=" + currenturl);
                        var details = { url: currenturl };
                            chrome.cookies.getAll(details, function(cookies) {   
                                console.log(cookies);                                           
                                for (const cookie of cookies) {
                                    //console.log("removing " + cookie.name + " in " + currenturl);
                                    if (cookie.name.indexOf("rldb") == 0) {
                                        chrome.cookies.remove({ name: cookie.name, url: currenturl }); 
                                    }
                                    
                                }
                            });
                    }

                

                // remove D2L session
                chrome.cookies.remove({
                    "name": "d2lSessionVal",
                    "url": systemState.domain
                }, function(cookie) {
                    //console.log("d2lSessionVal is cleared...");
                });

                // remove the response
                chrome.cookies.remove({
                    "name": "rldbrv",
                    "url": systemState.domain
                }, function(cookie) {
                    //console.log("rldbrv is cleared...");
                });

                // end the monitor
                chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
                    if (tabs.length > 0) {
                        var activetab = tabs[0].id;
                        //console.log("tab removed"); chrome.tabs.remove(activetab);
                        systemState.monitorRunningSet = false;
                    }

                });

                //console.log("UPDATING TAB " + systemState.examTabId);

                // end exam
                var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode;
                tabUpdateWithUrl(systemState.examTabId, outurl);



            });



        }

        if (request.action == 'errorreport') {
            console.log(request.error);
            logToWindow(request.error);
        }

        if (request.action == 'cancelendexamearly') {
            tabUpdateShow(systemState.examTabId);
            console.log(request);

            //chrome.tabs.remove(systemState.earlyExitWindow);
            
            removeTab(sender.tab.id, "cancelendexamearly");
            systemState.earlyExitWindowSet = -1;
        }

        if (request.action == 'endexamproctor') {

            console.log(request);
            
            var sessionbase = GLOBAL_server + '/MONServer/chromebook/verify_exit_pw.do';
            var encodepass = CryptoJS.SHA256(request.entered);

            var parameters = "x=" + systemState.serverExamId + "&p=" + encodepass;

            var callhttp = sessionbase + "?" + parameters;

            await fetch(callhttp, {        
                method: "POST"        
            })
                .then(response => response.text())
                .then(data => {
                    console.log("verify sent: " + data + " for pass [" + request.entered + "]"); 
                    var message = { action: "proctorpass", result: data };
                    chrome.tabs.sendMessage(sender.tab.id, message);
                })
                .catch(error => console.log("error", error));
            
        }

        

        if (request.action == 'endexambutton') {

            chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
                var activetab = tabs[0].id;
                //changeExamWindow(activetab, "endexambutton");

                console.log(systemState.canvasReviewMode + "," + systemState.schoologyReviewMode + "," + systemState.d2lReviewMode + "," + systemState.reviewMode + "," + systemState.examStarted + "," + systemState.attemptStarted);

                if ((systemState.canvasReviewMode == false && systemState.schoologyReviewMode == false && systemState.d2lReviewMode == false && systemState.reviewMode == false) 
                        && (systemState.examStarted == true || systemState.attemptStarted == false)) {
                    chrome.tabs.create({ url: chrome.runtime.getURL('examearlyend.html'), active: true }, function(tab) {
                        console.log(tab);
                        console.log("Setting earlywxitwindow " + tab.id);
                        systemState.earlyExitWindowSet = tab.id;
                    });

                } else {
                    
                    systemState.examTabSet = activetab;
                    var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode;
                    tabUpdateWithUrl(activetab, outurl);
                    notifyWebcam(true);
                }


            });




        }



        if (request.action == "onresize") {

            //console.log("exam " + systemState.examStarted);

            //console.log("attempt " + systemState.attemptStarted);

            // special case always protect security pages
            if (sender.url.indexOf("security_") != -1) {
                mywindowsupdate(sender.tab.windowId, { state: GLOBAL_screen }); //FULLSCREEN
            }


            if (systemState.examStarted == true || systemState.attemptStarted == true || systemState.monitorRunning == true || systemState.d2lReviewMode == true) {
                chrome.windows.getCurrent(function(browser) {
                    console.log(browser);
                    console.log("Got current browser window setting full screen");
                    mywindowsupdate(browser.id, { state: GLOBAL_screen }); //FULLSCREEN
                    mywindowsupdate(browser.id, { state: GLOBAL_screen }); //FULLSCREEN
                });
            }

        }

        // ------- ON BLUR
         if (request.action == "onblur") {


            chrome.windows.getCurrent(function(browser) {
                //mywindowsupdate(systemState.examWindow, { focused: true, drawAttention: true, state: GLOBAL_screen });
            
            });


        }

        if (request.action == "onfocus") {

            chrome.windows.getCurrent(function(browser) {
                //mywindowsupdate(systemState.examWindow, { focused: true, drawAttention: true, state: GLOBAL_screen }); // FULLSCREEN
            });
        }

        // ------- GET STATUS
        if (request.action == 'getstatus') {
            var message = { action: "getstatus", examStarted: systemState.examStarted };
            chrome.tabs.sendMessage(sender.tab.id, message);
        }


        // ------ OPENLINK
        if ( (request.action == "openlink" || request.action == "openlinkframe") && (GLOBAL_openlink_check == false)) {

            GLOBAL_openlink_check = true;
            setTimeout(resetOpenLink, 500);

            const empty = (request.payload == '');
            const canvasfile = (!systemState.inProcessingState('canvas') || (request.payload.indexOf("files") == -1));

            console.log("openlink canvaspay = " + canvasfile + " empty=" + empty + " payload:[" + request.payload + "]");

            

            if (request.payload.indexOf("javascript") == -1 && request.payload.indexOf("viewing") == -1 
                    && request.payload.indexOf("app.readspeaker.com") == -1 
                    && request.payload.indexOf("view.php") == -1 
                    && (!systemState.inProcessingState('canvas') || (request.payload.indexOf("files") == -1)) 
                    && (!systemState.inProcessingState('d2l') || (request.payload.indexOf("content/enforced") == -1 || request.payload.indexOf("pdf") != -1) ) 
                    //&& (!systemState.inProcessingState('blackboard') || (request.payload.indexOf("bbcswebdav/pid") == -1)) 
                    && !empty) {
                // check if max or not valid tab
                if (systemState.tabIds.length < GLOBAL_MAX_TABS || sender.tab.id != systemState.tabIds[0]) {

                    isPDF2(request.payload);                                

                } else {
                    var message = { action: "toomanytabs" };
                    chrome.tabs.sendMessage(sender.tab.id, message);
                }
            } else if (request.payload.indexOf("viewing") != -1) {

                console.log("detected review...loading " + request.payload);

                systemState.canvasReviewModeSet = true;
                systemState.canvasreviewurlSet = request.payload;

                mytabsupdate(sender.tab.id, { url: request.payload }, function() {
                    // add note why commented out
                    if (systemState.attemptStarted == true) {
                        setTimeout(function() { findHandshakeCanvasInner(sender.tab.id, request.payload, true); }, 2000);
                    }
                    
                    
                });  

                

                //                            
            }

        }

        // ------- TABREMOVE
        if (request.action == "tabremove") {


            var id = parseInt(request.payload);

            if (systemState.examTabId > 0) {
                tabUpdateShow(systemState.examTabId);
                systemState.currentTabSet = systemState.examTabId;
            }

            if (id == systemState.calculatorTabId) {
                systemState.calculatorTabIdSet = null;
            }
            
            removeTab(id, "tabremove");

            removeFromTabs(id);

            // notify all open tabs of the change
            chrome.tabs.query({}, function(tabs) {
                var message = { action: "removelinkbk", tabid: id };
                for (var i = 0; i < tabs.length; ++i) {
                    chrome.tabs.sendMessage(tabs[i].id, message);
                }
            });

        }

        // ------------- TABCLICK 
        if (request.action == "tabclick") {
            var id = parseInt(request.payload);
            tabUpdateShow(id);
            systemState.currentTabSet = id;
            logToWindow("Clicking tab " + id );
        }

        // ------------ GET EXAM STATE
        if (request.action == "getexamstate") {
            sendResponse(systemState.examStarted == true && systemState.attemptStarted == false);
        }




        // ------------ GET TAB LINE
        if (request.action == "gettabline") {
            sendResponse(buildTabString(sender.tab.id));
        }

        // ------------ CLOSE WEBCAM
        if (request.action == "closetab") {
            var id = parseInt(request.tabid);
            
            removeTab(id, "closetab");
        }

        // ---------- DECLINE EXAM
        if (request.action == 'declineexam') {

            var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode;
            tabUpdateWithUrl(systemState.examTabId, outurl);





            /*
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0; i < tabs.length; ++i) {

                    if (tabs[i].url.indexOf("instructure") != -1 || tabs[i].url.indexOf("blackboard") || tabs[i].url.indexOf("canvas")) {
                        console.log("decline exam");
                        chrome.tabs.remove(tabs[i].id);
                    }

                }
                resetExamInfo();
            });
            */

        }

        if (request.action == 'closesus') {

            console.log("closesus " + systemState.restartUrl);

            /*

            var out = 'Current State<ul><li>Restart:' + systemState.restartUrl + '<li>Domain: ' + systemState.domain + '</ul>';

            alert({html: out})
                  .then(() => console.log('alert closed'));
                  */                  
            closesus();                        

        }

        

        if (request.action == 'monitornotsupported') {

            console.log("Loading error page into webcam page");

/*
            chrome.tabs.create({ active: true, index: 0, url: 'schoology_monitor_error.html' }, function(tab) {
                mywindowsupdate(tab.windowId, { state: "normal" }); // KEEP NORMAL
                //cleanupEndExam();
            });
            */

            chrome.cookies.remove({
                "name": "rldbrv",
                "url": systemState.domain
            }, function(cookie) {
                console.log("rldbrv removed");

            });

            chrome.cookies.remove({
                "name": "rldbci",
                "url": systemState.domain
            }, function(cookie) {
                console.log("rldbci removed");

            });

            
            chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
                var activetab = tabs[0].id;
                mytabsupdate(activetab, { active: true, url: 'schoology_monitor_error.html' }, function() {

                    setTimeout(function() {
                        chrome.cookies.remove({
                            "name": "rldbrv",
                            "url": activetab
                        }, function(cookie) {
                        });         
        
                        chrome.cookies.remove({
                            "name": "rldbci",
                            "url": activetab
                        }, function(cookie) {
                        });       

                        console.log('normal22');
                        mywindowsupdate(tabs[0].windowId, { state: "normal" }); // KEEP NORMAL
                        //cleanupEndExam();
                        resetExamInfo();
                        cleanupExtraTabs();

                            

                    }, 1000);

                    



                });
            });
            
        }

        if (request.action == 'resumeexamnoldb') {
            chrome.windows.getCurrent(null, function(window) {

                GLOBAL_nonsecure_mode = true;
                chrome.tabs.create({ url: GLOBAL_testing_url, active: true }, function(tab) {
                    //resetExamInfo();
                });
            });
        }

        // ---------- SHOW WEBCAM
        if (request.action == 'showwebcam' || request.action == 'susping') {
            
            logToWindow("showwebcam");


            chrome.tabs.query({ 'title': 'Trouble*' }, function(trouble_tabs) {                

                if (trouble_tabs == null || trouble_tabs.length == 0) {

                    console.log("paypal "+ systemState.paypalId);

                    // check for paypal
                    if (systemState.paypalId != -1) {
                        systemState.currentTabSet = systemState.paypalId;
                        tabUpdateShow(systemState.paypalId);
                    } else {
                        chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {                

                            if (tabs != null && tabs[0] != null) {
                                var activetab = tabs[0].id;
                                systemState.currentTabSet = activetab;
                                tabUpdateShow(activetab);

                            }
                        });
                    }

                    

                }
            });
        }

        // ---------- HIDE WEBCAM - SHOW EXAM
        if (request.action == 'hidewebcam') {

            hideWebCam();
        }

        if (request.action == 'closefaq') {
            // close any faqs
            chrome.tabs.query({ 'title': 'Trouble*' }, function(tabs) {
                if (tabs.length > 0) {
                    var activetab = tabs[0].id;
                    removeTab(activetab, "closefaq");
                    
                }
            });
        }

        if (request.action == 'bbvalidpass') {
            systemState.passRequiredSet = false;            
            restartUrlCheck();
            
            chrome.tabs.query({ 'title': 'LockDown Browser*' }, function(tabs) {    
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].url.indexOf(chrome.runtime.id) != -1) { 
                        removeTab(tabs[i].id, "bbvalidpass " + i);
                    }
                }                                          
            });
        }

        if (request.action == 'restarturl') {

                                   
            

            systemState.restartUrlSet = request.starturl;
            systemState.liveproctorSet = request.liveproctor;     
            systemState.calculatorModeSet = request.calc;    
            systemState.serverExamIdSet = request.examid;

            systemState.externalDomainListSet = request.exdomain;
            systemState.passRequiredSet = request.passrequired;

            systemState.monitorRunningSet = request.monitor;
            systemState.svlpmodeSet = request.monitor;

            console.log("restarturl exdomain: " + request.exdomain);

            
            
            



            // prepare issue
            var issue = "|||Institution ID=" + request.profileid + "|||" + "Server URL=" + request.starturl;
            systemState.issueStringSet = issue;

            
            

            systemState.earlyExitModeSet = !request.locked; //opposite of locked
            systemState.reportModeSet = (request.reportmode == "REPORT");

            systemState.allowExtStringSet = request.allowlist;
            console.log("allow list");
            console.log(request.allowlist);

            if (request.allowlist.indexOf("ALLOWRECORDING") != -1) {
                removeTab(systemState.drmTabId, "drmallowrecording");
                systemState.drmDisabledSet = true;
            } else {                
                systemState.drmDisabledSet = false;
            }

            console.log("report mode is " + systemState.reportMode + "," + request.reportmode);

            

            // make sure its only BbOG
            if (systemState.passRequired && systemState.inProcessingState('blackboard') && systemState.monitorRunning == false) {                
                var outurl = chrome.runtime.getURL('blackboard_pass.html') + "?examid=" + systemState.serverExamId;
                chrome.tabs.create({ url: outurl, active: true });
            } else {
                restartUrlCheck();
            }


        }

        // ---------- END EXAM
        if (request.action == 'endexam') {

            const senderid = sender.tab.id;

            console.log("Exam: " + systemState.examTabId + " sender: " + senderid);

            

            
            
            

            

            chrome.tabs.query({currentWindow: true}, function(tabs) {               
                console.log("removing tabs " + systemState.schoologyReviewMode);
                console.log(tabs);

                // only take action if there are more than one tabs
                if (tabs && tabs.length > 1) {
                    for (let i = 0; i < tabs.length; i++) {                        
                        if (tabs[i].url.indexOf('assessment_view') != -1) {
                             
                            removeTab(tabs[i].id, "endexam1"); 
                        }
                    }

                }


            });

            console.log("GLOBAL_feedback_waiting" + systemState.feedbackWaiting);

            logToWindow("feedback_waiting " + systemState.feedbackWaiting);

            if (request.link != null) { 
                console.log("creating " + request.link);   
                setTimeout(function() { chrome.tabs.create({ url: request.link });  }, 1500);            
                               
            }

            const canvasexam = systemState.inProcessingState('canvas');
            const canvasnext = (systemState.canvasExamMode == 'QNext');
            clearKeyCookies();

            // move exam into another tab for canvas
            if (canvasexam && canvasnext) {

                changeExamState(false, "end exam canvas");
                changeAttemptState(false, "end exam canvas");

                
                chrome.tabs.get(systemState.examTabId, function(tab) {

                    console.log("Creating a new tab: " + tab.url);
                    
                    
                    chrome.tabs.create({ url: systemState.restartUrl }, function(newtab){         
                                
                        chrome.tabs.remove(systemState.examTabId, function() {
                            systemState.examTabSet = newtab.id;       
                            
                            chrome.tabs.query({ 'title': 'Exam Completed' }, function(tabs) {     
                                console.log(tabs);               
                                if (tabs && tabs.length > 0) {
                                    const removeid = tabs[0].id;
                                    console.log("removeid=" + removeid);                  
                                    setTimeout(function() {removeTab(removeid, "canvasEndExam");chrome.tabs.reload(systemState.examTab);}, 5000);
                                }
                            });
                        });
                    });
                });

            }


            if (systemState.feedbackWaiting == true) {



                chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {

                    console.log("searching for webcam tab");
                    console.log(tabs);

                    if (tabs.length > 0) {
                        var activetab = tabs[0].id;
                        

                        // focus on feedback
                        systemState.currentTabSet = activetab;

                       

                        logToWindow("FOCUS ON THE WEBCAM2 starting timeout");
                            
                        //console.log("FOCUS ON THE WEBCAM2 starting timeout");
                        setTimeout(function() { 
                            tabUpdateShow(activetab);
                        }, 700);
                        


                        
                    }
                });


            } else {

                

                console.log("end exam cleanup");
                changeExamState(false, "end exam action");
                changeAttemptState(false, "end exam action");
                
                chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
                    if (tabs && tabs.length > 0) {
                        
                        removeTab(tabs[0].id, "end exam webcam");
                    }

                        
                        

                    

                });

                cleanupEndExam();

                

                
            }

        }

        // ---------- END EXAM
        if (request.action == 'notenabled') {
            if (request.starturl) {
                systemState.restartUrlSet = request.starturl;
            }

            //console.log("cleanup not enabled");
            
            await chrome.tabs.query({ 'title': 'Webcam*' }, async function(tabs) {
                var activetab = tabs[0].id;
                await removeTab(activetab, "notenabled function");  

            });     

            

            if (!systemState.inProcessingState('canvas') ) {
                cleanupEndExam();                 
            } else {
                closesus();
            }
             
        }

        


    });
    const isPDF2 = async function(url) {
        try {
            // Fetch the first few bytes of the file
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Range': 'bytes=0-4'  // We only need the first 5 bytes to check for the PDF signature
                }
            });
            
            if (!response.ok) {
                throw new Error('isPDF: Failed to fetch the file.');
            }
    
            // Convert the response into an array of bytes
            const data = await response.arrayBuffer();
            const bytes = new Uint8Array(data);
    
            // Convert bytes to a string to check for '%PDF-'
            const pdfSignature = new TextDecoder().decode(bytes);

            //console.log('isPDF:' + pdfSignature + ' - ' + url );

            var correct = pdfSignature === '%PDF-';

            console.log("ISPDF " + correct + " on " + url);

            var container = url;
            if (correct) {
                //https://s28.q4cdn.com/392171258/files/doc_downloads/test.pdf
                container = chrome.runtime.getURL('react/web/viewer.html') + "?file=" + url;
            } 

            chrome.tabs.create({ url: container }, function(tab) {

                console.log("Creating " + tab.id + " for " + container);
                if (url.indexOf("quiz_submissions") == -1) {
                    addToTabs(tab.id, "Exam Link");

                    // notify all open tabs of the change
                
                    chrome.tabs.query({}, function(tabs) {
                        var message = { action: "openlinkbk", tabid: tab.id, label: "Exam Link" };
                        for (var i = 0; i < tabs.length; ++i) {
                            chrome.tabs.sendMessage(tabs[i].id, message);
                        }
                    });
                } else {
                    systemState.currentTabSet = tab.id;
                }
            });
    
            return correct;
        } catch (error) {
            console.error('isPDF: Error detecting PDF:', error);
            return false;
        }
    }

const isPDF = async function(url) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          const contentType = response.headers.get('Content-Type');
          
          if (contentType && contentType.toLowerCase() === 'application/pdf') {
            console.log('isPDF: This URL points to a PDF file. ' + url );
            return true;
          } else {
            console.log('isPDF: This URL does not point to a PDF file. ' + url + " - " + contentType.toLowerCase());
            return false;
          }
        } catch (error) {
          console.error('Error checking the URL:', error);
          return false;
        }
      }

const  closesus = async function () {


    // schoology has a special requirement the prestart screen is left open
    await chrome.tabs.query({ lastFocusedWindow: true }, async function(tabs) {
            for (const tab of tabs) {
                if (tab.url.indexOf("prestart") != -1) {
                var activetab = tab.id;   
                   
                await removeTab(activetab, "closesus");  
            }
        }
        
    });

    removeTab(systemState.drmTabId, "drmclosesus");

    await chrome.cookies.remove({
                "name": "rldbci",
                "url": systemState.domain
            }, function(cookie) { console.log("CLOSESUS rldbci"); });

    await chrome.cookies.remove({
            "name": "rldbrv",
            "url": systemState.domain
        }, function(cookie) { console.log("CLOSESUS rldbrv"); });

    await chrome.cookies.remove({
                        "name": "canvas_session",
                        "url": systemState.domain
                    }, function(cookie) {
                        chrome.cookies.remove({
                            "name": "_legacy_normandy_session",
                            "url": systemState.domain
                        }, function(cookie) {

                            chrome.cookies.remove({
                                "name": "_csrf_token",
                                "url": systemState.domain
                            }, function(cookie) {

                            });

                        });
                    });            



    await chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
        var activetab = tabs[0].id;
        console.log('normal23');
        setTimeout(function() { mywindowsupdate(tabs[0].windowId, { state: "normal" }); }, 1000); // KEEP NORMAL

        if (systemState.restartUrl != "") {

            chrome.tabs.query({ active: true, lastFocusedWindow: true }, async function(tabs) {
                var activetab = tabs[0].id;

                systemState.currentTabSet = activetab;

                console.log("close sus updating " + activetab + " to " + systemState.restartUrl);

                setTimeout(function(e) {

                        tabUpdateWithUrl(activetab,e);
                            }, 1000, systemState.restartUrl);

                

                systemState.restartUrlSet = "";

                resetExamInfo();
            });

        }

    });

}


const hideWebCam = function () {

    var currenttab = systemState.examTabId;    

    logToWindow("hidewebcam tab=" + currenttab);
    console.log("hideweb cam tab=" + currenttab);

    if (currenttab && currenttab > 0) {
        tabUpdateShow(currenttab);
        systemState.currentTabSet = currenttab;
    }

    
}


// ----------------


const checkResumeValid = function (requestin, senderin) {
    const request = requestin;
    const sender = senderin;

    console.log("checkResumeValid " + systemState.validresume);

    if (systemState.validresume == 1) {
        resumeExamActions(request, sender); 
         
    } else if (systemState.validresume != 1) {
          GLOBAL_resumetime = setTimeout(function(){ checkResumeValid(request,sender); }, 500);  
    }

    
    

    
}

    // ---------------------------------------------------------------------


  const resumeExamCanvas = function (request) {

      logToWindow("resumeExamCanvas");


    console.log("resumeExamCanvas new");
    console.log(request);

    GLOBAL_rvector_ready = true;

    if (systemState.examStarted == false) {

        chrome.tabs.query({ lastFocusedWindow: true }, function(tabs) {

            // find the LDB required tab and remove it
            for (var i=0; i < tabs.length; i++) {
                var url = tabs[i].url;
                if (url.indexOf("lockdown_browser_required") != -1) {
                    console.log("removing " + tabs[i].url);
                    


                }
            }
        });



        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            console.log("RESUME CANVAS TABS");
            console.log(tabs);

            chrome.tabs.move(tabs[0].id, {index:1});

            changeExamWindow(tabs[0].windowId, "resumeExamCanvas");



            setupTabManagementSingle(tabs[0].id, 'Canvas');

            

            changeExamState(true, "resumeExamCanvas: " + systemState.canvasExamMode);

            
            

            systemState.tabIds[0] = systemState.startingTab;    
            
            if (systemState.canvasExamMode == 'QOriginal') {    

                logToWindow("Updating to " + systemState.handshakeUrl + " on tab " + systemState.startingTab);
                

                    
                mytabsupdate(systemState.startingTab, { url: systemState.handshakeUrl, active: true }, function(tab) {
                    systemState.examTabSet = tab.id;
                    //systemState.examWindowSet = tab.windowId;

                    var filter = { urls: [systemState.handshakeUrl], types: ["main_frame"] };
                    chrome.webRequest.onCompleted.addListener(finalLoadQuizClassic, filter, []);

                    GLOBAL_canvas_reload = setTimeout(function() { canvasTooLongLoad();}, 5000 );



                    //console.log("reloading tab " + systemState.startingTab);
                    //setTimeout(function() { chrome.tabs.reload(systemState.startingTab); }, 2000);
                });    
                         


                /*
                chrome.tabs.create({ url: systemState.handshakeUrl, active: true }, function(tab) {
                    GLOBAL_exam_tabid = tab.id;
                    GLOBAL_exam_window = tab.windowId;
                });

                console.log("reloading");                               
                setTimeout(function() { chrome.tabs.reload(GLOBAL_exam_tabid); }, 4000);
                */
            }

            if (systemState.canvasExamMode == 'QNext') {

                mytabsupdate(systemState.handshakeTabId, { active: true }, function(tab) {
                    systemState.examTabSet = tab.id;

                    console.log("prestart QNEXT");

                    if (GLOBAL_canvas_start_interval == null) {
                        GLOBAL_canvas_start_interval = setInterval(function() { signalPrestartFinished(); }, 2000);    
                    }

                    

                });               

            }
            

        });

    }


}


const moveTabsToCurrentWindow = function () {
    console.log("movetabs");
    
   
    /*
    chrome.windows.getCurrent(null, function(window) {
        chrome.tabs.query({}, async function(tabs) {
            for (var i = 0; i < tabs.length; ++i) {
                if (tabs[i].url.indexOf(chrome.runtime.id) == -1 && tabs[i].title.indexOf("Files") != 0 && tabs[i].title.indexOf("Settings") != 0 && tabs[i].url.indexOf(GLOBAL_drm)  == -1) {
                    
                    console.log("GROUPenter: " + GLOBAL_tabgroup);
                    if (GLOBAL_tabgroup == null) {
                        await chrome.tabs.group({tabIds: tabs[i].id}, function(groupId) {
                            console.log("GROUP1: " + groupId);
                            GLOBAL_tabgroup = groupId;
                            console.log("GROUP1b: " + GLOBAL_tabgroup);
                        })
                    } else {
                        console.log("GROUP2: " + GLOBAL_tabgroup);
                        await chrome.tabs.group({tabIds: tabs[i].id, groupId: GLOBAL_tabgroup});
                    }
                }
            }
        });
    });*/


    

    if (osversion == "cros") {
        chrome.windows.getCurrent(null, function(window) {
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0; i < tabs.length; ++i) {
                    if (tabs[i].url.indexOf(chrome.runtime.id) == -1 && tabs[i].title.indexOf("Files") != 0 && tabs[i].title.indexOf("Settings") != 0 && tabs[i].url.indexOf(GLOBAL_drm)  == -1) {
                        chrome.tabs.move(tabs[i].id, {windowId: window.id, index: -1});
                    }
                }
            });
        });

    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    
    
    
    
    
    
    
}



const restartUrlCheck = function () {

        moveTabsToCurrentWindow();

        chrome.tabs.query({}, function(tabs) {

            const displayflags = {
                singleUnified: true
            };

            chrome.system.display.getInfo(displayflags, function(displayinfo) {

            const dispmode = displayinfo.length > GLOBAL_base_displays;


            console.log("dispmode = " + dispmode + " len:" + displayinfo.length);

            console.log(tabs);
            console.log(displayinfo);
            
            var validtabs = GLOBAL_base_tabs;
            var currentTabs = tabs.length;
            var commonDomain = "";
            var commonDomainCount = 0;
            var canvasmode = false;

            

            // remove our tabs
            var tablist = "<li>LockDown Browser for Chromebook (this tab)</li>";
            var tablistextra = "";
            var extracount = 0;
            var schoology_extra = false;

            for (var i = 0; i < tabs.length; ++i) {
                
                //console.log(tabs[i].url);
                if (tabs[i].url.indexOf(chrome.runtime.id) != -1 || tabs[i].title.indexOf("Files") == 0 || tabs[i].title.indexOf("Settings") == 0 || tabs[i].url.indexOf(GLOBAL_drm) != -1) {
                    console.log("reducing current tabs" + tabs[i].url);
                    currentTabs--;
                } else {

                    if (tabs[i].id != systemState.examTabId) {

                        if (i<11) {
                            tablist = tablist + "<li>" + tabs[i].title + "</li>";
                        } else {
                            tablistextra = tablistextra + "<li>" + tabs[i].title + "</li>";
                            extracount++;
                        }

                    }
                    
                    

                    const url = tabs[i].url;
                    var domain = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

                    //console.log("domain = " + domain);

                    if (commonDomain == "") {
                        commonDomain = domain;
                        commonDomainCount++;
                        
                    } else {
                        if (domain === commonDomain) {
                            
                            commonDomainCount++;
                        }

                    }

                }

                
            }

            console.log("liveproctor is " + systemState.liveproctor);
            // ILP
             if (systemState.d2lReviewMode == false && systemState.schoologyReviewMode == false 
                && systemState.canvasReviewMode == false && systemState.bbReviewMode == false ) {
                if (systemState.liveproctor) {
                    validtabs++;
                    commonDomainCount++; 
                }          
            }

            

           

            if (systemState.inProcessingState('blackboard') || systemState.canvasExamMode == 'QNext' ) {

                    if (validtabs+1 == commonDomainCount) {
                        validtabs++;    
                    }
                    
                }

            if (!systemState.schoologyReviewMode && systemState.inProcessingState('schoology')) {

                validtabs++;

            }

            if (!systemState.d2lReviewMode && systemState.inProcessingState('d2l')) {

                //validtabs++;

            }

            if (systemState.canvasExamMode == 'QOriginal') {
                canvasmode = true;

                
            }

            if (systemState.canvasReviewMode == true) {
                currentTabs = 0;
            }

           

            

            console.log("restartUrlCheck-----> validtabs = " + validtabs + " vs " + currentTabs + " commonDomainCount: " + commonDomainCount + " examstarted: " + systemState.schoologyReviewMode + " proctor: " + systemState.liveproctor + " dispmode: " + dispmode + " sm: " + systemState.lmsProcessing);
            
            const tabmode = currentTabs <= validtabs;
            if (tabmode && !dispmode) {
                //resumeExamActions(request, sender);
                
                systemState.validresumeSet = 1;      

            } else {
                
                systemState.validresumeSet = 2;
                console.log("closetabs5");
                var outurl = chrome.runtime.getURL('closetabserror.html') + "?list=" + encodeURIComponent(tablist) + "&exlist=" + encodeURIComponent(tablistextra) + "&excount=" + extracount + "&cmode=" + canvasmode + "&tmode=" + tabmode + "&dmode="+ dispmode;
                chrome.tabs.create({ url: outurl, active: true }, function(tab){
                    console.log('normal24 ' + systemState.examTabId);

                    systemState.currentTabSet = tab.id;
                    
                    
                    chrome.tabs.query({ 'title': 'LockDown Browser*' }, function(tabs) {    
                        for (var i = 0; i < tabs.length; i++) {
                            if (tabs[i].url.indexOf(chrome.runtime.id) != -1) { 
                                removeTab(tabs[i].id, "normal24 " + i);
                            }
                        }        
                                                       
                    });

                    


                    mywindowsupdate(tab.windowId, { state: "normal" });
                    mytabsupdate(systemState.examTabId, { url: systemState.restartUrl, active: false });
                    
                                
                    

                    console.log("checking state: id=" + systemState.examTabId + "," + systemState.inProcessingState('canvas') + "," + systemState.canvasExamMode + "," + systemState.canvasReviewMode) ;

                    console.log("schoology?" + systemState.inProcessingState('schoology'));

                    if (systemState.inProcessingState('moodle')) {
                        const currenturl = systemState.restartUrl;
                        chrome.cookies.remove({
                            name: "rldbci",
                            url: currenturl
                        });
                    }

                    if (systemState.inProcessingState('schoology')) {

                        const currenturl = systemState.restartUrl;
                        

                        console.log("current=" + currenturl);
                        var details = { url: currenturl };
                            chrome.cookies.getAll(details, function(cookies) {   
                                console.log(cookies);                                           
                                for (const cookie of cookies) {
                                    console.log("removing " + cookie.name + " in " + currenturl);
                                    if (cookie.name.indexOf("rldb") == 0) {
                                        chrome.cookies.remove({ name: cookie.name, url: currenturl }); 
                                    }
                                    
                                }
                            });
                    }

                    if (systemState.inProcessingState('canvas') && systemState.canvasExamMode == 'QOriginal' && systemState.canvasReviewMode == false) {

                        
                        //chrome.tabs.goBack(tab.id);

                        

                        chrome.tabs.get(systemState.examTabId, function(tab) {

                        const domain = tab.url.substring(0, tab.url.indexOf("//") + 2) + tab.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
                        const tabid = systemState.examTabId;

                        setTimeout(function(id, domainurl) { mytabsupdate(id, { url: domainurl, active: false }); }, 100, tabid, domain);
                                                        
                        systemState.fullreset();



                            var details = { url: domain };
                            chrome.cookies.getAll(details, function(cookies) {                                              
                                for (const cookie of cookies) {
                                    chrome.cookies.remove({ name: cookie.name, url: domain });                            
                                }
                            });
                        
                        });



                    }

                    tabCloseCleanup();
                    resetExamInfo();

                    
                    

                });                
                
            }

        });

    });
    
}

const restartUrlCheckD2L = function () {

    moveTabsToCurrentWindow();

    chrome.tabs.query({}, function(tabs) {
        
        var validtabs = GLOBAL_base_tabs;
        var currentTabs = tabs.length;
        var tablist = "<li>LockDown Browser for Chromebook (this tab)</li>";
        var tablistextra = "";
        var extracount = 0;
        // remove our tabs        
        for (var i = 0; i < tabs.length; ++i) {
            //console.log("checking tab " + i);
            if (tabs[i].url.indexOf(chrome.runtime.id) != -1 || tabs[i].title.indexOf("Files") == 0 || tabs[i].title.indexOf("Settings") == 0 || tabs[i].url.indexOf(GLOBAL_drm) != -1) {
                currentTabs--;
            } else {
                if (tabs[i].id != systemState.examTabId) {
                    if (i<11) {
                        tablist = tablist + "<li>" + tabs[i].title + "</li>";
                    } else {
                        tablistextra = tablistextra + "<li>" + tabs[i].title + "</li>";
                        extracount++;
                    }
                }
                

                const url = tabs[i].url;
                var domain = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

                //console.log("domain = " + domain);

                

            } // end else

        } // end for 

               

        console.log("-----> validtabd2l = " + validtabs + " vs " + currentTabs);
        

        if (currentTabs <= validtabs) {
            
            
            systemState.validresumeSet = 1;
            // this is exam submissions not an exam
            mytabsupdate(GLOBAL_d2l_main_tab, { url: systemState.handshakeUrl, active: false }, function(tab) {
                console.log("set exam tab " + tab.id);
                systemState.examTabSet = tab.id;
                changeExamWindow(tab.windowId, "extractd2lcont");
            });
        } else {
            
            systemState.validresumeSet = 2;
            console.log("closetabs6");
            var errorouturl = chrome.runtime.getURL('closetabserror.html') + "?list=" + encodeURIComponent(tablist) + "&exlist=" + encodeURIComponent(tablistextra) + "&excount=" + extracount;
            
            chrome.tabs.create({ url: errorouturl, active: true }, function(tab){
                console.log('normal25');
                mywindowsupdate(tab.windowId, { state: "normal" });
                tabUpdateWithUrl(systemState.examTabId, systemState.restartUrl);
                            
                tabCloseCleanup();
                resetExamInfo();
                

            });                
            
        }

    });
    
}

 

const tabCloseCleanup = function () {

    removeTab(systemState.drmTabId, "drmtabclosecleanup");


    systemState.reset();  
    resetExamInfo();

    

    if (GLOBAL_schoology_security != -1) {
        
        removeTab(GLOBAL_schoology_security, "tabCloseCLeanup");
        GLOBAL_schoology_security = -1;
    }
     


    chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
        if (tabs.length > 0) {
            var activetab = tabs[0].id;            
            
            removeTab(activetab, "tabclosecleanup webcam");
        }
    });

    chrome.cookies.remove({
        "name": "rldbci",
        "url": systemState.domain
    });

         
    chrome.cookies.remove({
        "name": "rldbrv",
        "url": systemState.domain
    });

}

const resumeExamActions = function (request, sender) {
    // make sure its been hidden again (in case of FD screen)
   console.log("resumeexamactions");

    hideWebCam();
    systemState.susReadySet = true;

    if (systemState.drmDisabled == false) {
        //console.log("deploying drm");
        deploydrm();
    }

    
    


    if (request.pid) {
        systemState.tokenSet = request.pid;
    }

    if (request.ps) {
        systemState.psSet = request.ps;
    }

    if (request.sid) {
        systemState.sequenceSidSet = request.sid;

        if (systemState.monitorBypassed == true) {
            labExamStart(request.sid);
        } else {
            sendStartExam(request.sid);
        }


    }


    systemState.monitorRunningSet = request.monitor;
    systemState.svlpmodeSet = request.monitor;





    if (systemState.inProcessingState('d2l') && request.monitor == false) {
        chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
            var activetab = tabs[0].id;

            
            removeTab(activetab, "resumeexamactions d2l");
        });
    }


    var pos = sender.url.indexOf("server=");
    var url = sender.url.substring(pos + 7);
    var pos2 = url.indexOf("&");
    if (pos2 != -1) {
        url = url.substring(0, pos2); 
    }


    if (systemState.deferredHandshake != null) {

        //console.log("setting rldbrv");

        chrome.cookies.set({
            "name": "rldbrv",
            "url": url,
            "value": systemState.deferredHandshake
        }, function(cookie) {

            //console.log("setting rldbrv");


            if (systemState.inProcessingState('d2l')) {
                resumeExamD2L(request);
            } else {

                if (systemState.inProcessingState('schoology')) {
                    resumeExamSchoology(request);
                } else {
                    if (systemState.inProcessingState('canvas')) {
                        resumeExamCanvas(request);
                    }
                }

            }


        });

        systemState.cookieUrlSet = url;
    } else {
        // handshake has not happened yet do it later
        if (systemState.inProcessingState('canvas') == true) {

            resumeExamCanvas(request);
        }

        if (systemState.inProcessingState('d2l')) {

            resumeExamD2L(request);
        }
        if (systemState.inProcessingState('schoology')) {

            resumeExamSchoology(request);
        }
        if (systemState.inProcessingState('ultra')) {

            logToWindow("going to resumeExamBbUltra");

            chrome.cookies.set({
                "name": "rldbci",
                "url": url,
                "value": "1"
            }, function(cookie) {

                resumeExamBbUltra(request);
            });



        }

        if ( systemState.inProcessingState('moodle')) {

            resumeExamMoodle(request);
        }


        if (systemState.inProcessingState('blackboard')) {
        //if (GLOBAL_blackboard_processing == true) {

            
            changeExamState(true, "resume exam blackboard");
            blackboardInjectCode();

            // make sure we have switched back
            tabUpdateShow(systemState.examTabId);

            if (request.monitor == false) {
                // remove that tab
                chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {

                    for (var i = 0; i < tabs.length; i++) {
                        var activetab = tabs[i].id;

                        
                        removeTab(activetab, "resumeexamactions Bb");
                    }

                });

            }
        }
    }  
}


const canvasEndExam = function (details) {

    logToWindow("canvasEndExam");

    var out = { cancel: false };

    // check its the real end and not a next question
    if (details.url.indexOf("record_answer") == -1) {


        if (systemState.examStarted == true) {
            // END OF THE EXAM

            changeExamState(false, "record_answer");
           
            

            chrome.tabs.query({ 'title': 'Canvas LMS' }, function(tabs) {

                if (tabs != null && tabs[0] != null) {
                    var activetab = tabs[0].id;
                    
                    removeTab(activetab, "canvasendexam");
                }

            });

            chrome.tabs.query({ 'title': 'Quiz:*' }, function(tabs) {

                if (tabs != null && tabs[0] != null) {

                    for (var i = 0; i < tabs.length; i++) {
                        
                        removeTab(tabs[i].id, "quiz");
                    }
                }

            });

            chrome.tabs.create({ openerTabId: details.openerTabId, active: true, url: details.url }, function(tab) {


                setTimeout(function() { removeTab(details.tabId, "canvasendexam"); }, 1500);

                notifyWebcamWait();


            });

            changeAttemptState(true, "canvasEndExam"); 

            
            cleanupSecondaryTabs();

        } else {
            if (GLOBAL_nonsecure_mode == true) {
                resetExamInfo();
            }
        }
    }

    return out;

}

const canvasAttempt = async function (details) {

    

    logToWindow("canvasAttempt");
    //console.log(details.url);



    var out = { cancel: false };

    var cookieurl = details.initiator;


    var local_count = GLOBAL_count;
    GLOBAL_count = GLOBAL_count + 1;

    if (systemState.attemptStarted == true) {
        // we are allowing the user to review their attempts but clicking anything else will end the exam



        var chist = details.url.indexOf("history");
        var csub = details.url.indexOf("submissions");
        var cquiz = details.url.indexOf("quizzes/");
        var ctake = details.url.indexOf("take");
        

        



        if (csub != -1) {
            systemState.canvasReviewModeSet = true;
        }



        if (chist == -1 && csub == -1) {

            if (cquiz == -1 || ctake > 0) {

                changeExamState(false, "canvasAttempt");                

                
                systemState.examTabSet = details.tabId;
                var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode;
                tabUpdateWithUrl(details.tabId, outurl);
                //notifyWebcam();
            }
        }

    } 


    if (cookieurl) {


        
        chrome.cookies.set({
            "name": "rldbci",
            "url": cookieurl,
            "value": "1"
        }, function(cookie) {
            //console.log(JSON.stringify(cookie));
            //console.log(chrome.extension.lastError);
            //console.log(chrome.runtime.lastError);
        });
        

        chrome.cookies.set({
            "name": "cbLDB",
            "url": cookieurl,
            "value": "1"
        }, function(cookie) {
            //console.log(JSON.stringify(cookie));
            //console.log(chrome.extension.lastError);
            //console.log(chrome.runtime.lastError);
        });
    }


};

const canvasEndExamValid = function (details) {

    logToWindow("canvasEndExamValid");

    var out = { cancel: false };

    if (systemState.examStarted == true) {
        // END OF THE EXAM
        
        changeExamState(false, "canvasEndExamValid");        
        
        var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode;
        out = { redirectUrl: outurl };

        notifyWebcam(true);

        //chrome.tabs.create({ active: true, url: details.url }, function(tab) {
        //    setTimeout(function() { chrome.tabs.remove(details.tabId); }, 1000);
        //});

        changeAttemptState(true, "canvasEndExamValid"); 

        
        cleanupSecondaryTabs();

    } else {
        if (GLOBAL_nonsecure_mode == true) {
            resetExamInfo();
        }
    }



    return out;

}

const labExamEnd = function (sidin) {
    logToWindow("labExamEnd");
}



const signalPrestartFinished = function () {

    logToWindow("signalPrestartFinished");

  //console.log("signalPrestartFinished");



    mytabsupdate(systemState.examTabId, { active: true, highlighted: true }, function(tabs) {
        systemState.currentTabSet = systemState.examTabId;

        changeExamState(true, "signalPrestartFinished");

        if (systemState.inProcessingState('ultra')) {
            setupTabManagementSingle(systemState.examTabId, 'BbUltra');
        }

        if (systemState.inProcessingState('blackboard')) {
        //if (GLOBAL_blackboard_processing == true) {
            setupTabManagementSingle(systemState.examTabId, 'Blackboard');
        }

        if (systemState.inProcessingState('schoology')) {
            setupTabManagementSingle(systemState.examTabId, 'Schoology');
        }

        if (systemState.inProcessingState('canvas')) {
            setupTabManagementSingle(systemState.examTabId, 'Canvas');
        }

        if (systemState.inProcessingState('d2l')) {
            setupTabManagementSingle(systemState.examTabId, 'Brightspace');
        }

        
        chrome.scripting.executeScript( {
          target: {tabId: systemState.examTabId },
          files: ["js/inject/myscript.js"],
          world: chrome.scripting.ExecutionWorld.MAIN,
        },
        (e) => {});
        

        /*
        chrome.scripting.executeScript(GLOBAL_exam_tabid, { code: scode, runAt: 'document_end' }, function(results) {
            //changeExamState(true, "scode");          
        });
        */




    });



}

const resumeExamBbUltra = function (request) {        

    logToWindow("resumeExamBbUltra");

   systemState.processing = 'ultra';

    if (request.monitor == false) {
        // remove that tab
        chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {

            if (tabs != null && tabs[0] != null) {
                var activetab = tabs[0].id;
                
                removeTab(activetab, "resumeexamBbultra");
            }

        });
    }

    GLOBAL_rvector_ready = true;

    if (systemState.examStarted == false) {

        changeExamState(true, "resumeExamBbUltra");    

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            var activetab = tabs[0].id;

            //V3CHANGE
            //console.log("BBResume: " + systemState.resumeUrl);

            logToWindow("BBResume [" + systemState.resumeUrl + "]");

            chrome.tabs.create({ url: systemState.resumeUrl }, function(tab) {
                    systemState.examTabSet = tab.id;
                    GLOBAL_complete_activeTab = tab.id;     
                    systemState.currentTabSet = tab.id;         
                });

            mywindowsupdate(tabs[0].windowId, { state: GLOBAL_screen }); //FULLSCREEN  
            changeExamWindow(tabs[0].windowId, "resumebbUltra");
        });    

        

    }

}

const resumeExamMoodle = function (request) {

    

    logToWindow("resumeExamMoodle");

    GLOBAL_rvector_ready = true;

    if (request.monitor == false) {
        // remove that tab
        chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {

            if (tabs != null && tabs[0] != null) {
                var activetab = tabs[0].id;
                
                removeTab(activetab, "resumeexamMoodle");
            }

        });

    }

    if (systemState.examStarted == false) {

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            var activetab = tabs[0].id;
            GLOBAL_complete_activeTab = activetab;

            

            tabUpdateWithUrl(systemState.examTabId, systemState.resumeUrl);
            systemState.currentTabSet = systemState.examTabId;
            mywindowsupdate(tabs[0].windowId, { state: GLOBAL_screen }); //FULLSCREEN  
            changeExamWindow(tabs[0].windowId, "resumeexammoodle");
        });

    }


}

const resumeExamD2L = function (request) {

    logToWindow("resumeExamD2L");

    GLOBAL_rvector_ready = true;
    GLOBAL_d2l_mode_resume = true;

    if (systemState.examStarted == false) {

        changeExamState(true, "resumeExamD2L");

        

        chrome.cookies.set({
            "name": "rldbci",
            "url": systemState.domain,
            "value": "1"
        }, function(cookie) {


            //url: systemState.handshakeUrl,
            mytabsupdate(GLOBAL_d2l_main_tab, { active: true }, function(tab) {
                
                systemState.examTabSet = tab.id;
                changeExamWindow(tab.windowId, "resumeexamd2l");
            });



        });




    }
}

const resumeExamSchoology = function (request) {

    logToWindow("resumeExamSchoology");

    GLOBAL_rvector_ready = true;

    if (systemState.examStarted == false) {


        changeExamState(true, "resumeExamSchoology");        

        if (GLOBAL_schoology_security != -1) {
            
            removeTab(GLOBAL_schoology_security, "resumeExamSchoology");
            GLOBAL_schoology_security = -1;
        }

        setTimeout(function() { signalPrestartFinished(); }, 800);


       
    }
}


// ***************************************************************************************************
// TAB MANAGEMENT


chrome.tabs.onCreated.addListener(function(tab) {

    logToWindow("Tab created: " + tab.id + "," + tab.url );

    //console.log("Tab created");
    //console.log(tab);


/*
    if (systemState.examStarted == true) {
        if (GLOBAL_tabgroup == null) {
            chrome.tabs.group({tabIds: tab.id}, function(groupId) {
                GLOBAL_tabgroup = groupId;
            })
        } else {
            chrome.tabs.group({tabIds: tab.id, groupId: GLOBAL_tabgroup});
        }
        
    }
    */

    if (systemState.examStarted == true && systemState.inProcessingState('d2l')) {
        //console.log("tabman adding " + tab.id);
        GLOBAL_inject_ids.push(tab.id);
    }


    if (!systemState.windowCheckInProgress) {
            
        if (tab.windowId != systemState.examWindow && systemState.examWindow != -1) {
            chrome.tabs.move(tab.id, {index: 0, windowId: systemState.examWindow}, function(e) {
                tabUpdateShow(tab.id);
            });    
        }


        if (systemState.examStarted == true) {
             if (tab.url.indexOf("google") != -1 || tab.url.indexOf("chrome:") != -1 || tab.url.indexOf("bing.com") != -1) {
                console.log("removing google tab");

                //removeTab(tab.id, "google");
            } else {
                if (systemState.inProcessingState('d2l')) {
                    if (tab.openerTabId) {
                        //GLOBAL_extra_tabs.push(tab.openerTabId);
                    }
                } else {
                    //GLOBAL_extra_tabs.push(tab.id);
                }

            }

        }
    }


});




// ***

function identifyTab(id) {

    const para = document.createElement("p");
    para.innerText = "Tab id: " + id;
    document.body.appendChild(para);
    
}


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    console.log("Tab was updated " + tab.status + " changeinfo " + changeInfo.status);




   
   



    if (tab.status == 'complete' && changeInfo.status == 'complete' && (tab.title.indexOf("Trouble") != -1 || tab.title.indexOf("Knowledge Base") != -1) ) {               

        systemState.currentTabSet = tab.id;
        tabUpdateShow(tab.id);
    }


/*
    chrome.tabs.query({ 'title': 'Trouble*' }, function(trouble_tabs) {                

                if (trouble_tabs == null || trouble_tabs.length == 0) {
                    chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {                

                    if (tabs != null && tabs[0] != null) {
                        var activetab = tabs[0].id;
                        systemState.currentTabSet = activetab;
                        mytabsupdate(activetab, { active: true, highlighted: true }, function() {});
                    }
                });
                }
            });

            */

    
    //logToWindow("Tab updated: [" + tabId + "] " + tab.url + " status: " + tab.status);


    //console.log("Tab updated: [" + tabId + "] " + tab.url + " status: " + tab.status + " change: " + changeInfo.status);

     if (tab.status == 'complete' && changeInfo.status == 'complete') {

        //console.log("checking preexam " + systemState.preExamStarted);

        if (systemState.preExamStarted == true && tab.url.indexOf('chrome-extension://' + chrome.runtime.id) == -1) {
        
        console.log("BLOCKING LINKS ------------------------------------------------------->>>>>>>");
            chrome.scripting.executeScript( {
                target: {tabId: systemState.examTabId },
                files: ["jquery-3.4.1.min.js", "js/inject/preexam.js"],
                world: chrome.scripting.ExecutionWorld.MAIN,
              },
              (e) => { });
        }
        
        if (tab.url.indexOf("paypal") != -1) {
            systemState.paypalIdSet = tab.id;
            //console.log("paypal "+ systemState.paypalId);

            chrome.scripting.executeScript( {
              target: {tabId: tab.id},
              files: ["jquery-3.4.1.min.js", "protectpaypal.js"]
            }, function(e) {
                //console.log('done injecting paypal');
            });
        }
    }

    if(tab.status == 'complete' && changeInfo.status == 'complete' && (systemState.examStarted || systemState.attemptStarted)) {
        const domainurl = (tab.url.indexOf(systemState.domain) != -1);
        const sysurl = (tab.url.indexOf('chrome-extension') == 0);
        const serverurl = (tab.url.indexOf(GLOBAL_server) == 0);

        

        setTimeout(()=>{

            var allowed = false;

            if (tabId == systemState.examTabId || domainurl || sysurl || serverurl || tabId == systemState.earlyExitWindow) {
                allowed = true;
            } else {
                systemState.tabIds.forEach((opentabId)=>{
                    if( tabId == opentabId ) {
                        allowed = true;
                    }
                });
            }

            const empty = (tab.url == 'chrome-extension://' + chrome.runtime.id + '/');

            

            //console.log("notallowed " + tabId + " url " + tab.url + " allow: " + allowed + " empty " + empty);
            
            if (empty) {
                // empty reference
                chrome.tabs.remove(tabId);
            }

            if (allowed == false) { 

                
                //chrome.tabs.remove(tabId);               
                
                tabUpdateShow(systemState.examTabId);
                console.log('normal26');
                mywindowsupdate(systemState.examWindow, {state:'normal'});
                mywindowsupdate(systemState.examWindow, {state:GLOBAL_screen}); 
            }
        }, 100);

    }

/*
    if (tab.status == 'complete' && changeInfo.status == 'complete') {
        console.log("Tab updated: [" + tabId + "] " + tab.url + " status: " + tab.status + " change: " + changeInfo.status);
        chrome.scripting.executeScript(
            {
              //target: {tabId: GLOBAL_complete_activeTab},
              target: {tabId: tab.id},
              func: identifyTab,
              args: [tab.id]
            },
            () => { 
                console.log('injected tab id');          
            });
    }
    */
    
    

    
    

    
    
    



    //console.log("tabs.onUpdated: " + tabId);
    //console.log(tab);

    // special case tabs
    


    if (tab.url.indexOf("lockdown_browser_required") != -1) {

        if (systemState.examStarted == false && systemState.lmsProcessing == 'nonereset') {
            
            const domain = tab.url.substring(0, tab.url.indexOf("//") + 2) + tab.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
            //chrome.tabs.goBack(tab.id);

            clearAll();resetExamInfo(); 
            systemState.fullreset();
            setTimeout(function(){ tabUpdateWithUrl(tab.id, domain);  }, 200); 
            
            
        }


       
        

        if (systemState.examStarted == true) {
            //console.log("tab removed"); chrome.tabs.remove(tab.id);
        }


        //maxWindow();
    }


    if (tab.url.indexOf("crosh") != -1) {
        
        removeTab(tab.id, "crosh");
        maxWindow();
    }

    if (systemState.examStarted == true) {

        if (tab.url.indexOf("google") != -1) {

            console.log("detected google checking");

            const domains = systemState.externalDomainList;
            const linkaddr = tab.url;

            console.log("external domain list: " + linkaddr);
            console.log(domains);

            var valid = false;
            if (domains && domains != '') {
                const domainstr = domains.replace(/\s/g, '');
                const domArray = domainstr.trim().split(",");
                for (dom of domArray) {
					console.log(dom);
					if (linkaddr.indexOf(dom) != -1) {
						valid = true;
					}
				}
            }
            
            console.log("valid is " + valid);
            if (!valid) {
                removeTab(tab.id, "google2");
            }
            
        }

        
        
    }

    if (systemState.resumeUrl2 != "" && tab.url.indexOf(systemState.resumeUrl2) != -1) {


        if (tab.status == 'complete' && changeInfo.status == 'complete') {

            logToWindow("prestart script");

            // prestart complete
            chrome.scripting.executeScript( {
              target: {tabId: systemState.examTabId },
              files: ["js/inject/myscript.js"],
              world: chrome.scripting.ExecutionWorld.MAIN,
            },
            (e) => {});

            

            setTimeout(function() { signalPrestartFinished(); }, 100);

        }



    }

    if (tab.status == 'complete' && changeInfo.status == 'complete') {


   

        // Blackboard

        chrome.runtime.getPlatformInfo(function(platformInfo) {
            var os = platformInfo.os;

            if (os == GLOBAL_os) {
                console.log("Bb url " + tab.url);
                if (tab.url.indexOf("take/launch.jsp") != -1) {

                    
                    

                    var pos = tab.url.indexOf("step=null");
                    var pos2 = tab.url.indexOf("new_attempt");
                   

                    if (pos != -1 || pos2 != -1) {

                        
                            // black board
                            //console.log(tab);

                            if (tab.title.indexOf("assword") != -1 || tab.title.indexOf("achtwoord") != -1 ||
                                tab.title.indexOf("ontraseña") != -1 || tab.title.indexOf("asse")) {

                                
                            }
                        
                                           
                        
                    }

                }

            }
        });






        if (tab.url.indexOf("MONServer/chromebook/faq.do") != -1) {

            

            //addToTabs(tab.id, "Troubleshooting");
            chrome.scripting.executeScript( {
              target: {tabId: tab.id},
              files: ["jquery-3.4.1.min.js","protectwindow.js"]
            }, function(e) {
                //console.log('done injecting faq');
            });

            // notify all open tabs of the change
            chrome.tabs.query({}, function(tabs) {
                

                var message = { action: "openlinkbk", tabid: tab.id, label: "Exam Link" };
                for (var i = 0; i < tabs.length; ++i) {
                    chrome.tabs.sendMessage(tabs[i].id, message);
                }
            });
        }

        //console.log("d2l review mode " + systemState.d2lReviewMode);

        if (systemState.d2lReviewMode == true) {

            //console.log('inserting protectwindowalt review');

            chrome.scripting.executeScript( {
                    target: {tabId: tabId},
                    files: ["jquery-3.4.1.min.js", "protectwindowalt.js"],
                    world: chrome.scripting.ExecutionWorld.ISOLATED
                  });

        }

        var posext = tab.url.indexOf("chrome-extension");
        var posext2 = tab.url.indexOf("chrome:");

       // console.log("POSEXT= " + posext + " for " + tab.url);

        if ( (systemState.examStarted || systemState.attemptStarted) && (posext == -1 && posext2 == -1) ) {

            // inject click break
            if (systemState.tabIds[0] != tabId) {
                
              chrome.scripting.executeScript( {
                target: {tabId: tabId},
                files: ["jquery-3.4.1.min.js"],
                world: chrome.scripting.ExecutionWorld.ISOLATED
              }, function() {

                
                if (systemState.examStarted) {
                  chrome.scripting.executeScript( {
                    target: {tabId: tabId},
                    files: ["blockclick.js", "js/d2lessay.js"],
                    world: chrome.scripting.ExecutionWorld.ISOLATED
                  });

                }
                


              });
            }

            if (systemState.inProcessingState('moodle')) {
                chrome.scripting.insertCSS({
                        target: { tabId: tabId },
                        files: ["css/moodle-fix.css"]
                    });
            }

            if (systemState.inProcessingState('schoology')) {
                if (tab.url.indexOf("assessment") != -1) {
                    // this is the exam tab
                    systemState.examTabSet = tab.id;
                }
            }

            

            if (systemState.inProcessingState('d2l')) {

                console.log("planning injecting protectwindowalt");
                
                if (GLOBAL_inject_ids.includes(tabId)) {

                    console.log("injecting protectwindowalt");

                    var loc = GLOBAL_inject_ids.indexOf(tabId);
                    //GLOBAL_inject_ids.splice(loc);

                    

                    // inject protection
                    
                        chrome.scripting.executeScript( {
                        target: {tabId: tabId },
                        files: ["jquery-3.4.1.min.js", "protectwindowalt.js"],
                        world: chrome.scripting.ExecutionWorld.ISOLATED,
                        },
                        (e) => {});
                        
                    

                }

                

            } else {
                // inject protection
                

                
                chrome.scripting.executeScript( {
                        target: {tabId: tabId},
                        files: ["jquery-3.4.1.min.js", "protectwindow.js"],
                        world: chrome.scripting.ExecutionWorld.ISOLATED,
                    });
                    
            }


            

            // inject essaylink
            // load disable links script
            //chrome.tabs.executeScript(tabId, {file: "js/disable_essay_links.js" }, function() {            
            // console.log("INJECTING DISABLE ESSAY");   
            //});             

            //if (!chrome.runtime.lastError) {
                if (true) {


                if (tab.url.toLowerCase().indexOf(".pdf") != -1) {
                    chrome.scripting.insertCSS({
                        target: { tabId: tabId },
                        files: ["border-nobody.css"]
                    });
                } else {


                    if (systemState.inProcessingState('d2l')) {

                        chrome.scripting.executeScript( {
                          target: {tabId: tab.id},
                          files: ["jquery-3.4.1.min.js","fixd2l.js"]
                        });

                    } else {

                        if (tab.url.toLowerCase().indexOf("chrome-extension") == -1 &&
                            tab.url.toLowerCase().indexOf("faq.do") == -1) {

                        //console.log("injecting border CSS");
                            chrome.scripting.insertCSS({
                                target: { tabId: tabId },
                                files: ["border.css"]
                            });
                        }

                    }
                  
                    
                }

                //console.log("ready to insert border JS " + tab.url);


                //if (!chrome.runtime.lastError) {

                
                if ( tab.url.toLowerCase().indexOf("chrome-extension") == -1 &&
                     tab.url.toLowerCase().indexOf("faq.do") == -1) {
                    

                    //console.log("Adding border.js to " + tab.url);

                
                    chrome.scripting.executeScript( {
                            target: {tabId: tabId},
                            files: ["jquery-3.4.1.min.js", "border.js"],
                            world: chrome.scripting.ExecutionWorld.ISOLATED,
                        }, function (e) {
                            
                        });      
                                                                                        
                    
                }
            }

        }

    }
});




const setupBlackboardTabManagement = function (tabId, webcamTabId) {

    logToWindow("setupBlackboardTabManagement");

    if (systemState.tabSetup == false) {
        systemState.tabSetupSet = true;

        
        systemState.tabIdsSet = [tabId];
        systemState.tabNamesSet = ["Blackboard"];
        

        //GLOBAL_exam_tabid = tabId;
        systemState.examTabSet = tabId;
        systemState.webcamTabIdSet = webcamTabId;
    }
}

const setupTabManagementSingle = function (tabId, tabLabel) {

    logToWindow("setupTabManagementSingle");

    if (systemState.tabSetup == false) {
        systemState.tabSetupSet = true;

        
        systemState.tabIdsSet = [tabId];
        systemState.tabNamesSet = [tabLabel];
        

        systemState.examTabSet = tabId;
        systemState.webcamTabIdSet = -1;

        
    }
}

const buildTabString = function (incomingId) {

    logToWindow("buildTabString");


    var tabline = "";    
    for (i = 0; i < systemState.tabIds.length; i++) {

        var currentName = systemState.tabNames[i];
        if (!currentName) {
            currentName = "<Loading>";
        }

        var active = "";
        if (systemState.tabIds[i] == incomingId) {        
            active = " active";
        }


        tabline = tabline + '<li id="' + systemState.tabIds[i] + '" class="nav-item' + active + '">';
        tabline = tabline + '<a class="nav-link">';

        //  no close for main

        tabline = tabline + currentName;

        if (i != 0) {       
            tabline = tabline + '<i class="fa fa-window-close closeTab"></i>';         

            
        } else {

            if (systemState.monitorRunning || systemState.screenrecmode) {
                tabline = tabline + '<img id="record-icon" src="../images/recording-icon.png"></img>';
            }

            /*
            if (systemState.monitorRunning && !systemState.screenrecmode) {
                //tabline = tabline + '<img id="record-icon" src="../images/recording-icon.png"></img>';
                tabline = tabline + '<img id="record-icon" src="../images/webcam_recording_icon.png"></img>';                
            } else {
               if (systemState.screenrecmode) {
                       tabline = tabline + '<img id="record-icon" src="../images/screen_recording_icon.png"></img>';                
                } 
            }
            */

            
        }

        tabline = tabline + '</a></li>';

    }

    tabline = tabline + "::::";

    if (systemState.calculatorMode != 'DISABLED') {
        tabline = tabline + '<img id="calc-button" src="../images/calculator-light.png"></img>';
    }

    tabline = tabline + ";;;;";
    

    // 7241 - show when in review mode for Canvas
    if (systemState.attemptStarted == true || systemState.earlyExitMode == true || systemState.canvasReviewMode == true || systemState.schoologyReviewMode == true)
        tabline = tabline + '<img id="exit-button" src="../images/x-square.png"></img>';
    else if (systemState.earlyExitMode == false) {
        tabline = tabline + '<img id="locked-button" src="../images/x-square.png"></img>';
    } else {
        tabline = tabline + ' ';
    }

        

    //console.log("tabline: " + tabline);

    return tabline;
}


const addToTabs = function (id, name) {

    
    systemState.tabIdsAdd = id;
    systemState.tabNamesAdd = name;
}

const removeFromTabs = function (id) {
    systemState.tabIdsRemove = id;

    /*
    const index = GLOBAL_tab_ids.indexOf(id);
    if (index > -1) {
        GLOBAL_tab_ids.splice(index, 1);
        GLOBAL_tab_names.splice(index, 1);
    }
    */
}

// -------------------------------------------------------------------------------


chrome.runtime.getPlatformInfo(function(platformInfo) {
    var os = platformInfo.os;

    if (os == GLOBAL_os) {

        chrome.webNavigation.onErrorOccurred.addListener(function(navinfo) {
            console.log("error");
            console.log(navinfo);

            logToWindow("Error: " + navinfo.error + " from " + navinfo.url + " examStarted? " + systemState.examStarted);

            if (navinfo.error == "net::ERR_INVALID_URL") {
                if (navinfo.url.indexOf("data://text/plain:rldb:gh") != -1) {
                    console.log("found the data URL!");
                    chrome.tabs.create({
                        url: "about:blank"
                      }, function() {
                        chrome.tabs.remove(navinfo.tabId);
                      });
                      

                }
            }
            if (systemState.examStarted == true || systemState.attemptStarted == true) {

                if (navinfo.error == "net::ERR_NAME_NOT_RESOLVED") {

                    // moodle has an error on this command
                    if (navinfo.url.indexOf("sbxcmd") == -1) {

                        if (systemState.examTabId > 0) {
                            tabUpdateShow(systemState.examTabId);
                            systemState.currentTabSet = systemState.examTabId;
                        }

                        
                        
                        removeTab(navinfo.tabId, "sbxcmd");

                        removeFromTabs(navinfo.tabId);        

                    }

                                

                }

                if (navinfo.error == "net::ERR_FAILED") {

                        if (systemState.examTabId > 0) {
                            tabUpdateShow(systemState.examTabId);
                            systemState.currentTabSet = systemState.examTabId;
                        }
                        
                        removeTab(navinfo.tabId, "sbxcmd");

                        removeFromTabs(navinfo.tabId);        

                }


             }
        });

        chrome.webNavigation.onCompleted.addListener(function(navinfo) {

            systemState.beforeunloadSet = false;

            if (systemState.examStarted == true) {
                maxWindow2();
            }


            if (navinfo.url.indexOf("blocks/lockdownbrowser/autoprestart.php") != -1) {
                reactToPrestartMoodle(navinfo);
            }
        });


        chrome.webNavigation.onBeforeNavigate.addListener(function(navinfo) {
            console.log("URL--> " + navinfo.url + ", started=" + systemState.examStarted + "(" + systemState.examTabId + "), attemptmode = " + systemState.attemptStarted);
            //console.log(navinfo);
            
            logToWindow("URL--> " + navinfo.url + ", started=" + systemState.examStarted + ", attemptmode = " + systemState.attemptStarted);
            

            if (systemState.inProcessingState('d2l')) {
                var domain = navinfo.url.substring(0, navinfo.url.indexOf("//") + 2) + navinfo.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
                console.log("setting popup on " + domain);
                chrome.contentSettings.popups.set({
                    primaryPattern: domain + "/*",
                    setting: "allow"
                });
            }

            //logToLocalStorage("navigation--->" + navinfo.url);

            GLOBAL_last_url = navinfo.url;

            if (systemState.examStarted == true || systemState.attemptStarted == true) {
                //while the exam is running prevent the browser from going back
                chrome.history.deleteAll(function() {});
                

            } else {
                var domain = navinfo.url.substring(0, navinfo.url.indexOf("//") + 2) + navinfo.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
                chrome.cookies.set({
                    "name": "cbLDBex",
                    "url": domain,
                    "value": "1"
                }, function(cookie) {});

                chrome.cookies.set({
                    "name": "cbLDB",
                    "url": domain,
                    "value": "1"
                }, function(cookie) {});
            }

            // D2L
            if (navinfo.url.indexOf("rldb:bm") != -1) {

                console.log("found D2L Autolaunch.......................");
                systemState.examTabSet = navinfo.tabId;
                extractAutoLaunchD2L(navinfo.url, navinfo.tabId);
            }

            // Moodle     
            if (navinfo.url.indexOf("rldb:co") != -1) {
                systemState.examTabSet = navinfo.tabId;
                extractAutoLaunchMoodle(navinfo.url);

                //reload to hide blank screen in moodle 7751
                chrome.tabs.reload(navinfo.tabId); 
            }

            // Schoology     
            if (navinfo.url.indexOf("rldb:gh") != -1) {
                systemState.examTabSet = navinfo.tabId;
                extractAutoLaunchSchoology(navinfo.url);
            }

            // BBUltra
            if (navinfo.url.indexOf("rldb:vl") != -1) {
                systemState.examTabSet = navinfo.tabId;
                extractAutoLaunchBbUltra(navinfo.url, navinfo.tabId);
            }

            // Canvas

            /*

            if (navinfo.url.indexOf("refresh_ldb=true") != -1) {
                console.log("refresh ldb reloading");

                    

                setTimeout(function(){ 
                    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
                    var activetab = tabs[0].id;
                    alert({html:"reloading now "});
                    chrome.tabs.reload(activetab);                     
                    });               
                }, 3000); 

                setTimeout(function(){ 
                    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
                    var activetab = tabs[0].id;
                    alert({html:"reloading 2 now "});
                    chrome.tabs.reload(activetab);                     
                    });               
                }, 6000); 
                
            }
            */



            // EXIT
            if ( (systemState.examStarted || systemState.attemptStarted) && navinfo.url.indexOf("rldbxb=1") != -1) {
                // the exam is ending shutdown the exam
                

                systemState.examTabSet = navinfo.tabId;
                systemState.currentTabSet = navinfo.tabId;

                
                
                setTimeout(function() { var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode; tabUpdateWithUrl(navinfo.tabId, outurl); }, 100);

                notifyWebcam(true);


            }

            if (navinfo.url.indexOf("set_security?rldbsl=1") != -1) {
                changeExamState(false, "set_security"); 
                changeAttemptState(true, "set_security"); 

                
                cleanupSecondaryTabs();

                // inform webcam
                notifyWebcam(true);
                
            }

            if (navinfo.url.indexOf("startup_sequence_done.do") != -1) {

                console.log("startup sequence done");

                systemState.susReadySet = true;

                if (navinfo.url.indexOf("pex=1") != -1) {
                    systemState.monitorBypassedSet = true;
                }

                systemState.monitorRunningSet = false;


            }

            if (navinfo.url.indexOf("student_feedback2.do") != -1) {

               
            }

            if (navinfo.url.indexOf("cbe_help_center_continue") != -1) {

                //console.log("help center continue");    

                var conturl = navinfo.url;
                var t = param(conturl, 't');
                var hct = param(conturl, 'hct');

                GLOBAL_issue_token = t;
                GLOBAL_issue_hct = hct;

                


            }

            // Canvas review - extra tab
            if (navinfo.url.indexOf("refresh_ldb=true") != -1) {
                //console.log(navinfo);
                
                removeTab(navinfo.tabId, "refresh_ldb");
            }


            if (navinfo.url.indexOf("student_feedback_close.do") != -1) {

                //console.log("student_feedback_close detected");

                chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
                    var activetab = tabs[0].id;
                    //console.log("studentfeedbackclose");

                    setTimeout(function() { removeTab(activetab, "student_feedback_close"); }, 100);

                    
                    systemState.monitorRunningSet = false;
                });

                // cleanup is waiting for feedback to complete
                //console.log("feedback cleanup");
                cleanupEndExam();
            }


        });


    }




});




// ***************************************************************************************
// CLEANUP

const cleanAddedTabs = function () {
    chrome.tabs.remove(GLOBAL_extra_tabs, function() {
        GLOBAL_extra_tabs = [];
    });
}


const cleanupExtraTabs = function () {

    logToWindow("cleanupExtraTabs");

    chrome.tabs.query({ 'title': 'LockDown Browser*' }, function(tabs) {    
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].url.indexOf(chrome.runtime.id) != -1) { 
                        removeTab(tabs[i].id, "cleanupExtraTabs " + i);
                    }
                }                                          
            });


    // Schoology
    // special case
    chrome.tabs.query({ 'title': '*Desmos*' }, function(tabs) {

        console.log("Found desmos...")
        console.log(tabs)

        if (tabs.length > 0) {
            for (tab of tabs) {                
                removeTab(tab.id, "desmoscalculator");
            }
        }
        
        
    });

    chrome.tabs.query({ 'url': '*about:blank*' }, function(tabs) {

        if (tabs && tabs[0]) {            
            removeTab(tabs[0].id, "aboutblank");
        }

    });

    // Ultra extra tab
    chrome.tabs.query({ 'url': 'https://*.blackboard.com/*respondusRequirement*' }, function(tabs) {

        if (tabs && tabs[0]) {            
            removeTab(tabs[0].id, "requirement");
        }

    });
    

    /*
    cleanAddedTabs();
    */

     // schoology prestart
     
    chrome.tabs.query({ 'url': 'https://*/apps/ldb/start_finished*' }, function(tabs) {

        if (tabs && tabs[0]) {

            
            removeTab(tabs[0].id, "start_finish");
        }

    });


    chrome.tabs.query({ 'title': 'data*' }, function(tabs) {

        if (tabs && tabs[0]) {

            removeTab(tabs[0].id, "data");
        }

    });


    chrome.tabs.query({ 'title': 'Enter Password*' }, function(tabs) {

        if (tabs && tabs[0]) {

            
            removeTab(tabs[0].id, "pass");
        }

    });

    chrome.tabs.query({ 'title': 'Review Test*' }, function(tabs) {

        if (tabs && tabs[0]) {

            removeTab(tabs[0].id, "reviewtest");
        }

    });

    /*
    chrome.tabs.query({ 'title': 'Content*' }, function(tabs) {

        if (tabs && tabs[0]) {

            chrome.tabs.remove(tabs[0].id);
        }
    });
    */
    


    chrome.tabs.query({ 'title': 'Summary -*' }, function(tabs) {

        if (tabs && tabs[0] ) {

            
            removeTab(tabs[0].id, "summary-");
        }
    });
    

    chrome.tabs.query({ 'title': 'Canvas LMS*' }, function(tabs) {

        if (tabs && tabs[0]) {

            
            removeTab(tabs[0].id, "canvas lms");
        }
    });
}

const cleanupEndExam = function () {

    logToWindow("cleanupEndExam");

    var activetab = systemState.examTabId;
    var backupactivetab = systemState.examTabId;
    var activeurl = systemState.restartUrl;

    // make sure the exam end screen is closed
    /*
    chrome.tabs.query({ 'title': 'Exam Completed*' }, function(tabs) {

        if (tabs && tabs[0]) {

            chrome.tabs.remove(tabs[0].id);
        }
    });
    */

    
    

    removeTab(systemState.drmTabId, "drm-cleanupendexam");

    // CLEAR OTHER TABS
    for (var i = 1; i < systemState.tabIds.length; i++) {
        //console.log("Clearing tab " + systemState.tabIds[i]);
        if (systemState.tabIds[i] != systemState.webcamTabId) {            
            
            removeTab(systemState.tabIds[i], "systemState.tabIds");
        }
    }

    // remove extra tabs - give time for the exam page to close on its own
    setTimeout(function() { cleanupExtraTabs(); }, 1000);

    if (systemState.monitorBypassed) {
        // we have a bypass so call lab_exam_end
        labExamEnd(systemState.sequenceSid);
        systemState.monitorBypassedSet = false;
    }



    chrome.windows.getLastFocused(null, function(window) {


        setTimeout(function() { mywindowsupdate(window.id, { state: "normal" }); }, 1000); // KEEP NORMAL
        setTimeout(function() { mywindowsupdate(window.id, { state: "normal" }); }, 1200); // KEEP NORMAL
        setTimeout(function() { mywindowsupdate(window.id, { state: "normal" }); }, 1500); // KEEP NORMAL

        // if we are in a special browser window destroy it
        /*
        if (GLOBAL_exam_browser_id != -1) {

            chrome.windows.remove(GLOBAL_exam_browser_id, function(e) {
                GLOBAL_exam_browser_id = -1;
            });

        }*/

        //console.log("Removing the cookies from " + systemState.domain);

        const currenturl = systemState.restartUrl;
                        

        //console.log("current=" + currenturl);
        var details = { url: currenturl };
            chrome.cookies.getAll(details, function(cookies) {   
                console.log(cookies);      
                    if (cookies) {                                     
                        for (const cookie of cookies) {
                            //console.log("removing " + cookie.name + " in " + currenturl);
                            if (cookie.name.indexOf("rldb") == 0) {
                                chrome.cookies.remove({ name: cookie.name, url: currenturl }); 
                            }
                            
                        }
                }
            });


        // remove the cookie
        if (systemState.domain) {
        
            chrome.cookies.remove({
                "name": "rldbci",
                "url": systemState.domain
            }, function(cookie) {


            });

            // remove the cookie
        chrome.cookies.remove({
            "name": "rldbrv",
            "url": systemState.domain
        }, function(cookie) {


        });

        // remove the cookie

        chrome.cookies.remove({
            "name": "rldbcv",
            "url": systemState.domain
        }, function(cookie) {


        });


        chrome.cookies.remove({
            "name": "_MS",
            "url": systemState.domain
        }, function(cookie) {


        });

        // remove the cookie
        if (systemState.domain) {
            chrome.cookies.remove({
                "name": "rldbci",
                "url": systemState.domain
            }, function(cookie) {

                //console.log("Removing rldbci");
            });
        }

        }


        //sendEndExam(systemState.sequenceSid);

        var activetab = 0;

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            var activetab = tabs[0].id;

            //console.log("cleanup checking restart " + systemState.restartUrl + " tab: " + systemState.examTabId);
            //console.log("cleanup canvas mode " + systemState.canvasExamMode);

            if (systemState.restartUrl != "") {



                if (systemState.canvasExamMode == 'QOriginal') {

                    // cleanup any extra tabs

                    chrome.tabs.query({ 'title': 'Quiz*' }, function(tabs) {
                        if (tabs.length > 0) {
                            for (tab of tabs) {
                                
                                removeTab(tab.id, "quiz");
                            }


                        }
                    });

                    //console.log("clearing canvas session from " + systemState.domain);


                    chrome.cookies.remove({
                        "name": "canvas_session",
                        "url": systemState.domain
                    }, function(cookie) {
                        chrome.cookies.remove({
                            "name": "_legacy_normandy_session",
                            "url": systemState.domain
                        }, function(cookie) {

                            chrome.cookies.remove({
                                "name": "_csrf_token",
                                "url": systemState.domain
                            }, function(cookie) {

                            });

                        });
                    });




                    //console.log("setting timeout tab:" + backupactivetab + " url: " + activeurl);

                    
                    chrome.tabs.query({ 'title': 'Exam Completed' }, function(tabs) {                    
                        //console.log(tabs);
                        //console.log(activeurl);

                        var activetabcanvas = activetab;

                        if (tabs != null && tabs.length > 0) {
                            activetabcanvas = tabs[0].id;
                        }
                        
                        
                        //activetabcanvas = backupactivetab;      

                        

                        setTimeout(function(e) {
                            //console.log("updating activeurl " + activeurl + " on tab id: " + activetabcanvas);
                        tabUpdateWithUrl(activetabcanvas, e );
                            }, 1000, activeurl);

                    });

                    


                    

                } else {
                    //console.log("loading restartURL " + systemState.restartUrl + " into " + systemState.examTabId);
                    

                    if (systemState.inProcessingState("schoology")) {

                        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
                            tabUpdateWithUrl(tabs[0].id, systemState.restartUrl);
                        });

                    } else {
                        tabUpdateWithUrl(systemState.examTabId, systemState.restartUrl);
                    }
                }


                systemState.restartUrlSet = "";
            } else {
                //console.log("cleanup1");
                //console.log("tab removed"); chrome.tabs.remove(activetab);
            }

            // CLEAR OTHER TABS
            for (var i = 0; i < systemState.tabIds.length; i++) {
                if (systemState.tabIds[i] != systemState.webcamTabId && systemState.tabIds[i] != activetab) {
                    
                    removeTab(systemState.tabIds[i], "GLOBALTABSID");
                    
                }
            }

        });

        // tell the monitor we are done
        if (systemState.webcamTabId != -1 && systemState.webcamTabId != null) {
            chrome.tabs.sendMessage(systemState.webcamTabId, { "message": "endofexam" });
        }

        for (var i = 0; i < GLOBAL_cleanup_ids.length; i++) {

            removeTab(GLOBAL_cleanup_ids[i], "GLOBAL_cleanup_ids");
        }

        /*
        chrome.tabs.query({}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
              // webcam tab will take care of itself
              if (tabs[i].id != GLOBAL_webcam_tabid) {
                chrome.tabs.remove(tabs[i].id);          
                console.log("Clearing tab " + tabs[i].id + " opener " + tabs[i].openerTabId);
              }
            }
        });
        */
    });

    chrome.windows.getLastFocused(null, function(window) {
        mywindowsupdate(window.id, { state: "normal" }); // KEEP NORMAL
    });


    // reset the exam info
    resetExamInfo();
}


const resetExamInfo = function () {

    logToWindow("resetExamInfo");

    //console.log("resetExamInfo");

    systemState.reset();

    chrome.storage.local.remove(["ldb_user_cookie"],function(){
        var error = chrome.runtime.lastError;
           if (error) {
               console.error(error);
           }
       })

    

    GLOBAL_unsecured = false;
    GLOBAL_user_info = false;
    
    changeExamState(false, "resetExamInfo");
    changeAttemptState(false, "resetExamInfo");

    if (GLOBAL_resumetime != null) {
        clearTimeout(GLOBAL_resumetime);
        GLOBAL_resumetime = null;
    }

    removeTab(systemState.drmTabId, "drmresetexaminfo");
    

    GLOBAL_monitor_bypassed = false;

    GLOBAL_setup_started = false;
    GLOBAL_onetime = null;
    GLOBAL_rvector_ready = false;
    GLOBAL_feedback_on = false;

    GLOBAL_tab_ids = [];
    GLOBAL_tab_names = [];

    GLOBAL_tabs_setup = false;

    GLOBAL_exam_id = "";
    GLOBAL_course_id = "";
    

    GLOBAL_blackboard_processing = false;
    GLOBAL_d2l_state = "";

    GLOBAL_monitor_running = false;
    GLOBAL_rvector_prefix = 0;

    //GLOBAL_webcam_tabid = -1;
    GLOBAL_exam_tabid = -1;

    GLOBAL_exam_attempt_mode = false;

    GLOBAL_cleanup_ids = [];
    GLOBAL_cleanup_count = 0;

    GLOBAL_previous_warning_windowid = -1;
    

    GLOBAL_user_info = false;
    GLOBAL_def_handshake = null;

    GLOBAL_exam_window = -1;
    GLOBAL_sequence_sid = null;

    GLOBAL_nonsecure_mode = false;
    GLOBAL_d2l_params = null;

    
    GLOBAL_d2l_mode = null;
    GLOBAL_d2l_mode_resume = false;

    GLOBAL_lms_challenge_known = "";
    GLOBAL_lms_challenge_value = "";

    GLOBAL_count = 0;

    GLOBAL_feedback_waiting = false;
    GLOBAL_feedback_exit = true;

    GLOBAL_starting_tab = -1;    
    GLOBAL_canvas_review_mode = false;
    GLOBAL_bbultra_review_mode = false;
    GLOBAL_firsttime_canvas = false;
    GLOBAL_d2l_review_mode = false;
    GLOBAL_schoology_review_mode = false;


    GLOBAL_exam_check = null;

    GLOBAL_loadingJson = false;

    GLOBAL_startup_detected = false;


    
    GLOBAL_early_exit_mode = false;


}

const cleanupSecondaryTabs = function () {

    logToWindow("cleanupSecondaryTabs");

    let totaltabs = systemState.tabIds.length;

    for (i = totaltabs - 1; i > 0; i--) {
        let id = systemState.tabIds[i];
        removeFromTabs(id);

        //console.log("cleanupSecondaryTabs");
        chrome.tabs.remove(id, function() {
            // notify all open tabs of the change
            chrome.tabs.query({}, function(tabs) {
                var message = { action: "removelinkbk", tabid: id };
                for (var i = 0; i < tabs.length; ++i) {
                    chrome.tabs.sendMessage(tabs[i].id, message);
                }
            });
        });
    }

    

    
    
}

const notifyWebcamWait = function () {

    logToWindow("notifyWebcamWait");

    if (systemState.monitorRunning == true) {
        systemState.feedbackWaitingSet = true;
    }

    systemState.monitorRunningSet = false;


    // notifify all open tabs of the change - monitor stopped
    chrome.tabs.query({}, function(tabs) {

        if (systemState.webcamTabId > 0) {

            var message = { action: "removelinkbk", tabid: systemState.webcamTabId };
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, message);
            }
        }

        // and tell them exam has ended
        var messageend = { action: "endofexamwait" };
        for (var i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, messageend);
        }
    });

}

const notifyFeedback = function () {

    logToWindow("notifyFeedback");
    //console.log("notifyFeedback");


    // and tell them feedback is needed
    var messageend = { action: "feedback" };
    for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.sendMessage(tabs[i].id, messageend);
    }

}


const notifyWebcam = function (normalEnd) {

     logToWindow("notifyWebcam");

     //console.log("notify webcam " + normalEnd);


    if (systemState.monitorRunning) {

        systemState.monitorRunningSet = false;
        systemState.feedbackWaitingSet = true;

        // notifify all open tabs of the change - monitor stopped
        chrome.tabs.query({}, function(tabs) {

            if (systemState.webcamTabId > 0) {

                var message = { action: "removelinkbk", tabid: systemState.webcamTabId };
                for (var i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, message);
                }
            }

            // and tell them exam has ended
            var messageout = "endofexam";
            if (!normalEnd) {
                messageout = 'endofexamabnormal';
            }
            var messageend = { action: messageout, feedback: systemState.feedbackExit };

            //console.log("sending " + messageend);

            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, messageend);
            }

            if (systemState.feedbackExit == false) {

                // nofeedback so close the window
                chrome.tabs.query({ 'title': 'Webcam*' }, function(tabs) {
                    var activetab = tabs[0].id;
                    
                    removeTab(activetab, "webcamfeedbackExit");
                    systemState.monitorRunningSet = false;
                });

            }
            systemState.feedbackExitSet = true;
        });

        // REVIEW NEED - TODO
        if (systemState.webcamTabId != -1 && systemState.webcamTabId != null) {
            chrome.tabs.sendMessage(systemState.webcamTabId, { "action": "end_exam" });
        }

    } else {
        // send a message that there is no feedback coming
        //console.log("monitor is not running");
    }


}


// ***************************************************************************************
// BLOCK

const deepblock = function (details) {
    var messageout = { cancel: false };
    if (details.url.indexOf("html/crosh.html") != -1) {
        messageout = { cancel: true };
    }
    return messageout;
}

// WARNING may not work any more with removal of blocking in v3
chrome.webRequest.onBeforeRequest.addListener(deepblock, { urls: ["<all_urls>"] }, []);

const beginCheck = function () {

    logToWindow("beginCheck: " + GLOBAL_exam_check);

    chrome.windows.getCurrent(function(win) {
        changeExamWindow(win.id, "begincheck");
    });

    if (GLOBAL_exam_check != null) {
        clearInterval(GLOBAL_exam_check);
    }


    
        //console.log("starting check");

        if (chrome.clipboard === undefined) {
            //console.log("screenshot - chrome.clipboard is undefined")
        } else {
            chrome.clipboard.onClipboardDataChanged.addListener(clipboardCheck);
        }

        chrome.idle.onStateChanged.addListener(idleCheck);

        const ran = getRandomInt(100);

        GLOBAL_exam_check = setInterval(function() { checkWindow(ran) }, 1000); // 100
    

    mywindowsupdate(systemState.examWindow, { focused: true, drawAttention: false, state: GLOBAL_screen }); // FULLSCREEN


}

const endCheck = function () {

    logToWindow("endCheck");


    clearTimeout(GLOBAL_exam_check);
    GLOBAL_exam_check = null;
}


const idleCheck = function (state){
    if (systemState.examStarted) {

        if (state == "locked") {
            systemState.screenLocked = true;
        } else if (state == "active" && systemState.screenLocked) {
            // Reset the windowCheck so we start detecting focus again and bring the exam window back into focus
            systemState.windowCheckInProgress = false;
            systemState.screenLocked = false;

            //console.log("Locked state detected, temporary tab ids to close: ", systemState.temporaryTabIds)
            mywindowsupdate(systemState.examWindow, { focused: true, drawAttention: false, state: GLOBAL_sec_mode },()=>{
                systemState.temporaryTabIds.forEach((windowId)=>{
                    //console.log("idlecheck closing window: " + windowId);
                    chrome.windows.remove(windowId)
                })
            });
        }
    }
}

var GLOBAL_clipboardTimeout = null;
const clipboardCheck = function () {

    if ( GLOBAL_clipboardTimeout != null ) {
		clearTimeout(GLOBAL_clipboardTimeout);
	}

    GLOBAL_clipboardTimeout = setTimeout(function() {
    
        if (systemState.copyEvent == true) {
            systemState.copyEventSet = false;
            //console.log("screenshot -copy event true.")
        } else if (systemState.examStarted) {
            //console.log("screenshot - Screenshot took place. id=" + systemState.examTabId);

            // Send Message to Content Script
            chrome.tabs.sendMessage(systemState.examTabId, {action:'screenshot'});


            chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            var activetab = tabs[0].id;
            if (activetab != systemState.examTabId) {
                //console.log("screenshot - Screenshot took place. id=" + activetab);
                chrome.tabs.sendMessage(activetab, { action: 'screenshot' });
            }
                            
            });        
        }
    }, 500);
}




const labelTabs = function () {
    //console.log("labelTabs");

    chrome.tabs.query({'windowId': chrome.windows.WINDOW_ID_CURRENT},
       function(tabs){
          for (const tab of tabs) {
              var newtitle = 'ID: ' + tab.id;
              var newcommand = "document.title = " + newtitle;
              chrome.tabs.executeScript(tab.id, {code: newcommand});
          }
       }
    );


}



var GLOBAL_focus_id = 100;

function checkWindowDis(id) {
    console.log("checkwindow DISABLED");
}



const checkWindow = function (id) {

    //console.log("checkWindow---------------------------------------------"+GLOBAL_exam_check + " id: " + id);

    // keep checking the display
    maxDisplayCheck();

    chrome.windows.get(systemState.examWindow, function (mainWindow) {

        if (mainWindow && mainWindow.focused == false && systemState.windowCheckInProgress == false ) {

            // Set to true so that we know not to execute the below code after the interval cycles
            systemState.windowCheckInProgress = true;

            chrome.windows.create({
                url: "focus_lost.html",
                type: "popup",
                state: "fullscreen",
                focused: true
            }, (newWindow) => {

                // Add new window to be removed later if it exists
                systemState.temporaryTabIds.push(newWindow.id);
                
                setTimeout(function () {
                    //console.log("sending focuslost to " + systemState.examTabId);
                    mywindowsupdate(systemState.examWindow, { focused: true, drawAttention: false, state: GLOBAL_screen }, (mainWindowInner) => {

                        if (mainWindowInner.focused == true) {
                            
                            chrome.windows.remove(newWindow.id);
                            console.log("shift to exam in focus lost")
                            tabUpdateShow(systemState.examTabId);

                            if (systemState.beforeunload == false) {

                                chrome.tabs.sendMessage(systemState.examTabId, { action: 'focuslost', id: GLOBAL_focus_id }, () => {

                                    // Set back to false so we start detecting again
                                    systemState.windowCheckInProgress = false;
                                    GLOBAL_focus_id++;

                                });

                                chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
                                    var activetab = tabs[0].id;
                                    if (activetab != systemState.examTabId) {
                                        chrome.tabs.sendMessage(activetab, { action: 'focuslost', id: GLOBAL_focus_id }, () => {
                                        });
                                    }
                                                      
                                    });        
                                }  else {
                                    systemState.windowCheckInProgress = false;
                                    systemState.beforeunload == false;
                                }  


                           
                            

                        } else {

                            // remove the window
                            chrome.windows.remove(newWindow.id)

                            // Set back to false so we start detecting again
                            systemState.windowCheckInProgress = false;
                        }

                    });
                }, 1000);
            });
        }
    });
}

function beep() {
    var snd = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
}




chrome.windows.onFocusChanged.addListener(function(window) {
    if (window == chrome.windows.WINDOW_ID_NONE) {
        GLOBAL_focus = false;
        maxWindow(window);
    } else {
        GLOBAL_focus = true;
        maxWindow(window);
    }
});


const maxWindow = function (window_in) {
    maxWindow2(window_in);
}



const maxWindow2 = function (window_in) {



    if (systemState.examWindow != -1) {

        mywindowsupdate(systemState.examWindow, { drawAttention: false, state: GLOBAL_screen }); //FULLSCREEN

        if (systemState.examTabId > 0 && systemState.feedbackOn == false && systemState.feedbackWaiting == false) {

            if (systemState.examStarted == true) {
                //console.log("Updating exam tab as active current=" + systemState.currentTab + "examTabId: " + systemState.examTabId);

                if (systemState.currentTab == -1) {
                    systemState.currentTabSet = systemState.examTabId;                    
                }

                tabUpdateShow(systemState.currentTab);
            }

        }

        if (GLOBAL_focus_issue === false) {
            // set timer as they cannot be trusted

            GLOBAL_focus_issue = true;
            setTimeout(function() { maxTimerWindow() }, 5000);
        }
    }
}

const maxTimerWindow = function () {
    maxWindow();
    //setTimeout(function(){ maxTimerWindow() }, 5000);   
}




const maxDisplayCheck = function () {

    //console.log("maxdisplay check exam=" + systemState.examStarted);
    // display handler
    var displayflags = {
        singleUnified: true
    };

    
    chrome.system.display.getInfo(displayflags, function(displayinfo) {

        //console.log("got info");
        //console.log(displayinfo);
        
        var displayTablet = false;
        if (displayinfo[0].rotation == -1) {
            displayTablet = true;
        }

        if (systemState.examStarted) {
            //console.log("maxdisplay examstarted rotation=" + displayinfo[0].rotation + " tabletmode=" + systemState.tabletmode);
       
            if (displayTablet == true && systemState.tabletmode == false ) {
                //console.log("detecting tablet mode");
                systemState.tabletmodeSet = true;

                chrome.windows.getCurrent(function(browser) {
                    console.log('normal27');
                        mywindowsupdate(browser.id, { state: "normal" });
                        mywindowsupdate(browser.id, { state: GLOBAL_screen });
                    });
            } else if (displayTablet == false && systemState.tabletmode == true ) {
                //console.log("exiting  tablet mode");
                systemState.tabletmodeSet = false;

                chrome.windows.getCurrent(function(browser) {
                    console.log('normal28');
                        mywindowsupdate(browser.id, { state: "normal" });
                        mywindowsupdate(browser.id, { state: GLOBAL_screen });
                    });
            }
        }


        
        
        if (displayinfo.length > GLOBAL_base_displays) {

            if (systemState.examStarted == true) {
                chrome.tabs.sendMessage(systemState.examTabId, { action: 'displaychange' });    
            } 
            
            
        }
    }); // display info

}



const illegalExtensionCheck = function () {
    if (systemState.extlist.length == 0) {
        illegalExtensionCheckInner();
    }
    
}

const illegalExtensionCheckInner = async function () {    

    

    await chrome.management.getAll(
      async function(extensions) {

         // console.log(extensions);

          var disabledList = [];
          var allowed = systemState.allowExtString;

          allowed = allowed + ":adkcpkpghahmbopkjchobieckeoaoeem, ghlpmldmjjhmdgmneoaibbegkjjbonbk, iheobagjkfklnlikgihanlhcddjoihkg, haldlgldplgnggkjaafhelgiaglafanh";

           //console.log("illegalExtensionCheck: " + allowed);

          for (const ext of extensions) {

              //console.log(ext);

              var pos = -1;
              if (allowed) {
                  
                  pos = allowed.indexOf(ext.id);
              }

              if (ext.id != chrome.runtime.id && pos == -1) {

                  //console.log("Extension id=[" + ext.id + "] name: " + ext.name + " isApp? " + ext.isApp + " enable: " + ext.enabled);

                  if (ext.enabled) {
                      //console.log("ext DISABLING");
                      disabledList.push(ext.id);
                      await chrome.management.setEnabled(ext.id, false);
                  } 
                  

                  
                  
                  
                  
              }
              
          }

         // console.log("Ext saving ");
         // console.log(disabledList);

          systemState.extListSet = disabledList;

          

         
          
      }
    );
}

const restoreExtensions = async function () {

    //console.log('ext restoreExtensions');
    //console.log(systemState.extlist);
    

    for (const ext of systemState.extlist) {
        //console.log("ext restoring [" + ext + "]");
        await chrome.management.setEnabled(ext, true);
       
    }

    systemState.extListSet = [];

}


// ********************************************************************************************
// RUNTIME

chrome.runtime.onInstalled.addListener(function(details) {
    //console.log("onInstalled");
    if (details.reason == "install") {
        // only install if it is the ChromeOS
        chrome.runtime.getPlatformInfo(function(info) {
            if (info.os == 'cros') {
                //displayFirstInstallPage();                8993
            }
            cleanOnInstall();

        });

    } else if (details.reason == "update") {
        // only install if it is the ChromeOS
        chrome.runtime.getPlatformInfo(function(info) {

            if (info.os != 'cros') {
                //displayFirstInstallPage();                
            }
            cleanOnInstall();

        });
    }
});

const cleanOnInstall = function () {

    // clean out the state machine when we install
    systemState.reset();

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        console.log(tabs);
        var activetab = tabs[0].id;



        var domain = tabs[0].url.substring(0, tabs[0].url.indexOf("//") + 2) + tabs[0].url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

        chrome.cookies.remove({
            "name": "rldbrv",
            "url": domain
        }, function(cookie) {

        });

        chrome.cookies.remove({
            "name": "rldbcv",
            "url": domain
        }, function(cookie) {

        });

        chrome.cookies.remove({
            "name": "rldbci",
            "url": domain
        }, function(cookie) {

        });

    });



}


const displayFirstInstallPage = function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('install.html') });

    


    /*
    chrome.tabs.create({ url: chrome.runtime.getURL('logging.html') }, function(tab) {
        systemState.logId = tab.id;

        console.log("setting up logging tab: " + systemState.logId);

        //setTimeout(function() { chrome.tabs.sendMessage(systemState.logId, { "message": "endofexam" }); }, 3000);
        //setTimeout(function() { chrome.tabs.sendMessage(systemState.logId, { "message": "next line" }); }, 5000);

        
    });
    */
}

chrome.runtime.onSuspend.addListener(function() {
    clearExamTabs();
    resetExamInfo();
    console.log("onSuspend");
});

chrome.windows.onRemoved.addListener(function(windowId){
  //console.log("onRemoved");
});

chrome.runtime.onRestartRequired.addListener(function(reason) {    
    resetExamInfo();
    console.log("onRestartRequired");
});





// ************************************************************************************

const clearExamTabs = function (excludeId = null) {
    chrome.tabs.query({}, function(tabs) {
        for (var i = 0; i < tabs.length; ++i) {

            if (excludeId != null && tabs[i].id != excludeId) {
                removeTab(tabs[i].id, "clearexamtabs");
                
            }
                       
        }
    });

}

const clearKeyCookies = function () {
    
    chrome.cookies.remove({
        "name": "canvas_session",
        "url": systemState.domain
    }, function(cookie) {
        chrome.cookies.remove({
            "name": "_legacy_normandy_session",
            "url": systemState.domain
        }, function(cookie) {

            chrome.cookies.remove({
                "name": "_csrf_token",
                "url": systemState.domain
            }, function(cookie) {

            });

        });
    });

    chrome.cookies.remove({
        "name": "rldbrv",
        "url": systemState.domain
    }, function(cookie) {
    }); 

    chrome.cookies.remove({
        "name": "rldbcv",
        "url": systemState.domain
    }, function(cookie) {
    }); 
       
    chrome.cookies.remove({
        "name": "rldbsi",
        "url": systemState.domain
    }, function(cookie) {
    }); 

    chrome.cookies.remove({
        "name": "rldbci",
        "url": systemState.domain
    }, function(cookie) {
    }); 

    

    chrome.cookies.remove({
        "name": "d2lSessionVal",
        "url": systemState.domain
    }, function(cookie) {
        //console.log("d2lSessionVal is cleared...");
    });

    chrome.cookies.remove({
        "name": "_MS",
        "url": systemState.domain
    }, function(cookie) {
    });
    

}

// ************************************************************************************


const onCompleteUserInfo = function (details) {

    logToWindow("onCompleteUserInfo");

    chrome.scripting.executeScript( {
        target: {tabId: details.tabId},
        files: ["js/getuser.js"],
        world: chrome.scripting.ExecutionWorld.ISOLATED,
    }, function(results) {

        if (GLOBAL_user_info == false) {
            resetExamInfo();
            GLOBAL_user_info = true;
        }

    });

}
    
const onCompleteUserInfoOLD = function (details) {

    logToWindow("onCompleteUserInfo");

    //console.log(details);

    if (details.url.indexOf("success") != -1) {

        var domain = details.initiator;
        //injectLDBCookies(domain);

        //console.log("injecting getuser.js");


        chrome.scripting.executeScript( {
            target: {tabId: details.tabId},
            files: ["js/getuser.js"],
            world: chrome.scripting.ExecutionWorld.ISOLATED,
        }, function(results) {

            if (GLOBAL_user_info == false) {
                //resetExamInfo();
                console.log("reset15: " + systemState.canvasExamMode);
                GLOBAL_user_info = true;
            }

        });


/*
        chrome.scripting.executeScript(details.id, { file: "js/getuser.js", runAt: 'document_start' }, function(results) {

            if (GLOBAL_user_info == false) {
                resetExamInfo();
                GLOBAL_user_info = true;
            }

        });
        */
    } else {
        // we missed the login potentially
        if (GLOBAL_user_info == false) {

          //console.log("Calling with " + details.tabId);
          //console.log(details);


           //console.log("injecting getuser.js");

           chrome.scripting.executeScript( {
                target: {tabId: details.tabId},
                files: ["js/getuser.js"],
                world: chrome.scripting.ExecutionWorld.ISOLATED,
            }, function(results) {

                GLOBAL_user_info = true;

            });



/*
            chrome.scripting.executeScript( {

              target: {tabId: details.tabId},
              files: ['js/getuser.js'],

            }, function(results) {
                GLOBAL_user_info = true;
              });
              */

            
        }
    }
}

const getFeedback = function () {

    logToWindow("getFeedback");

    //console.log("getFeedback................");

    systemState.feedbackOnSet = true;
    chrome.tabs.create({ index: 1, active: true, url: GLOBAL_server + "/MONServer/chromebook/student_feedback2.do?token=988241484&env=chromeos" }, function(tab) {
        //console.log("open feedback tab");
    });
}

const labExamStart = function (sid) {

    logToWindow("labExamStart");

     var sessionbase = GLOBAL_server + '/MONServer/chromebook/exam_start_v3.do';

     var parameters = "sid=" + sid;

     var callhttp = sessionbase + "?" + parameters;

     

     fetch(callhttp)
        .then(response => response.text())
        .then(data => {console.log("")})
        .catch(error => console.log("error", error));
}







const sendStartExam = function (sid) {

    logToWindow("sendStartExam");

    var sessionbase = GLOBAL_server + '/MONServer/chromebook/exam_start_v3.do';
   
    var parameters = "sid=" + sid;

    var callhttp = sessionbase + "?" + parameters;

     fetch(callhttp)
        .then(response => response.text())
        .then(data => {console.log("exam start sent")})
        .catch(error => console.log("error", error));
}








// ************************************************************************************
// UTILITIES

chrome.runtime.onMessage.addListener(

    function(request, sender, sendResponse) {
        //clearClipboardText();
        if (request.message === "open_new_tab") {

            chrome.tabs.create({ "url": request.url });
        }
    }
);
const clearFormData = async function() {

    console.log("attempting to remove form data");

     var callback = function () {
        console.log("removed form data");
      };
      
      var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
      var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;
      chrome.browsingData.remove({
        "since": oneWeekAgo
      }, {
        "appcache": false,
        "cache": false,
        "cacheStorage": false,
        "cookies": false,
        "downloads": false,
        "fileSystems": false,
        "formData": true,
        "history": true,
        "indexedDB": false,
        "localStorage": false,
        "passwords": false,
        "serviceWorkers": false,
        "webSQL": false
      }, callback);
}

const clearClipboardText = async function () {
    console.log("clear clipboard text");

    /*
    systemState.copyEventSet = true;

    await chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        var activetab = tabs[0].id; 
        
        chrome.scripting.executeScript(
            {              
              target: {tabId: activetab},
              func: clearClipboardInject
            },
            () => { 
                //console.log("Completed injecting clipoard " + systemState.examTabId);    
                //console.log(chrome.runtime.lastError);
                setTimeout(function() { systemState.copyEventSet = false; }, 100);   
            });        
    });             
    */                  

    
}


const clearClipboardInject = function () {

    var textArea = document.createElement("textarea");
    textArea.style.background = "transparent";

    for(let i = 0; i < 8; i++) {
        textArea.value = i+"------"+i;
        document.body.appendChild(textArea);
        textArea.select();
        status = document.execCommand("copy");
    }

    document.body.removeChild(textArea);
    
}

// Clears all data from chrome.storage.local
const clearLocalStorage = function () {
    chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        } else {
            printLocalStorage();
        }
    });
}
// Console logs all data in chrome.storage.local
const printLocalStorage = function () {
    chrome.storage.local.get(null, function(result) {
        if (result) {
            console.log(result);
        } else {
            console.log('Nothing in chrome.storage.local');
        }
    });
}

const printLogStorage = function () {
    chrome.storage.local.get(['ldblog'], function(result) {
        console.log(result);
    });
}

function logToLocalStorage(newitem) {


    /*
    chrome.storage.local.get(['ldblog'], function(result) {

        console.log(result);

        var logitem="";

        if (result) {
            logitem = result.ldblog + "::" + newitem;
        } else {
            logitem = newitem;
        }

    chrome.storage.local.set({'ldblog': logitem}, function() {
      console.log('Value is set to ' + logitem);
    });    



    });
    */
}

const showEndExit = async function () {


    if (!systemState.svlpmode) {
        await chrome.tabs.query({ 'title': 'Webcam*' }, async function(tabs) {

                    //console.log("Ending monitor");
                    //console.log(tabs);

                    if (tabs && tabs.length > 0) {
                        var activetab = tabs[0].id;
                        await removeTab(activetab, "showendexit");
                        systemState.monitorRunningSet = false;
                    }
                    
                });
    }
            

    GLOBAL_early_exit_mode = true;
             

    await chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        var activetab = tabs[0].id;  

        var outurl = chrome.runtime.getURL('examend.html') + "?mode=" + systemState.svlpmode;
        tabUpdateWithUrl(systemState.examTabId, outurl);
    });                               
    


}




    // -----------------------------------------------------------------------

    const storeWebCamInfo = function (server, course, exam, username, firstname, lastname) {


      systemState.courseIdSet = course;
      systemState.examIdSet = exam;
      systemState.serverIdSet = server;
      systemState.userNameSet = username;
      systemState.firstNameSet = firstname;
      systemState.lastNameSet = lastname;
    }


    // ----------------------------------------------------------------------------




// -------DELETE ---------------------------------------------------------------------------




chrome.runtime.onMessage.addListener( data => {
  if ( data.type === 'notification' ) {
    notify( data.message );
  }
});

chrome.runtime.onInstalled.addListener( () => {
  chrome.contextMenus.create({
    id: 'notify',
    title: "LockDown Browser: %s", 
    contexts:[ "selection" ]
  });
});

chrome.contextMenus.onClicked.addListener( ( info, tab ) => {
  if ( 'notify' === info.menuItemId ) {
    notify( info.selectionText );
  }
} );

const notify = message => {
  chrome.storage.local.get( ['notifyCount'], data => {
    let value = data.notifyCount || 0;
    chrome.storage.local.set({ 'notifyCount': Number( value ) + 1 });
  } );

  return chrome.notifications.create(
    '',
    {
      type: 'basic',
      title: 'LockDown Browser',
      message: message || 'LockDown Browser',
      iconUrl: 'icon.png',
    }
  );
};

function param(url, name) {

    return (url.split(name + '=')[1] || '').split('&')[0];
}

// code to handle getting user information
function encrypt_user_info(input, key) {

    var bf = new Blowfish(key, "ecb");
    var diff = input.length % 8;

    // pad to 8 bytes margins
    input = (input + "        ").slice(0, input.length + (8 - diff));

    var blocked = bf.encrypt(input);
    var blocked = bf.base64Encode(blocked);
    return blocked;
}

const parse_user_info = function (userinfo, serverin, course, exam) {

    //console.log("parse_user_info" + userinfo);

    var res = userinfo.split("$%$");
    var outid = res[0];
    var outname = res[2] + " " + res[1];
    var outinfo = { "id": outid, "name": outname };
    var outJSON = JSON.stringify(outinfo);

    storeWebCamInfo(serverin, course, exam, outid, outname, outname);

    // set the user information
    chrome.storage.local.set({ 'ldb_user_cookie': outJSON }, function(result) {
        console.log('ldb_user_cookie: ' + outJSON);
        var outurl = chrome.runtime.getURL('webcamstart.html');
        outurl = outurl + "?" + "courseid=" + course + "&examid=" + exam + "&server=" + serverin;

        

        chrome.tabs.create({ index: 1, url: outurl, active: true }, function(tab) {
            systemState.monitorRunningSet = true;
            
            
            removeTab(GLOBAL_complete_overlayTab, "parse_user_info");
        });
    });



}

const decrypt_user_info = function (data, key) {

    logToWindow("decrypt_user_info");

    var url = GLOBAL_complete_url;

    var serverin = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

    var course = param(url, 'course_id');
    var exam = param(url, 'content_id');

    //console.log('decrypt ' + data + "," + key);

    var callhttp = GLOBAL_server + "/MONServer/chromebook/decode_bb_user.do?" + "i=" + encodeURIComponent(data) + "&p=" + key;

    fetch(callhttp)
                .then(response => response.text())
                .then(data => {parse_user_info(data, serverin, course, exam); })
                .catch(error => console.log("error", error));     





                /*
    var xhr2 = new XMLHttpRequest();



    var callhttp = GLOBAL_server + "/MONServer/chromebook/decode_bb_user.do?" + "i=" + encodeURIComponent(data) + "&p=" + key;


    xhr2.open("GET", callhttp, true);
    xhr2.withCredentials = true;
    xhr2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr2.onreadystatechange = function() {
        if (xhr2.readyState == 4) {

            if (xhr2.status == 200) {

                console.log("USER INFO......................");
                console.log(xhr2.responseText);

                var userinfo = xhr2.responseText;


                // set Globals for the oncomplete
                //GLOBAL_complete_activeTab = activetab;
                //GLOBAL_complete_overlayTab = overlaytab;

                var res = userinfo.split("$%$");
                var outid = res[0];
                var outname = res[2] + " " + res[1];
                var outinfo = { "id": outid, "name": outname };
                var outJSON = JSON.stringify(outinfo);

                //alert({html:"userinfo successful"});


                storeWebCamInfo(serverin, course, exam, outid, outname, outname);

                // set the user information
                chrome.storage.local.set({ 'ldb_user_cookie': outJSON }, function(result) {
                    var outurl = chrome.runtime.getURL('webcamstart.html');
                    outurl = outurl + "?" + "courseid=" + course + "&examid=" + exam + "&server=" + serverin;



                    chrome.tabs.create({ index: 1, url: outurl, active: true }, function(tab) {
                        systemState.monitorRunningSet = true;
                        chrome.tabs.remove(GLOBAL_complete_overlayTab);
                    });
                });


            } else {
                console.log("ERROR getUserInfo:" + xhr2.status + "," + xhr2.responseText);

            }

        }
    }

    xhr2.send();

    */
}

const notifyUser = function (title, message) {
    //console.log("notify User");
    chrome.notifications.create('LockDown Browser', {
        type: 'basic',
        iconUrl: 'icon_128.png',
        title: title,
        message: message
     }, function(notificationId) {});
}

function sendAlert() {    
    const message = chrome.i18n.getMessage("schoologypopup");
    alert(message);
}


const notifySchoology = async function () {
    await chrome.tabs.query({ active: true, lastFocusedWindow: true }, async function(tabs) {
        var activetab = tabs[0].id;
        var url = tabs[0].url;

        var message = { action: "schoologyfailedstart" };
        chrome.tabs.sendMessage(activetab, message);

        systemState.reset();

        //console.log("clearing cookies " + systemState.domain);
        var domain = url.substring(0, url.indexOf("//") + 2) + url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

        chrome.cookies.remove({
            "name": "rldbrv",
            "url": domain
        }, function(cookie) {
        });         

        chrome.cookies.remove({
            "name": "rldbci",
            "url": domain
        }, function(cookie) {
        });           
        //console.log("clearing cookies " + domain);

        await chrome.scripting.executeScript(
            {
              //target: {tabId: GLOBAL_complete_activeTab},
              target: {tabId: activetab},
              func: sendAlert,
              args: []
            },
            () => { 
                //console.log("Completed sending schoology warning ");      

                chrome.cookies.remove({
                    "name": "rldbrv",
                    "url": systemState.domain
                }, function(cookie) {
                });         

                chrome.cookies.remove({
                    "name": "rldbci",
                    "url": systemState.domain
                }, function(cookie) {
                });           
            });
        
    });
}

const blockUnload = function () {
    //console.log("blockUnload");
    //$(window).bind("beforeunload", function(){ return(false); });
    //$("body").bind("beforeunload", function(){ return(false); });

    $("body").css("background-color", "green");
    

    //window.onbeforeunload = () => {}
    $(window).off('beforeunload');
    window.addEventListener("beforeunload", function (e) { console.log("IN LISTENER"); return true; });



    
}

const blockUnloadHideContent = function () {
    //console.log("blockUnloadHideContent");

    $("body").empty();
    $(document).find("*").off();
    //window.onbeforeunload = () => {}
    
}

const injectBlockUnloadHideContent = async function (id) {

    await chrome.scripting.executeScript(
            {
              //target: {tabId: GLOBAL_complete_activeTab},
              target: {tabId: id},
              func: blockUnloadHideContent,
              args: []
            },
            () => { 
                //console.log("Completed block unload ");                    
            });    


    await chrome.cookies.remove({
                        "name": "canvas_session",
                        "url": systemState.domain
                    }, function(cookie) {
                        chrome.cookies.remove({
                            "name": "_legacy_normandy_session",
                            "url": systemState.domain
                        }, function(cookie) {

                            chrome.cookies.remove({
                                "name": "_csrf_token",
                                "url": systemState.domain
                            }, function(cookie) {

                            });

                        });
                    });

    }

const injectBlockUnload = async function (id) {

    //console.log("injectBlockUnload");


    await chrome.scripting.executeScript(
            {
              //target: {tabId: GLOBAL_complete_activeTab},
              target: {tabId: id},
              func: blockUnload,
              args: []
            },
            () => { 
                //console.log("Completed block unload ");                    
            });    

}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function resetOpenLink() {
    GLOBAL_openlink_check = false;
}



async function alert({
  html,
  title = chrome.runtime.getManifest().name,
  width = 400,
  height = 300,
  left,
  top,
}) {

    
    left = 100;
    top = 100;
  const w = left == null && top == null && await chrome.windows.getCurrent();
  const w2 = await chrome.windows.create({
      focused: true,
    url: `data:text/html,<title>${title}</title>${html}`.replace(/#/g, '%23'),
    type: 'popup',
    left: left ?? Math.floor(w.left + (w.width - width) / 2),
    top: top ?? Math.floor(w.top + (w.height - height) / 2),
    height,
    width,
  });

  

  return new Promise(resolve => {
    chrome.windows.onRemoved.addListener(onRemoved, {windowTypes: ['popup']});
    function onRemoved(id) {
      if (id === w2.id) {
        chrome.windows.onRemoved.removeListener(onRemoved);
        resolve();
      }
    }
  });
}

