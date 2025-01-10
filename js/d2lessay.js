console.log("d2lessay");




$(document).ready(function() {  
    linkCheckActive();
    setInterval(linkCheckActive, 500);
});


//var allOfThem = $('*');

function linkCheckActive() {

    chrome.storage.local.get([ 'systemstate' ], function(result){        
		const started = result.systemstate.examStarted;

        if (started) {
            linkCheck();
        }
    });
    
}


function linkCheck() {

    //console.log("linkcheck");

    

        var iframeone = $("#ctl_2").get(0);        

        //console.log(iframeone);

        var fs2attempt = "";
        if (iframeone) {
            var allframe = $(iframeone).contents();

            //console.log(allframe);

            fs2attempt = allframe.find("#FRMSET_attempt");
        } else {
            fs2attempt = $("#FRMSET_attempt");

            //console.log(fs2attempt);
        }

        

        
        
        //var fs2new = allframe.find("#FRMSET_attempt").find("[name='pageFrame");

        

        //console.log(fs2attempt);

        var fs2new = fs2attempt.find("[name='pageFrame");

        //console.log(fs2new);

        
        
        if (fs2new) {

            //console.log("looking inside of pageFrame");

            

            
            fs2new.contents().find("a").each(function () {
               // console.log("found a link");

                //readspeaker
                const href = $(this).prop('href');
	            const index = href.indexOf("readspeaker");

                if (index == -1) {
                    $(this).attr('target', '_blank');	    
                    $(this).unbind().click(function() {
                        e.preventDefault();
                        e.stopPropagation();

                        chrome.runtime.sendMessage({action: 'openlink', payload: $(this).prop('href')}, function(response) {
                            console.log('Tab opened');          
                        });
                    });		

                }
            });


            var fs2newcontent = fs2new.contents().find("d2l-htmleditor").each(function () {

                //console.log($(this).attr("id"));

                //console.log("found d2l-htmleditor");

                $(this).bind("contextmenu", function(e) {
                    e.preventDefault();
                    return false;
                });
                        
                var fs2newcontentshadow = $(this).get(0).shadowRoot;   

                //console.log(fs2newcontentshadow);

                var fs2editor = $(fs2newcontentshadow).find("iframe").each(function () {
                    //console.log("fs2editor");
                    //console.log($(this));

                    

                    

                    $(this).contents().find("#tinymce").each(function (i, obj) {
                        
                        console.log(obj);

                        //$(obj).css("background-color", "green");
                                                       
                        $(obj).unbind().bind("contextmenu", function(e) {
                            e.preventDefault();
                            console.log("rightclick");
                            return false;
                        });

                        $(obj).parent().on("contextmenu",function(){
                            console.log("rightclickon");
                            return false;
                         }); 
                        
                        
                    });


                });
                
                //console.log(fs2editor);

                //fs2newcontentshadow.find("iframe").each(function () { 
                //    console.log("found iframe " + $(this).attr("id"));
                //});

                var fs2toolbar = $(fs2newcontentshadow).find("d2l-htmleditor-toolbar").get(0);
                //console.log(fs2toolbar);

                var fs2toolbarshadow = fs2toolbar.shadowRoot;

                //console.log(fs2toolbarshadow);
                
                var fs2quicklink = $(fs2toolbarshadow).find("[text='Insert Stuff']").get(0);
                var fs2quicklink2 = $(fs2toolbarshadow).find("[text='Insert Quicklink']").get(0);
                var fs2quicklink3 = $(fs2toolbarshadow).find("[text='Source Code']").get(0);
                

                var fs2context = $(fs2newcontentshadow).find("d2l-htmleditor-context-menu").get(0);
                $(fs2quicklink).remove();
                $(fs2quicklink2).remove();
                $(fs2quicklink3).remove();

                if (fs2context) {                
                    var fs2contextlink = $(fs2context).find("d2l-htmleditor-link-display-context-menu").get(0);

                    if (fs2contextlink) {                    
                        var fs2contextlinkshad = fs2contextlink.shadowRoot;
                        var fs2contextactions = $(fs2contextlinkshad).find("d2l-htmleditor-context-menu-link-actions").get(0);
                        var fs2contextactionsshad = fs2contextactions.shadowRoot;
                        var fs2quicklink4 = $(fs2contextactionsshad).find("[text='Open Link']").get(0);
                        $(fs2quicklink4).remove();
                    }
                }
                
            });
        }


        if (fs2new) {


            
            fs2new.contents().find("d2l-html-block").each(function () {

                //console.log("found block");

                var fsinfoshadow = $(this).get(0).shadowRoot;    

                //console.log(fsinfoshadow);

                $(fsinfoshadow).find("a").each(function () {

                    $(this).attr('target', '_new');	    
                    $(this).unbind().click(function(e) {
                        e.preventDefault();
                        e.stopPropagation();
    
                        chrome.runtime.sendMessage({action: 'openlink', payload: $(this).prop('href')}, function(response) {
                            console.log('Tab opened');          
                        });
                    });		
    
                });

            });

          
        }


        
}


