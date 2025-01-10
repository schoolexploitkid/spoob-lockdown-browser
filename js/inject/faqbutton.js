
console.log("adding a button");

$('body').on('click', '#exit_faq', function() {
    window.close();
});


$(function() {
    $('body').append('<div id="exit_faq" style="display:block; position: absolute; top: 20px; right: 20px; font-size: 25px"><i class="fa fa-window-close closeTab"></i></div>');          
});