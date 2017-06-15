module.exports = function (app, model) {

    app.get("/api/getAvailableCourses", getAvailableCourses);
    app.post("/api/startLab", startLab);
    app.post("/api/stopLab", stopLab);
    app.get("/api/publish", publish);
    app.get("/api/consume", consume);

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
        var loggedinUser = req.user.id;
        var labInfo = {imageName : imageName, userid : loggedinUser};
        var jsonFile = require('jsonfile');
        var file = './private/services/temp/stopLabInfo.json';
        jsonFile.writeFile(file, labInfo , function(err) {
            if (err) {
                console.log("Error writing to file : " + err);
            }

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


    function startLab(req, res) {
        req.setTimeout(600000);
        var imageName = req.body.imageName;
        var moduleName = "Risk Analysis4";
        var imageInfo = {imageName : imageName, module : moduleName, username : req.user.username};
        var jsonFile = require('jsonfile');
        var file = './private/services/start_params.json';
        jsonFile.writeFile(file, imageInfo , function(err) {
            if (err) {
                console.log("Error writing to file : "+err);
            }
            // // Option 1
            var spawn = require('child_process').spawn,
                py = spawn('python', ['./private/services/aws_start.py']),
                data = [1,2,3,4,5,6,7,8,9,10],
                dataString = '';

            py.stdout.on('data', function(data){
                console.log(data.toString());
                if (data) {
                    res.json(data.toString().split("ip: ")[1]);
                }
                else {
                    return res.sendStatus(400);
                }
                // dataString += data.toString();
            });
            py.stdin.write(JSON.stringify(data));
            py.stdin.end();


            // // Option 2
            // var PythonShell = require('python-shell');

            // PythonShell.run('C:\\Users\\QuantUniversity-6\\Rohan\\AdaptiveAlgo\\private\\services\\boto-test_modified.py', function (err) {
            //     if (err) throw err;
            //     console.log('finished');
            // });

        });

    }

    function getAvailableCourses(req, res) {
        //return res.sendStatus(200);
    }


};