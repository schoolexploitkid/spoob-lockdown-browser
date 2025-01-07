$(document).ready(function () {
    if (window.ReadSpeaker && window.ReadSpeaker.TextAidReader) 
        { ReadSpeaker.TextAidReader.showPlayer(); }
    else {
        var taid = 'tareaderscript'; 
        if (!document.getElementById(taid)) {
            var s = document.createElement('script'); 
            s.setAttribute('src','https://ws.readspeaker.com/a/wasp/reader/orglogin'); 
            s.setAttribute('id', taid); 
            document.getElementsByTagName('body')[0].appendChild(s);
        }
    }
});

