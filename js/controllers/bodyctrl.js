app.controller('bodyCtrl', function($rootScope, $scope, $http, $state, socket, $interval) {
    $scope.maps = function(){
        $state.go('maps');
    };

    $scope.piechart = function(){
        $state.go('piechart');
    };

    $scope.linechart = function(){
        $state.go('linechart');
    };

    $scope.barchart = function(){
        $state.go('barchart');
    };
    
    $scope.ourteam = function(){
        $state.go('ourteam');
    };
});