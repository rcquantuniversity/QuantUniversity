(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("LoginController", LoginController);

    function LoginController($location, UserService, $http) {
        var vm = this;

        vm.login = login;
        function init() {

            //testing
            var credential = {"username" : "jdoe", "password" : "jdoe"};
            $http.post('http://localhost:3000/authenticate',credential)
                .then(
                    function (data) {
                        console.log(data);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
        }
        init();
        
        function login(user) {
            UserService
                .login(user)
                .then(
                    function (user) {
                        if(user) {
                            if (user.data.userType === "STUDENT") {
                                $location.url("/student/availableProjects");
                            } else if (user.data.userType === "INSTRUCTOR") {
                                $location.url('/instructor/listImages');
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