(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("StudentController", StudentController);

    function StudentController($location, UserService, CourseService) {
        var vm = this;
        vm.logout = logout;
        vm.showAvailableCourses = showAvailableCourses;
        vm.showAllProjects = showAllProjects;

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

        function showAvailableCourses() {
            CourseService
                .showAvailableCourses()
                .then(
                    function () {
                        $location.url("/student/availableCourses");
                    },
                    function (err) {
                        vm.error = "Could not load available courses. Please try again";
                    }
                );
        }

        function showAllProjects() {
            $location.url("/student/availableProjects");
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

