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
            "consume" : consume
        };
        return api;

        function consume() {
            return $http.get("/api/consume");
        }

        function publish() {
            return $http.get("/api/publish");
        }

        function stopLab(imageName, labStartTime) {
            var imageNameJSON = {imageName : imageName, labStartTime : labStartTime};
            return $http.post("/api/stopLab",imageNameJSON);
        }

        function startLab(imageName) {
            var imageNameJSON = {imageName : imageName};
            return $http.post("/api/startLab", imageNameJSON);
        }

        function showAvailableCourses() {
            return $http.get("/api/getAvailableCourses");
        }
    }
})();