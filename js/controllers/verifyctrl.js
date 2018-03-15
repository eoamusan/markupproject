app.controller('verifyCtrl', function($rootScope, $scope, $http, $state, $stateParams, $timeout) {
	$scope.onSending = false;

	console.log($stateParams);

	$scope.verify = function(){
		$scope.onSending = true;

    	$scope.successStatus = false;
    	$scope.errorStatus = false;

    	// Verification process
    	var verify_request = $http({
            method: "post",
            url: "https://docdial-api.herokuapp.com/api/v1/verify-code",
            data: {'verification_code': $scope.verification_code},
            headers: {
                'x-access-token': $stateParams.token
            }
        });

        verify_request.then(function successCallback(data) {
           
            if(data.data._meta.status_code === 200){

                console.log(data);
                $scope.onSending = false;
                $scope.showStatus = data.data._meta.message;
                $scope.successStatus = true;

                $timeout(function(){
                    $state.go('login');
                }, 1000);

            }else{

                $scope.onSending = false;
                $scope.showStatus = "Something went wrong";
                $scope.errorStatus = true;

                console.log($scope.errorStatus);
           
           	}
            
        }, function errorCallback(data) {
            
            console.log(data);
            $scope.onSending = false;
            $scope.errorStatus = true;

            if(data.data._meta.error.errors){
                console.log(data.data._meta.error.errors[0]);
                $scope.showStatus = data.data._meta.error.errors[0];
            }else{
                console.log(data.data._meta.error.message);
                $scope.showStatus = data.data._meta.error.message;
            }

            console.log($scope.errorStatus);

        });
	}
});