console.log("ALL DETECTED 3");

console.log(chrome.runtime.getURL('tabs/tabs.html'));

var GLOBAL_started = false;

onload = function() {

    

    var x = document.getElementsByClassName("vui-heading-2");
    console.log("FInding vui-heading-2");
    console.log(x);

    for (i = 0; i < x.length; i++) {
        x[i].style.fontSize = "8px";
    }


};