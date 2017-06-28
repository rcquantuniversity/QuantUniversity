module.exports = function () {
    var model = {};
    var mongoose = require("mongoose");
    // var MLModelSchema = mongoose.Schema;
    // var MLModel = mongoose.model("MachineLearningModel", MLModelSchema);
    var bcrypt = require("bcrypt-nodejs");

    var Q = require("q");

    var api = {
        setModel: setModel,
        storeZipInDB : storeZipInDB,
        retrieveZipFile : retrieveZipFile
    };
    return api;

    function retrieveZipFile() {
        var conn = mongoose.connection;
        var fs = require('fs');
        var Grid = require('gridfs-stream');
        Grid.mongo = mongoose.mongo;
        var gfs = Grid(conn.db);

        conn.once('open', function () {
            console.log('open');
            var gfs = Grid(conn.db);

            //write content to file system
            var fs_write_stream = fs.createWriteStream('./private/services/abc.zip');

            //read from mongodb
            var readstream = gfs.createReadStream({
                filename: "zipfile.zip"
            });
            readstream.pipe(fs_write_stream);
            fs_write_stream.on('close', function () {
                console.log('file has been written fully!');
            });
            // fs_write_stream.close();

        });


    }

    function storeZipInDB() {
        var conn = mongoose.connection;
        var fs = require('fs');
        var Grid = require('gridfs-stream');
        Grid.mongo = mongoose.mongo;

        conn.once('open', function () {
            console.log('open');
            var gfs = Grid(conn.db);

            // streaming to gridfs
            //filename to store in mongodb
            var writestream = gfs.createWriteStream({
                filename: 'zipfile.zip'
            });
            fs.createReadStream('./private/services/zipTesting.zip').pipe(writestream);

            writestream.on('close', function (file) {
                // do something with `file`
                console.log(file.filename + 'Written To DB');
            });
        });

    }

    function setModel(_model) {
        model = _model;
        console.log("Storing file in mongodb");
        // storeZipInDB();
        // retrieveZipFile();
    }

};