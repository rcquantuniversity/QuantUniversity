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

        function stopLab() {
            return $http.get("/api/stopLab");
        }

        function startLab() {
            return $http.get("/api/startLab");
        }

        function showAvailableCourses() {
            return $http.get("/api/getAvailableCourses");
        }
    }
})();