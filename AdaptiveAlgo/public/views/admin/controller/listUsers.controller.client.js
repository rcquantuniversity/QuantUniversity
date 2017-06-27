(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("ListUsersController", ListUsersController);

    function ListUsersController(CourseService, UserService, ModalService) {
        var vm = this;

        function init() {
            UserService
                .listAllUsers()
                .then(
                    function (users) {
                        vm.users = users;
                    },
                    function (err) {
                        vm.error = "Could not load users "+ err;
                    }
                );

        }
        init();
    }

})();
