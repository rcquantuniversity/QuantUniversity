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
    app.get("/api/listAllUsers", listAllUsers);
    app.get("/api/listAllImagesForStudent", listAllImagesForStudent);
    app.post("/api/addPackage", addPackage);
    app.get("/api/getUserPackageFile", getUserPackageFile);
    app.put("/api/setAmazonCredentials",updateAmazonCredentials);

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


        // testing - push dockerfile to github
        // var simpleGit = require('simple-git')('./private/services');
        // simpleGit.add('./temp/Dockerfile', function (err, data) {
        //     simpleGit.push('./i1',function (err, data) {
        //         console.log("push"+err);
        //         console.log("push"+data);
        //     });
        //     console.log(err);
        //     console.log(data);
        // });
    }
    init();

    function updateAmazonCredentials(req,res) {
        var userId  = req.user._id;
        var amazonCredentials = req.body;
        model
            .userModel
            .updateAmazonCredentials(userId,amazonCredentials)
            .then(
                function () {
                    res.sendStatus(200);
                },
                function (err) {
                    res.sendStatus(400).send(err);
                }
            );
    }


    function getUserPackageFile(req, res) {
        var logger = require('./logger.js');
        var jsonfile = require('jsonfile');
        var file = './private/services/i1/PackageFile1.json';
        // var file = './private/services/' + req.user.username + '/' + req.body.fileName +'.json';
            jsonfile.readFile(file, function(err, obj) {
                if (err) {
                    logger.log('Error','File Read in getUserPackageFile() unsuccessful');
                    logger.log('Error',err);
                    res.sendStatus(400).send(err);
                } else {
                    res.json(obj);
                }
            });
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
        var logger = require('./logger.js');
        // Add userid and permission parameters
        model
            .dockerImageModel
            .getImagesForStudent()
            .then(
                function (images) {
                    logger.log('Info','Returning images for student');
                    res.json(images);
                },
                function (err) {
                    logger.log('Error','Could not return images for student');
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

    function listAllUsers(req, res) {
        var logger = require('./logger.js');
        model
            .userModel
            .getListOfUsers()
            .then(
                function (users) {
                    logger.log('Info','Returning users for admin');
                    res.json(users);
                },
                function (err) {
                    logger.log('Error','Could not return users for admin');
                    res.sendStatus(400).send(err);
                }
            );
    }

    function uploadToDockerHub(req, res) {
        var logger = require('./logger.js');
        var imageName = req.body.imageName;


        // *******************************************
        // Check for image first and then upload
        // do not need to check - when image is created, the database entry is made only when image creation is
        // successful.


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

    function isImageReady(imageName) {
        docker.command('inspect --type=image' + ' ' + imageName, function(err, data){
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
        var imageName = req.body.imageName;
        var description = req.body.description;
        var moduleName = req.body.moduleName;
        var duration = req.body.duration;
        var packageList = req.body.packageList;
        var imageType = req.body.imageType;
        var extractLocation = req.body.extractLocation;
        var PythonShell = require('python-shell');

        logger.log('Info','Creating Docker Image');
        PythonShell.run('./private/services/dockerimage_generator.py', function (err) {
            docker.command('inspect --type=image' + ' ' + imageName, function(err, data){
                if (err) {
                    logger.log('Error','Could not generate docker image due to below error');
                    logger.log('Error',err);
                    return res.sendStatus(400);
                } else {
                    model
                        .dockerImageModel
                        .saveDockerImageFile(req.user, imageName, packageList,
                            description, moduleName, duration, imageType, extractLocation)
                        .then(
                            function () {
                                logger.log("Info","DockerImage details saved in database");
                            },
                            function () {
                                logger.log("Error","Error saving Image details in database");
                            }
                        );
                    logger.log('Info','Docker Image created successfully');
                    return res.sendStatus(200);
                }
        });
        });
    }

    function createOutputJSON(req, res) {
        var logger = require('./logger.js');
        var imageName = req.params.imageName + Date.now().toString();
        var packageList = req.body;
        var output = {"username": req.user.username ,"name" : imageName, "data" : packageList};

        var jsonfile = require('jsonfile');
        var file = './private/services/output.json';
        jsonfile.writeFile(file, output, function (err) {
            if (err) {
                logger.log("Error","DockerImage details could not be saved in JSON file due to error below");
                logger.log("Error",err);
                res.sendStatus(400).send(err);
            } else {
                logger.log("Info","DockerImage details saved in JSON file successfully");
                res.json(imageName);
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
        var logger = require('./logger.js');
        var user = req.body;
        model
            .userModel
            .createUser(user)
            .then(
                function () {
                    logger.log('Info','User registered successfully');
                    res.sendStatus(200);
                },
                function (err) {
                    logger.log('Error','User registration failed due to error below');
                    logger.log('Error',err);
                    res.sendStatus(400).send(err);
                }
            );
    }

    function localStrategy(username, password, done) {
        var logger = require('./logger.js');
        model
            .userModel
            .findUserByUsername(username)
            .then(
                function(user) {
                    if (!user) {
                        return done(null, false);
                    } else if (user && password === user.password) {
                        return done(null, user);
                    } else {
                        return done(null,"Invalid Credentials");
                    }
                },
                function(err) {
                    if (err) { return done(err); }
                }
            );
    }

    function login(req, res) {
        if(req.user) {
            var user = req.user;
            res.json(user);
        } else {
            res.sendStatus(400);
        }
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