$(document).ready(function() {
    var headerHeight = $('header').height();
    var windowHeight = $(window).height();
    var footerheight = $('footer').height();

    var minheight = windowHeight - headerHeight - footerheight - 1;
    console.log(headerHeight);
    console.log(windowHeight);
    console.log(footerheight);
    console.log(minheight);
    $('#backgroundImage').css('min-height', minheight);
});
