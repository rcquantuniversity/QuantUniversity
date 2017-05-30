(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("InstructorController", InstructorController);

    function InstructorController($location, UserService) {
        var vm = this;
        vm.logout = logout;

        function init() {
            UserService
                .findCurrentUser()
                .then(
                    function (user) {
                        if(user.data.userType != "INSTRUCTOR") {
                            $location.url("/");
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
        }
        init();


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