module.exports = function () {
    var mongoose = require('mongoose');
    var connectionString = 'mongodb://127.0.0.1:27017/local';

    if(process.env.MLAB_UNAME) {
        connectionString = process.env.MLAB_UNAME + ":" +
            process.env.MLAB_PWD + "@" +
            process.env.MLAB_HOST2 + ':' +
            process.env.MLAB_PORT2 + '/' +
            process.env.MLAB_APP_NAME_2;
        //mongodb://admin:admin@ds143980.mlab.com:43980/heroku_bjfvlp12
    }

    mongoose.connect(connectionString);

    var userModel = require("./user/user.model.server.js")();
    var packagesModel = require("./packages/packages.model.server.js")();
    var dockerImageModel = require("./dockerImage/dockerImage.model.server.js")();
    var machineLearningModel = require("./machineLearningModel/mlModel.model.server.js")();

    var model = {
        userModel : userModel,
        packagesModel : packagesModel,
        dockerImageModel : dockerImageModel,
        machineLearningModel : machineLearningModel
    };

    userModel.setModel(model);
    packagesModel.setModel(model);
    dockerImageModel.setModel(model);
    machineLearningModel.setModel(model);

    return model;
};