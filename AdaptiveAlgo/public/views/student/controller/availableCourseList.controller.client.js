(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("AvailableCoursesController", AvailableCoursesController);

    function AvailableCoursesController($location, UserService, CourseService) {
        var vm = this;
        vm.logout = logout;
        vm.startLab = startLab;
        vm.stopLab = stopLab;
        vm.publish = publish;
        vm.consume = consume;

        function init() {
            UserService
                .findCurrentUser()
                .then(
                    function (user) {
                        if(user.data.userType != "STUDENT") {
                            $location.url("/");
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
        }
        init();

        function publish() {
            CourseService
                .publish()
                .then(
                    function () {
                        vm.message2 = "Published URL";
                    },
                    function (err) {
                        vm.err = "Could not start Lab. Please try again";
                    }
                );
        }

        function consume() {
            CourseService
                .consume()
                .then(
                    function (url) {
                        console.log(url);
                        vm.message3 = url;
                    },
                    function (err) {
                        vm.err = "Could not start Lab. Please try again";
                    }
                );
        }


        function startLab() {
            CourseService
                .startLab()
                .then(
                    function () {
                        vm.message = "Lab Started !!";
                    },
                    function (err) {
                        vm.err = "Could not start Lab. Please try again";
                    }
                );
        }

        function stopLab() {
            CourseService
                .stopLab()
                .then(
                    function () {
                        vm.message = "Lab Stopped !!";
                    },
                    function (err) {
                        vm.err = "Could not stop Lab. Please try again";
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
