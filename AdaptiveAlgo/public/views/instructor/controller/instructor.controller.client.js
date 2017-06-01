(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("InstructorController", InstructorController);

    function InstructorController($location, UserService) {
        var vm = this;
        vm.logout = logout;
        vm.createOutputJSON = createOutputJSON;

        function init() {
            UserService
                .findCurrentUser()
                .then(
                    function (user) {
                        if(user.data.userType != "INSTRUCTOR") {
                            $location.url("/");
                        } else {
                            UserService
                                .getAllPackages()
                                .then(
                                    function (allPackages) {
                                        vm.allPackages = allPackages;
                                        console.log(vm.allPackages);
                                    },
                                    function (err) {
                                        console.log("Error : " + err);
                                    }
                                );
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
        }
        init();
        
        // function createOutputJSON(packageList) {
        //     packageList = {"name" : "python123456", "package" : "rohan"};
        //     UserService
        //         .createOutputJSON(packageList)
        //         .then(
        //             function () {
        //                 vm.message = "JSON created successfully!";
        //             },
        //             function () {
        //                 vm.error = "Could not create JSON. Try again.";
        //             }
        //         );
        // }


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