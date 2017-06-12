$(document).ready(function() {
    $('#buildDockerForm').on('click', '.addRepo', function() {
        var $template = $('#gitRepoTemplate'),
            $clone = $template
            .clone()
            .removeClass('hide')
            .removeAttr('id')
            .insertBefore($template);
    }) // Remove button click handler
    .on('click', '.removeRepo', function() {
        var $row = $(this).parents('.form-grp');

        $row.remove();
    }).on('click', '.addAptget', function() {
        var $template = $('#aptgetTemplate'),
            $clone = $template
            .clone()
            .removeClass('hide')
            .removeAttr('id')
            .insertBefore($template);
    }) // Remove button click handler
    .on('click', '.removeAptget', function() {
        var $row = $(this).parents('.form-grp');

        $row.remove();
    });

    $('#uploadBtn').on('change', function() {
        var value = $(this).val();
        var path = value; 
        var filename = path.replace(/^.*\\/, ""); 
        $('#uploadFile').val(filename);
    });

    var headerHeight = $('header').height();
    var windowHeight = $(window).height();
    var footerheight = $('footer').height();

    var minheight = windowHeight - headerHeight - footerheight;
    $('#backgroundImage').css('min-height', minheight);

    Dropzone.autoDiscover = false;
});
