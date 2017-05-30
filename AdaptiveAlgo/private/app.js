module.exports = function (app) {

    var model = require("./model/model.server.js")();

    require('./services/user.service.server.js')(app, model);
    require('./services/course.service.server.js')(app, model);

};