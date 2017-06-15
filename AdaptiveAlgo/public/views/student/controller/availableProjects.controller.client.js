(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("AvailableProjectsController", AvailableProjectsController);

    function AvailableProjectsController($location, UserService, CourseService, $scope, $window, ModalService) {
        var vm = this;
        vm.logout = logout;
        vm.runLab = runLab;
        vm.stopLab = stopLab;

        vm.openModal = openModal;
        vm.closeModal = closeModal;

        function init() {
            vm.isNotebookLoaded = false;
            vm.bodyText = 'This text can be updated in modal 1';
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

        function openModal(id){
            ModalService.Open(id);
        }
 
        function closeModal(id){
            ModalService.Close(id);
        }

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
                        // vm.notebookUrl = 'https://'+labURL.data.replace('\\r\\n','').replace("\"",'').replace("\"",'')+'/user/a/notebooks/Untitled.ipynb';
                        vm.notebookUrl = 'https://'+labURL.data.ip.replace('\\r\\n','').replace("\"",'').replace("\"",'');
                        vm.timeRemaining = labURL.data.timeRemaining;

                        // vm.notebookUrl = 'https://www.google.com/';
                        //console.log(labURL);
                        //console.log(labURL.data.replace('\\r\\n','').replace("\"",'').replace("\"",''));
                        //vm.isNotebookLoaded = true;
                        console.log(vm.notebookUrl);
                        // $window.open(vm.notebookUrl, '_blank');
                        // https://35.166.73.218/user/a/notebooks/Untitled.ipynb
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
