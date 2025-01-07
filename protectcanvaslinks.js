console.log("protect LINKS! " + document.location.href);


function updatelinkCheck() {
	chrome.storage.local.get([ 'systemstate' ], function(result){        
        const start = result.systemstate.examStarted;
        if (start) {
            updatelinks();            
        }
    });
}

function updatelinks() {
	$('a[class=external]').each(function() {		
		//$(this).attr('target', '_blank');	    
		$(this).unbind().click(noop);		
	});

	//$("body").find("[aria-label='Equation Editor']").remove();

	$('html').attr('translate', 'no');

}

function noop(e) {

	e.preventDefault();
	e.stopPropagation();	

	chrome.runtime.sendMessage({action: 'openlink', payload: $(this).prop('href')} );


	console.log('noop');
}

$(document).ready(function() {		
	
	setInterval(function () {updatelinkCheck();}, 1000);

});