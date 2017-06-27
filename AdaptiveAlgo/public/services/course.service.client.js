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
            "runScriptLab" : runScriptLab,
            "runRStudio" : runRStudio,
            "openTerminal" : openTerminal
        };
        return api;

        function runRStudio() {
            return $http.post("/api/runRStudio");
        }

        function runScriptLab(imageName, moduleName) {
            var imageNameJSON = {imageName : imageName, moduleName : moduleName};
            return $http.post("/api/startScriptLab", imageNameJSON);
        }

        function openTerminal(imageName, moduleName) {
            var imageNameJSON = {imageName : imageName, moduleName : moduleName};
            return $http.post("/api/openTerminal", imageNameJSON);
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

        function startLab(imageName, moduleName, useAC) {
            var imageNameJSON = {imageName : imageName,
                                moduleName : moduleName,
                                useAC : useAC};
            return $http.post("/api/startLab", imageNameJSON);
        }

        function showAvailableCourses() {
            return $http.get("/api/getAvailableCourses");
        }
    }
})();