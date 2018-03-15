app.controller('doctorCtrl', function($rootScope, $scope, $http, $state, $stateParams, utils) {
	$scope.toCall = false;

 	if(!utils.objectIsEmpty($stateParams.doctor)){
 		$scope.doctor = $stateParams.doctor;
 	}else{
 		$state.go('mydoctors');
 	}

 	$scope.viewCallOptions = function(){
 		$scope.toCall = !$scope.toCall;
 	}
});