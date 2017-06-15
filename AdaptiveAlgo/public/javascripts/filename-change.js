$(document).ready(function() {
    $('#uploadBtn').on('change', function() {
        var value = $(this).val();
        var path = value; 
        var filename = path.replace(/^.*\\/, ""); 
        $('#uploadFile').val(filename);
    });

    $('#importBtn').on('change', function() {
        var value = $(this).val();
        var path = value; 
        var filename = path.replace(/^.*\\/, ""); 
        $('#importFile').val(filename);
    });

    $('#multipleUpload').on('change', function() {
        var file = $(this);
        var total = file.get(0).files.length;
        $('#multipleFile').val(total + " files");
    });            
});
