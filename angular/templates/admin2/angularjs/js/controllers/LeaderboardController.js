
/* Setup general page controller */
MetronicApp.controller('LeaderboardController', ['$rootScope', '$scope', '$http', 'settings', 'contest_entries', 'tracks', function($rootScope, $scope, $http, settings, contest_entries, tracks) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	$scope.contest_entries = contest_entries;
    	$scope.tracks = tracks;

    	// Sort TASTEMAKERS by Jam Points
    	$scope.getLeaders = function(leadersObj) {
    		leadersObj.sort(function(a, b) { 
			    return a.jam_points - b.jam_points;
			})
			return leadersObj;
		};

    	// Sort SONGS by Jam Points
    	$scope.getTrending = function(entriesObj) {
    		entriesObj.sort(function(a, b) { 
			    return a.jam_points - b.jam_points;
			})

    		var trackIDs = [];
    		console.log(entriesObj.length);

    		for (var i = 0; i < entriesObj.length; i++) {
    			var url = entriesObj[i].track;
    			console.log(url);
    			var category = "";
				var matches = url.match(/\/api\/(.*)$/);
				if (matches) {
				    category = matches[1];   // "whatever"
				}

				console.log("/api/" + category);
				var endpoint = "/api/" + category;

				// trackIDs.push(getTrackID(i, endpoint));
            }

            console.log(trackIDs);

			return trackIDs;
		};

		// var getTrackID = function(i, endpoint){
		//   $http.get(endpoint)
		//     .success(function(data) {
		//       console.log('Test');
		//       console.log('i is ', i);
		//       // console.log($scope.comments[i].id);
		//       return data;
		//   	})
		//   	.error(function(data) {
		//   		console.log("The request isn't working");
		//   	});
		// }

    	// console.log($scope.contest_entries.results);

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });
}]);
