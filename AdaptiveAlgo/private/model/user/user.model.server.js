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
        createUser : createUser
    };
    return api;

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
