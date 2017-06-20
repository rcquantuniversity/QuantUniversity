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
        getImagesForUser : getImagesForUser,
        getImagesForStudent : getImagesForStudent,
        getImageDuration : getImageDuration
    };
    return api;

    function getImageDuration(imagename) {
        var deferred = Q.defer();
        DockerImageModel
            .findOne({imageName : imagename}, function (err, image) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(image.duration);
                }
            });
        return deferred.promise;
    }

    function getImagesForStudent() {
        var deferred = Q.defer();
        DockerImageModel
            .find({}, function (err, allImages) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(allImages);
                }
            });
        return deferred.promise;
    }

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
    
    function saveDockerImageFile(userid, imagename, imageDescription, description, modulename, imageType) {
        var deferred = Q.defer();
        var file = './private/services/dockerImages/'+imagename +'.txt';
        var record = {userid : userid, imageName : imagename, description : description, moduleName : modulename, imageType : imageType};
        DockerImageModel
            .create(record, function (err, status) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(status);
                    var packages = [];
                    for (var i in imageDescription.data) {
                        var record = imageDescription.data[i];
                        if (record.packages.length > 0) {
                            for (var j in record.packages) {
                                var p = record.packages[j];
                                packages.push(p.name);
                            }
                        }
                    }
                    var str = "Packages in this image are : "+packages;
                    fs.writeFile(file, str, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        return deferred.promise;
    }

    function setModel(_model) {
        model = _model;
    }
};
