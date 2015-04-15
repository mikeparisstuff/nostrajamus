
/* Setup general page controller */
MetronicApp.controller('LeaderboardController', ['$rootScope', '$scope', '$http', 'settings', 'leaders', '$sce', '$location', '$anchorScroll', 'globalPlayerService', 'homeService', 'api', '$state', function($rootScope, $scope, $http, settings, leaders, $sce, $location, $anchorScroll, globalPlayerService, homeService, api, $state) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();
    	// set default layout mode
      $rootScope.settings.layout.pageSidebarClosed = true;
    });

    $scope.leaders = leaders;
    $scope.api = api;

    function chunk(arr, size) {
      var newArr = [];
      for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
      }
      return newArr;
    }

    $scope.chunkedLeaders = chunk($scope.leaders, 5);

    // $scope.gotoTastemakers = function() {
    //   // set the location.hash to the id of
    //   // the element you wish to scroll to.
    //   $location.hash('tastemakers');

    //   // call $anchorScroll()
    //   $anchorScroll();
    // };

    // $scope.gotoUpcomingJams = function(x) {
    //   // set the location.hash to the id of
    //   // the element you wish to scroll to.
    //   $location.hash('upcomingjams');

    //   // call $anchorScroll()
    //   $anchorScroll();
    // };

    $scope.getProfilePicture = function(pic) {
      return pic;
    };

    $scope.hoverExpand = function(leaderItem) {
      leaderItem.hover = true;
    };

    $scope.hoverShrink = function(leaderItem) {
      leaderItem.hover = false;
    };

    $scope.updateRefer = function(trackId) {
      $scope.referLink = "http://nostrajamus.com/#/tracks/" + trackId;
      $('#shareLargeModal').modal('show');
    };

    $scope.truncate = function(title) {
      if (title.toString().length > 24) {
          var newTitle = title.toString().substring(0,24) + "...";
          return newTitle;
      }
      return title;
    };

    $scope.insertCommas = function(s) {
      s = s.toString();
      // get stuff before the dot
      var d = s.indexOf('.');
      var s2 = d === -1 ? s : s.slice(0, d);
      // insert commas every 3 digits from the right
      for (var i = s2.length - 3; i > 0; i -= 3)
        s2 = s2.slice(0, i) + ',' + s2.slice(i);
      // append fractional part
      if (d !== -1)
        s2 += s.slice(d);
      return s2;
    };

    $scope.goToProfile = function(leader_id) {
      $state.go('profile.dashboard', {userID: leader_id});
    };

    $scope.getMoreTracks = function(leaderItem) {
      leaderItem.numSongs += 1;
    };

    /* BEGIN PLAYER LOGIC */

    $scope.player = globalPlayerService.player;

    $scope.playNewTrack = function(track, index) {
        console.log(track);
        homeService.home.data.panelId = 0;
        globalPlayerService.player.resetTrack(track.track);
        var tracks = $scope.leaders.map(function(leader) {
          return leader.my_entries[0];
        });
        var tunes = tracks.slice(index+1).map(function(elem) {
            return elem.track;
        });
        console.log(tunes);
        globalPlayerService.player.data.trackQueue = tunes;
        // Set the next url and such
        // var nextUrl = '/api/contests/' + $scope.contestInfo.id + 'entries/?page=' + ($scope.currentPage + 1);
        // globalPlayerService.player.data.nextPageUrl = nextUrl;
    };

    $scope.getCroppedImageUrl = function(url) {
        var cropped = url.replace("-large", "-t300x300");
        return cropped;
    };

    $scope.$on('player.data.trackProgress.update', function (newState) {
//        $scope.trackProgress = globalPlayerService.player.data.trackProgress;
        $scope.$apply(function() {
            $scope.player.data = globalPlayerService.player.data;
        });
    });

    /* END PLAYER LOGIC */

    // $scope.saveChanges = function() {
    //     $http.put().success(successCallback);
    // }

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = true;
// }]).directive('progressBar', [
//     function () {
//         return {
//             link: function ($scope, el, attrs) {
//                 $scope.$watch(attrs.progressBar, function (newValue) {
//                     el.css('width', newValue.toString() + '%');
//                 });
//             }
//         };
//     }
// ]);

}]);
