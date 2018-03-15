app.controller('controllerCtrl', function($scope, $state, $http, $rootScope) {

	$scope.home = function(){
		$state.go('home');
	}

	$scope.login = function(){
		$state.go('login');
	}

    $scope.signup = function(){
        $state.go('signup.patient');
    }

	$scope.enterPatientDashboard = function(){
        $state.go('account');
    }
});