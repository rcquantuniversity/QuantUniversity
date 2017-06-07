(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("AvailableProjectsController", AvailableProjectsController);

    function AvailableProjectsController($location, UserService, CourseService, $scope, $window) {
        var vm = this;
        vm.logout = logout;
        vm.runLab = runLab;
        vm.stopLab = stopLab;

        function init() {
            vm.isNotebookLoaded = false;
            UserService
                .listAllImagesForStudent()
                .then(
                    function (images) {
                        vm.images = images;
                        console.log(images);
                    },
                    function (err) {
                        vm.error = "Could not load images "+ err;
                    }
                );
        }
        init();

        function stopLab(imageName) {
            CourseService
                .stopLab(imageName)
                .then(
                    function (status) {
                        console.log(status);
                    },
                    function (err) {
                        console.log("Error : "+err);
                    }
                );
        }

        function runLab(imageName) {
            CourseService
                .startLab(imageName)
                .then(
                    function (labURL) {
                        vm.notebookUrl = 'https://'+labURL.data.replace('\\r\\n','').replace("\"",'').replace("\"",'')+'/';
                        console.log(labURL);
                        console.log(labURL.data.replace('\\r\\n','').replace("\"",'').replace("\"",''));
                        //vm.isNotebookLoaded = true;
                        console.log(vm.notebookUrl);
                        $window.open(vm.notebookUrl, '_blank');
                        $("#frame").attr("src", vm.notebookUrl);
                    },
                    function (err) {
                        console.log("Error : "+err);
                    }
                );
        }

        function logout() {
            UserService
                .logout()
                .then(
                    function () {
                        $location.url("/login");
                    }
                );
        }

    }
})();
