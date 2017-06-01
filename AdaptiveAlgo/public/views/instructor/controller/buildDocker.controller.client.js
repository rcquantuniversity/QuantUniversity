(function () {
    angular
    .module("AdaptiveAlgoApp")
    .controller("BuildDockerController", function($scope, $http, UserService) {
        // $http.get("masterPackageJSON.json").then(function(response) {
        //     $scope.myData = response.data.data;
        // });

        var vm = this;
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
    });
})();