(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("AvailableProjectsController", AvailableProjectsController);

    function AvailableProjectsController($location, UserService, CourseService, $scope, $window, ModalService, spinnerService, $compile) {
        var vm = this;
        vm.logout = logout;
        vm.runLab = runLab;
        vm.stopLab = stopLab;
        vm.runScriptLab = runScriptLab;
        vm.runLabNow = runLabNow;
        vm.runRStudio = runRStudio;
        vm.openTerminal = openTerminal;

        vm.openModal = openModal;
        vm.openTimeModal = openTimeModal;
        vm.closeModal = closeModal;
        vm.viewDockerFile = viewDockerFile;

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

        function openTerminal(imageName, indexNo, moduleName) {
            CourseService
                .openTerminal(imageName, moduleName)
                .then(
                    function (url) {
                        console.log(url);
                        console.log("http://"+url.data.ip+":"+url.data.port);
                        vm.openModal('openTerminal');
                        $("#frameTerminal").attr("src", "http://"+url.data.ip+":"+url.data.port);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
        }

        function runRStudio() {
            CourseService
                .runRStudio()
                .then(
                    function (data) {
                        console.log(data);
                        vm.openModal('startModal');
                        $("#frame").attr("src", 'http://'+data.data.ip.replace('\\r\\n','').replace("\"",'').replace("\"",''));
                    },
                    function (err) {
                        console.log(err);
                    }
                );
        }


        function runLabNow() {
            // vm.openModal('startModal');
            // $("#frame").attr("src", "http://localhost:8787");

            console.log(vm.notebookUrl);
            console.log(vm.timeRemaining);
            vm.labStartTime = Date.now() / 1000;
            vm.openModal('startModal');
            // $window.open(vm.notebookUrl, '_blank');
            // https://35.166.73.218/user/a/notebooks/Untitled.ipynb
            $("#frame").attr("src", vm.notebookUrl);
        }

        function runScriptLab(imageName, indexNo, moduleName) {
            CourseService
                .runScriptLab(imageName, moduleName)
                .then(
                    function (data) {
                        vm.scriptOutput = data;
                        vm.message = "Scripts ran successfully";
                    },
                    function (err) {
                        console.log("Error : "+err);
                    }
            );
        }

        function viewDockerFile(imageName) {
            CourseService
                .viewDockerFile(imageName)
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
            if (!vm.isLabStopped) {
                stopLab(vm.moduleName);
            }
        }

        function stopLab(moduleName) {

            // what if multiple labs are started
            vm.isLabStopped = true;

            // $('#ntb_'+indexNo).replaceWith($('#ntb_'+indexNo));
            // $('#ntb_'+indexNo).text('Run Notebook');
            // // change ng-click
            // $('#ntb_'+indexNo).attr('ng-click','model.runLab(image.imageName, $index+1)');
            // // compile the element
            // $compile($('#ntb_'+indexNo))($scope);

            CourseService
                .stopLab(moduleName, vm.labStartTime)
                .then(
                    function (status) {
                        console.log(status);
                    },
                    function (err) {
                        console.log("Error : "+err);
                    }
                );
        }

        function runLab(imageName, indexNo, moduleName) {

            // what if user clicks multiplt start labs
            vm.moduleName = moduleName;
            // spinnerService.show('booksSpinner');
            $('#ntb_'+indexNo).text('Starting...');
            $('#ntb_'+indexNo).attr('disabled', 'true');


            // $('#ntb_'+indexNo).removeAttr('disabled');

            // $('#ntb_'+indexNo).hide();
            // var tempBtn = '<a class="btn btn-primary btn-rounded btn-bordred" ng-click="model.runLabNow()">Run Now</a>';


            // e.currentTarget.text = "Starting...";
            // vm.disabled = true;
            // vm.openModal('startModal');
            // $("#frame").attr("src", "http://localhost:8787");
            CourseService
                .startLab(imageName, moduleName)
                .then(
                    function (labURL) {

                        $('#ntb_'+indexNo).removeAttr('disabled');
                        $('#ntb_'+indexNo).text('Run Now');
                        // $('#ntb_'+indexNo).hide();
                        // $('#ntb_'+indexNo).after('<a class="btn btn-primary btn-rounded btn-bordred" ng-click="model.runLabNow()">Run Now</a>');
                        // $('#ntb_'+indexNo).text('Run Now');

                        // e.currentTarget.text = "Started";
                        // vm.disabled = false;
                        // spinnerService.hide('booksSpinner');
                        // vm.notebookUrl = 'https://'+labURL.data.replace('\\r\\n','').replace("\"",'').replace("\"",'')+'/user/a/notebooks/Untitled.ipynb';
                        vm.notebookUrl = 'http://'+labURL.data.ip.replace('\\r\\n','').replace("\"",'').replace("\"",'');
                        vm.timeRemaining = labURL.data.timeRemaining;
                        vm.hours = Math.floor(vm.timeRemaining / (60*60));
                        vm.minutes = Math.floor(vm.timeRemaining / 60) - vm.hours * 60;
                        vm.seconds = Math.floor(vm.timeRemaining) - vm.hours * 3600 - vm.minutes * 60;
                        $('#ntb_'+indexNo).replaceWith($('#ntb_'+indexNo));
                        // change ng-click
                        $('#ntb_'+indexNo).attr('ng-click','model.runLabNow()');
                        // compile the element
                        $compile($('#ntb_'+indexNo))($scope);

                        // vm.openModal('startModal', "module1");

                        // vm.notebookUrl = 'https://www.google.com/';
                        //console.log(labURL);
                        //console.log(labURL.data.replace('\\r\\n','').replace("\"",'').replace("\"",''));
                        //vm.isNotebookLoaded = true;
                        // console.log(vm.notebookUrl);
                        // console.log(vm.timeRemaining);
                        // vm.labStartTime = Date.now() / 1000;
                        // // $window.open(vm.notebookUrl, '_blank');
                        // // https://35.166.73.218/user/a/notebooks/Untitled.ipynb
                        // $("#frame").attr("src", vm.notebookUrl);
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
