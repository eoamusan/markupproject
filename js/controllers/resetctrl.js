app.controller('resetCtrl', function($rootScope, $scope, $http, $state, AuthenticationService, $stateParams) {
	$scope.onSending = false;
    $scope.resetValues = {};

    if($stateParams.email){
        console.log($stateParams);
        $scope.resetValues.email = $stateParams.email;
    }

    $scope.reset = function(){

        $scope.onSending = true;

        $scope.successStatus = false;
        $scope.errorStatus = false;

        // Reset process
        var add_doctor_request = $http({
            method: "post",
            url: "https://docdial-api.herokuapp.com/api/v1/authorize-reset",
            data: $scope.resetValues
        }).then(function successCallback(data) {
            $scope.onSending = false;
           
            if(data.data._meta.status_code === 200){
                $scope.onSending = false;

                $scope.successStatus = true;               

                $state.go('reset-authorization', {email: $scope.resetValues.email});
                $scope.showStatus = "Reset Code sent to your email";

            }else{

                $scope.onSending = false;
                $scope.errorStatus = true;

                $scope.showStatus = data.data._meta.error.message;
           
            }
            
        }, function errorCallback(data) {
            
            $scope.onSending = false;
            $scope.errorStatus = true;

            $scope.showStatus = data.data._meta.error.message;

        });

    }

	$scope.resetAuth = function(){

		$scope.onSending = true;

    	$scope.successStatus = false;
    	$scope.errorStatus = false;

    	// Reset process
    	var add_doctor_request = $http({
            method: "post",
            url: "https://docdial-api.herokuapp.com/api/v1/verify-reset-code",
            data: $scope.resetValues
        }).then(function successCallback(data) {
            $scope.onSending = false;
           
            if(data.data._meta.status_code === 200){
                $scope.onSending = false;

                $scope.successStatus = true;               

                console.log(data);
                $scope.showStatus = "New password sent to your email. You should change this when you log in";

            }else{

                $scope.onSending = false;
                $scope.errorStatus = true;

                $scope.showStatus = data.data._meta.error.message;
           
            }
            
        }, function errorCallback(data) {
            
            $scope.onSending = false;
            $scope.errorStatus = true;

            $scope.showStatus = data.data._meta.error.message;

        });

	}
});