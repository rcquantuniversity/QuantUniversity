(function () {
    angular
    .module("AdaptiveAlgoApp")
    .controller("BuildDockerController", function($scope, $http, UserService) {
        // $http.get("masterPackageJSON.json").then(function(response) {
        //     $scope.myData = response.data.data;
        // });

        var vm = this;

        vm.createOutputJSON = createOutputJSON;

        function init() {
            UserService
                .getAllPackages()
                .then(
                    function (allPackages) {
                        vm.myData = allPackages.data;
                    },
                    function (err) {
                        vm.error = err;
                    }
                );
        }
        init();

        function createOutputJSON(packageList) {
            // packageList = {"name" : "python123456", "package" : "rohan"};
            packageList = {"data":[{"_id":"592de4fc87aa4829f0fcca1b","__v":0,"packages":[{"name":"matplotlib","command":"pip install matplotlib","_id":"592de4fc87aa4829f0fcca1d","version":"latest"},{"name":"numpy","command":"pip install numpy","_id":"592de4fc87aa4829f0fcca1c","version":"latest"}],"base":"python2.7"},{"_id":"592de4fc87aa4829f0fcca1e","__v":0,"packages":[{"name":"matplotlib","command":"pip install matplotlib","_id":"592de4fc87aa4829f0fcca20","version":"latest"},{"name":"numpy","command":"pip install numpy","_id":"592de4fc87aa4829f0fcca1f","version":"latest"},{"_id":"592de54287aa4829f0fcca24","command":"pip install SciPy","name":"SciPy","version":"1.9"}],"base":"python3.5"},{"_id":"592de4fc87aa4829f0fcca21","__v":0,"packages":[{"name":"matplotlib","command":"pip install matplotlib","_id":"592de4fc87aa4829f0fcca23","version":"latest"},{"name":"numpy","command":"pip install numpy","_id":"592de4fc87aa4829f0fcca22","version":"latest"}],"base":"R"}]};

            UserService
                .createOutputJSON(packageList)
                .then(
                    function () {
                        vm.message = "JSON created successfully! Creating Docker Image";
                        UserService
                            .createDockerImage()
                            .then(
                                function (status) {
                                    vm.message = "Docker Image created succesfully!";
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


    });
})();