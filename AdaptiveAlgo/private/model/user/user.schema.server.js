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
        }
    }, {collection: "UserDB"});

    return UserSchema;
};