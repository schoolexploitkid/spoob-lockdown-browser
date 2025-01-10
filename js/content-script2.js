console.log("content script 2");

window.removeEventListener('beforeunload', null, true);

window.onbeforeunload = function() { 
           console.log("new unload");
           alert('new unload!')
           return "test";
        }