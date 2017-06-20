(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("ProfileController", ProfileController);

    function ProfileController(UserService) {
        var vm = this;

        vm.updateKeys = updateKeys;
        function init() {

        }

        init();

        function updateKeys(accessKeyID, secretAccessKey) {

            UserService
                .updateAmazonCredentials(accessKeyID, secretAccessKey)
                .then(
                    function (data) {
                        console.log("Updated Successfully");
                    },
                    function (err) {
                        vm.error = "Could not update Amazon Credentials. Please try again";
                    }
                );

        }
    }
})();