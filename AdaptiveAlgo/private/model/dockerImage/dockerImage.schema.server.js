module.exports = function() {
    var mongoose = require("mongoose");

    var DockerImageSchema = mongoose.Schema({
        userid : {type: mongoose.Schema.Types.ObjectId, ref:'NewUserModel'},
        imageName: String,
        descriptionFile : String,
        dateCreated: {type: Date, default: Date.now}
    }, {collection: "DockerImageDB"});

    return DockerImageSchema;
};