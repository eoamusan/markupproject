app.controller('appointmentsCtrl', function($rootScope, $scope, $http, $state, $timeout, utils) {
	var populate = [{
                        path:"patient",
                        populate:{
                            path:"user"
                        }
                    },
                    {
                        path:"doctor",
                        populate:{
                            path:"user"
                        }
                    }];

    // console.log($rootScope.globals.currentUser.userdata.data.patient);

	$http({
        method: 'GET',
        url: 'https://docdial-api.herokuapp.com/api/v1/appointments?all=true&patient='+$rootScope.globals.currentUser.userdata.data.patient+'&populate='+JSON.stringify(populate)
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        $scope.appointments = response.data.data;
        console.log($scope.appointments);

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });

    $scope.viewAppointment = function(appointment){
    	$state.go('appointment_details', {"appointment_id" : appointment._id, "appointment" : appointment});
    }
});