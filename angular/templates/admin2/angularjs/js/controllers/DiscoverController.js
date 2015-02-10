
/* Setup general page controller */
MetronicApp.controller('DiscoverController', ['$rootScope', '$scope', '$http', 'settings', 'trending', '$sce', '$location', '$anchorScroll', function($rootScope, $scope, $http, settings, trending, $sce, $location, $anchorScroll) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.trending = trending;
    // console.log($scope.trending);

    $scope.timeSelect = 'weekly';

    // pagination
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.numberOfPages=function() {
        return Math.ceil($scope.trending.count/$scope.pageSize);                
    };

    $scope.getWeekly = function() {
      if ($scope.timeSelect == 'weekly') {
        return;
      }
      else {
        $scope.timeSelect = 'weekly';

        $http({
            url: '/api/tracks/trending/?filter=' + $scope.timeSelect + "&page=1",
            method: "GET",
            // data: JSON.stringify($scope.form),
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // console.log(data);
            $scope.trending = data;
            // console.log($scope.trending);
            // console.log("SUCCESS");
        }).error(function (data, status, headers, config) {
            // $scope.status = status;
            // console.log(data);
            // console.log("FAILURE");
        });

        $scope.currentPage = 1;
      }
    }

    $scope.getMonthly = function() {
      if ($scope.timeSelect == 'monthly') {
        return;
      }
      else {
        $scope.timeSelect = 'monthly';

        $http({
            url: '/api/tracks/trending/?filter=' + $scope.timeSelect + "&page=1",
            method: "GET",
            // data: JSON.stringify($scope.form),
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // console.log(data);
            $scope.trending = data;
            // console.log($scope.trending);
            // console.log("SUCCESS");
        }).error(function (data, status, headers, config) {
            // $scope.status = status;
            // console.log(data);
            // console.log("FAILURE");
        });

        $scope.currentPage = 1;
      }
    }

    $scope.getAllTime = function() {
      if ($scope.timeSelect == 'alltime') {
        return;
      }
      else {
        $scope.timeSelect = 'alltime';

        $http({
            url: '/api/tracks/trending/?filter=' + $scope.timeSelect + "&page=1",
            method: "GET",
            // data: JSON.stringify($scope.form),
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // console.log(data);
            $scope.trending = data;
            // console.log($scope.trending);
            // console.log("SUCCESS");
        }).error(function (data, status, headers, config) {
            // $scope.status = status;
            // console.log(data);
            // console.log("FAILURE");
        });

        $scope.currentPage = 1;
      }
    }

    $scope.prevPage = function() {
        $scope.currentPage = $scope.currentPage - 1;

        // console.log($scope.currentPage);

        $http({
            url: '/api/tracks/trending/?filter=' + $scope.timeSelect + "&page=" + $scope.currentPage,
            method: "GET",
            // data: JSON.stringify($scope.form),
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // console.log(data);
            $scope.trending = data;
            console.log($scope.trending);
            // console.log("SUCCESS");
        }).error(function (data, status, headers, config) {
            // $scope.status = status;
            // console.log(data);
            // console.log("FAILURE");
        });
    }

    $scope.nextPage = function() {
        $scope.currentPage = $scope.currentPage + 1;

        console.log($scope.currentPage);

        $http({
            url: '/api/tracks/trending/?filter=' + $scope.timeSelect + "&page=" + $scope.currentPage,
            method: "GET",
            // data: JSON.stringify($scope.form),
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // console.log(data);
            $scope.trending = data;
            console.log($scope.trending);
            // console.log("SUCCESS");
        }).error(function (data, status, headers, config) {
            // $scope.status = status;
            // console.log(data);
            // console.log("FAILURE");
        });
    }

//     var dayTracks = [];
//     var weekTracks = [];
//     var monthTracks = [];

//     var now = new Date();
//     var day = new Date();
//     var week = new Date();
//     var month = new Date();

//     day.setDate(day.getDate()-1);
//     week.setDate(week.getDate()-7);
//     month.setDate(month.getDate()-30);

//     // console.log(day);
//     // console.log(week);
//     // console.log(month);
//     // console.log(now);

//     day = Date.parse(day);
//     week = Date.parse(week);
//     month = Date.parse(month);
//     now = Date.parse(now);

//     for (var i=0; i < $scope.trending.length; i++) {
//       // console.log($scope.trending[i].created_at);
//       var timeCreated = new Date($scope.trending[i].created_at);
//       timeCreated = Date.parse(timeCreated);
//       // console.log(timeCreated);
// //      if (month < timeCreated) {
//         monthTracks.push($scope.trending[i]);
//         if (month < timeCreated) {
//           weekTracks.push($scope.trending[i]);
//             if (week < timeCreated) {
//                 dayTracks.push($scope.trending[i]);
//             }
//         }
// //      }
//     }

//     $scope.monthTracks = monthTracks;
//     $scope.weekTracks = weekTracks;
//     $scope.dayTracks = dayTracks;

//     $scope.timeSelect = 'day';

//     console.log($scope.monthTracks);
//     console.log($scope.weekTracks);
//     console.log($scope.dayTracks);

    $scope.getPlayIncrease = function(track) {
  		// get play count increase
  		var currPlayCount = track.current_playback_count;
  		var initPlayCount = track.initial_playback_count;

  		var playIncrease = (((currPlayCount - initPlayCount) / (initPlayCount)) * 100).toFixed(2);

  		return playIncrease;
    };

    $scope.getFollowIncrease = function(track) {
  		// get follower count increase
  		var currFollowCount = track.current_follower_count;
  		var initFollowCount = track.initial_follower_count;
  		
  		var followIncrease = ((currFollowCount - initFollowCount) / (initFollowCount)) * 100;

  		return followIncrease;
    };

    $scope.getSrc = function(track) {
    	var SCUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + track.track.sc_id + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';

    	var trustedUrl = $sce.trustAsResourceUrl(SCUrl);

    	return trustedUrl;
    };

}]);
