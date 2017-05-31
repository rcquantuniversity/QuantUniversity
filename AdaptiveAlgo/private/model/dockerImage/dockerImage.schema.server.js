module.exports = function() {
    var mongoose = require("mongoose");

    var DockerImageSchema = mongoose.Schema({
        userid : {type: mongoose.Schema.Types.ObjectId, ref:'NewUserModel'},
        imageName: String,
        descriptionFile : String
    }, {collection: "DockerImageDB"});

    return DockerImageSchema;
};