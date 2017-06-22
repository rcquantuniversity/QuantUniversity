(function () {
    angular
        .module("AdaptiveAlgoApp")
        .factory("CourseService", CourseService);

    function CourseService($http) {

        var api = {
            "showAvailableCourses": showAvailableCourses,
            "startLab" : startLab,
            "stopLab" : stopLab,
            "publish" : publish,
            "consume" : consume,
            "viewDockerImage" : viewDockerImage,
            "runScriptLab" : runScriptLab
        };
        return api;

        function runScriptLab(imageName, moduleName) {
            var imageNameJSON = {imageName : imageName, moduleName : moduleName};
            return $http.post("/api/startScriptLab", imageNameJSON);
        }


        function viewDockerImage(imageName) {
            return $http.get("/api/viewDockerImage/"+imageName);
        }

        function consume() {
            return $http.get("/api/consume");
        }

        function publish() {
            return $http.get("/api/publish");
        }

        function stopLab(moduleName, labStartTime) {
            var imageNameJSON = {moduleName : moduleName, labStartTime : labStartTime};
            return $http.post("/api/stopLab",imageNameJSON);
        }

        function startLab(imageName, moduleName) {
            var imageNameJSON = {imageName : imageName, moduleName : moduleName};
            return $http.post("/api/startLab", imageNameJSON);
        }

        function showAvailableCourses() {
            return $http.get("/api/getAvailableCourses");
        }
    }
})();