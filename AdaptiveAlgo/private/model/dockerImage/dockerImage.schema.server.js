module.exports = function() {
    var mongoose = require("mongoose");

    var DockerImageSchema = mongoose.Schema({
        userid : {type: mongoose.Schema.Types.ObjectId, ref:'NewUserModel'},
        imageName: String,
        description : String,
        moduleName: String,
        duration : Number,
        imageType : {
            type: String,
            enum: ['Notebook', 'Script','Both'],
            default: 'Notebook'
        },
        dateCreated: {type: Date, default: Date.now}
    }, {collection: "DockerImageDB"});

    return DockerImageSchema;
};