module.exports = function (app, model) {

    app.get("/api/user/:userId", findUserById);
    app.post("/api/checkLogin", checkLogin);
    app.post("/api/logout", logout);
    app.get("/api/findCurrentUser",findCurrentUser);
    app.post("/api/registerUser", registerUser);
    app.post("/api/callToJupyterNotebook", callToJupyterNotebook);
    app.get("/api/getAllPackages", getAllPackages);
    app.post("/api/createOutputJSON", createOutputJSON);

    var request = require('request');
    var jsonfile = require('jsonfile');

    function createOutputJSON(req, res) {
        var file = './private/services/output.json';
        jsonfile.writeFile(file, req.body, function (err) {
            console.error(err);
        });
        return res.sendStatus(200);
    }
    
    function getAllPackages(req, res) {
        model
            .packagesModel
            .getAllPackages()
            .then(
                function (allPackages) {
                    res.json(allPackages);
                },
                function (err) {
                    res.sendStatus(400).send(err);
                }
            );
    }


    function callToJupyterNotebook(req, res) {
        // return request('http://ec2-52-26-246-88.us-west-2.compute.amazonaws.com:8000/user/999/tree', function (error, response, body) {
        //     console.log('body:', body); // Print the HTML for the Google homepage.
        // });
    }


    var bcrypt = require("bcrypt-nodejs");
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy(localStrategy));
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);

    app.post('/api/login', passport.authenticate('local'), login);

    function registerUser(req, res) {
        var user = req.body;
        model
            .userModel
            .createUser(user)
            .then(
                function () {
                    res.sendStatus(200);
                },
                function (err) {
                    res.sendStatus(400).send(err);
                }
            );
    }

    function localStrategy(username, password, done) {
        model
            .userModel
            .findUserByUsername(username)
            .then(
                function(user) {
                    if (!user) {
                        return done(null, false);
                    } else if (user && password === user.password) {
                        return done(null, user);
                    }
                },
                function(err) {
                    if (err) { return done(err); }
                }
            );
    }

    function login(req, res) {
        var user = req.user;
        res.json(user);
    }

    function logout(req, res) {
        req.logout();
        res.sendStatus(200);
    }

    function serializeUser(user, done) {
        done(null, user);
    }

    function deserializeUser(user, done) {
        model
            .userModel
            .findUserById(user._id)
            .then(
                function(user){
                    done(null, user);
                },
                function(err){
                    done(err, null);
                }
            );
    }

    function findCurrentUser(req, res) {
        res.json(req.user);
    }

    function checkLogin(req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    }

    function findUserById(req, res) {
        var userId = req.params.userId;
        model
            .userModel
            .findUserById(userId)
            .then(
                function (user) {
                    res.send(user);
                },
                function (err) {
                    res.sendStatus(400).send(err);
                }
            );
    }

};