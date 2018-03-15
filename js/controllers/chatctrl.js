app.controller('chatCtrl', function($rootScope, $scope, $http, $state, $timeout, $stateParams) {
    $scope.sending_status = "notsending";
    $rootScope.showThreadList = false;
    $scope.chooseDoctor = false;
    $rootScope.inChat = true;

    var doctorData = {};

    $scope.$on('$destroy', function() {
        $rootScope.showThreadList = false;
        $rootScope.inChat = false;
    });

    if($stateParams.doctorData){
	    doctorData = $stateParams.doctorData;
	    console.log(doctorData);
	}

    var sb = new SendBird({
        appId: '7351E687-D16B-4DAA-BAC0-6F1663AB01F7'
        // appId: '692C2138-F9AA-4C78-9A86-D1C3F9DF67B6'
    });

    $scope.loadDoctors();

    $scope.choose = function(){
    	$scope.chooseDoctor = !$scope.chooseDoctor;
    }

    $scope.$watch(

        function($scope) {
            return ($rootScope.channellist);
        },

        function(newValue) {
            if(newValue){
            	if(doctorData.id == undefined){
                    $scope.chat($rootScope.channellist[0].peer.userId, $rootScope.channellist[0].peer.nickname);
                    $scope.activeChat = 0;
                }else{
                    $scope.chat(doctorData.id, doctorData.name);
                    for (var i = 0; i < $rootScope.channellist.length; i++) {
                        if ($rootScope.channellist[i].peer.userId == doctorData.id) {
                            $scope.activeChat = i;
                        }
                    }
                }
            }
        }
    );



    $scope.chatObj = {};

    console.log($rootScope.globals);

	$scope.chat = function(doctor_id, doctor_name){
		console.log(doctor_id, doctor_name);
		var doctor = {id: doctor_id, name: doctor_name};

		$scope.doctor_name = doctor_name;

		$state.go('viewchat', {doctor: doctor});
		$rootScope.showThreadList = true;
	}

	$scope.viewAllChats = function(doctor_id, doctor_name){
		$rootScope.showThreadList = false;
	}

	$scope.setActive = function(question){
		$scope.activeChat = question;
	}

	$scope.setDoctor = function(index){
		$scope.activeDoctor = index;
	}
});