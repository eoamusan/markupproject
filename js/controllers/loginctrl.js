app.controller('loginCtrl', function($rootScope, $scope, $http, $state, AuthenticationService) {
	$scope.onSending = false;

    $scope.reset = function(){
        console.log('Reset password');
        $state.go('reset');
    }

	$scope.login = function(){

        console.log("Logging in");

		$scope.onSending = true;

    	$scope.successStatus = false;
    	$scope.errorStatus = false;

    	// Signup process
    	AuthenticationService.Login($scope.upatient, function(data){
            console.log(data);
            
    		if(data.data._meta.status_code !== 200){

                $scope.onSending = false;
                $scope.errorStatus = true;
                $scope.showStatus = data.data._meta.error.message;

            }else if(data.data.data){
                if(data.data.data.doctor){
                    $scope.onSending = false;
                    $scope.errorStatus = true;
                    $scope.showStatus = 'Only patients are to login here. Please click <a href="https://doctor.doctordial.org/login" class="link_emphasis">here</a> to login';
                }else{

                    console.log(data);

                    $scope.onSending = false;
                    $scope.errorStatus = true;

            		if(data.data._meta.status_code === 200){

                        $scope.showStatus = "User logged in";
                        $scope.successStatus = true;

                        AuthenticationService.SetCredentials($scope.upatient.username, $scope.upatient.password, data.data);

                        if(!data.data.data.account_verified){
                            $state.go('verify', {token: data.data._meta.token});
                        } else {
                            $state.go('account');
                        }

                    }else if(data.data._meta.error.errors){

                        $scope.showStatus = data.data._meta.error.errors[0];

                    }else if(data.data._meta.error.message){

                        $scope.showStatus = data.data._meta.error.message;

                    } else {

                        $scope.showStatus = "Something went wrong";
                   
                    }

                }
            }

    	});

	}
});