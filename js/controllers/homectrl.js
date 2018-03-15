app.controller('homeCtrl', function($rootScope, $scope, $http, $state, socket, $interval) {

    function parseCSV(file) {
        var url = "../../file.xls";

        var reader = new FileReader();
        reader.readAsText(file.files[0], "UTF-8");

        reader.onload = function(e) {
            // get file content  
            var csv = e.target.result;

            console.log(csv);

            // var allTextLines = csv.split(/\r\n|\n/);
            var allTextLines = csv.split('\n');
            var lines = [];
            for (var i = 0; i < allTextLines.length; i++) {
                var data = allTextLines[i].split(',');
                var tarr = {};
                for (var j = 0; j < data.length; j++) {
                    // console.log(j);
                    if (j == 0) {
                        tarr.music_title = data[j];
                        console.log(tarr);
                    }
                    if (j == 1) {
                        tarr.author = data[j];
                        console.log(tarr);
                    }
                }

                if (Object.size(tarr) > 1) {
                    lines.push(tarr);
                }

                console.log(data);
            }

            console.log(allTextLines);
            console.log(lines);

            // var scope = angular.element(document.getElementById("krosfade_container")).scope();
            // scope.order.mymusic = lines;

            // console.log(scope.order.mymusic);

            var appElement = document.querySelector('[ng-app="krosfadeApp"]');
            var $scope = angular.element(appElement).scope();

            $scope.$apply(function() {
                $scope.mymusic = lines;
            });

        }
    }

});