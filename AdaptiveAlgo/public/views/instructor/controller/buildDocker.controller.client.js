(function () {
    angular
    .module("AdaptiveAlgoApp")
    .controller("BuildDockerController", function($scope, $http, UserService, $location) {
        // $http.get("masterPackageJSON.json").then(function(response) {
        //     $scope.myData = response.data.data;
        // });

        var vm = this;

        vm.createDockerImage = createDockerImage;
        vm.uploadToDockerHub = uploadToDockerHub;
        vm.showAllImages = showAllImages;

        function init() {
            UserService
                .getAllPackages()
                .then(
                    function (allPackages) {
                        vm.myData = allPackages.data;
                        for(var i in vm.myData) {
                            // console.log(vm.myData[i].base);
                            if(vm.myData[i].base == "python2.7") {
                                vm.py27 = vm.myData[i].packages;
                            } else if (vm.myData[i].base == "python3.5") {
                                vm.py35 = vm.myData[i].packages;
                            } else if (vm.myData[i].base == "R") {
                                vm.r = vm.myData[i].packages;
                            }
                        }                        
                        // vm.py27 = vm.myData.packages;
                    },
                    function (err) {
                        vm.error = err;
                    }
                );
        }
        init();

        function createDockerImage(folder1, folder2, folder3, imageName) {
            // packageList = {"name" : "python123456", "package" : "rohan"};
            // packageList = {"data":[{"_id":"592de4fc87aa4829f0fcca1b","__v":0,"packages":[{"name":"matplotlib","command":"pip install matplotlib","_id":"592de4fc87aa4829f0fcca1d","version":"latest"},{"name":"numpy","command":"pip install numpy","_id":"592de4fc87aa4829f0fcca1c","version":"latest"}],"base":"python2.7"},{"_id":"592de4fc87aa4829f0fcca1e","__v":0,"packages":[{"name":"matplotlib","command":"pip install matplotlib","_id":"592de4fc87aa4829f0fcca20","version":"latest"},{"name":"numpy","command":"pip install numpy","_id":"592de4fc87aa4829f0fcca1f","version":"latest"},{"_id":"592de54287aa4829f0fcca24","command":"pip install SciPy","name":"SciPy","version":"1.9"}],"base":"python3.5"},{"_id":"592de4fc87aa4829f0fcca21","__v":0,"packages":[{"name":"matplotlib","command":"pip install matplotlib","_id":"592de4fc87aa4829f0fcca23","version":"latest"},{"name":"numpy","command":"pip install numpy","_id":"592de4fc87aa4829f0fcca22","version":"latest"}],"base":"R"}]};

            vm.python27Packages = [];
            vm.python35Packages = [];
            vm.rPackages = [];

            angular.forEach(folder1, function(key, value) {
                if(key) {
                    vm.python27Packages.push(value);
                }
            });

            angular.forEach(folder2, function(key, value) {
                if(key) {
                    vm.python35Packages.push(value);
                }
            });

            angular.forEach(folder3, function(key, value) {
                if(key) {
                    vm.rPackages.push(value);
                }
            });

            var allPackageArray = [];
            var packageArray = [];

            // python 2.7
            for (var i in vm.python27Packages) {
                var package = vm.python27Packages[i];
                var packageDetails = vm.py27.filter(function (item) {
                    return item.name === package;
                });
                packageArray.push(packageDetails[0]);
            }
            var packageJson = {"packages": packageArray,"base":"python2.7"};
            allPackageArray.push(packageJson);


            packageArray = [];
            // python 3.5
            for (var i in vm.python35Packages) {
                var package = vm.python35Packages[i];
                var packageDetails = vm.py35.filter(function (item) {
                    return item.name === package;
                });
                packageArray.push(packageDetails[0]);
            }
            packageJson = {"packages": packageArray,"base":"python3.5"};
            allPackageArray.push(packageJson);


            packageArray = [];
            // R
            for (var i in vm.rPackages) {
                var package = vm.rPackages[i];
                var packageDetails = vm.r.filter(function (item) {
                    return item.name === package;
                });
                packageArray.push(packageDetails[0]);
            }
            packageJson = {"packages": packageArray,"base":"R"};
            allPackageArray.push(packageJson);

            UserService
                .createOutputJSON(allPackageArray, imageName)
                .then(
                    function (imageName) {
                        vm.uniqueImageName = imageName;
                        vm.message = "JSON created successfully! Creating Docker Image";
                        UserService
                            .createDockerImage()
                            .then(
                                function (status) {
                                    vm.message = "Docker Image created successfully!";
                                    $location.url("/instructor/listImages");
                                },
                                function (err) {
                                    vm.error = "Could not create Docker image. " + err;
                                }
                            );
                    },
                    function () {
                        vm.error = "Could not create JSON. Try again.";
                    }
                );
        }

        function uploadToDockerHub() {
            UserService
                .uploadToDockerHub(vm.uniqueImageName)
                .then(
                    function (status) {
                        vm.message = "Docker Image Uploaded succesfully!";
                    },
                    function (err) {
                        vm.error = "Could not upload Docker image. " + err;
                    }
                );
        }

        function showAllImages() {
            $location.url("/instructor/listImages");
        }


    });
})();