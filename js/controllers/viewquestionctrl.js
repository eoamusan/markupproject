app.controller('viewQuestionCtrl', function($rootScope, $scope, $http, $state, $timeout, $stateParams, utils) {
    console.log($stateParams);
    console.log($stateParams.question);
    console.log($stateParams.questionobject);
    console.log(utils.objectIsEmpty($stateParams.questionobject));

	$scope.getQuestion = function(questionid){
		$http({
	        method: 'GET',
	        url: 'https://docdial-api.herokuapp.com/api/v1/questions/'+questionid,
	        headers: 	{
                        	'x-access-token': $rootScope.globals.currentUser.userdata._meta.token
                    	}
	    }).then(function successCallback(response) {

	        // this callback will be called asynchronously
	        // when the response is available

	        $scope.viewedQuestion = response.data.data;
	        $scope.getResponses(response.data.data);


	    }, function errorCallback(response) {
	        // called asynchronously if an error occurs
	        // or server returns response with an error status.
	    });

	}

    if(utils.objectIsEmpty($stateParams.questionobject)){
    	console.log('Question object not existing');

    	$scope.getQuestion($stateParams.question);
    	$rootScope.showThreadList = true;
    }else{
    	$scope.viewedQuestion = $stateParams.questionobject;
    }
});