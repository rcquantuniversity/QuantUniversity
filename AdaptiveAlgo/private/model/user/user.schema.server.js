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
        amazonCredentials: {
            accessKeyID: String,
            secretAccessKey : String,
            region : String,
            pemName : String
        },
        noOfCredits : Number,
        dateCreated: {type: Date, default: Date.now},
        labs : [{
            imageName: String,
            timeRemaining : Number
        }]
    }, {collection: "UserDB"});

    return UserSchema;
};