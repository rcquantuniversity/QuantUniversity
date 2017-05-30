(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("RegisterController", RegisterController);

    function RegisterController($location, UserService, $http) {
        var vm = this;
        vm.registerUser = registerUser;

        function init() {

            // UserService
            //     .callToJupyterNotebook()
            //     .then(
            //         function (data) {
            //             console.log(data);
            //         },
            //         function (err) {
            //             console.log(err);
            //         }
            //     );

            // $http.post("http://ec2-52-26-246-88.us-west-2.compute.amazonaws.com:8000/user/999/tree")
            //     .then(
            //         function (response) {
            //             console.log(response);
            //         },
            //         function (err) {
            //             console.log("error - ", err);
            //         }
            //     );

        }
        init();

        function registerUser(user) {
            UserService
                .registerUser(user)
                .then(
                    function () {
                        $location.url("/login");
                    },
                    function () {
                        vm.error = "Could not register. Please try again";
                    }
                );
        }

    }
})();