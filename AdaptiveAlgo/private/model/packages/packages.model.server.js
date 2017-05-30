module.exports = function () {
    var model = {};
    var mongoose = require("mongoose");
    var PackagesSchema = require("./packages.schema.server")();
    var PackagesModel = mongoose.model("NewPackagesModel", PackagesSchema);

    var Q = require("q");

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
                }
            });
        return deferred.promise;
    }

    function addPackage(base, package) {
        var deferred = Q.defer();
        base = "python3.5";
        package = {
                    "name": "SciPy",
                    "command": "pip install SciPy"
        };
        PackagesModel
            .update({"base" : base}, {$push : {packages :package}}, function (err, package) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(package);
                }
            });
        return deferred.promise;
    }

    function setModel(_model) {
        model = _model;


        getAllPackages()
            .then(
                function (package) {
                    console.log(package);
                },
                function (err) {
                    console.log(err);
                }
            );


        // addPackage("","")
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
        //             "command": "pip install numpy"
        //         }
        //     ]
        // };
        // PackagesModel
        //     .create(package1, function (err, user) {
        //         if(err) {
        //             //deferred.reject(err);
        //         } else {
        //             //deferred.resolve(user);
        //         }
        //     });
    }

};
