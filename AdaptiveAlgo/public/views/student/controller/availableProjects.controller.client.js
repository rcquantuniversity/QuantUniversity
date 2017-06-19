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
        vm.openTimeModal = openTimeModal;
        vm.closeModal = closeModal;
        vm.inspectDockerImage = inspectDockerImage;

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

        function inspectDockerImage(imageName) {
            CourseService
                .inspectDockerImage(imageName)
                .then(
                    function (data) {
                        vm.imageDetails = data;
                        console.log(data);
                    },
                    function (err) {
                        console.log("Error : "+ err)
                    }
                );
        }

        function openModal(id){
            ModalService.Open(id);

            $('#hm_timer').countdowntimer({
                hours : vm.hours,
                minutes : vm.minutes,
                seconds : vm.seconds,
                size : "lg",
                timeUp : timeIsUp,
                beforeExpiryTime : "00:01:55:00",
                beforeExpiryTimeFunction :  beforeExpiryFunc,
                pauseButton : "pauseBtnhms"          
            });            
        }

        function openTimeModal(id){
            ModalService.Open(id); 

            $('#doNotAddTime, #closeTimeModal').on('click', function() {
                $('#pauseBtnhms').trigger('click');
                vm.closeModal('timeModal');
            });       
        }

        function timeIsUp() {
            if($('#hm_timer').text() == "00:00:00") {
                $(this).text("Stopped");
            }
        }

        function beforeExpiryFunc() {
            //Code to be executed before the timer expires (before 01:05).
            vm.openTimeModal('timeModal');
            $('#hm_timer').addClass('red');
            $('#pauseBtnhms').trigger('click');
        }
        function closeModal(id){
            ModalService.Close(id);
        }

        function stopLab(imageName) {
            CourseService
                .stopLab(imageName, vm.labStartTime)
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
                        vm.notebookUrl = 'http://'+labURL.data.ip.replace('\\r\\n','').replace("\"",'').replace("\"",'');
                        vm.timeRemaining = labURL.data.timeRemaining;
                        vm.hours = Math.floor(vm.timeRemaining / (60*60));
                        vm.minutes = Math.floor(vm.timeRemaining / 60) - vm.hours * 60;
                        vm.seconds = Math.floor(vm.timeRemaining) - vm.hours * 3600 - vm.minutes * 60;
                        vm.openModal('startModal');

                        // vm.notebookUrl = 'https://www.google.com/';
                        //console.log(labURL);
                        //console.log(labURL.data.replace('\\r\\n','').replace("\"",'').replace("\"",''));
                        //vm.isNotebookLoaded = true;
                        console.log(vm.notebookUrl);
                        console.log(vm.timeRemaining);
                        vm.labStartTime = Date.now() / 1000;
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
