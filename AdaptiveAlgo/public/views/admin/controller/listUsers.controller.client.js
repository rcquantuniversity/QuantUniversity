(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("ListUsersController", ListUsersController);

    function ListUsersController(UserService, ModalService, $filter, $timeout, $window) {
        var vm = this;

        vm.openModal = openModal;
        vm.closeModal = closeModal;
        vm.updateUserDetails = updateUserDetails;

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

        function openModal(id, credits, expiryDate, userId){
            ModalService.Open(id);
            vm.userId = userId;
            vm.credits = credits;
            vm.expiryDate = expiryDate;
            vm.formatDate = $filter('date')(vm.expiryDate);
            vm.newDate = new Date(vm.formatDate);
        }

        function closeModal(id){
            ModalService.Close(id);
        }

        function updateUserDetails(credits, expiryDate, userId) {
            UserService
                .updateUserDetails(credits, expiryDate, userId)
                .then(
                    function (data) {
                        vm.success = "Updated Successfully";
                        $timeout(function () {
                            $window.location.reload();
                        }, 1500);
                    },
                    function (err) {
                        vm.error = "Could not update User Details. Please try again";
                    }
                );

        }
    }

})();
