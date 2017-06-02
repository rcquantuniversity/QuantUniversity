(function () {
    angular
        .module("AdaptiveAlgoApp")
        .controller("ListImagesController", ListImagesController);

    function ListImagesController(UserService) {
        var vm = this;

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


    }

})();
