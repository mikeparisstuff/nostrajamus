
/* Setup general page controller */
MetronicApp.controller('DiscoverController', ['$rootScope', '$scope', '$http', 'settings', 'trending', '$sce', '$location', '$anchorScroll', function($rootScope, $scope, $http, settings, trending, $sce, $location, $anchorScroll) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.trending = trending;

    var dayTracks = [];
    var weekTracks = [];
    var monthTracks = [];

    var now = new Date();
    var day = new Date();
    var week = new Date();
    var month = new Date();

    day.setDate(day.getDate()-1);
    week.setDate(week.getDate()-7);
    month.setDate(month.getDate()-30);

    // console.log(day);
    // console.log(week);
    // console.log(month);
    // console.log(now);

    day = Date.parse(day);
    week = Date.parse(week);
    month = Date.parse(month);
    now = Date.parse(now);

    for (var i=0; i < $scope.trending.length; i++) {
      // console.log($scope.trending[i].created_at);
      var timeCreated = new Date($scope.trending[i].created_at);
      timeCreated = Date.parse(timeCreated);
      // console.log(timeCreated);
//      if (month < timeCreated) {
        monthTracks.push($scope.trending[i]);
        if (month < timeCreated) {
          weekTracks.push($scope.trending[i]);
            if (week < timeCreated) {
                dayTracks.push($scope.trending[i]);
            }
        }
//      }
    }

    $scope.monthTracks = monthTracks;
    $scope.weekTracks = weekTracks;
    $scope.dayTracks = dayTracks;

    $scope.timeSelect = 'day';

    console.log($scope.monthTracks);
    console.log($scope.weekTracks);
    console.log($scope.dayTracks);

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


    // pagination
    $scope.currentPage = 0;
    $scope.pageSize = 3;

    $scope.numberOfPages=function() {
      if ($scope.timeSelect == 'day') {
        return Math.ceil($scope.dayTracks.length/$scope.pageSize);
      }
      else if ($scope.timeSelect == 'week') {
        return Math.ceil($scope.weekTracks.length/$scope.pageSize);
      }
      else if ($scope.timeSelect == 'month') {
        return Math.ceil($scope.monthTracks.length/$scope.pageSize);   
      }        
    };

}]);
