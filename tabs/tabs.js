console.log("tabs.js loaded");

const GLOBAL_proclabel = chrome.i18n.getMessage("tabsproc_label");
const GLOBAL_enterlabel = chrome.i18n.getMessage("tabsproc_enter");
const GLOBAL_dismisslabel = chrome.i18n.getMessage("tabsproc_dismiss");
const GLOBAL_passworderror = chrome.i18n.getMessage("tabsproc_badpass");

$(document).ready(function(){
    $("#procpassword").html(GLOBAL_proclabel);
    $("#passok").html(GLOBAL_enterlabel);
    $("#passclose").html(GLOBAL_dismisslabel);
    $("#passerror").html(GLOBAL_passworderror);
  });




chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {

        //console.log("TOP LINE ACTION: " + request.action);

        if (request.action == 'endofexam') {
            $("#exit-button").show();
        }

        

        });

onload = function() {
    console.log("calling onload adding communication port");


    $(document).find("body").on('contextmenu', function(e) { 
                console.log('contextmenu'); 
                 e.preventDefault();
             });
             
             

    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {

        //console.log("ACTION: " + request.action);

        if (request.action == "beep") {
            beep();
        }


        if (request.action == "clickreceived") {
            var  locelem = document.elementFromPoint(30, 30);
            $(locelem).click();
        }

        if (request.action == "openlinkbk") {
            console.log("background opened a requestedtab " + request.tabid);
            $("#respondus_tabbar").append('<li id="' + request.tabid + '" class="nav-item"><a class="nav-link">' + request.label + '<i class="fa fa-window-close closeTab"></i></a></li>');
            //$("#respondus_tabbar").append('<li id="' + request.tabid + '" class="nav-item"><a class="nav-link">Exam Link</a></li>');
        }

        

        if (request.action == 'removelinkbk') {
            console.log("background removing link");

            chrome.runtime.sendMessage({action: 'gettabline'}, function(response) {
                console.log('tabbar returned ' + response);

                // split the components
                var pos = response.indexOf("::::");
                var part1 = response.substring(0, pos);
                var part2 = response.substring(pos+4);

                var pt2pos = part2.indexOf(";;;;");
                var part3 = part2.substring(0, pt2pos);
                var part4 = part2.substring(pt2pos+4);

            

                $('#respondus_tabbar').html(part1);
                $('#calc-button-div').html(part3);
                $('#exit-button-div').html(part4);                         
            });

        }

        if (request.action == 'toomanytabs') {
            $("#toomanytabs").show();
            setTimeout(function(){ $("#toomanytabs").hide(); }, 1500);
        }

        if (request.action == 'webcamstart') {
            $("#recording-li").show();
        }

        if (request.action == 'webcamstop') {
            $("#recording-li").hide();            
        }

        if (request.action == 'proctorpass') {
            var val = request.result;    

            if (val == 'true') {
                chrome.runtime.sendMessage({action: 'endexamearly', reason: '***proctorpasswordexit***'});                  
            } else {
                $("#passerror-div").slideDown();
                $("#hidden-pass-div").hide();
                setTimeout(function () {$("#passerror-div").slideUp();} , 2000);
            }
        }

        

  });


    $('body').on('click', '#exit-button', function(e) {   
          $("#passerror-div").slideUp();  
          chrome.runtime.sendMessage({action: 'endexambutton'});        
    });

    $('body').on('click', '#passclose', function(e) { 
        
        
        setTimeout(function(){$("#brand_line").show();$("#calc-button-div").show();$("#exit-button-div").show();}, 1000);
        $("#hidden-pass-div").slideUp();
        $("#pass").val('');

        //chrome.runtime.sendMessage({action: 'endexambutton'});        
    });

    $('body').on('click', '#passok', function(e) { 
       
        var passin = $("#pass").val();
        setTimeout(function(){$("#brand_line").show();$("#calc-button-div").show();$("#exit-button-div").show();}, 1000);
            $("#hidden-pass-div").slideUp();
        if (passin != '') {                
            chrome.runtime.sendMessage({action: 'endexamproctor', entered: passin}); 
            $("#pass").val('');
        }
        

        //chrome.runtime.sendMessage({action: 'endexambutton'});        
    });

    $('body').on('click', '#locked-button', function(e) { 
        
        $("#brand_line").hide();
        $("#calc-button-div").hide();
        //$("#exit-button-div").hide();
        $("#hidden-pass-div").slideDown();

        //chrome.runtime.sendMessage({action: 'endexambutton'});        
    });

    $('body').on('click', '#calc-button', function(e) {     
        chrome.runtime.sendMessage({action: 'opencalculator'}); 
    });

    $('body').on('click', '#paste-button', function(e) {     
        chrome.runtime.sendMessage({action: 'pastein'}); 
    });

    $('body').on('onmousedown', '#paste-button', function(e) {     
        e.preventDefault();
    });

    $('body').on('click', '.closeTab', function(e) {
          console.log("TRAPPED THE BUTTON CLICK");
          e.preventDefault();

          var p1 = $(this).parent();
          //console.log(p1);

          var p2 = p1.parent();
          //console.log(p2);

          var id = p2.attr('id');

          chrome.runtime.sendMessage({action: 'tabremove', payload: id});

    });

    
    var GLOBAL_ctrl_mode = false;
    var GLOBAL_alt_mode = false;

    $('body').keydown(function(e) {
         console.log("TRAPPED KEYDOWN " + e.ctrlKey);

         if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
            e.preventDefault();
            e.stopPropogation();
         }

         if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
            e.preventDefault();
            e.stopPropogation();
         }

         if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'W' || e.key === 'w')) {
            e.preventDefault();
            e.stopPropogation();
         }

         if ((e.ctrlKey || e.metaKey) && (e.key === 'W' || e.key === 'w')) {
            e.preventDefault();
            e.stopPropogation();
         }

         if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            e.stopPropogation();
         }

         if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
            e.preventDefault();
            e.stopPropogation();
         }

         if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
            e.stopPropogation();
         }

         

         

         if (e.altKey) {   

            GLOBAL_alt_mode = true;    
                  
            chrome.runtime.sendMessage({action: 'altdown'}, function(response) {
               console.log('ALT down');       
           });
           
        }

        if (e.ctrlKey && e.shiftKey) {   

            GLOBAL_alt_mode = true;   
             
            chrome.runtime.sendMessage({action: 'altdown'}, function(response) {
               console.log('ALT down');       
           });
           
        } else if (e.ctrlKey) {

            GLOBAL_ctrl_mode = true;   
                    
             chrome.runtime.sendMessage({action: 'ctrldown'}, function(response) {
                console.log('CTRL down');       
            });
            
         }
    });

    $('body').keyup(function(e) {
         console.log("TRAPPED KEYUP" + e.ctrlKey);

         if (!e.ctrlKey && GLOBAL_ctrl_mode) {
            GLOBAL_ctrl_mode = false;

            
             chrome.runtime.sendMessage({action: 'ctrlup'}, function(response) {
                console.log('CTRL up');       
            });
            
         } else if (!e.altKey && GLOBAL_alt_mode) {
            GLOBAL_alt_mode = false;

            
            chrome.runtime.sendMessage({action: 'altup'}, function(response) {
               console.log('ALT up');       
           });
           
        } else if (e.which == 27) {
            chrome.runtime.sendMessage({action: 'escup'}, function(response) {
                console.log('ESC up');       
            });
        }
    });
   



    $('body').on('click', '.nav-item', function(e) {

        console.log("TRAPPED THE NAVITEM CLICK");
        //e.preventDefault();

        chrome.runtime.sendMessage({action: 'tabclick', payload: this.id}, function(response) {
            console.log('Tab clicked');       
        });
    });

    chrome.runtime.sendMessage({action: 'gettabline'}, function(response) {
            console.log('tabbar returned ' + response);

            // split the components
            var pos = response.indexOf("::::");
            var part1 = response.substring(0, pos);
            var part2 = response.substring(pos+4);

            var pt2pos = part2.indexOf(";;;;");
            var part3 = part2.substring(0, pt2pos);
            var part4 = part2.substring(pt2pos+4);

            

            $('#respondus_tabbar').html(part1);
            $('#calc-button-div').html(part3);
            $('#exit-button-div').html(part4);            
          
        });
}


function beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
}

function changeTab(tab, action) {
    port.postMessage({
        tab: parseInt(tab),
        action: action
    });
}

function tabScroll(e) {
    var tabs = document.querySelector('#tabs');
    var active = document.querySelector('.active');
    var tabId = 0;
    if (e.wheelDelta > 0) {
        if (active.previousSibling != null) {
            tabId = active.previousSibling.dataset.id;
        } else {
            tabId = tabs.children[tabs.children.length - 1].dataset.id;
        }
    } else if (e.wheelDelta < 0) {
        if (active.nextSibling != null) {
            tabId = active.nextSibling.dataset.id;
        } else {
            tabId = tabs.children[0].dataset.id;
        }
    }
    changeTab(tabId, 'activate');
    return false;
}

function updateTabs(data) {
    console.log('updateTabs ' + data);
    console.log(data);

    var tabs = document.querySelector('#tabs');
    tabs.innerHTML = data.tabs;
    for (var i = 0; i < tabs.children.length; i++) {
        if (tabs.children[i].dataset.id == data.tabId) {
            tabs.children[i].className += ' active';
        }
        tabs.children[i].onclick = function(e) {
            changeTab(this.dataset.id, e.button == 1 ? 'close' : 'activate');
        };
        tabs.onmousewheel = tabScroll;
    }
}


