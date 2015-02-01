'use strict';

MetronicApp.controller('DashboardController', function($rootScope, $scope, $http, $timeout, contests, myData) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
    });

    $scope.contests = contests;
    $scope.myData = myData;

	// Start Countdown Timer
	// set the date we're counting down to
	var target_date = new Date(contests.results[0].start_time).getTime();
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
	    document.getElementById('countdown').innerHTML = '<span class="days">' + days + ' <b>Days</b></span> <span class="hours">' + hours + ' <b>Hours</b></span> <span class="minutes">' + minutes + ' <b>Minutes</b></span> <span class="seconds">' + seconds + ' <b>Seconds</b></span>';

	}, 1000);
	// End Countdown Timer

    $scope.filterContests = function(contestsList) {
        var openContests = [];
        var inProgressContests = [];
        var completedContests = [];

		var now = new Date();
		now = Date.parse(now);
		// var contestStartDate = Date.parse(contestsList[0].start_time);
		// var contestEndDate = Date.parse(contestsList[0].end_time);
		// console.log(now);
		// console.log(contestStartDate);
		// console.log(contestEndDate);
		// console.log(contestStartDate == contestEndDate);

		for (var contest in contestsList) {
			var start_time = Date.parse(contestsList[contest].start_time);
			var end_time = Date.parse(contestsList[contest].end_time);

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
	};

	$scope.convertDateTime = function(contest, contestsList) {
		//convert datetimes
		contestsList[contest].start_time = new Date(contestsList[contest].start_time).toLocaleDateString();
		contestsList[contest].end_time = new Date(contestsList[contest].end_time).toLocaleDateString();
	};

	$scope.myCurrentContests = function(myEntryList) {
		var myEntries = [];
		for (entry in myEntryList) {
			$scope.convertDateTime(entry, myEntryList);
			myEntries.push(myEntryList[entry]);
		}
		$scope.myEntries = myEntries;
	}

	$scope.passModal = function(title, entry_fee, prize, description, start_time, end_time) {
		$scope.title = title;
		$scope.entry_fee = entry_fee;
		$scope.prize = prize;
		$scope.description = description;
		$scope.start_time = start_time;
		$scope.end_time = end_time;
	}

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = false;
});