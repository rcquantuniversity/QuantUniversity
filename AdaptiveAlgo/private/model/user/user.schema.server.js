module.exports = function() {
    var mongoose = require("mongoose");

    var UserSchema = mongoose.Schema({
        username: String,
        password: String,
        firstName: String,
        lastName: String,
        email: String,
        userType: {
            type: String,
            enum: ['STUDENT', 'INSTRUCTOR'],
            default: 'INSTRUCTOR'
        },
        dateCreated: {type: Date, default: Date.now},
        lab : {
            labId : {type: mongoose.Schema.Types.ObjectId, ref:'NewDockerImageModel'},
            startTime : Date,
            stopTime : Date
        }
    }, {collection: "UserDB"});

    return UserSchema;
};