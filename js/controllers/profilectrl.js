app.controller('profileCtrl', function($rootScope, $scope, $http, $state, $filter, utils, $timeout) {
 	console.log($rootScope.globals.currentUser.userdata.data);
    $scope.edit = false;

    $rootScope.editingProfile = true;

    $scope.$on('$destroy', function() {
        $rootScope.editingProfile = false;
    });

    $scope.editProfile = function(){
        $scope.edit = !$scope.edit;
    }

    $scope.editMedical = function(){
        $scope.medit = !$scope.medit;
    }

    function formatMedical(record, label){
        var data = [];

        if(!(record == undefined)){

            if(record.length != 0){
                for(var i = 0; i < record.length; i++){
                    data.push({id: label + (i+1), label: record[i]});
                }
            }else{
                data.push({id: label + 1});
            }
        }else{
            data.push({id: label + 1});
        }

        return (data);
    }

    $scope.addNewAllergy = function() {
        var newItemNo = $scope.medical.known_allergies.length + 1;
        $scope.medical.known_allergies.push({'id':'allergy' + newItemNo});
    };

    $scope.removeAllergy = function(item) {
        $scope.medical.known_allergies.splice(item, 1);
    };

    $scope.addNewCondition = function() {
        var newItemNo = $scope.medical.medical_conditions.length + 1;
        $scope.medical.medical_conditions.push({'id':'condition' + newItemNo});
    };

    $scope.removeCondition = function(item) {
        $scope.medical.medical_conditions.splice(item, 1);
    };

    $scope.addNewMedication = function() {
        var newItemNo = $scope.medical.current_medications.length + 1;
        $scope.medical.current_medications.push({'id':'medication' + newItemNo});
    };

    $scope.removeMedication = function(item) {
        $scope.medical.current_medications.splice(item, 1);
    };

 	$scope.personal = {
 		first_name: $rootScope.globals.currentUser.userdata.data.first_name,
 		gender: $rootScope.globals.currentUser.userdata.data.gender
 	}

 	$scope.patient = $rootScope.globals.currentUser.userdata;

    $scope.days_of_the_month = [];
    $scope.months_of_the_year = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $scope.years = [];
    $scope.genders = ["Male", "Female"];

    for (var i = 1; i <= 31; i++) {
        $scope.days_of_the_month.push(i);
    }

    var year = 1930;

    for (var i = 1; i <= 87; i++) {
        $scope.years.push(year);
        year++;
    }

    var populate = [{
                        path:"user"
                    }];

 	$http({
        method: 'GET',
        url: 'https://docdial-api.herokuapp.com/api/v1/patients/'+$rootScope.globals.currentUser.userdata.data.patient+'?populate='+JSON.stringify(populate),
        headers: 	{
                    	'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                	}
    }).then(function successCallback(response) {

        console.log(response.data.data.user);

        $scope.personal = response.data.data.user;
        $scope.medical = response.data.data;

        if($scope.personal.dob){
            var date = new Date($scope.personal.dob);

            $scope.date = date.getDate();
            $scope.month = $scope.months_of_the_year[date.getMonth()];
            $scope.year = date.getFullYear();
        }

        console.log($scope.personal);

        $scope.medical.known_allergies = formatMedical($scope.medical.known_allergies, 'allergy');
        $scope.medical.medical_conditions = formatMedical($scope.medical.medical_conditions, 'condition');
        $scope.medical.current_medications = formatMedical($scope.medical.current_medications, 'medication');

    }, function errorCallback(response) {

    });

    $scope.getName = function(firstname, lastname){
        return firstname + ' ' + lastname;
    }

    $scope.updateBasicRecords = function(){
        $scope.onSaving = true;

        $scope.personal.first_name = $rootScope.globals.currentUser.userdata.data.first_name;

        if(($scope.date || $scope.month || $scope.year) && !($scope.date && $scope.month && $scope.year)){
            console.log('One set, all not set');
        }else if($scope.date && $scope.month && $scope.year){
            console.log(new Date($scope.year, ($scope.months_of_the_year.indexOf($scope.month)), $scope.date));
            $scope.personal.dob = (new Date($scope.year, ($scope.months_of_the_year.indexOf($scope.month)), $scope.date)).toString();
        }

        // Save profile process
        $http({
            method: "put",
            url: "https://docdial-api.herokuapp.com/api/v1/users/"+$rootScope.globals.currentUser.userdata.data._id,
            data: $scope.personal,
            headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                    }
        }).then(function successCallback(data) {
            console.log($rootScope.globals);
            
            $scope.onSaving = true;
           
            if(data.data._meta.status_code === 200){

                $scope.showStatus = 'Data Updated';
                $scope.successStatus = true;

                $timeout(function(){
                    $scope.onSaving = false;
                }, 2000);

            }else{
                console.log(data);

                $scope.showStatus = 'Something went wrong';
                $scope.errorStatus = true;

                $timeout(function(){
                    $scope.onSaving = false;
                }, 2000);
           
            }

        }, function errorCallback(data) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.

            if(data.data._meta.status_code === 200){
                $scope.showStatus = 'Something went wrong';
                $scope.errorStatus = true;

                $timeout(function(){
                    $scope.onSaving = false;
                }, 2000);
            }
        });
    }

    $scope.updateMedicalRecords = function(){
        var medical = angular.copy($scope.medical);

        medical.known_allergies = $filter('formatMedical')(medical.known_allergies);
        medical.medical_conditions = $filter('formatMedical')(medical.medical_conditions);
        medical.current_medications = $filter('formatMedical')(medical.current_medications);

        console.log(medical);

        // Signup process
        $http({
            method: "put",
            url: "https://docdial-api.herokuapp.com/api/v1/patients/"+$rootScope.globals.currentUser.userdata.data.patient,
            data: medical,
            headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                    }
        }).then(function successCallback(data) {
            console.log(data);
           
            if(data.data._meta.status_code === 200){

                alert('Data Updated');

            }else{

                console.log(data);
           
            }

        }, function errorCallback(data) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            
            console.log(data);

            if(data.data._meta.status_code === 200){
                alert('Something went wrong');
            }
        });
    }
});