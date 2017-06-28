(function(){
    angular
        .module("AdaptiveAlgoApp")
        .config(configuration);

    function configuration($routeProvider, $locationProvider, $httpProvider) {
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/json;charset=utf-8';

        $httpProvider.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        $httpProvider.defaults.headers.post['Access-Control-Allow-Credentials'] = 'true';


        $routeProvider
            .when("/", {
                templateUrl: "views/user/templates/login.view.client.html",
                controller: "LoginController",
                controllerAs: "model"
            })
            .when("/login", {
                templateUrl: "views/user/templates/login.view.client.html",
                controller: "LoginController",
                controllerAs: "model"
            })
            .when("/register", {
                templateUrl: "views/user/templates/register.view.client.html",
                controller: "RegisterController",
                controllerAs: "model"
            })

            .when("/student/profile", {
                templateUrl: "views/student/templates/profile.view.client.html",
                controller: "ProfileController",
                controllerAs: "model",
                resolve : {
                    checkLogin : checkLogin
                }
            })

            .when("/reset", {
                templateUrl: "views/user/templates/reset.view.client.html",
                // controller: "ResetController",
                // controllerAs: "model"
            })
            .when("/user/student", {
                templateUrl: "views/student/templates/student.view.client.html",
                controller: "StudentController",
                controllerAs: "model",
                resolve : {
                    checkLogin : checkLogin
                }
            })
            .when("/student/availableCourses", {
                templateUrl: "views/student/templates/availableCourseList.view.client.html",
                controller: "AvailableCoursesController",
                controllerAs: "model",
                resolve : {
                    checkLogin : checkLogin
                }
            })
            .when("/student/availableProjects", {
                templateUrl: "views/student/templates/availableProjectList.view.client.html",
                controller: "AvailableProjectsController",
                controllerAs: "model",
                resolve : {
                    checkLogin : checkLogin
                }
            })
            .when("/user/instructor", {
                templateUrl: "views/instructor/templates/instructor.view.client.html",
                controller: "InstructorController",
                controllerAs: "model",
                resolve : {
                    checkLogin : checkLogin
                }
            })
            .when("/instructor/buildDocker", {
                templateUrl: "views/instructor/templates/buildDocker.view.client.html",
                controller: "BuildDockerController",
                controllerAs: "model",
                resolve : {
                    checkLogin : checkLogin
                }
            })
            .when("/instructor/editDocker/:id", {
                templateUrl: "views/instructor/templates/editDocker.view.client.html",
                controller: "EditDockerController",
                controllerAs: "model",
                resolve : {
                    checkLogin : checkLogin
                }
            })
            .when("/instructor/listImages", {
                templateUrl: "views/instructor/templates/listAllImages.view.client.html",
                controller: "ListImagesController",
                controllerAs: "model",
                resolve : {
                    checkLogin : checkLogin
                }
            })
            .when("/admin/listUsers", {
                templateUrl: "views/admin/templates/listUsers.view.client.html",
                controller: "ListUsersController",
                controllerAs: "model",
                resolve : {
                    checkLogin : checkLogin
                }
            });


        function checkLogin($q, UserService, $location) {
            var deferred = $q.defer();
            UserService
                .checkLogin()
                .success(
                    function (user) {
                        if (user != '0') {
                            deferred.resolve();
                        } else {
                            deferred.reject();
                            $location.url("/");
                        }
                    }
                );
            return deferred.promise;
        }
    }

})();