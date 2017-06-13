(function () {
	angular
	.module('AdaptiveAlgoApp')
	.controller('headerCtrl', function($scope, UserService, $location) {

		var vm = this;

	    vm.logout = logout;

	    function init() {
	    	UserService
	    		.findCurrentUser()
	    		.then(
	    			function(user) {
	    				vm.userType = user.data.userType;
	    				console.log(vm.userType);
	    			},
	    			function(err) {
	    				vm.err = "No User Found";
	    			}
	    		);
	    }
	    init();

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