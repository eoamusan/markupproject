app.controller('callCtrl', function($rootScope, $scope, $http, $state, $stateParams, socket) {
 	$rootScope.localParticipantAdded = false;
 	$rootScope.localParticipantComing = false;
	
	$scope.callers = [];
    var audio = new Audio('audio/audio_file.mp3');

    socket.on('connect', function (data) {
    });

    socket.on('disconnect', function (data) {
        console.log('User disconnected from default namespace');
    });

    socket.on("UserCalling", function(caller){

        if($rootScope.globals.currentUser && (JSON.parse(caller).call_type !== 0)){

	        if($rootScope.globals.currentUser.userdata.data.id == JSON.parse(caller).calleeId){

                $scope.doctor_id = JSON.parse(caller).callerId;
		        console.log(caller);
		 		
		 		$rootScope.call_type = JSON.parse(caller).call_type;

		        $rootScope.localParticipantAdded = false;
		 		$rootScope.localParticipantComing = false;

                console.log("Added Value: " + $rootScope.localParticipantAdded);

		        $rootScope.peer = JSON.parse(caller).callerId;
	        
			    $http.get('https://docdial-api.herokuapp.com/api/v1/token/'+$rootScope.globals.currentUser.userdata.data.id, function(data) {

			    }).then(function(data) {

			        // Bind click event and add token to data attribute
			        document.getElementById('button-call').setAttribute('data-token', data.data.token);

			        // Bind button to leave Room
			        document.getElementById('button-call-end').onclick = function() {
			            log('Disconnecting...');
			            document.getElementById('call-connected').style.display = 'none';
			            document.getElementById('spin-wrapper').style.display = 'none';
			            document.getElementById('button-preview').style.display = 'block';
			            document.getElementById('video-overlay').style.display = 'none';
			            activeRoom.disconnect();
			        };
			    });

		        $http({
			        method: 'GET',
			        url: 'https://docdial-api.herokuapp.com/api/v1/users/'+$rootScope.peer
			    }).then(function successCallback(response) {
			        // this callback will be called asynchronously
			        // when the response is available
			        $rootScope.peer_name = response.data.data.full_name;

			    }, function errorCallback(response) {
			        // called asynchronously if an error occurs
			        // or server returns response with an error status.
			    });

		        $scope.incomingCall = true;

		        playIncoming();
            }
        }else{
            $scope.closeCallModal();
        }
    });

    $scope.callDoctor = function(doctor_id, doctor_name, call_type){
		$scope.outgoingCall = true;

		$scope.callConnecting = true;

		$scope.call_type = call_type;

		$http.get('https://docdial-api.herokuapp.com/api/v1/token/'+$rootScope.globals.currentUser.userdata.data.id, function(data) {

	    }).then(function(data) {

	        // Bind click event and add token to data attribute
	        document.getElementById('button-call').setAttribute('data-token', data.data.token);

			connect($rootScope.globals.currentUser.userdata.data.id, doctor_id, call_type);

	        // Bind button to leave Room
	        document.getElementById('button-call-end').onclick = function() {
	            log('Disconnecting...');
	            document.getElementById('call-connected').style.display = 'none';
	            document.getElementById('spin-wrapper').style.display = 'none';
	            document.getElementById('button-preview').style.display = 'block';
	            document.getElementById('video-overlay').style.display = 'none';
	            activeRoom.disconnect();
	        };
	    });

        $scope.doctor_id = doctor_id;
		socket.emit("UserCalling", {callerId: $rootScope.globals.currentUser.userdata.data.id, calleeId: doctor_id, call_type: call_type});
	}

    $scope.$watch(

        function($scope) {
            return ($rootScope.participantConnected);
        },

        function(newValue) {
            if(newValue == true){
                stopIncoming();
            }
        }
    );

    function playIncoming(){
        audio.play();
    }

    function stopIncoming(){
        audio.pause();
        audio.currentTime = 0;
    }

    $scope.closeCallModal = function(){
    	stopIncoming();

        
    	$scope.incomingCall = false;
    	$scope.outgoingCall = false;

    	$scope.dropCall();
    }

    $scope.emitClose = function(){
        socket.emit("UserCalling", {callerId: $rootScope.globals.currentUser.userdata.data.id, calleeId: $scope.doctor_id, call_type: 0});
    }

    // instantiate Twilio Programmable Video library
    const Video = Twilio.Video;

    // setup some vars
    var activeRoom;
    var previewTracks;
    var identity;
    var roomName;

    $rootScope.participantConnected = false;

    // Attach the Tracks to the DOM.
    function attachTracks(tracks, container) {

        tracks.forEach(function(track) {
            container.appendChild(track.attach());
        });
    }

    // Attach the Participant's Tracks to the DOM.
    function attachParticipantTracks(participant, container) {
        console.log("Added value: " + $rootScope.localParticipantAdded);

    	$rootScope.localParticipantAdded = true;

    	console.log("Added Value: " + $rootScope.localParticipantAdded);

        var tracks = Array.from(participant.tracks.values());
        attachTracks(tracks, container);
    }

    // Detach the Tracks from the DOM.
    function detachTracks(tracks) {
        tracks.forEach(function(track) {
            track.detach().forEach(function(detachedElement) {
                detachedElement.remove();
            });
        });
    }

    // Detach the Participant's Tracks from the DOM.
    function detachParticipantTracks(participant) {
        var tracks = Array.from(participant.tracks.values());
        detachTracks(tracks);
    }

    // When we are about to transition away from this page, disconnect
    // from the room, if joined.
    window.addEventListener('beforeunload', leaveRoomIfJoined);

    $rootScope.$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams) {
            leaveRoomIfJoined();
        }
    );

    $scope.receiveCall = function(){
    	stopIncoming();
        $rootScope.inCall = true;

        $scope.callConnecting = true;

        connect($rootScope.globals.currentUser.userdata.data.id, $rootScope.peer, $rootScope.call_type);
    }

    $scope.dropCall = function(){
        $rootScope.inCall = false;
        $rootScope.participantConnected = false;

        leaveRoomIfJoined();
    }

    function connect(patient, doctor, call_type) {
    	$rootScope.localParticipantComing = true;

        (call_type == 1) ? call_type = 'video' : call_type = 'audio';

        roomName = patient+'_'+doctor+'_'+call_type;

        token = document.getElementById('button-call').getAttribute('data-token');

        var connectOptions = {
            name: roomName,
            logLevel: 'debug'
        };

        if (previewTracks) {
            connectOptions.tracks = previewTracks;
        }

        // Join the Room with the token from the server and the
        // LocalParticipant's Tracks.
        Video.connect(token, connectOptions).then(roomJoined, function(error) {
            log('Could not connect to Twilio: ' + error.message);
        });

        document.getElementById('call-connected').style.display = 'block';
        document.getElementById('spin-wrapper').style.display = 'inline-flex';
        document.getElementById('button-preview').style.display = 'none';
    }

    // Successfully connected!
    function roomJoined(room) {
        window.room = activeRoom = room;

        // log("Joined as '" + identity + "'");
        document.getElementById('button-call').style.display = 'none';
        document.getElementById('button-call-end').style.display = 'inline';

        // Attach LocalParticipant's Tracks, if not already attached.
        var previewContainer = document.getElementById('local-media');
        if (!previewContainer.querySelector('video')) {
            attachParticipantTracks(room.localParticipant, previewContainer);
        }

        // Attach the Tracks of the Room's Participants.
        room.participants.forEach(function(participant) {
            log("Already in Room: '" + participant.identity + "'");
            var previewContainer = document.getElementById('remote-media');
            attachParticipantTracks(participant, previewContainer);
            if(angular.element(document.querySelector('#remote-media'))[0].children.length > 0){
                $rootScope.participantConnected = true;
                $scope.showInfo = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }else{
                $rootScope.participantConnected = false;
                $scope.showInfo = true;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        // When a Participant joins the Room, log the event.
        room.on('participantConnected', function(participant) {
            //document.getElementById('remote-media').style.display = 'inline';
            log("Joining: '" + participant.identity + "'");
            if(angular.element(document.querySelector('#remote-media'))[0].children.length > 0){
                $rootScope.participantConnected = true;
                $scope.showInfo = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }else{
                $rootScope.participantConnected = false;
                $scope.showInfo = true;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        // When a Participant adds a Track, attach it to the DOM.
        room.on('trackAdded', function(track, participant) {
            log(participant.identity + " added track: " + track.kind);
            var previewContainer = document.getElementById('remote-media');
            document.getElementById('spin-wrapper').style.display = 'none';
            document.getElementById('video-overlay').style.display = 'flex';
            attachTracks([track], previewContainer);
            if(angular.element(document.querySelector('#remote-media'))[0].children.length > 0){
                $rootScope.participantConnected = true;
                $scope.showInfo = false;

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }else{
                $rootScope.participantConnected = false;
                $scope.showInfo = true;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        // When a Participant removes a Track, detach it from the DOM.
        room.on('trackRemoved', function(track, participant) {
            log(participant.identity + " removed track: " + track.kind);
            detachTracks([track]);
            if(angular.element(document.querySelector('#remote-media'))[0].children.length > 0){
                $rootScope.participantConnected = true;
                $scope.showInfo = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }else{
                $rootScope.participantConnected = false;
                $scope.showInfo = true;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        // When a Participant leaves the Room, detach its Tracks.
        room.on('participantDisconnected', function(participant) {
            log("Participant '" + participant.identity + "' left the room");
            detachParticipantTracks(participant);
            if(angular.element(document.querySelector('#remote-media'))[0].children.length > 0){
                $rootScope.participantConnected = true;
                $scope.showInfo = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }else{
                $rootScope.participantConnected = false;
                $scope.showInfo = true;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        // Once the LocalParticipant leaves the room, detach the Tracks
        // of all Participants, including that of the LocalParticipant.
        room.on('disconnected', function() {
            log('Left');
            if (previewTracks) {
                previewTracks.forEach(function(track) {
                    track.stop();
                });
            }
            detachParticipantTracks(room.localParticipant);
            room.participants.forEach(detachParticipantTracks);
            activeRoom = null;
            document.getElementById('button-call').style.display = 'inline';
            document.getElementById('button-call-end').style.display = 'none';
            document.getElementById('spin-wrapper').style.display = 'none';
        });
    }

    // Preview LocalParticipant's Tracks.
    document.getElementById('button-preview').onclick = function() {
        var localTracksPromise = previewTracks
            ? Promise.resolve(previewTracks)
            : Video.createLocalTracks();

        localTracksPromise.then(function(tracks) {
            window.previewTracks = previewTracks = tracks;
            var previewContainer = document.getElementById('local-media');
            if (!previewContainer.querySelector('video')) {
                attachTracks(tracks, previewContainer);
            }
        }, function(error) {
            console.error('Unable to access local media', error);
            log('Unable to access Camera and Microphone');
        });
    };

    document.getElementById('mute').onclick = function() {
        room.localParticipant.audioTracks.disable();
    };

    // Leave Room.
    function leaveRoomIfJoined() {
        if (activeRoom) {
            activeRoom.disconnect();
        }
    }

    // Activity log.
    function log(message) {
        return false;
        var logDiv = document.getElementById('log');
        logDiv.innerHTML += '<p>&gt;&nbsp;' + message + '</p>';
        logDiv.scrollTop = logDiv.scrollHeight;
    }
});