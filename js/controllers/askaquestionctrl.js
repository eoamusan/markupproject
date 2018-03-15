app.controller('askAQuestionCtrl', function($rootScope, $scope, $http, $state, $timeout) {
    $scope.openQuestion = true;
    $scope.sending_status = "notsending";
    $scope.refreshingQuestions = false;
    $rootScope.showThreadList = false;

    console.log($rootScope.globals);

    $scope.openInput = function(){
    	$scope.openQuestion = !$scope.openQuestion;
    }

    $scope.refreshQuestions = function(){
    	$scope.refreshingQuestions = true;
    	$scope.getQuestions();
    }

    $scope.getQuestions = function(){
		$http({
	        method: 'GET',
	        url: 'https://docdial-api.herokuapp.com/api/v1/questions?user='+$rootScope.globals.currentUser.userdata.data.id+'&all=true',
	        headers: 	{
                        	'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                    	}
	    }).then(function successCallback(response) {

	        // this callback will be called asynchronously
	        // when the response is available

	        console.log(response);
	        $scope.refreshingQuestions = false;
	        $scope.questions = response.data.data;

	        angular.forEach($scope.questions, function(question) {
	            $scope.getResponses(question);
	        });

	        if(response.data.data.length > 0){
		        $state.go('viewquestion', {question: $scope.questions[$scope.questions.length - 1].id, questionobject: $scope.questions[$scope.questions.length - 1]});
		    }

	        $scope.activeQuestion = 0;

	    }, function errorCallback(response) {
	        // called asynchronously if an error occurs
	        // or server returns response with an error status.
	        $scope.refreshingQuestions = false;
	    });
	}

	$scope.viewQuestions = function(question){
		$state.go('viewquestion', {question: question.id, questionobject: question});
		$rootScope.showThreadList = true;
	}

	$scope.viewAllQuestions = function(){
		$rootScope.showThreadList = false;
	}

	$scope.setActive = function(question){
		$scope.activeQuestion = question;
	}

	$scope.getResponses = function(question){
		var populate = [
							{
								path:"user"
							}
						];

		$http({
	        method: 'GET',
	        // url: 'https://docdial-api.herokuapp.com/api/v1/questions/'+question.id+'/response',
	        url: 'https://docdial-api.herokuapp.com/api/v1/question-responses?question='+question.id+'&populate='+JSON.stringify(populate)+'&all=true',
	        headers: 	{
                        	'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                    	}
	    }).then(function successCallback(response) {

	        // this callback will be called asynchronously
	        // when the response is available
	        var length = response.data.data.length;
	        var responses = formatResponses(response.data.data);
	        question.no_of_responses = length;
	        question.responses = responses;

	    }, function errorCallback(response) {
	        // called asynchronously if an error occurs
	        // or server returns response with an error status.
	    });
	}

    $scope.askQuestion = function(){
    	$scope.sending_status = "sending";

    	var question = {
				    		body: $scope.questionterm,
				    		user: $rootScope.globals.currentUser.userdata.data.id
				    	};

    	var ask_question = $http({
            method: "post",
            url: "https://docdial-api.herokuapp.com/api/v1/questions",
            data: question,
            headers: {
                'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
            }
        });

        ask_question.then(function successCallback(data){
			
			console.log(data);

            $timeout(function(){
            	$scope.sending_status = "sent";
            	$scope.questionterm = "";
            }, 500);

            $timeout(function(){
            	$scope.sending_status = "notsending";
            }, 5000);

            $scope.getQuestions();

        }, function errorCallback(data){

            $scope.onLoading = false;

        });
    }

    function formatResponses(responses){

    	console.log(responses);
		var formatted_responses = {};

		for (var i = 0; i < responses.length; i++) {
        	if(!formatted_responses.hasOwnProperty(responses[i].user._id)){
	        	formatted_responses[responses[i].user._id] = {};
	        }

        	formatted_responses[responses[i].user._id].user_id = responses[i].user.id;
        	formatted_responses[responses[i].user._id].user_fullname = responses[i].user.full_name;

        	if(formatted_responses[responses[i].user._id].responses == undefined){
	        	formatted_responses[responses[i].user._id].responses = [];
	        	formatted_responses[responses[i].user._id].responses.push(responses[i].body);
	        }else{
	        	formatted_responses[responses[i].user._id].responses.push(responses[i].body);
	        }
        }

        return formatted_responses;
	}

    $scope.getQuestions();
});