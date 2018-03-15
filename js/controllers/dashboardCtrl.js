app.controller('dashboardCtrl', function($scope, $state, $http, $rootScope, AuthenticationService, ChatService, utils, doctorDialUI, socket, $timeout) {
    $rootScope.innerflyoutOpen = false;
    $rootScope.mydoctors = [];
    $scope.inProcess = false;
    $scope.showNotification = false;
    $scope.showChat = false;
    $scope.showUserOption = false;
    var parsed_notifications = [];
    $rootScope.chatCount = 0;
    $scope.fadingAlert = false;
    $rootScope.inChat = false;

    var sb = new SendBird({
        appId: '7351E687-D16B-4DAA-BAC0-6F1663AB01F7'
    });
    
    sb.connect($rootScope.globals.currentUser.userdata.data.id, function(user, error) {

                var ChannelHandler = new sb.ChannelHandler();

                ChatService.pullChannels(sb, function(data){
                    console.log(data);
                    $rootScope.channellist = data;
    
                    ChannelHandler.onMessageReceived = function (channel, message) {
                        $rootScope.addChat(channel, message);

                        console.log($rootScope.inChat);

                        if(!$rootScope.inChat){
                            $scope.chatAlert = message;

                            $rootScope.chatCount++;

                            // $timeout(function(){
                            //     $scope.fadingAlert = true;
                            // }, 8000);

                            // $timeout(function(){
                            //     if (!$scope.chatHover) {
                            //         $scope.chatAlert = null;
                            //     }
                            // }, 11000);
                        }
                    }

                    sb.addChannelHandler('chatUpdater', ChannelHandler);
                    
                    $scope.$apply();
                });
            });

    socket.on('connect', function (data) {
    });

    socket.on('disconnect', function (data) {
        console.log('User disconnected from default namespace');
    });

    socket.emit("NotificationCount", $rootScope.globals.currentUser.userdata.data.id);

    socket.on("RequestNotification", function(notyId) {
        socket.emit("Notification", notyId);
        console.log(notyId);
    });

    socket.on("NotificationReceived", function(data) {
        // notification.next(JSON.parse(data));
        console.log(data);
    });

    socket.on("NotificationCountReceived", function(data) {
        $scope.notificationCount = JSON.parse(data).count;
    });

    socket.on("RequestNotificationCount", function(userId) {
        socket.emit("NotificationCount", userId);
        console.log(userId);
    });

    socket.on("OpenedNotificationReceived", function(data) {
        // openedNotification.next(JSON.parse(data));
        console.log(data);
    });

    $http({
        method: 'GET',
        url: 'https://docdial-api.herokuapp.com/api/v1/specialties?all=true'
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        $rootScope.specialties_online = response.data.data;

        var specialties = [];

        for(var i = 0; i < $rootScope.specialties_online.length; i++){
            specialties[$rootScope.specialties_online[i]._id] = $rootScope.specialties_online[i];
        }

        $rootScope.specialties = specialties;

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });

    $rootScope.addChat = function(channel, message){
        console.log(channel, message);
    }

    $scope.keepChatAlertActive = function(){
        $scope.chatHover = true;
    }

    $scope.makeChatAlertInactive = function(){
        $scope.chatHover = false;

        $timeout(function(){
            if (!$scope.chatHover) {
                $scope.chatAlert = null;
            }
        }, 3000);
    }

    $scope.loadDoctors = function(){
        var populate = [{
                            path:"doctor",
                            populate:{
                                path:"specialties"
                            }
                        },
                        {
                            path:"doctor",
                            populate:{
                                path:"user"
                            }
                        }];

        $http({
            method: 'GET',
            url: 'https://docdial-api.herokuapp.com/api/v1/patient-doctors?patient='+$rootScope.globals.currentUser.userdata.data.patient+'&all=true&populate='+JSON.stringify(populate),
            headers: {
                        'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                    }
        }).then(function successCallback(response) {

            $rootScope.mydoctors = response.data.data;

            var my_doctors_id = [];

            for (var i = 0; i < $rootScope.mydoctors.length; i++) {
                $rootScope.mydoctors[i].doctor.pd_id = $rootScope.mydoctors[i]._id;
                my_doctors_id.push($rootScope.mydoctors[i].doctor);
            }

            $rootScope.my_doctors = my_doctors_id;

        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    $scope.loadDoctors();

    $scope.loadAllDoctors = function(){
        var populate = [{
                            path:"user",
                            populate: {
                                path: "doctor",
                                populate: {
                                    path: "user"
                                }
                            }
                        },
                        {
                            path:"specialties"
                        }];

        $http({
            method: 'GET',
            url: 'https://docdial-api.herokuapp.com/api/v1/doctors?&all=true&populate='+JSON.stringify(populate),
            headers: {
                        'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                    }
        }).then(function successCallback(response) {

            $rootScope.all_doctors = response.data.data;

        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    $scope.loadAllDoctors();

    var populate = [{
                        path: 'user'
                    },
                    {
                        path: 'origin'
                    }]

    $http({
        method: 'GET',
        url: 'https://docdial-api.herokuapp.com/api/v1/notifications',
        params: {
            user: $rootScope.globals.currentUser.userdata.data.id,
            all: true,
            populate: JSON.stringify(populate)
        }
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available

        var notifications = response.data.data;

        for(var i = 0; i < notifications.length; i++){
            parsed_notifications.push(parseNotification(notifications[i]));
        }

        $scope.notifications = parsed_notifications;

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });

    function getFullName(value){
        var doctor_name;

        if(value.doctor){
            doctor_name = "Dr. "+value.full_name;
        }else{
            doctor_name = value.full_name;
        }

        return "<b>"+doctor_name+"</b>";
    }

    function parseNotification(notification){

        var result = {};

        switch (notification.type) {
            case 0:
                result.icon = "notifications";
                result.badge = "Welcome!";
                result.content = "Hello "+getFullName(notification.user)+", welcome to DoctorDial!";
                result.url = "/dashboard";
                break;
            case 1:
                result.icon = "date_range";
                result.badge = "Appointment request";
                result.content = "You have a new appointment request from "+getFullName(notification.origin);
                result.url = "/desk/doctor-appointments/" + notification.content.appointment + "/details";
                break;
            case 2:
                result.icon = "date_range";
                result.badge = "Appointment approved";
                result.content = getFullName(notification.origin)+" approved your appointment request";
                result.url = "/users/appointments/" + notification.content.appointment + "/details";
                break;
            case 8:
                result.icon = "question_answer";
                result.badge = "New answer to your question";
                result.content = getFullName(notification.origin)+" posted an answer";
                result.url = "/questions/time-line/" + notification.content.question;
                break;
        }

        if(notification.origin){
            result.origin = getFullName(notification.origin);
        }

        result._id = notification._id;
        result.seen = notification.seen;
        result.opened = notification.opened;
        result.time = notification.createdAt;

        return result;

    }

    $scope.addDoctor = function(doctor) {
        $scope.inProcess = true;

        var details = {
                        "doctor": doctor._id,
                        "patient": $rootScope.globals.currentUser.userdata.data.patient
                    };

                    console.log(details);

        var add_doctor_request = $http({
            method: "post",
            url: "https://docdial-api.herokuapp.com/api/v1/patient-doctors",
            data: details,
            headers:    {
                            'Content-Type': 'application/json',
                            'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                        }
        }).then(function successCallback(data) {
            $scope.inProcess = false;
           
            if(data.data._meta.status_code === 200){

                doctor.pd_id = data.data.data._id;
                $rootScope.my_doctors.push(doctor);

                console.log(data);
                console.log(data.data.data._id);

            }else{

                console.log(data);
           
            }
            
        }, function errorCallback(data) {
            
            $scope.inProcess = false;
            console.log(data);

        });
    };

    $scope.removeDoctor = function(doctor) {
        $scope.inProcess = true;

        var doctor = utils.inArrayFull(doctor._id, $rootScope.my_doctors);

        console.log(doctor);

        var remove_doctor_request = $http({
            method: "delete",
            url: "https://docdial-api.herokuapp.com/api/v1/patient-doctors/"+doctor.pd_id,
            headers:    {
                            'Content-Type': 'application/json',
                            'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                        }
        }).then(function successCallback(data) {
            $scope.inProcess = false;

            if(data.data._meta.status_code === 200){

                $rootScope.mydoctors.splice(doctor);
                $rootScope.my_doctors.splice(doctor.doctor);

                console.log(data);

            }else{

                console.log(data);
           
            }
            
        }, function errorCallback(data) {
            
            $scope.inProcess = false;
            console.log(data);

        });
    };

    $scope.getInitials = function(fullname){
        return doctorDialUI.getInitials(fullname);
    }

    $scope.getColor = function(fullname){
        return doctorDialUI.getColor(fullname);
    }

    $scope.inArray = function(needle, haystack){
        return utils.inArray(needle, haystack);
    }

    $scope.viewDoctor = function(doctor){
        $state.go('doctor', {doctor: doctor});
    }

    $scope.openFlyout = function(){
        $rootScope.innerflyoutOpen = !$rootScope.innerflyoutOpen;
    }

    $scope.closeFlyout = function(){
        $rootScope.innerflyoutOpen = false;
    }

    $scope.home = function(){
        $state.go('home');
    }

    $scope.accounthome = function(){
        $state.go('account');
    }

	$scope.consult = function(){
		$state.go('consult');
	}

    $scope.chatList = function(){
        if($rootScope.showThreadList){
            $rootScope.showThreadList = false;
        }else{
            $state.go('chat');
        }
    }

    $scope.askaquestion = function(){
        $state.go('question');
    }

    $scope.healthtips = function(){
        $state.go('healthtips');
    }

    $scope.myProfile = function(){
        $state.go('profile');
    }

    $scope.changePassword = function(){
        $state.go('password-change');
    }

    $scope.myDoctors = function(){
        $state.go('mydoctors');
    }

    $scope.myAppointments = function(){
        $state.go('appointments');
    }

    $scope.login = function(){
        $state.go('container.login');
    }

	$scope.logout = function(){
        AuthenticationService.ClearCredentials();
        $state.go('login');
	}

    $scope.signup = function(){
        $state.go('container.signup');
    }

    $rootScope.schedule = function(doctor){
        $state.go('appointment', {doctor: doctor});
    }

    $scope.formatDate = function(date, wordy) {

        return utils.formatDate(date, wordy);
        
    }

    $scope.formatTime = function(time) {

        return utils.formatTime(time);
        
    }

    $rootScope.chat = function(doctor_id, doctor_name){
        console.log(doctor_id, doctor_name);
        var doctor = {id: doctor_id, name: doctor_name};

        $state.go('chat', {doctorData: doctor});
        $rootScope.showThreadList = true;
    }

    $scope.showNotifications = function(){
        $scope.showNotification = !$scope.showNotification;
        $scope.showUserOption = false;
        $scope.showChat = false;
    }

    $scope.showChats = function(){
        $scope.showChat = !$scope.showChat;
        $scope.showUserOption = false;
        $scope.showNotification = false;
    }

    $scope.showUserOptions = function(){
        $scope.showUserOption = !$scope.showUserOption;
        $scope.showNotification = false;
        $scope.showChat = false;
    }

    $scope.updateAccount = function(){
        $scope.onSaving = true;

        $scope.personalUser.first_name = $rootScope.globals.currentUser.userdata.data.first_name;

        $http({
            method: "put",
            url: "https://docdial-api.herokuapp.com/api/v1/users/"+$rootScope.globals.currentUser.userdata.data._id,
            data: $scope.personalUser,
            headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                    }
        }).then(function successCallback(data) {
            console.log($rootScope.globals);
            console.log(data);
            
            $scope.onSaving = true;
           
            if(data.data._meta.status_code === 200){

                $scope.showStatus = 'Data Updated';
                $scope.successStatus = true;

                $timeout(function(){
                    $scope.onSaving = false;
                }, 2000);

                $rootScope.globals.currentUser.userdata.data.first_name = $scope.personalUser.first_name;
                $rootScope.globals.currentUser.userdata.data.last_name = $scope.personalUser.last_name;

                $cookieStore.put('globals', $rootScope.globals);

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
});