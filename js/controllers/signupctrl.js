app.controller('signupCtrl', function($rootScope, $scope, $http, $state, $location) {
	$scope.tab = 1;
    $scope.upatient = {};
   	$scope.udoctor = {};
    $scope.udoctor.specialties_user = {};

	$scope.successStatus = false;
	$scope.errorStatus = false;

	$scope.location = $location.path();

	$rootScope.$on('$locationChangeSuccess', function() {
        $scope.location = $location.path();
    });

	$scope.patient = function(){
		$state.go('signup.patient');
	}

	$scope.doctor = function(){
		$state.go('signup.doctor');
	}

	$scope.signUpUser = function(val){
		$scope.location = val;
	}

    $scope.signuppatient = function(){
        $scope.onSending = true;
        console.log($scope.upatient);

        $scope.successStatus = false;
        $scope.errorStatus = false;

        // Signup process

        if($scope.upatient.password == $scope.upatient.confirmpassword){

            var signup_request = $http({
                method: "post",
                url: "https://docdial-api.herokuapp.com/api/v1/register",
                data: $scope.upatient
            });

            signup_request.then(function successCallback(data) {
               
                if(data.data._meta.status_code === 200){

                    console.log(data);
                    $scope.onSending = false;
                    $scope.showStatus = "Account Created";
                    $scope.successStatus = true;

                    $state.go('verify', {token: data.data._meta.token});

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


        }else{
            // console.log('Please confirm password correctly');
            $scope.onSending = false;
            $scope.errorStatus = true;

            $scope.showStatus = 'Please confirm password correctly';
        }
    }

	$scope.signupdoctor = function(){
        var specialties_checked = [];
		$scope.onDoctorSending = true;

    	$scope.doctorSuccessStatus = false;
    	$scope.doctorErrorStatus = false;

        $scope.udoctor.specialties = angular.copy($scope.udoctor.specialties_user);

        var specialties = Object.keys($scope.udoctor.specialties).map(function(e){
            if ($scope.udoctor.specialties[e] == true) {
                specialties_checked.push(e);
            }
        });

        $scope.udoctor.dob = $scope.udoctor.dobinput.date + '-' + $scope.udoctor.dobinput.month + '-' +$scope.udoctor.dobinput.year;

        $scope.udoctor.specialties = specialties_checked;

        console.log($scope.udoctor);

        // Doctor Signup process
        var doctor_signup_request = $http({
            method: "post",
            url: "https://docdial-api.herokuapp.com/api/v1/doctor-requests",
            data: $scope.udoctor
        });


        if($scope.upatient.password == $scope.upatient.confirmpassword){

            doctor_signup_request.then(function successCallback(data) {
               
                if(data.data._meta.status_code === 200){

                    console.log(data);
                    $scope.onDoctorSending = false;
                    $scope.showDoctorStatus = "Sign up successful. You will be contacted for verification shortly.";
                    $scope.doctorSuccessStatus = true;

                }else{

                    $scope.onDoctorSending = false;
                    $scope.showDoctorStatus = "Something went wrong";
                    $scope.doctorErrorStatus = true;

                    console.log($scope.doctorErrorStatus);
               
               	}
                
            }, function errorCallback(data) {
                
                console.log(data);
                $scope.onDoctorSending = false;
                $scope.doctorErrorStatus = true;

                if(data.data._meta.error.errors){
	                console.log(data.data._meta.error.errors[0]);
	                $scope.showDoctorStatus = data.data._meta.error.errors[0];
                }else{
                    console.log(data.data._meta.error.message);
                    $scope.showDoctorStatus = data.data._meta.error.message;
                }

                console.log($scope.doctorErrorStatus);

            });


        }else{
            console.log('Please confirm password correctly');
            $scope.onDoctorSending = false;
        }
	}
});