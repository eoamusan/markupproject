app.controller('landingCtrl', function($rootScope, $scope, $http, $state) {
	$scope.listDoctors = function(specialty){
		$state.go('doctors', {specialty: specialty._id, specialty_name: specialty.name});
	}

    $http({
        method: 'GET',
        url: 'https://docdial-api.herokuapp.com/api/v1/specialties?all=true',
        headers: {
            'x-api-key': 'doctordial'
        }
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        $scope.specialties_online = response.data.data;

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
});