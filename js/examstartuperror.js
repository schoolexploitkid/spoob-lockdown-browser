const GLOBAL_copyright = chrome.i18n.getMessage("install_copyright");

const GLOBAL_restartwarn = chrome.i18n.getMessage("restart_warning");



$(document).ready(function() {
    $("#ldb_copyrighttext").html(GLOBAL_copyright);

    $("#ldb_subtitle").html(GLOBAL_restartwarn);
    
});