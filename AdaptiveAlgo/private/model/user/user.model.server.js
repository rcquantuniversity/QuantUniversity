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
        updateLabTimeRemaining : updateLabTimeRemaining,
        getListOfUsers : getListOfUsers,
        updateAmazonCredentials : updateAmazonCredentials,
        updateUserDetails : updateUserDetails,
        getAmazonCredentials : getAmazonCredentials
    };
    return api;

    function getAmazonCredentials(username) {
        var deferred = Q.defer();
        UserModel
            .findOne({"username" : username}, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(data.amazonCredentials);
                }
            });
        return deferred.promise;
    }

    function updateLabTimeRemaining(moduleName, labStartTime, userid) {
        console.log("******** inside updateLabTimeRemaining ***********");
        var deferred = Q.defer();
        UserModel
            .findOne({"_id" : userid}, function (err, user) {
                if (err) {
                    deferred.reject(err);
                } else {
                    user.labs.forEach(function (lab, index) {
                        // check for imageName/modulename
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

    function getListOfUsers() {
        var deferred = Q.defer();
        UserModel
            .find({}, function (err, allUsers) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(allUsers);
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


    //Update Amazon Credentials
    function updateAmazonCredentials(userId,amazonCredentials) {
        var deferred = Q.defer();
        UserModel
            .update({_id : userId},
                    {$set : {amazonCredentials : amazonCredentials
                    }}, function (err, data) {
                                if (err) {
                                    deferred.reject(err);
                                } else {
                                    deferred.resolve(data);
                                }
                    });

        return deferred.promise;
    }

    function updateUserDetails(userId, userDetails) {
        // userDetails.credits = parseInt(userDetails.credits);
        // console.log(userDetails);
        // console.log("Check Value"+userId+ userDetails);
        var deferred = Q.defer();
        UserModel
            .update({_id : userId},
                    {$set : {noOfCredits : userDetails.noOfCredits,
                            expiryDate : userDetails.expiryDate
                        }}, function (err, data) {
                            if (err) {
                                deferred.reject(err);
                            } else {
                                deferred.resolve(data);
                            }
                    });

        return deferred.promise;
    }

    function setModel(_model) {
        model = _model;
    }

};
