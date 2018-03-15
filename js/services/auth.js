app.factory('AuthenticationService', ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout',
    function(Base64, $http, $cookieStore, $rootScope, $timeout) {
        var service = {};

        service.Login = function(credentials, callback) {

            var login_request = $http({
                method: "post",
                url: "https://docdial-api.herokuapp.com/api/v1/login",
                data: credentials,
                headers: {
                    'x-api-key': 'doctordial'
                }
            });

            login_request.then(function successCallback(data) {
               
                callback(data);
                
            }, function errorCallback(data) {
                
                callback(data);

            });

        };

        service.SetCredentials = function(username, password, userdata) {
            var authdata = Base64.encode(username + ':' + password);

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    password: password,
                    userdata: userdata
                }
            };

            // $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function() {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            // $http.defaults.headers.common.Authorization = 'Basic ';
        };

        return service;
    }
]);