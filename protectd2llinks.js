console.log("protect d2l LINKS! " + document.location.href);

function updatelinks() {	

	var $iframeBody = $('frame[name = "pageFrame"]').contents().find('body'); 		

	var $div7 = $iframeBody.find("#ctl_7");
	var $c1 = $div7.children()[0].shadowRoot;
	
	$($c1).find("a").each(function() {		
		//$(this).attr('target', '_blank');	    
		$(this).unbind().click(noop);		
	});
		

}

function noop(e) {
	const href = $(this).prop('href');
	const index = href.indexOf("readspeaker");
	if (index == -1) {
		e.preventDefault();
		e.stopPropagation();

		chrome.runtime.sendMessage({action: 'openlink', payload: $(this).prop('href')}, function(response) {
			console.log('Tab opened');		  
		});
	}
	
	console.log('noop');
}

$(document).ready(function() {

	console.log("protect links PAGE READY!");	
	
	setInterval(function () {updatelinks();}, 1000);

});

