(function () {
    angular
        .module("AdaptiveAlgoApp")
        .factory("UserService", userService);

    function userService($http) {

        var api = {
            "findUserById": findUserById,
            "login" : login,
            "checkLogin" : checkLogin,
            "logout" : logout,
            "findCurrentUser" : findCurrentUser,
            "registerUser" : registerUser,
            "callToJupyterNotebook" : callToJupyterNotebook,
            "getAllPackages" : getAllPackages,
            "createOutputJSON" : createOutputJSON,
            "createDockerImage" : createDockerImage,
            "uploadToDockerHub" : uploadToDockerHub,
            "listAllImages" : listAllImages,
            "listAllImagesForStudent" : listAllImagesForStudent,
            "addPackage" : addPackage,
            "getPackageFromJSON" : getPackageFromJSON,
            "updateAmazonCredentials" : updateAmazonCredentials
        };
        return api;

        function updateAmazonCredentials(accessKeyID,secretAccessKey) {

            var amazonCredentials = {
                accessKeyID: accessKeyID,
                secretAccessKey : secretAccessKey
            };
            return $http.put("/api/setAmazonCredentials", amazonCredentials);
        }


        function getPackageFromJSON() {
            return $http.get("/api/getUserPackageFile");
        }

        function addPackage(base, package) {
            var packageJSON = {"base" : base, "package" : package};
            return $http.post("/api/addPackage", packageJSON);
        }

        function listAllImagesForStudent() {
            return $http.get("/api/listAllImagesForStudent");
        }

        function listAllImages() {
            return $http.get("/api/listAllImages");
        }

        function uploadToDockerHub(imageName) {
            var imageNameJSON = {imageName : imageName};
            return $http.post("/api/uploadToDockerHub", imageNameJSON);
        }

        function createDockerImage(imageName, packageList, description, moduleName, imageType) {
            return $http.post("/api/createDockerImage",
                {imageName : imageName,
                    packageList : packageList,
                    description : description,
                    moduleName : moduleName,
                    imageType : imageType});
        }

        function createOutputJSON(packageList, imageName) {
            return $http.post("/api/createOutputJSON/" + imageName, packageList);
        }

        function getAllPackages() {
            return $http.get("/api/getAllPackages");
        }

        function callToJupyterNotebook() {
            return $http.post("/api/callToJupyterNotebook");
        }

        function registerUser(user) {
            return $http.post("/api/registerUser", user);
        }

        function findCurrentUser() {
            return $http.get("/api/findCurrentUser");
        }

        function logout() {
            return $http.post("/api/logout");
        }

        function checkLogin() {
            return $http.post("/api/checkLogin");
        }

        function findUserById(userId) {
            return $http.get("/api/user/"+userId);
        }

        function login(user) {
            return $http.post("/api/login", user);
        }

    }
})();