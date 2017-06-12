module.exports = function (app, model) {

    app.post("/api/uploadToDockerHub", uploadToDockerHub);
    app.get("/api/user/:userId", findUserById);
    app.post("/api/checkLogin", checkLogin);
    app.post("/api/logout", logout);
    app.get("/api/findCurrentUser",findCurrentUser);
    app.post("/api/registerUser", registerUser);
    app.post("/api/callToJupyterNotebook", callToJupyterNotebook);
    app.get("/api/getAllPackages", getAllPackages);
    app.post("/api/createOutputJSON/:imageName", createOutputJSON);
    app.post("/api/createDockerImage", createDockerImage);
    app.get("/api/listAllImages", listAllImages);
    app.get("/api/listAllImagesForStudent", listAllImagesForStudent);
    app.post("/api/addPackage", addPackage);
    app.get("/api/getUserPackageFile", getUserPackageFile);

    var request = require('request');
    var dockerCLI = require('docker-cli-js');
    var DockerOptions = dockerCLI.Options;
    var Docker = dockerCLI.Docker;
    var docker = new Docker();

    function init() {
        var logger = require('./logger.js');
        docker.command('login'+' -e '+ "jd.adaptivealgo@gmail.com" +' -p '+
            "JDadaptivealgo2017" +' -u '+"jdadaptivealgo", function(err, data){
            logger.log('Info',data);
            logger.log('Info',"Logged in to docker hub");
        });
    }
    init();

    function getUserPackageFile(req, res) {
        var logger = require('./logger.js');
        var jsonfile = require('jsonfile');
        // var file = './private/services/' + 'i1' + '/' + filename +'.json';
        var file = './private/services/' + req.user.username + '/' + req.body.fileName +'.json';
        try {
            jsonfile.readFile(file, function(err, obj) {
                if (err) {
                    throw err;
                } else {
                    console.log(obj);
                    res.json(obj);
                }
            });
        }catch (ex) {
            logger.log('Error','File Read in getUserPackageFile() unsuccessful');
            logger.log('Error',ex);
            res.sendStatus(400).send(ex);
        }
    }

    function addPackage(req, res) {
        var logger = require('./logger.js');
        model
            .packagesModel
            .addPackage(req.body.base, req.body.package)
            .then(
                function (status) {
                    logger.log('Info','Following package added successfully');
                    logger.log('Info', req.body.package);
                    res.json(status);
                },
                function (err) {
                    logger.log('Error','Following package could not be added');
                    logger.log('Info', req.body.package);
                    res.sendStatus(400).send(err);
                }
            );
    }

    function listAllImagesForStudent(req, res) {
        // Add userid and permission parameters
        model
            .dockerImageModel
            .getImagesForStudent()
            .then(
                function (images) {
                    res.json(images);
                },
                function (err) {
                    res.sendStatus(400).send(err);
                }
            );
    }
    
    function listAllImages(req, res) {
        var logger = require('./logger.js');
        model
            .dockerImageModel
            .getImagesForUser(req.user.id)
            .then(
                function (images) {
                    logger.log('Info','Returning all images for instructor : '+req.user.id);
                    res.json(images);
                },
                function (err) {
                    res.sendStatus(400).send(err);
                    logger.log('Error','Could not return images for instructor : '+req.user.id);
                }
            );
    }

    function uploadToDockerHub(req, res) {
        var logger = require('./logger.js');
        var imageName = req.body.imageName;


        // *******************************************
        // Check for image first and then upload


        // try {
        //     var myVar = setInterval(function () {
        //         docker.command('inspect --type=image ' + imageName, function(err, data){
        //             if (err){
        //                 console.log('errjaja');
        //             } else {
        //                 console.log('yesjaja');
        //                 throw "Found";
        //             }
        //         })}, 500);
        // } catch (ex) {
        //     console.log(ex);
        //     clearInterval(myVar);
        // }

        // while(1) {
        //     var waitTill = new Date(new Date().getTime() + 2000);
        //     while(waitTill > new Date()) {}
        //     console.log("Image not ready");
        //     if(isImageReady()) {
        //         break;
        //     }
        // }
        // console.log("image ready");

        // var waitTill = new Date(new Date().getTime() + 60000);
        // while(waitTill > new Date()) {}

        docker.command('tag'+' '+imageName+' '+ "jdadaptivealgo" +'/'+imageName, function(err, data){
            logger.log('Info','Image is tagged successfully');
            console.log(data);
            console.log(err);
            docker.command('push'+' '+ "jdadaptivealgo" +'/'+imageName, function(err, data){
                console.log(data);
                console.log(err);
                logger.log('Info','Image is pushed to DockerHub successfully');
                return res.sendStatus(200);
            });
        });
    }

    function isImageReady() {
        docker.command('inspect --type=image' + ' ' + 'jupyter/scipy-notebook', function(err, data){
            console.log("Inside isImageReady() : "+ err);
            console.log("Inside isImageReady() : "+ data);
            if (err) {
                return false;
            }
            return true;
        });
    }

    // function pushImageToDockerHub() {
    //     console.log("currentImageName : " + currentImageName);
    //     // currentImageName = 'jupyter/scipy-notebook';
    //     docker.command('tag'+' '+currentImageName+' '+ "jdadaptivealgo" +'/'+currentImageName, function(err, data){
    //         docker.command('push'+' '+ "jdadaptivealgo" +'/'+currentImageName, function(err, data){
    //             console.log(data);
    //         });
    //     });
    // }

    function createDockerImage(req, res) {
        var logger = require('./logger.js');
        var PythonShell = require('python-shell');

        PythonShell.run('./private/services/dockerimage_generator.py', function (err) {
            if (err) {
                logger.log('Error','Could not generate docker image due to below error');
                logger.log(err);
            }
            logger.log('Info','Docker Image created successfully');
            return res.sendStatus(200);
        });
    }

    function createOutputJSON(req, res) {
        var logger = require('./logger.js');
        var imageName = req.params.imageName + Date.now().toString();
        var packageList = req.body;
        var output = {"username": req.user.username ,"name" : imageName, "data" : packageList};

        //*****************************************************************
        // put image details in Image database
        // check if image is created or not then do this
        model
            .dockerImageModel
            .saveDockerImageFile(req.user, imageName, output)
            .then(
                function () {
                    logger.log("Info","DockerImage details saved in database");
                },
                function () {
                    logger.log("Error","Error saving Image details in database");
                }
            );

        var jsonfile = require('jsonfile');
        var file = './private/services/output.json';
        jsonfile.writeFile(file, output, function (err) {
            if (err) {
                logger.log("Error","DockerImage details could not be saved in JSON file due to error below");
                logger.log("Error",err);
                return res.sendStatus(400).send(err);
            } else {
                logger.log("Info","DockerImage details saved in JSON file successfully");
                return res.json(imageName);
            }
        });
    }
    
    function getAllPackages(req, res) {
        var logger = require('./logger.js');
        model
            .packagesModel
            .getAllPackages()
            .then(
                function (allPackages) {
                    logger.log("Info","All packages returned successfully");
                    res.json(allPackages);
                },
                function (err) {
                    logger.log("Error","Could not return packages due to error below");
                    logger.log("Error",err);
                    res.sendStatus(400).send(err);
                }
            );

        // //testing
        // model
        //     .dockerImageModel
        //     .getImagesForUser(req.user.id)
        //     .then(
        //         function (allPackages) {
        //             //res.json(allPackages);
        //         },
        //         function (err) {
        //             //res.sendStatus(400).send(err);
        //         }
        //     );

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