app.controller('appointmentDetailsCtrl', function($rootScope, $scope, $http, $state, $timeout, utils, $stateParams) {

	console.log(utils.objectIsEmpty($stateParams.appointment));

	$http({
        method: 'GET',
        url: 'https://docdial-api.herokuapp.com/api/v1/appointments/'+$stateParams.appointment_id
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        $scope.appointment = response.data.data;

        console.log($scope.appointment);

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
});