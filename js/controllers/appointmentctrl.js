app.controller('appointmentCtrl', function($rootScope, $scope, $http, $state, $stateParams, $timeout, utils) {
	console.log($stateParams.doctor);
 	$scope.doctor = $stateParams.doctor;
 	$scope.appointment = {};
 	$scope.tab = 1;
 	$scope.today = new Date();
 	$scope.today.setUTCHours(0,0,0,0);
 	$scope.today_actual = new Date();


 	$scope.datePicked = function(){
 		console.log('Date Picked');
 	}

 	$scope.setTab = function(id){
 		$scope.tab = id;
 	}

 	$scope.dateWithTime = function(date, time){
 		var date = $scope.date(utils.formatDate(date, false));
 		date.setHours(time.split(' - ')[0].split(':')[0], time.split(' - ')[0].split(':')[1])

 		return (date);
 	}

 	Date.prototype.toIsoString = function() {
    var tzo = -this.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    	return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        '.000Z';
	}

 	$scope.setInfo = function(date, time_label, time_value, calender){
 		if (date instanceof Date) {
 			var newDate = new Date(date);

 			$scope.appointment.date = newDate.toIsoString();
	 	}else{
	 		$scope.appointment.date = date;
	 	}

	 	if(!calender){
	 		$scope.pickedDate = date;
	 	}

	 	console.log($scope.appointment.date);

 		$scope.setTab(2);


 		if(time_label){
 			$scope.appointment.time = {label: time_label, value: time_value};
 		}else{
 			$scope.appointment.time = "";
 		}
 	}

 	$scope.date = function(date){
 		return (new Date(date));
 	}

 	$scope.options = {
        minDate: $scope.today
    }

 	console.log($scope.doctor._id);

 	function loadConsultingHours(){
 		var populate = [{path: "time_ranges"}];
	 	$http({
	        method: 'GET',
	        url: 'https://docdial-api.herokuapp.com/api/v1/consulting-hours?doctor='+$scope.doctor._id+'&all=true&populate='+JSON.stringify(populate)
	    }).then(function successCallback(response) {
	        // this callback will be called asynchronously
	        // when the response is available

	        console.log(response);

	        $scope.consulting_hours = response.data.data;

	        console.log($scope.consulting_hours);

	        $timeout(function(){
		        $scope.formatted_consulting_hours = formatConsultingHours($scope.consulting_hours);
	       		console.log($scope.formatted_consulting_hours);

	       		$scope.$apply();
		    }, 0);


	    }, function errorCallback(response) {
	        // called asynchronously if an error occurs
	        // or server returns response with an error status.
	    });
	}

	function formatConsultingHours(consultinghours){
		var formatted = [];

		for (var i = 0; i < consultinghours.length; i++) {
			
			var time_ranges = [];
			formatted[consultinghours[i].date] = [];
			formatted[consultinghours[i].date]['valid_date'] = false;

			for (var j = 0; j < consultinghours[i].time_ranges.length; j++) {
				time_ranges.push({label : consultinghours[i].time_ranges[j].value, value : consultinghours[i].time_ranges[j]._id});
				if($scope.today_actual <= $scope.dateWithTime(consultinghours[i].date, consultinghours[i].time_ranges[j].value)){
					formatted[consultinghours[i].date]['valid_date'] = true;
				}
			}

			formatted[consultinghours[i].date]['time_ranges'] = time_ranges;
		}

		return formatted;
	}

 	$scope.chat = function(doctor_id, doctor_name){
		console.log(doctor_id, doctor_name);
		var doctor = {id: doctor_id, name: doctor_name};

		$scope.doctor_name = doctor_name;

		$state.go('chat', {doctorData: doctor});
		$rootScope.showThreadList = true;
 	}

 	if(!utils.objectIsEmpty($stateParams.doctor)){
 		loadConsultingHours();
 	}else{
 		$state.go('mydoctors');
 	}

 	$scope.scheduleAppointment = function(doctor){
 		$scope.appointment.patient = $rootScope.globals.currentUser.userdata.data.patient;
 		$scope.appointment.doctor = doctor;
 		$scope.appointment.time_range = $scope.appointment.time.value;
 		var appointmentdate = utils.formatDate($scope.appointment.date, false);
 		$scope.appointment.start_time = appointmentdate + ' ' + $scope.appointment.time.label.split(' - ')[0];
 		$scope.appointment.end_time = appointmentdate + ' ' + $scope.appointment.time.label.split(' - ')[1];

 		console.log($scope.appointment);

        $http({
	        method: 'POST',
	        url: 'https://docdial-api.herokuapp.com/api/v1/appointments',
	        data: $scope.appointment,
	        headers: {
                        'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                    }
	    }).then(function successCallback(response) {
	        // this callback will be called asynchronously
	        // when the response is available
	        console.log(response);
	        alert('Appointment set');

	    }, function errorCallback(response) {
	        // called asynchronously if an error occurs
	        // or server returns response with an error status.
	    });
 	}
});