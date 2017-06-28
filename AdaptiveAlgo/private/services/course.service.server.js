module.exports = function (app, model) {

    app.get("/api/getAvailableCourses", getAvailableCourses);
    app.post("/api/startLab", startLab);
    app.post("/api/stopLab", stopLab);
    app.get("/api/publish", publish);
    app.get("/api/consume", consume);
    app.get("/api/viewDockerImage/:imageName", viewDockerImage);
    app.post("/api/startScriptLab", startScriptLab);
    app.post("/api/runRStudio", runRStudio);
    app.post("/api/openTerminal", openTerminal);


    var dockerCLI = require('docker-cli-js');
    var DockerOptions = dockerCLI.Options;
    var Docker = dockerCLI.Docker;
    var docker = new Docker();
    var Set;
    var s;

    function init() {
        Set = require('simple-hashset');
        s = new Set();

        // testing
        // var spawn = require('child_process').spawn,
        //     py    = spawn('python', ['./private/services/testInputOutput.py']),
        //     data = {"name" : "Rohan", "id" : 1234},
        //     dataString = '';
        //
        // py.stdout.on('data', function(data){
        //     dataString += data.toString();
        // });
        //
        // py.stdout.on('end', function(){
        //     console.log('All data ',dataString);
        // });
        //
        // py.stdin.write(JSON.stringify(data));
        // py.stdin.end();

        //testing
        // reading entire directory structure
        // var fs = require('fs');
        // fs.readdir('./private/services', function(err, files) {
        //     console.log(files);
        // });

    }
    init();

    function runRStudio(req, res) {
        var logger = require('./logger');
        logger.log('Info','Starting R studio');


        // // Option 1
        var spawn = require('child_process').spawn,
            py = spawn('python', ['./private/services/rstudio_start.py']),
            dataString = '';

        py.stdout.on('data', function(data){
            console.log(data.toString());
            dataString += data.toString();
        });

        py.stdout.on('end', function(){
            if (dataString) {

                console.log("dataString : "+dataString);
                // add metering info into userDB
                // model
                //     .userModel
                //     .updateStartOfLab(req.user._id, imageName)
                //     .then(
                //         function (timeRemaining) {
                //             var labParameters = {"ip" : dataString.split("ip: ")[1], timeRemaining : timeRemaining};
                //             res.json(labParameters);
                //         },
                //         function (err) {
                //             console.log(err);
                //         }
                //     );
                // var labParameters = {"ip" : dataString.split("ip: ")[1], timeRemaining : timeRemaining};
                var labParameters = {"ip" : dataString.split("ip: ")[1]};
                res.json(labParameters);
            }
            else {
                return res.sendStatus(400);
            }
        });
    }

    function get_port() {
        var min = Math.ceil(7000);
        var max = Math.floor(7050);
        var port = Math.floor(Math.random()*(max-min)) + min;
        while (s.contains(port)) {
            port = Math.floor(Math.random()*(max-min)) + min;
        }
        console.log(""+port);
        return port;
    }

    function openTerminal(req, res) {
        req.setTimeout(600000);
        var node_ssh = require('node-ssh');
        var ssh = new node_ssh();
        var logger = require('./logger');
        logger.log('Info','Starting Terminal');
        var imageName = req.body.imageName;
        var moduleName = req.body.moduleName;
        var port = get_port();

        // create instance for 1st user.
        // allow max 10 users by maintaining database
        // next 9 users will use same instance but different containers

        var PythonShell = require('python-shell');

        // Create Amazon Instance
        // PythonShell.run('./private/services/', function (err) {
        //     if (err) {
        //         logger.log('Error',"Error while creating amazon instance");
        //         logger.log('Error', err);
        //         return res.sendStatus(200);
        //     } else {
        //         return res.sendStatus(400);
        //     }
        // });


        //read parameters from json
        ssh.connect({
            host: '34.211.179.108',
            username: 'ec2-user',
            privateKey: "./private/services/qu.pem"
        }).then(function() {
            // Local, Remote
            ssh.execCommand('docker run -td --name='+req.user.username+' '+ imageName)
                .then(
                    function(result) {
                        ssh.execCommand('screen -dm -S '+req.user.username+' ./gotty -w -p '+ port +
                        ' docker exec -it '+'test'+' /bin/bash').then(function(result) {
                        console.log('STDOUT: ' + result.stdout);
                        console.log('end');
                        s.add(port);
                        ssh.dispose().then(
                            function (status) {
                                logger.log('Info','ssh dispose() called');
                                logger.log('Info',status);
                            },
                            function (err) {
                                logger.log('Error','ssh dispose() failed due to error below');
                                logger.log('Error',err);
                            }
                        );
                        return res.json({"ip" : '34.211.179.108', "port" : port});
                });
            },
                function (err) {
                    logger.log('Error',err);
                    return res.sendStatus(400);
                });
        },
        function (err) {
            logger.log('Error','ssh execCommand() failed due to below reason');
            logger.log('Error',err);
            return res.sendStatus(400);
        });
    }

    function viewDockerImage(req, res) {
        var imageName = req.params.imageName;
        var fs = require('fs');
        var fileName = imageName + 'Dockerfile.txt';
        fileName = 'i1Dockerfile.txt';
        fs.readFile('./private/services/temp/' + fileName, function(err, data) {
            if (err) {
                res.sendStatus(400).send(err);
            }
            var fileData = data.toString();
            res.json(fileData);
        });
    }

    function consume(req, res) {
        // var amqp = require('amqplib/callback_api');
        // var message;

        // amqp.connect('amqp://localhost', function(err, conn) {
        //     conn.createChannel(function(err, ch) {
        //         var q = 'hello';

        //         ch.assertQueue(q, {durable: false});
        //         console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        //         ch.consume(q, function(msg) {
        //             console.log(" [x] Received %s", msg.content.toString());
        //             message = msg.content.toString();
        //             res.json(message);
        //             conn.close();
        //         }, {noAck: true});
        //     });
        // });
    }

    function publish(req, res) {
        // var amqp = require('amqplib/callback_api');

        // amqp.connect('amqp://localhost', function(err, conn) {
        //     conn.createChannel(function(err, ch) {
        //         var q = 'hello';
        //         var msg = 'Hello World!';

        //         ch.assertQueue(q, {durable: false});
        //         // Note: on Node 6 Buffer.from(msg) should be used
        //         ch.sendToQueue(q, new Buffer(msg));
        //         console.log(" [x] Sent %s", msg);
        //     });
        //     //setTimeout(function() { conn.close(); process.exit(0) }, 500);
        // });

        // res.sendStatus(200);
    }

    function stopLab(req, res) {
        req.setTimeout(600000);
        // var imageName = req.body.imageName;
        var labStartTime = req.body.labStartTime;
        var loggedinUser = req.user.username;
        var labInfo = {approach:"Exit", module : req.body.moduleName, username : loggedinUser};
        console.log(labInfo);
        var jsonFile = require('jsonfile');
        var file = './private/services/stop_params.json';
        jsonFile.writeFile(file, labInfo , function(err) {
            if (err) {
                console.log("Error writing to file : " + err);
            }

            // update lab timeRemaining in userDBrisk
            model
                .userModel
                .updateLabTimeRemaining(req.body.moduleName, labStartTime, req.user._id)
                .then(
                    function (newTimeRemaining) {
                        console.log("Lab remaining time updated as : ", newTimeRemaining);
                    },
                    function (err) {
                        console.log("Could not update lab time remaining : ", err);
                    }
                );

            var PythonShell = require('python-shell');

            PythonShell.run('./private/services/aws_stop.py', function (err) {
                if (err) {
                    console.log("Error while stopping VM : "+err);
                    return res.sendStatus(200);
                } else {
                    return res.sendStatus(400);
                }
            });
        });

    }

    function startScriptLab(req, res) {
        req.setTimeout(1000000);
        var imageName = req.body.imageName;
        var moduleName = req.body.moduleName;
        var imageInfo = {
            "username": "ec2-user",
            "key_file": "./private/services/qu.pem",
            "imageName": imageName,
            "commands": [
                // "touch qwerty",
                // "ls"
                "cd /home/jovyan/base/Source",
                "python main.py"
            ]
        };
        var jsonFile = require('jsonfile');
        var file = './private/services/run_script.json';
        jsonFile.writeFile(file, imageInfo , function(err) {
            if (err) {
                console.log("Error writing to file : "+err);
            }

            console.log("Starting script execution");
            var spawn = require('child_process').spawn,
                py = spawn('python', ['./private/services/runScriptAWS.py']),
                dataString = '';

            py.stdout.on('data', function(data){
                console.log(data.toString());
                dataString += data.toString();
            });

            py.stdout.on('end', function(){
                if (dataString) {
                    console.log("Output : "+dataString);
                    return res.json(dataString);
                }
                else {
                    return res.sendStatus(400);
                }
            });
        });
    }

    function startLabWithUserCredentials(req, res, username) {
        req.setTimeout(1000000);
        var imageName = req.body.imageName;
        var moduleName = req.body.moduleName;
        model
            .userModel
            .getAmazonCredentials(username)
            .then(
                function (amazonCredentials) {
                    var spawn = require('child_process').spawn,
                        py = spawn('python', ['./private/services/aws_start.py']),
                        data = {
                            "imageName": imageName,
                            "module": moduleName,
                            "username": req.user.username,
                            "maxUsers": "2",  // get from config.json
                            "version": "latest",  // get from config.json
                            "pemName" : "qu",  // get from DB
                            "pemFilePath": "./private/services/adaptivealgo.pem", // get from DB
                            "accessKeyID": amazonCredentials.accessKeyID,
                            "secretAccessKey": amazonCredentials.secretAccessKey,
                            "amiId" : "ami-c27561bb"  // get from config.json
                        },
                        dataString = '';

                    py.stdout.on('data', function(data){
                        dataString += data.toString();
                    });

                    py.stdout.on('end', function(){
                        console.log(dataString);
                        if (dataString) {
                            // add metering info into userDB
                            model
                                .userModel
                                .updateStartOfLab(req.user._id, imageName)
                                .then(
                                    function (timeRemaining) {
                                        var labParameters = {"ip" : dataString.split("ip: ")[1], timeRemaining : timeRemaining};
                                        res.json(labParameters);
                                    },
                                    function (err) {
                                        console.log(err);
                                    }
                                );
                        }
                        else {
                            return res.sendStatus(400);
                        }
                    });
                    py.stdin.write(JSON.stringify(data));
                    py.stdin.end();
                },
                function (err) {
                    console.log(err);
                }
            );
    }

    function startLab(req, res) {
        req.setTimeout(1000000);
        var useAC = req.body.useAC;
        if (useAC) {
            startLabWithUserCredentials(req, res, req.user.username);
        } else {
            startLabWithUserCredentials(req, res, 'admin');
        }

        // console.log({imageName : imageName, module : moduleName,
        //     username : req.user.username, maxUsers : "2", version : "latest"});
        //
        // var spawn = require('child_process').spawn,
        //     py = spawn('python', ['./private/services/aws_start.py']),
        //     data = {imageName : imageName, module : moduleName,
        //         username : req.user.username, maxUsers : "2", version : "latest"
        //         pemFilePath : "./private/services/qurohan.pem"},
        //     dataString = '';
        //
        // py.stdout.on('data', function(data){
        //     console.log("Printing Output : "+data.toString());
        //     dataString += data.toString();
        // });
        //
        // py.stdout.on('end', function(){
        //     console.log("Here");
        //     if (dataString) {
        //
        //         console.log(dataString);
        //
        //         console.log("dataString : "+dataString);
        //         // add metering info into userDB
        //         model
        //             .userModel
        //             .updateStartOfLab(req.user._id, imageName)
        //             .then(
        //                 function (timeRemaining) {
        //                     var labParameters = {"ip" : dataString.split("ip: ")[1], timeRemaining : timeRemaining};
        //                     res.json(labParameters);
        //                 },
        //                 function (err) {
        //                     console.log(err);
        //                 }
        //             );
        //     }
        //     else {
        //         return res.sendStatus(400);
        //     }
        // });
        // py.stdin.write(JSON.stringify(data));
        // py.stdin.end();
    }

    function getAvailableCourses(req, res) {
        //return res.sendStatus(200);
    }


};