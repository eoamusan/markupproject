app.controller('changeCtrl', function($rootScope, $scope, $http, $state, AuthenticationService, $timeout, $cookieStore) {
	$scope.onSending = false;

    console.log($rootScope.globals);

	$scope.change = function(){

		$scope.onSending = true;

    	$scope.successStatus = false;
    	$scope.errorStatus = false;

        if($scope.passwordChange.password == $scope.passwordChange.confirm_password){
        	// Change Password process
        	var add_doctor_request = $http({
                method: "post",
                url: "https://docdial-api.herokuapp.com/api/v1/change-password",
                data: $scope.passwordChange,
                headers:    {
                                'Content-Type': 'application/json',
                                'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                            }
            }).then(function successCallback(data) {
                $scope.onSending = false;
               
                if(data.data._meta.status_code === 200){

                    $timeout(function(){
                        $scope.onSending = false;
                    }, 1000);

                    $scope.successStatus = true;
                    $scope.showStatus = "Password successfully changed";

                    $rootScope.globals.currentUser.password = $scope.passwordChange.password;

                    console.log($rootScope.globals);
                    $cookieStore.put('globals', $rootScope.globals);

                }else{

                    console.log(data);
               
                }
                
            }, function errorCallback(data) {
                
                $scope.onSending = false;
                $scope.errorStatus = true;
                $scope.showStatus = data.data._meta.error.message;

            });
        }else{
            $scope.onSending = false;
            $scope.errorStatus = true;
            $scope.showStatus = "Please confirm password correctly";
        }

	}
});