console.log("Inside install...");

const GLOBAL_bbsetuperror = chrome.i18n.getMessage("blackboardsetuperror");
const GLOBAL_bbprofileerror = chrome.i18n.getMessage("blackboardprofileerror");



const GLOBAL_installhead = chrome.i18n.getMessage("install_head");
const GLOBAL_warntop = chrome.i18n.getMessage("install_warntop");
const GLOBAL_warnbottom = chrome.i18n.getMessage("install_warnbottom");
const GLOBAL_installcopy = chrome.i18n.getMessage("install_copyright");

$(document).ready(function() {

  $("#ldb_subtitle").html(GLOBAL_installhead);
  $("#warning-text-top-inside").html(GLOBAL_warntop);
  $("#warning-text-bottom").html(GLOBAL_warnbottom);
  $("#ldb_copyrighttext").html(GLOBAL_installcopy);

  $("#ldb_subtitlebb").html(GLOBAL_bbsetuperror);
  $(".profileerror").html(GLOBAL_bbprofileerror);
});


chrome.runtime.getPlatformInfo(function(platformInfo) {
  var os = platformInfo.os;

  if (os != 'cros') {
      $("#ldb_oswarning").show();
      $("#ldb_title").hide();
	  $("#ldb_subtitle").hide();
  }

  var manifest = chrome.runtime.getManifest();
  $("#version-number").text("v" + manifest.version);
  
});



