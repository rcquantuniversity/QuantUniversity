module.exports = function () {
    var model = {};
    var mongoose = require("mongoose");
    var UserSchema = require("./user.schema.server.js")();
    var UserModel = mongoose.model("NewUserModel", UserSchema);
    var bcrypt = require("bcrypt-nodejs");

    var Q = require("q");

    var api = {
        setModel: setModel,
        findUserById: findUserById,
        findUserByUsername: findUserByUsername,
        createUser : createUser,
        updateStartOfLab : updateStartOfLab,
        updateLabTimeRemaining : updateLabTimeRemaining
    };
    return api;

    function updateLabTimeRemaining(imageName, labStartTime, userid) {
        console.log("******** inside updateLabTimeRemaining ***********");
        var deferred = Q.defer();
        UserModel
            .findOne({_id : userid}, function (err, user) {
                if (err) {
                    deferred.reject(err);
                } else {
                    user.labs.forEach(function (lab, index) {
                        // check for imageName
                        console.log(lab);
                        console.log(Date.now() / 1000);
                        console.log(labStartTime);
                        lab.timeRemaining -= Date.now() / 1000 - labStartTime;
                        console.log(lab);
                        deferred.resolve(lab.timeRemaining);
                    });
                    user.save();
                }
            });
        return deferred.promise;
    }

    function updateStartOfLab(userid, imagename) {
        var deferred = Q.defer();
        UserModel
            .findOne({_id : userid}, function (err, user) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var labs = user.labs;
                    var labFound = false;
                    for (var i in labs) {
                        var lab = labs[i];
                        if (lab.imageName === imagename) {
                            labFound = true;
                            deferred.resolve(lab.timeRemaining);
                            break;
                        }
                    }
                    if (!labFound) {
                        // if lab is not in the list, add it and set timeRemaining to complete duration
                        model
                            .dockerImageModel
                            .getImageDuration(imagename)
                            .then(
                                function (duration) {
                                    UserModel
                                        .update({_id : userid}, {$push : {labs : {
                                            imageName: imagename,
                                            timeRemaining : duration
                                        }}}, function (err, data) {
                                            if (err) {
                                                deferred.reject(err);
                                            } else {
                                                deferred.resolve(duration);
                                            }
                                        });
                                },
                                function (err) {
                                    deferred.reject(err);
                                }
                            );
                    }
                }
            });
        return deferred.promise;
    }


    function createUser(user) {
        var deferred = Q.defer();
        UserModel
            .create(user, function (err, user) {
                if(err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });
        return deferred.promise;
    }

    function findUserById(userId) {
        var deferred = Q.defer();
        UserModel
            .findOne({_id: userId}, function (err, user) {
                if(err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });
        return deferred.promise;
    }


    function findUserByUsername(username) {
        var deferred = Q.defer();
        UserModel
            .findOne({"username": username}, function (err, user) {
                if(err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });
        return deferred.promise;
    }

    function setModel(_model) {
        model = _model;
    }

};
