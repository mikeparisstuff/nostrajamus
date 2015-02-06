
/* Setup general page controller */
MetronicApp.controller('LeaderboardController', ['$rootScope', '$scope', '$http', 'settings', 'leaders', 'trending', '$sce', '$location', '$anchorScroll', function($rootScope, $scope, $http, settings, leaders, trending, $sce, $location, $anchorScroll) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();
    	// set default layout mode
      $rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.leaders = leaders;
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
      if (month < timeCreated) {
        monthTracks.push($scope.trending[i]);
        if (week < timeCreated) {
          weekTracks.push($scope.trending[i]);
          if (day < timeCreated) {
            dayTracks.push($scope.trending[i]);
          }
        }
      }
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

    $scope.gotoTastemakers = function() {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash('tastemakers');

      // call $anchorScroll()
      $anchorScroll();
    };

    $scope.gotoUpcomingJams = function(x) {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash('upcomingjams');

      // call $anchorScroll()
      $anchorScroll();
    };

    $scope.getProfilePicture = function(pic) {
      var src = '';
        
      if (pic == null) {
            // var randomPic = Math.random()*100;
            // if (randomPic < 100/3) {
            //     return src = '/assets/admin/pages/media/profile/profile-landscape.jpg';
            // }
            // else if (randomPic >= 100/3 && randomPic <= 200/3) {
            //     return src = '/assets/admin/pages/media/profile/profile-swan.jpg';
            // }
            // else if (randomPic > 200/3) {
            //     return src = '/assets/admin/pages/media/profile/profile-car.jpg'; 
            // }
            return src = '/assets/admin/pages/media/profile/profile-car.jpg';
      }
      else {
        return pic;
      }
    };

    // pagination
    $scope.currentPage = 0;
    $scope.pageSize = 3;

    $scope.numberOfPages=function() {
        return Math.ceil($scope.trending.length/$scope.pageSize);                
    };

}]);
