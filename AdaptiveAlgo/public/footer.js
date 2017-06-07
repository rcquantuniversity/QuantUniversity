(function () {
	angular
	.module('AdaptiveAlgoApp')
	.controller('footerCtrl', function($scope, UserService, $location) {

		var vm = this;

	    vm.logout = logout;

	    function logout() {
	        UserService
	            .logout()
	            .then(
	                function () {
	                    $location.url("/login");
	                }
	            );
	    }

	});
})();