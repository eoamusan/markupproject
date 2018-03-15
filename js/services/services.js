app.factory('clickAnywhereButHereService', function($document) {
    var tracker = [];

    return function($scope, expr) {
        var i, t, len;
        for (i = 0, len = tracker.length; i < len; i++) {
            t = tracker[i];
            if (t.expr === expr && t.scope === $scope) {
                return t;
            }
        }
        
        var handler = function() {
            $scope.$apply(expr);
        };

        $document.on('click', handler);

        // IMPORTANT! Tear down this event handler when the scope is destroyed.
        $scope.$on('$destroy', function() {
            $document.off('click', handler);
        });

        t = { scope: $scope, expr: expr };
        tracker.push(t);
        return t;
    };
});

app.factory('utils', function () {
    return {

        inArray: function(needle, haystack) {
            if(haystack != undefined){
                var length = haystack.length;

                for(var i = 0; i < length; i++) {
                    if(haystack[i]._id == needle) return true;
                }
            }

            return false;
        },

        inArrayFull: function(needle, haystack) {
            if(haystack != undefined){
                var length = haystack.length;

                for(var i = 0; i < length; i++) {
                    if(haystack[i]._id == needle) return haystack[i];
                }
            }

            return false;
        },

        objectIsEmpty: function(obj) {
            for(var prop in obj) {
                if(obj.hasOwnProperty(prop))
                    return false;
            }

            return JSON.stringify(obj) === JSON.stringify({});
        },

        formatDate: function(date, wordy){
            var months_of_the_year = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            date = new Date(date);

            var day = date.getDate();
            var monthIndex = date.getMonth();
            var monthWord = months_of_the_year[date.getMonth()];
            var year = date.getFullYear();

            if(wordy){
                return day + ' ' + monthWord + ', ' + year;
            }else{
                return year + '-' + (monthIndex + 1) + '-' + day;
            }
        },

        formatTime: function(time){
            var hours = time.split(':')[0].split('T')[1];
            var minutes = time.split(':')[1];

            var amPM = (hours > 11) ? "pm" : "am";

            return ((hours > 12) ? (hours % 12) : hours) + ':' + minutes + ' ' + amPM;
        }

    };
});

app.factory('doctorDialUI', function () {
    return {

        getInitials: function (fullname) {

            if (fullname) {
                return fullname.split(' ')[0].charAt(0)+fullname.split(' ')[1].charAt(0);
            }else{
                return 'NA';
            }
        },

        getColor: function (fullname) {

            // $scope.getColor = function(fullname){
                if (fullname) {
                    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    var colorpalette = ['#96ceb4','#ff6f69','#ffcc5c','#88d8b0','#0F5959', '#571845', '#900C3E', '#C70039', '#FF5733', '#FFC300'];

                    return colorpalette[alphabet.indexOf(fullname.charAt(0).toUpperCase()) % 10];
                }else{
                    return '#000';
                }
            // }
        }

    };
});