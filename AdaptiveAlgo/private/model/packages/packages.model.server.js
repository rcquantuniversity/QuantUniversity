module.exports = function () {
    var model = {};
    var mongoose = require("mongoose");
    var PackagesSchema = require("./packages.schema.server")();
    var PackagesModel = mongoose.model("NewPackagesModel", PackagesSchema);

    var Q = require("q");
    var jsonfile = require('jsonfile');

    var api = {
        setModel: setModel,
        addPackage : addPackage,
        getAllPackages : getAllPackages
    };
    return api;

    function getAllPackages() {
        var deferred = Q.defer();
        PackagesModel
            .find({}, function (err, allPackages) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(allPackages);

                    addPackage("", "")
                        .then(
                            function (package) {
                                console.log(package);
                            },
                            function (err) {
                                console.log(err);
                            }
                        );
                }
            });
        return deferred.promise;
    }

    function addPackage(base, package) {
        var deferred = Q.defer();
        base = "python3.5";
        package = {
                    "name": "XYZ",
                    "command": "pip install SciPy",
                    "version" : "1.9"
        };
        PackagesModel
            .findOne({base : base}, function (err, matchingRecords) {
                if (err) {
                    console.log("Unable to search");
                } else {
                    var packageExists = false;
                    for (var a in matchingRecords.packages) {
                        var record = matchingRecords.packages[a];
                        if (record.name == package.name) {
                            packageExists = true;
                        }
                    }
                    if (!packageExists) {
                        PackagesModel
                            .update({"base" : base}, {$push : {packages :package}}, function (err, package) {
                                if (err) {
                                    deferred.reject(err);
                                } else {
                                    deferred.resolve(package);
                                    // Update master file with this newly added package
                                    PackagesModel
                                        .find({}, function (err, allPackages) {
                                           if (err) {
                                               deferred.reject(err);
                                           } else {
                                               console.log(allPackages.length);
                                               var jsonOutput = {"data" : allPackages};
                                               var file = './private/services/masterPackageJSON.json';
                                               jsonfile.writeFile(file, jsonOutput, function (err) {
                                                   console.error(err);
                                               });
                                               deferred.resolve(package);
                                           }
                                        });
                                }
                            });
                    }
                    deferred.resolve();
                }
            });

        return deferred.promise;
    }

    function setModel(_model) {
        model = _model;


        // getAllPackages()
        //     .then(
        //         function (package) {
        //             console.log(package);
        //         },
        //         function (err) {
        //             console.log(err);
        //         }
        //     );

        // var package1 = {
        //     "base": "python3.5",
        //     "packages": [
        //         {
        //             "name": "matplotlib",
        //             "command": "pip install matplotlib"
        //         },
        //         {
        //             "name": "numpy",
        //             "command": "pip install numpy",
        //             "version" : "1.2"
        //         }
        //     ]
        // };

        var file = './private/services/masterPackageJSON.json';
        jsonfile.readFile(file, function(err, packageObject) {
            PackagesModel
                .remove(function (err, status) {
                    if (err) {
                        console.log("error dropping table")
                    } else {
                        for (var recordIndex in packageObject.data) {
                            var record = packageObject.data[recordIndex];
                            PackagesModel
                                .create(record, function (err, records) {
                                    if (err) {
                                        console.log("Error");
                                    }
                                });
                        }
                    }
                    });
        });
    }
};
