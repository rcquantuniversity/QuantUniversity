(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("ListImagesController", ListImagesController);

    function ListImagesController(UserService) {
        var vm = this;
        vm.uploadToDockerHub = uploadToDockerHub;

        function init() {
            UserService
                .listAllImages()
                .then(
                    function (images) {
                        vm.images = images;
                    },
                    function (err) {
                        vm.error = "Could not load images "+ err;
                    }
                );

        }
        init();

        function uploadToDockerHub(imageName) {
            console.log(imageName);
            UserService
                .uploadToDockerHub(imageName)
                .then(
                    function (status) {
                        vm.message = "Docker Image Uploaded succesfully!";
                    },
                    function (err) {
                        vm.error = "Could not upload Docker image. " + err;
                    }
                );
        }
    }

})();
