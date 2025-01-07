console.log("blockclick ready");
linkCheck();
setInterval(linkCheck, 2000);

$('a').addClass('disabled');

$('body').on('click', 'a', function(e){
	console.log("TRAPPED THE CLICK ON a general link body");
	if($(this).hasClass('disabled')) {
		e.preventDefault();
	}	  
});

$("a").on('click' , function(e) {
	console.log("TRAPPED THE CLICK ON a general link a");
	if($(this).hasClass('disabled')) {
		e.preventDefault();
	}	  
});

function linkCheck() {
	chrome.storage.local.get([ 'systemstate' ], function(result){        
		const started = result.systemstate.examStarted;
		const domains = result.systemstate.externalDomainList;
		const domainstr = domains.replace(/\s/g, '');

		const domArray = domainstr.trim().split(",");

		//console.log(domArray);

		if (started && domains != '') {
			$("a").each(function() {
				var valid = false;
				var linkaddr = $(this).attr("href");

				if (linkaddr.charAt(0) =='/') {					
					linkaddr = window.location.href + linkaddr;	
				} 

				//console.log("LINK: " + linkaddr);

				for (dom of domArray) {
					//console.log(dom);
					if (linkaddr.indexOf(dom) != -1) {
						valid = true;
					}
				}

				
				

				if (valid == true) {					
					$('a').removeClass('disabled');
				} 


			});
		}

		
	});
}

