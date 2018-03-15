app.controller('viewChatCtrl', function($rootScope, $scope, $http, $state, $timeout, $stateParams, $location, utils) {
	$scope.userid = $rootScope.globals.currentUser.userdata.data.id;
	$scope.sending = false;
	$scope.choosingFile = false;

    var sb = new SendBird({
        appId: '7351E687-D16B-4DAA-BAC0-6F1663AB01F7'
    });

    $scope.chooseFile = function(inputid){

    	setTimeout(function() {
	        document.getElementById(inputid).click();
	        $scope.clicked = true;
	    }, 0);
		
	}

    $scope.closeFile = function(){
    	$scope.choosingFile = false;
	}

	$scope.renderPreview = function (event) {
		$scope.selectedFiles = [];
		
		if(event){
			if (event.target.files && event.target.files[0]) {
				console.log('File selected');

				$timeout(function(){
					$scope.choosingFile = true;
				});

				for (var i = 0; i < event.target.files.length; i++) {
					var reader = new FileReader();

					reader.onload = function (e) {
					  	$scope.selectedFiles.push(e.target.result);
					  	$scope.$apply();
					}

					reader.readAsDataURL(event.target.files[i]);
				}

			}else{
				console.log('File not selected');
			}
		}
	};

	$scope.getChat = function(doctor_id, doctor_name){

		$scope.loadingChats = true;

		$scope.destination_id = doctor_id;
		$scope.source_id = $rootScope.globals.currentUser.userdata.data.id;

		sb.connect(doctor_id, function(user, error) {
            sb.updateCurrentUserInfo(doctor_name, "", function(response, error) {
						connecttoDoctor();
					});
        });

        function connecttoDoctor(){

	        sb.connect($rootScope.globals.currentUser.userdata.data.id, function(user, error) {
	            console.log(user, error);

	            sb.updateCurrentUserInfo($rootScope.globals.currentUser.userdata.data.full_name, "", function(response, error) {

	            	var channel_name = doctor_id+"_"+$rootScope.globals.currentUser.userdata.data.id;

	            	var userIds = [$rootScope.globals.currentUser.userdata.data.id, doctor_id];

					sb.GroupChannel.createChannelWithUserIds(userIds, true, "Chat Appointment", function(createdChannel, error){

						$scope.chatChannel = createdChannel;
						// createdChannel.leave();
						// $scope.chatChannel.removeMember(doctor_id);
						// $scope.chatChannel.removeMember($rootScope.globals.currentUser.userdata.data.id);

						var messageListQuery = $scope.chatChannel.createPreviousMessageListQuery();

						messageListQuery.load(30, true, function(messageList, error){
						    if (error) {
						        console.error(error);
						        return;
						    }
						    console.log(messageList);

						    $timeout(function(){
						    	$scope.list = messageList;
						    	$rootScope.msglist = messageList;
						    	$scope.loadingChats = false;

						    	$location.hash(messageList[0].messageId);
						    });
						    
						});

					    if (error) {
					        console.log(error);
					        return;
					    }
					});
					
				});
	        });

        }

	 	var ChannelHandler = new sb.ChannelHandler();

		ChannelHandler.onMessageReceived = function(channel, message){
		    console.log(channel, message);

		    $timeout(function(){
		    	$scope.list.unshift(message);
		    	$location.hash(message.messageId);
		    });

		};

		sb.addChannelHandler('test', ChannelHandler);
	};

	$scope.sendChat = function(){

		$scope.sending = true;

		if($scope.chatObj.message){

	  		$scope.chatChannel.sendUserMessage($scope.chatObj.message, '', '', function(message, error){
			    if (error) {
			        console.error(error);
			        return;
			    }

			    console.log(message);

			    $timeout(function(){
					$scope.list.unshift(message);

					$location.hash(message.messageId);
				});

			    $scope.chatObj.message = "";
			    $scope.sending = false;
			});

	  	}

    }

    if(!utils.objectIsEmpty($stateParams.doctor)){
    	$scope.getChat($stateParams.doctor.id, $stateParams.doctor.name);
    	$rootScope.showThreadList = true;
    }else{
    	$state.go('chat');
    }
});