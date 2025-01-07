console.log("tabs.js loaded");

chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {

        console.log("TOP LINE ACTION: " + request.action);

        if (request.action == 'endofexam') {
            $("#exit-button").show();
        }

        });

onload = function() {
    console.log("calling onload adding communication port");

    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {

        console.log("ACTION: " + request.action);

        if (request.action == "clickreceived") {
            var  locelem = document.elementFromPoint(30, 30);
            $(locelem).click();
        }

        if (request.action == "openlinkbk") {
            console.log("background opened a requestedtab " + request.tabid);
            $("#respondus_tabbar").append('<li id="' + request.tabid + '" class="nav-item"><a class="nav-link">Exam Link<i class="fa fa-window-close closeTab"></i></a></li>');
        }

        if (request.action == 'removelinkbk') {
            console.log("background removing link");

            chrome.runtime.sendMessage({action: 'gettabline'}, function(response) {
                console.log('tabbar returned ' + response);

                // split the components
                var pos = response.indexOf("::::");
                var part1 = response.substring(0, pos);
                var part2 = response.substring(pos+4);

                $('#respondus_tabbar').html(part1);
                $('#exit-button-div').html(part2);
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

        

  });


    $('body').on('click', '#exit-button', function(e) {     
          chrome.runtime.sendMessage({action: 'endexambutton'});        
    });

    $('body').on('click', '.closeTab', function(e) {
          console.log("TRAPPED THE BUTTON CLICK");
          e.preventDefault();

          var p1 = $(this).parent();
          console.log(p1);

          var p2 = p1.parent();
          console.log(p2);

          var id = p2.attr('id');

          chrome.runtime.sendMessage({action: 'tabremove', payload: id});

    });


    $('body').keydown(function(e) {
         console.log("TRAPPED KEYDOWN " + e.ctrlKey);

         if (e.ctrlKey) {             
             chrome.runtime.sendMessage({action: 'ctrldown'}, function(response) {
                console.log('CTRL down');       
            });
         }
    });

    $('body').keyup(function(e) {
         console.log("TRAPPED KEYUP" + e.ctrlKey);

         if (!e.ctrlKey) {
             chrome.runtime.sendMessage({action: 'ctrlup'}, function(response) {
                console.log('CTRL up');       
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

            console.log("part1= " + part1);
            console.log("part2=" + part2);

            $('#respondus_tabbar').html(part1);
            $('#exit-button-div').html(part2);            
          
        });
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


