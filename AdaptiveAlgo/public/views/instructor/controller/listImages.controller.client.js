(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("ListImagesController", ListImagesController);

    function ListImagesController(CourseService, UserService, ModalService, $location) {
        var vm = this;
        vm.uploadToDockerHub = uploadToDockerHub;

        vm.openModal = openModal;
        vm.closeModal = closeModal;
        vm.viewDockerImage = viewDockerImage;
        vm.editDockerImage = editDockerImage;

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

        function editDockerImage(image) {
            var editUrl;

            editUrl = "/instructor/editDocker/"+image._id;

            $location.url(editUrl);
        }

        function bin2String(array) {
            var result = "";
            for (var i = 0; i < array.length; i++) {
                result += String.fromCharCode(parseInt(array[i], 2));
            }
            return result;
        }

        function viewDockerImage(imageName) {
            CourseService
                .viewDockerImage(imageName)
                .then(
                    function (data) {
                        console.log(data);
                        vm.imageDetails = data.data;
                        console.log(vm.imageDetails);
                    },
                    function (err) {
                        console.log("Error : "+ err);
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
