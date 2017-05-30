module.exports = function() {
    var mongoose = require("mongoose");

    var PackagesSchema = mongoose.Schema({
        base: {
            type: String,
            enum: ['python2.7', 'python3.5', 'R'],
            default: 'python2.7'
        },
        packages: [
            {
                name : String,
                command : String,
                version: {
                    type: String,
                    default: 'latest'
                }
            }]
    }, {collection: "PackagesDB"});

    return PackagesSchema;
};