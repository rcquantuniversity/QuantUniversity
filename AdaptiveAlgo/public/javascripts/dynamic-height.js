$(document).ready(function() {
    var headerHeight = $('header').height();
    var windowHeight = $(window).height();
    var footerheight = $('footer').height();

    var minheight = windowHeight - headerHeight - footerheight - 1;
    $('#backgroundImage').css('min-height', minheight);
});
