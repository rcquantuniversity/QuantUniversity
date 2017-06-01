module.exports = function () {
    var model = {};
    var mongoose = require("mongoose");
    var DockerImageSchema = require("./dockerImage.schema.server")();
    var DockerImageModel = mongoose.model("NewDockerImageModel", DockerImageSchema);

    var Q = require("q");
    var fs = require('file-system');

    var api = {
        setModel: setModel,
        saveDockerImageFile : saveDockerImageFile,
        getImagesForUser : getImagesForUser
    };
    return api;

    function getImagesForUser(userid) {
        var deferred = Q.defer();
        DockerImageModel
            .find({userid : userid}, function (err, allImages) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(allImages);
                }
            });
        return deferred.promise;
    }
    
    function saveDockerImageFile(userid, imagename, imageDescription) {
        var deferred = Q.defer();
        // var file = './private/services/dockerImages/'+imagename +'.txt';
        // var record = {userid : userid, imageName : imagename, descriptionFile : file};
        // DockerImageModel
        //     .create(record, function (err, status) {
        //         if (err) {
        //             deferred.reject(err);
        //         } else {
        //             deferred.resolve(status);
        //             fs.writeFile(file, imageDescription, function(err) {
        //                 if (err) {
        //                     console.log(err);
        //                 }
        //             });
        //         }
        //     });
        return deferred.promise;
    }

    function setModel(_model) {
        model = _model;
    }
};
