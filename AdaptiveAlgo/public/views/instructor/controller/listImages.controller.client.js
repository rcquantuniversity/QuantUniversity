(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("ListImagesController", ListImagesController);

    function ListImagesController(CourseService, UserService, ModalService) {
        var vm = this;
        vm.uploadToDockerHub = uploadToDockerHub;

        vm.openModal = openModal;
        vm.closeModal = closeModal;
        vm.inspectDockerImage = inspectDockerImage;

        function init() {
            UserService
                .listAllImages()
                .then(
                    function (images) {
                        console.log(images);
                        vm.images = images;
                    },
                    function (err) {
                        vm.error = "Could not load images "+ err;
                    }
                );

        }
        init();

        function inspectDockerImage(imageName) {
            console.log(imageName);
            CourseService
                .inspectDockerImage(imageName)
                .then(
                    function (data) {
                        vm.imageDetails = data;
                        console.log(data);
                    },
                    function (err) {
                        console.log("Error : "+ err)
                    }
                );
        }

        function openModal(id){
            ModalService.Open(id);            
        }

        function closeModal(id){
            ModalService.Close(id);
        }

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
