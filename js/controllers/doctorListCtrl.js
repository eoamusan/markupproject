app.controller('doctorListCtrl', function($rootScope, $scope, $http, $state, $stateParams, utils) {

	console.log($stateParams);

	$scope.specialty = $stateParams.specialty;
	$scope.specialty_name = $stateParams.specialty_name;

	$scope.doctorsLoading = true;

	$scope.loadDoctorsInSpecialty = function(){

		var populate = [{
							path:"user",
							populate:{
								path:"doctor"
							}
						},
						{
							path:"specialties"
						}];

	    $http({
	        method: 'GET',
	        url: 'https://docdial-api.herokuapp.com/api/v1/doctors?specialties='+$scope.specialty+'&populate='+JSON.stringify(populate),
	        headers: {
	        	'x-api-key': 'ddial'
	        }
	    }).then(function successCallback(response) {

	    	console.log(response.data.data);

	        // $scope.doctors = response.data.data;
	        $scope.specialised_doctors = response.data.data;

	        $scope.doctors_loaded = true;
	        $scope.doctorsLoading = false;

	        $scope.$broadcast('scroll.refreshComplete');

	    }, function errorCallback(response) {
	        // called asynchronously if an error occurs
	        // or server returns response with an error status.
	    });

    }

    $scope.inArray = function(needle, haystack){
		return utils.inArray(needle, haystack);
	}

	$scope.loadDoctorsInSpecialty();

});