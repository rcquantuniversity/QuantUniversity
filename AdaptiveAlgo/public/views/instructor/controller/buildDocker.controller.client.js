(function () {
    angular
    .module("AdaptiveAlgoApp")
    .controller("BuildDockerController", function($scope, $http) {
        $http.get("masterPackageJSON.json").then(function(response) {
            $scope.myData = response.data.data;
        });
    });
})();