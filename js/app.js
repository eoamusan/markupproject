var app = angular.module("markupApp", ["ui.router", "ngSanitize", "ngCookies", "ui.bootstrap"]);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    $urlRouterProvider.otherwise('/');

    $httpProvider.interceptors.push('BasicAuthInterceptorService');

    $stateProvider

        .state('body', {
            templateUrl : "views/body.html",
            controller: 'bodyCtrl'
        })

        .state('home', {
            url: '/',
            parent: 'body',
            views: {
                'main-view@body': {
                    templateUrl : "views/home.html",
                    controller: 'homeCtrl'
                }
            }
            
        })

});

app.run(function($rootScope, $state, AuthenticationService, $cookieStore, $location, $http) {

    $rootScope.globals = $cookieStore.get('globals') || {};

    var routes_nloggedin = ['/login', '/signup/patient', '/signup/doctor'];
    var routes_loggedin = ['/account', '/account/doctors', '/question', '/password-change', '/consult'];

    if ($rootScope.globals.currentUser) {
        var credentials = {
            username: $rootScope.globals.currentUser.username,
            password: $rootScope.globals.currentUser.password
        };

        AuthenticationService.Login(credentials, function(data){

            if(data.data._meta.status_code === 200){

                AuthenticationService.SetCredentials(credentials.username, credentials.password, data.data);

                if(!data.data.data.account_verified){
                    $state.go('verify', {token: data.data._meta.token});
                }

            }else{

                console.log('Should be cleared here');

                $rootScope.globals = {};
                $cookieStore.remove('globals');
                $state.go('login');

            }

        });
    }

    $rootScope.$on('$locationChangeStart', function(event, toState, toParams, fromState, fromParams) {

        if ((routes_nloggedin.indexOf($location.path()) !== -1) && $rootScope.globals.currentUser) {
            // User isn’t authenticated
            console.log('User is authenticated');

            $state.go("account");
            event.preventDefault();
        }

        if ((routes_loggedin.indexOf($location.path()) !== -1) && !$rootScope.globals.currentUser) {
            // User isn’t authenticated
            console.log('User isn’t authenticated');

            $state.go("login");
            event.preventDefault();
        }
    });
});