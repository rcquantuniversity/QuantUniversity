(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("ListUsersController", ListUsersController);

    function ListUsersController(UserService, ModalService, $filter, $timeout, $window, $http) {
        var vm = this;

        vm.openModal = openModal;
        vm.closeModal = closeModal;
        vm.updateUserDetails = updateUserDetails;
        vm.sendmail = sendmail;

        function init() {
            UserService
                .findCurrentUser()
                .then(
                    function (user) {
                        if(user.data.userType != "ADMIN") {
                            $location.url("/");
                        } else {
                            vm.currentEmail = user.data.email;
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
                    },
                    function (err) {
                        console.log(err);
                    }
                );            

        }
        init();

        function openModal(id, credits, expiryDate, userId, email){
            ModalService.Open(id);
            vm.userId = userId;
            vm.email = email;
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
                        }, 2000);
                    },
                    function (err) {
                        vm.error = "Could not update User Details. Please try again";
                    }
                );

        }

        function sendmail(email, credits, expiryDate, currentEmail) {
            var formatDate = $filter('date')(expiryDate, 'longDate');
            var dataToPost = {to: email, message: 'Hey, your credits have been updated to '+credits+' hours. And, the expiry date for the credits is '+formatDate};
            console.log(dataToPost);
            sendmailToAdmin(currentEmail, email);
            /* PostData*/
            $http({
                url: "/send", 
                method: "GET",
                params: {to: dataToPost.to, message: dataToPost.message}
            }).success(function(serverResponse) {
                console.log(serverResponse);
            }).error(function(serverResponse) {
                console.log(serverResponse);
            });
        }

        function sendmailToAdmin(currentEmail, email) {
            var dataToPost = {to: currentEmail, message: 'Hey, the details have been updated for the user with emailID - '+email};
            console.log(dataToPost);
            /* PostData*/
            $http({
                url: "/sendToAdmin", 
                method: "GET",
                params: {to: dataToPost.to, message: dataToPost.message}
            }).success(function(serverResponse) {
                console.log(serverResponse);
            }).error(function(serverResponse) {
                console.log(serverResponse);
            });
        }
    }

})();
