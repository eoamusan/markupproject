app.factory('ChatService', ['$rootScope',
    function($rootScope) {
        var service = {};

        service.pullChannels = function(sb, callback){

            var channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
            channelListQuery.includeEmpty = true;
            channelListQuery.limit = 20; // pagination limit could be set up to 100

            if (channelListQuery.hasNext) {
                channelListQuery.next(function(channelList, error){
                    if (error) {
                        console.error(error);
                        return;
                    }
                    
                    for(var i = 0; i < channelList.length; i++){
                        // console.log(channelList[i].leave());

                        for(var j = 0; j < channelList[i]['members'].length; j++){
                            if(channelList[i]['members'][j]['userId'] !== $rootScope.globals.currentUser.userdata.data.id){
                                channelList[i]['peer'] = channelList[i]['members'][j];
                            }
                        }
                    }

                    callback(channelList);
                });
            }
        }

        return service;
    }
]);