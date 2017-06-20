module.exports = function (app, model) {

    app.get("/api/getAvailableCourses", getAvailableCourses);
    app.post("/api/startLab", startLab);
    app.post("/api/stopLab", stopLab);
    app.get("/api/publish", publish);
    app.get("/api/consume", consume);
    app.get("/api/viewDockerFile/:imageName", viewDockerFile);
    app.post("/api/startScriptLab", startScriptLab);


    var dockerCLI = require('docker-cli-js');
    var DockerOptions = dockerCLI.Options;
    var Docker = dockerCLI.Docker;
    var docker = new Docker();

    function viewDockerFile(req, res) {
        var imageName = req.params.imageName;
        var fs = require('fs');
        fs.readFile('/etc/passwd', function(err, data) {
            if (err) throw err;
        console.log(data);
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
        var imageName = req.body.imageName;
        var labStartTime = req.body.labStartTime;
        var loggedinUser = req.user.username;
        var labInfo = {approach:"Exit", module : "asdfghj", username : loggedinUser};
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
                .updateLabTimeRemaining(imageName, labStartTime, req.user._id)
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
        req.setTimeout(600000);
        var imageName = req.body.imageName;
        var moduleName = "asdfghj";
        var imageInfo = {
            "username": "ec2-user",
            "key_file": "C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\adaptivealgo.pem",
            "imageName": "ubuntu:16.04",
            "commands": [
                "touch jeff",
                "ls"
            ]
        };
        var jsonFile = require('jsonfile');
        var file = './private/services/run_script.json';
        jsonFile.writeFile(file, imageInfo , function(err) {
            if (err) {
                console.log("Error writing to file : "+err);
            }

            var spawn = require('child_process').spawn,
                py = spawn('python', ['./private/services/runScriptAWS.py']),
                dataString = '';

            console.log("running script");

            py.stdout.on('data', function(data){
                console.log(data.toString());
                dataString += data.toString();
            });

            py.stdout.on('end', function(){
                if (dataString) {
                    console.log("Output : "+dataString);
                    return res.sendStatus(200);
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
        var moduleName = "asdfghj";
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