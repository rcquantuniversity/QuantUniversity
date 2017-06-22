module.exports = function (app, model) {

    app.get("/api/getAvailableCourses", getAvailableCourses);
    app.post("/api/startLab", startLab);
    app.post("/api/stopLab", stopLab);
    app.get("/api/publish", publish);
    app.get("/api/consume", consume);
    app.get("/api/viewDockerImage/:imageName", viewDockerImage);
    app.post("/api/startScriptLab", startScriptLab);
    app.post("/api/runRStudio", runRStudio);


    var dockerCLI = require('docker-cli-js');
    var DockerOptions = dockerCLI.Options;
    var Docker = dockerCLI.Docker;
    var docker = new Docker();

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
                    console.log('finished');
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
        console.log(moduleName);
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

    function startLab(req, res) {
        req.setTimeout(600000);
        var imageName = req.body.imageName;
        var moduleName = req.body.moduleName;
        var imageInfo = {imageName : imageName, module : moduleName,
            username : req.user.username, maxUsers : "2", version : "latest"};
        var jsonFile = require('jsonfile');
        var file = './private/services/start_params.json';
        jsonFile.writeFile(file, imageInfo , function(err) {
            if (err) {
                console.log("Error writing to file : "+err);
            }
            // // Option 1
            var spawn = require('child_process').spawn,
                py = spawn('python', ['./private/services/aws_start.py']),
            dataString = '';

            py.stdout.on('data', function(data){
                console.log(data.toString());
                dataString += data.toString();
            });

            py.stdout.on('end', function(){
                if (dataString) {

                    console.log("dataString : "+dataString);
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
            // py.stdin.write(JSON.stringify(data));
            // py.stdin.end();


            // // Option 2
            // var PythonShell = require('python-shell');
            // console.log("Here");
            // PythonShell.run('./private/services/aws_start.py', function (err, data) {
            //     // console.log(data.toString());
            //     if (data) {
            //
            //         // add metering info into userDB
            //         model
            //             .userModel
            //             .updateStartOfLab(req.user._id, imageName)
            //             .then(
            //                 function (timeRemaining) {
            //                     var labParameters = {"ip" : data.toString().split("ip: ")[1], timeRemaining : timeRemaining};
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
            //     // if (err) throw err;
            //     // console.log('finished');
            // });

        });

    }

    function getAvailableCourses(req, res) {
        //return res.sendStatus(200);
    }


};