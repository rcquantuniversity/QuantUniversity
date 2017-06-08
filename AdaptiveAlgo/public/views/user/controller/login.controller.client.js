(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("LoginController", LoginController);

    function LoginController($location, UserService) {
        var vm = this;

        vm.login = login;
        function init() {

        }
        init();
        
        function login(user) {
            UserService
                .login(user)
                .then(
                    function (user) {
                        if(user) {
                            if (user.data.userType === "STUDENT") {
                                $location.url("/user/student");
                            } else if (user.data.userType === "INSTRUCTOR") {
                                $location.url('/user/instructor');
                            }
                        } else {
                            vm.error = "User not found !! Please check your credentials.";
                        }
                    },
                    function (err) {
                        vm.error = "User not found !! Please check your credentials.";
                    }
                );
        }

    }
})();