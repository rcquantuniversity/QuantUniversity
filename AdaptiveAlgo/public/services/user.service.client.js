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
            "callToJupyterNotebook" : callToJupyterNotebook
        };
        return api;

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