console.log("findpass");

if ( $("input[name='password']").length) {
	chrome.runtime.sendMessage({action: 'bbpassfound'});
} else {
	chrome.runtime.sendMessage({action: 'nobbpassfound'});
}
