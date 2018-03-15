app.controller('blogCtrl', function($rootScope, $scope, $http, $state) {
    $http({
        method: 'GET',
        url: 'https://doctordial.com.ng/wp-json/wp/v2/posts?_embed'
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        $scope.wordpress_posts = response.data;

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
});