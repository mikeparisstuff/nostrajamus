
/* Setup general page controller */
MetronicApp.controller('OpenContestsController', ['$rootScope', '$scope', 'settings', 'contestInfo', 'contestEntries', 'myData', '$http', '$sce', function($rootScope, $scope, settings, contestInfo, contestEntries, myData, $http, $sce) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.contestInfo = contestInfo;
    $scope.contestEntries = contestEntries;
    $scope.myData = myData;

    $scope.contestInfo.start_time = new Date($scope.contestInfo.start_time).toString();
    $scope.contestInfo.end_time = new Date($scope.contestInfo.end_time).toString();

	// Start Countdown Timer
	// set the date we're counting down to
	var target_date = new Date($scope.contestInfo.start_time).getTime();
	var time_now = Date.now();

	// variables for time units
	var days, hours, minutes, seconds;
	// get tag element
	// var countdown = document.getElementById('countdown');

    // update the tag with id "countdown" every 1 second
	setInterval(function () {
	    // find the amount of "seconds" between now and target
	    var current_date = new Date().getTime();

	    var seconds_left = (target_date - current_date) / 1000;

	    // do some time calculations
	    days = parseInt(seconds_left / 86400);
	    seconds_left = seconds_left % 86400;

	    hours = parseInt(seconds_left / 3600);
	    seconds_left = seconds_left % 3600;

	    minutes = parseInt(seconds_left / 60);
	    seconds = parseInt(seconds_left % 60);

	    // format countdown string + set tag value
	    document.getElementById('countdown-open').innerHTML = '<span class="days">' + days + ' <b>Days</b></span> <span class="hours">' + hours + ' <b>Hours</b></span> <span class="minutes">' + minutes + ' <b>Minutes</b></span> <span class="seconds">' + seconds + ' <b>Seconds</b></span>';

	}, 1000);
	// End Countdown Timer

	// SoundCloud
	SC.initialize({
        client_id: 'f0b7083f9e4c053ca072c48a26e8567a'
    });
	var url = "https://api.soundcloud.com/tracks";
	$scope.getTracks = function(val) {
	    return $http.get(url, {
	      params: {
	      	client_id: "f0b7083f9e4c053ca072c48a26e8567a",
	        q: val,
	      }
	    }).then(function(response){
	    	// console.log(response);
	    	return response.data;
	      // return response.data.map(function(item){
	      //   return {
	      //   	"label": item.title,
	      //   	"select": item
	      //   }
	      // });
	    });
  	};

  	$scope.onSelect = function(item, model, label) {
  		console.log(item);
  		$scope.track = item;

  		var SCUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + item.id + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';

    	var trustedUrl = $sce.trustAsResourceUrl(SCUrl);

    	$scope.track_url = trustedUrl;

    	// var trackFrame = '<iframe width="100%" height="83" scrolling="no" frameborder="no" ng-src="' + SCUrl + '"></iframe>';

    	// document.getElementById("sc-embed").innerHTML = trackFrame;
  	}

  	$scope.postTrack = function(track) {
  		$http({
            url: '/api/contests/' + $scope.contestInfo.id + '/enter/' ,
            method: "POST",
            data:
            {
            	"track": track
            },
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
                alert("Thanks for submitting!");
            }).error(function (data, status, headers, config) {
                // $scope.status = status;
                alert("Try again.");
            });
  	}

 //    $scope.getTracks = function(val) {
	// 	return SC.get('/tracks', {q: val}, function(tracks) {
	//         // alert(tracks);
	//         var titles = [];
	//         for (var i = 0; i < tracks.length; i++) {
	//             if (i > 20) { break; }
	//             var item = { label: tracks[i].title, value: tracks[i] };
	//             titles[i] = item;
	//         }
	//         return titles;
 //    	});    	
	// };

    // SC.get('/tracks', {q: $scope.autocomplete}, function(tracks) {
    //     // alert(tracks);
    //     var titles = [];
    //     for (var i = 0; i < tracks.length; i++) {
    //         if (i > 20) { break; }
    //         var item = { label: tracks[i].title, value: tracks[i] };
    //         titles[i] = item;
    //     }
    //     return titles;
    // });

}]);
