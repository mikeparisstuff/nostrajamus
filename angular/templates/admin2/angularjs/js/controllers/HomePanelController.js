'use strict';

MetronicApp.controller('HomePanelController', function($rootScope, $scope, $http, $timeout, contests, globalPlayerService, dailyLeaders, homeService, authState, api) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
    });

    $scope.contests = contests;
    $scope.dailyLeaders = dailyLeaders;
    // $scope.myContestInfo = myData;
    $scope.currentPage = 1;

    // if ($scope.authState.user.length > 0) {
    // 	$scope.myContestInfo = myData;
    // 	// console.log($scope.myData);
    // }
    // else {
    // 	$scope.myData = null;
    // }

    if (authState.user) {
		// My Contest Info
		// $scope.myContestInfo = [];

	 //   	var getContestInfo = function(i, contestNum){
	 //    	$http({
	 //            url: '/api/contests/' + contestNum,
	 //            method: "GET",
	 //            // data: JSON.stringify($scope.form),
	 //            headers: {'Content-Type': 'application/json'}
	 //        }).success(function (data, status, headers, config) {
	 //    	  	// console.log(data);
	 //    	  	$scope.myContestInfo.push(data);
	 //    	  	$scope.convertDateTime(i, $scope.myContestInfo);
	 //    	  	getContestRank(i, contestNum, $scope.myContestInfo);
	 //    	  	// console.log("SUCCESS");
	 //        }).error(function (data, status, headers, config) {
	 //            // $scope.status = status;
	 //    	  	// console.log(data);
	 //    	  	// console.log("FAILURE");
	 //        });
		// };

		if (api.data.myUser.my_entries) {
			$scope.myContestInfo = api.data.myUser.my_entries.filter(function(elem) {return elem.is_active});
		}

		var getContestRank = function(i, contestNum, myContestInfo){
	    	$http({
	            url: '/api/contests/' + contestNum + '/rank',
	            method: "GET",
	            // data: JSON.stringify($scope.form),
	            headers: {'Content-Type': 'application/json'}
	        }).success(function (data, status, headers, config) {
	    	  	// console.log(data);
	    	  	$scope.myContestInfo[i].rank = data.rank;
	    	  	// console.log($scope.myContestInfo);
	    	  	// $scope.myContestRank.push(data);	    	  	
	    	  	// console.log("SUCCESS");
	        }).error(function (data, status, headers, config) {
	            // $scope.status = status;
	    	  	// console.log(data);
	    	  	// console.log("FAILURE");
	        });
		};

		// if (myData.my_entries) {
		// 	for (var i=0; i < myData.my_entries.length; i++) {
		// 		if (myData.my_entries[i].is_active) {
		// 			var contestNum = myData.my_entries[i].contest;
		// 			getContestInfo(i, contestNum);
		// 		}
		// 	}
		// }

		if ($scope.myContestInfo) {
			for (var i = 0; i < $scope.myContestInfo.length; i++) {

				getContestRank(i, $scope.myContestInfo[i].contest, $scope.myContestInfo);
				for (var j = 0; j < $rootScope.contests.length; j++) {
					if ($rootScope.contests[j].id == $scope.myContestInfo[i].contest) {
						$scope.myContestInfo[i].title = $rootScope.contests[j].title;
					}
				}
			}
		}

		// $scope.myContestInfo.reverse();

		// End My Contest Info
	}

    $scope.getContestEntries = function(i, contest) {
	    $http.get('/api/contests/' + contest.id + "/entries").then(function(response) {
	        contest.results = response.data.results;
	    })
	}

//    for (var i = 0; i < $scope.contests.length; i++) {
//        $scope.getContestEntries(i, $scope.contests[i]);
//    }

    $scope.trendingTracks = dailyLeaders.results;

	$scope.insertCommas = function(s) {
		if (s) {
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
		}
		return s;
    };

    $scope.truncate = function(title) {
      if (title.toString().length > 50) {
          var newTitle = title.toString().substring(0,50) + "...";
          return newTitle;
      }
      return title;
    };

    $scope.getPlayIncrease = function(track) {
		// get play count increase
		var currPlayCount = track.current_playback_count;
		var initPlayCount = track.initial_playback_count;

		var playIncrease = ((currPlayCount - initPlayCount) / (initPlayCount)) * 100;

		return playIncrease.toFixed(1);
    };

	$scope.isEnabled = function(start) {
		var oneWeek = new Date().addHours(24*7);
		var startTime = new Date(start).addHours(0);
		if (startTime < oneWeek) {
			// console.log(true);
			return true;
		}
		else {
			// console.log(false);
			return false;
		}
	}

	Date.prototype.addHours = function(h){
	    this.setHours(this.getHours()+h);
	    return this;
	}

    $scope.timeOffset = function(date, offset) {
    	var d = new Date(date);

    	var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    	var nd = new Date(utc + (3600000*offset));

    	var formattedTime = moment(nd).format("MM/DD/YYYY, h:mm A");
    	return formattedTime;
    }

	$scope.convertDateTime = function(contest, contestsList) {
		//convert datetimes
		contestsList[contest].start_time = $scope.timeOffset(contestsList[contest].start_time, '+0');
		contestsList[contest].end_time = $scope.timeOffset(contestsList[contest].end_time, '+0');
	};

	$scope.passModal = function(title, entry_fee, prize, description, start_time, end_time, status, contest_id, isEnabled) {
		$scope.title = title;
		$scope.entry_fee = entry_fee;
		$scope.enabled = isEnabled;

		$scope.prize = prize;
		var prizes = prize.split(",");
		$scope.prizes = prizes;
		var prizeCategories = [];
		var prizeValues = [];

		for (var i in prizes) {
			var eachPrize = prizes[i].split(":");
			prizeCategories.push(eachPrize[0].trim());
			if (eachPrize[1]) {
				prizeValues.push(eachPrize[1].trim());
			}
		}

		$scope.prizeCategories = prizeCategories;
		$scope.prizeValues = prizeValues;

		// console.log($scope.prizeCategories);
		// console.log($scope.prizeValues);

		$scope.description = description;
		$scope.start_time = start_time;
		$scope.end_time = end_time;
		$scope.status = status;
		$scope.contest_id = contest_id;
	};

	/* BEGIN PLAYER LOGIC */

    $scope.player = globalPlayerService.player;
    $scope.api = api;

    $scope.playNewTrack = function(track, index, contestEntries) {
        globalPlayerService.player.resetTrack(track);
        var tunes = contestEntries.slice(index+1).map(function(elem) {
            return elem.track;
        });
        globalPlayerService.player.data.trackQueue = tunes;
        // Set the next url and such
        if (homeService.home.data.panelId != 0) {
        	var nextUrl = '/api/contests/' + homeService.home.data.panelId + 'entries/?page=' + ($scope.currentPage + 1);
        	$scope.currentPage = $scope.currentPage + 1;
        	globalPlayerService.player.data.nextPageUrl = nextUrl;
        }
    };

    $scope.getCroppedImageUrl = function(url) {
    	if (url) {
    		var cropped = url.replace("-large", "-t300x300");
        	return cropped;
    	}
    };

    $scope.$on('player.data.trackProgress.update', function (newState) {
//        $scope.trackProgress = globalPlayerService.player.data.trackProgress;
        $scope.$apply(function() {
            $scope.player.data = globalPlayerService.player.data;
        });
    });

    /* END PLAYER LOGIC */

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = true;
});