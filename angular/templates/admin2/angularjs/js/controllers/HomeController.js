'use strict';

MetronicApp.controller('HomeController', function($rootScope, $scope, $http, $timeout, contests, $window, authState, globalPlayerService, weeklyLeaders) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
    });

    if (!authState.user && $rootScope.firstTime) {
    	$('#tutorialModal').modal('show');
    	$rootScope.firstTime = false;
    }

    $rootScope.panelId = 0;
    $scope.contests = contests;
    // console.log($scope.contests);
    $scope.authState = authState;
    $scope.weeklyLeaders = weeklyLeaders;

    $scope.getContestEntries = function(i) {
    	console.log($scope.contests[i].id);
    	console.log($scope.contests);
	    $http.get('/api/contests/' + $scope.contests[i].id + "/entries").then(function(response) {
	        // console.log($scope.contests[i].id, response.data);
	        $scope.contests[i].results = response.data.results;
	        console.log(contests[i]);
	    })
	}

    for (var i = 0; i < $scope.contests.length; i++) {
        $scope.getContestEntries(i);
    }

    $scope.trendingTracks = weeklyLeaders.results;

 //    $scope.getUserProfileSong = function(i, id) {
	//     $http.get('/api/users/' + id).then(function(response) {
	//         // console.log(response.data);
 //    		$scope.trendingTracks[i].moreTracks = [];
 //    		if ($scope.trendingTracks[i].track.sc_id != response.data.my_entries[0].track.sc_id) {
	// 	    	$scope.trendingTracks[i].moreTracks.push(response.data.my_entries[0].track);
	// 	    }
	// 	    else {
	// 	    	$scope.trendingTracks[i].moreTracks.push(response.data.my_entries[1].track);
	// 	    }
	//         // console.log($scope.moreSongs);
	//     })
	// }
    
	// for (var i = 0; i < $scope.trendingTracks.length; i++) {
	// 	$scope.getUserProfileSong(i, $scope.trendingTracks[i].entries[0].user.id);
 //    }

    // console.log($scope.trendingTracks);

    // console.log($scope.contests);

    // if ($scope.authState.user.length > 0) {
    // 	$scope.myData = myData;
    // 	// console.log($scope.myData);
    // }
    // else {
    // 	$scope.myData = null;
    // }

    // $scope.contestType = 'open';

    $scope.filterContests = function(contestsList) {
    	contestsList.reverse();

        var openContests = [];
        var inProgressContests = [];
        var completedContests = [];

		var now = new Date();
		// now = Date.parse(now);

		// var contestStartDate = Date.parse(contestsList[0].start_time);
		// var contestEndDate = Date.parse(contestsList[0].end_time);
		// console.log(now);
		// console.log(contestStartDate);
		// console.log(contestEndDate);
		// console.log(contestStartDate == contestEndDate);

		for (var contest in contestsList) {
			// var start_time = Date.parse(contestsList[contest].start_time);
			// var end_time = Date.parse(contestsList[contest].end_time);

			var start_time = new Date(contestsList[contest].start_time).addHours(5);
			var end_time = new Date(contestsList[contest].end_time).addHours(5);

			// console.log(now);
			// console.log(start_time);
			// console.log(end_time);

			if (now < start_time) {
				$scope.convertDateTime(contest, contestsList);
				openContests.push(contestsList[contest]);
			}
			else if (now > start_time && now < end_time) {
				$scope.convertDateTime(contest, contestsList);
				inProgressContests.push(contestsList[contest]);
			}
			else if (now > end_time) {
				$scope.convertDateTime(contest, contestsList);
				completedContests.push(contestsList[contest]);
			}
		}

		$scope.openContests = openContests;
		$scope.inProgressContests = inProgressContests;
		$scope.completedContests = completedContests;

		// Start Countdown Timer
		// set the date we're counting down to
		var target_date = new Date(openContests[0].start_time).getTime();
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
		    // console.log(hours);
		    seconds_left = seconds_left % 3600;

		    minutes = parseInt(seconds_left / 60);
		    seconds = parseInt(seconds_left % 60);

		    // format countdown string + set tag value
		    if (hours >= 0) {
		    	document.getElementById('countdown').innerHTML = 'Next contest begins in <span class="days">' + days + ' <b>Days</b></span> <span class="hours">' + hours + ' <b>Hours</b></span> <span class="minutes">' + minutes + ' <b>Minutes</b></span> <span class="seconds">' + seconds + ' <b>Seconds</b></span>';
		    }
		    else {
		    	document.getElementById('countdown').innerHTML = 'Sorry, there are no upcoming contests at this time.';
		    }

		}, 1000);
		// End Countdown Timer
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

		// contestsList[contest].start_time = new Date(contestsList[contest].start_time).toLocaleDateString();
		// contestsList[contest].end_time = new Date(contestsList[contest].end_time).toLocaleDateString();

		contestsList[contest].start_time = $scope.timeOffset(contestsList[contest].start_time, '+0');
		contestsList[contest].end_time = $scope.timeOffset(contestsList[contest].end_time, '+0');
	};

	$scope.myCurrentContests = function(myEntryList) {
		if (myEntryList) {
			for (var i=0; i < myEntryList.length; i++) {
				$scope.convertDateTime(i, myEntryList);
			}
			return myEntryList;
		}
	}

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
	}

	$scope.goToContest = function(status, contest_id) {
		if (status == 'open') {
			$window.location.href = '/opencontests/' + contest_id;
		}
		else if (status == 'inProgress') {
			$window.location.href = '/inprogresscontests/' + contest_id;
		}
		else if (status == 'completed') {
			$window.location.href = '/completedcontests/' + contest_id;
		}
	}

	$scope.enterSuggestion = function(suggestion) {

		$http({
            url: '/api/feedback/' ,
            method: "POST",
            data:
            {
			    "text": suggestion, 
			    "name": "", 
			    "email": ""
			},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
        	  	// console.log(data);
                $scope.suggestion = "";
                $scope.suggestThanks = "Thanks!";
            }).error(function (data, status, headers, config) {
                // $scope.status = status;
        	  	// console.log(data);
                alert("Try again.");
            });

	}

	$scope.setPanel = function(contestId) {
		$rootScope.panelId = contestId;
		// console.log($rootScope.panelId);

		$http.get('/api/contests/' + $rootScope.panelId + "/entries").then(function(response) {
			$rootScope.contestInstance = response.data;
			// console.log($scope.contestInstance);
	    })
	};

	$scope.setPanelBack = function() {
		$rootScope.panelId = 0;
	};

	// if (authState.user) {
	// 	// My Contest Info
	// 	$scope.myContestInfo = [];

	//    	var getContestInfo = function(i, contestNum){
	//     	$http({
	//             url: '/api/contests/' + contestNum,
	//             method: "GET",
	//             // data: JSON.stringify($scope.form),
	//             headers: {'Content-Type': 'application/json'}
	//         }).success(function (data, status, headers, config) {
	//     	  	// console.log(data);
	//     	  	$scope.myContestInfo.push(data);
	//     	  	$scope.convertDateTime(i, $scope.myContestInfo);
	//     	  	// console.log("SUCCESS");
	//         }).error(function (data, status, headers, config) {
	//             // $scope.status = status;
	//     	  	// console.log(data);
	//     	  	// console.log("FAILURE");
	//         });
	// 	};

	// 	if (myData.my_entries) {
	// 		for (var i=0; i < myData.my_entries.length; i++) {
	// 			var contestNum = myData.my_entries[i].contest;
	// 			getContestInfo(i, contestNum);
	// 		}
	// 	}
	// 	// End My Contest Info
	// }

	/* BEGIN PLAYER LOGIC */

    $scope.player = globalPlayerService.player;

    $scope.playNewTrack = function(track, index, contestEntries) {
    	// console.log(track);
        globalPlayerService.player.resetTrack(track);
        var tunes = contestEntries.slice(index+1).map(function(elem) {
            return elem.track;
        });
        globalPlayerService.player.data.trackQueue = tunes;
        // // Set the next url and such
        // var nextUrl = '/api/contests/' + $scope.contestInfo.id + 'entries/?page=' + ($scope.currentPage + 1);
        // globalPlayerService.player.data.nextPageUrl = nextUrl;
    };

    $scope.getCroppedImageUrl = function(url) {
        var cropped = url.replace("-large", "-t300x300");
        return cropped;
    };

    $scope.$on('player.trackProgress.update', function (newState) {
//        $scope.trackProgress = globalPlayerService.player.data.trackProgress;
        $scope.$apply(function() {
            $scope.player.data = globalPlayerService.player.data;
        });
    });

    /* END PLAYER LOGIC */

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = true;
});