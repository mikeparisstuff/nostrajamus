'use strict';

MetronicApp.controller('DashboardController', function($rootScope, $scope, $http, $timeout, contests, myData, $window, authState) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
    });

    $scope.contests = contests;
    $scope.authState = authState;

    if ($scope.authState.user.length > 0) {
    	$scope.myData = myData;
    	// console.log($scope.myData);
    }
    else {
    	$scope.myData = null;
    }
    $scope.closed = false;

    $scope.contestType = 'open';

    $scope.getProfilePicture = function(pic) {
      var src = '';
        
      if (pic == null) {
            // var randomPic = Math.random()*100;
            // if (randomPic < 100/3) {
                return src = '/assets/admin/pages/media/profile/profile-landscape.jpg';
            // }
            // else if (randomPic >= 100/3 && randomPic <= 200/3) {
            //     return src = '/assets/admin/pages/media/profile/profile-swan.jpg';
            // }
            // else if (randomPic > 200/3) {
            //     return src = '/assets/admin/pages/media/profile/profile-car.jpg'; 
            // }
      }
      else {
        return pic;
      }
    };

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
		$scope.completedContests = completedContests.reverse();

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
			$window.location.href = '#/opencontests/' + contest_id;
		}
		else if (status == 'inProgress') {
			$window.location.href = '#/inprogresscontests/' + contest_id;
		}
		else if (status == 'completed') {
			$window.location.href = '#/completedcontests/' + contest_id;
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

	if (authState.user) {
		// My Contest Info
		$scope.myContestInfo = [];

	   	var getContestInfo = function(i, contestNum){
	    	$http({
	            url: '/api/contests/' + contestNum,
	            method: "GET",
	            // data: JSON.stringify($scope.form),
	            headers: {'Content-Type': 'application/json'}
	        }).success(function (data, status, headers, config) {
	    	  	// console.log(data);
	    	  	$scope.myContestInfo.push(data);
	    	  	$scope.convertDateTime(i, $scope.myContestInfo);
	    	  	// console.log("SUCCESS");
	        }).error(function (data, status, headers, config) {
	            // $scope.status = status;
	    	  	// console.log(data);
	    	  	// console.log("FAILURE");
	        });
		};

		if (myData.my_entries) {
			for (var i=0; i < myData.my_entries.length; i++) {
				var contestNum = myData.my_entries[i].contest;
				getContestInfo(i, contestNum);
			}
		}
		// End My Contest Info
	}

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = true;
});