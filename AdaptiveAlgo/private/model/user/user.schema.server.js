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
            enum: ['ADMIN', 'STUDENT', 'INSTRUCTOR'],
            default: 'INSTRUCTOR'
        },
        amazonCredentials: {
            accessKeyID: String,
            secretAccessKey : String,
            region : String,
            pemName : String
        },
        noOfCredits: {
            type: Number,
            default: 2
        },
        dateCreated: {type: Date, default: Date.now},
        expiryDate: {type: Date, default: Date.now() + 30*24*60*60*1000},
        labs : [{
            imageName: String,
            timeRemaining : Number
        }]
    }, {collection: "UserDB"});

    return UserSchema;
};