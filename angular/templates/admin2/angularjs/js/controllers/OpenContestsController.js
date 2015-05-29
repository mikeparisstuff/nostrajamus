
/* Setup general page controller */
MetronicApp.controller('OpenContestsController', ['$rootScope', '$scope', 'settings', 'contestInfo', 'contestEntries', 'myData', '$http', '$sce', 'globalPlayerService', 'api', 'soundcloud', '$cookies', '$timeout', function($rootScope, $scope, settings, contestInfo, contestEntries, myData, $http, $sce, globalPlayerService, api, soundcloud, $cookies, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = true;
    });

    $scope.hideDiscoverer = true;
    $scope.submissionPage = true;
    $scope.track_type = 'manual';
    $scope.api = api;
    $scope.soundcloud = soundcloud;
    soundcloud.sc.init();

    $scope.contestInfo = contestInfo;
    $scope.contestEntries = contestEntries;
    $scope.myData = myData;
    $scope.mySubmittedTrackID = null;
    $scope.hasSubmitted = false;

    $scope.fromOpenContests = true;

    // console.log(myData);
    // console.log(contestInfo);

    if (myData.my_entries != null) {
        for (var i=0; i < myData.my_entries.length; i++) {
            if (myData.my_entries[i].contest == contestInfo.id) {
                $scope.myTrack = myData.my_entries[i];
                $scope.mySubmittedTrack = myData.my_entries[i].track;
                $scope.hasSubmitted = true;

                var url = "https://api.soundcloud.com/users/" + $scope.mySubmittedTrack.sc_user_id;
                $http.get(url, {
                  params: {
                    client_id: "f0b7083f9e4c053ca072c48a26e8567a",
                  }
                }).then(function(response){
                    console.log(response.data);
                    $scope.initial_followers_count = response.data.followers_count;

                    console.log($scope.initial_followers_count);

                    $scope.track = $scope.mySubmittedTrack;
                    $scope.track.sc_id = $scope.mySubmittedTrack.sc_id;

                    $scope.track = {
                        track: $scope.mySubmittedTrack,
                        initial_playback_count: $scope.mySubmittedTrack.playback_count,
                        current_playback_count: $scope.mySubmittedTrack.playback_count,
                        initial_follower_count: $scope.initial_followers_count,
                        jam_points: 0
                    };

                    console.log($scope.track);

                    // return response.data;
                });

            }
        }
    };

    $scope.getSrc = function(track) {
    	var SCUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + track.sc_id + '&amp;color=ff5252&amp;theme_color=ff5252&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';

    	var trustedUrl = $sce.trustAsResourceUrl(SCUrl);

    	return trustedUrl;
    };

    $scope.timeOffset = function(date, offset) {
    	var d = new Date(date);

    	var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    	var nd = new Date(utc + (3600000*offset));

    	var formattedTime = moment(nd).format("MM/DD/YYYY, h:mm A");
    	return formattedTime;
    };

    // $scope.contestInfo.start_time = new Date($scope.contestInfo.start_time).toLocaleString('en-US');
    // $scope.contestInfo.end_time = new Date($scope.contestInfo.end_time).toLocaleString('en-US');

    $scope.contestInfo.start_time = $scope.timeOffset($scope.contestInfo.start_time, '+0');
    $scope.contestInfo.end_time = $scope.timeOffset($scope.contestInfo.end_time, '+0');

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
	    if ($scope.hasSubmitted) {
	    	document.getElementById('countdown-submitted').innerHTML = '<span class="days">' + days + ' <b>Days</b></span> <span class="hours">' + hours + ' <b>Hours</b></span> <span class="minutes">' + minutes + ' <b>Minutes</b></span> <span class="seconds">' + seconds + ' <b>Seconds</b></span>';
	    }
	    else {
		    document.getElementById('countdown-open').innerHTML = '<span class="days">' + days + ' <b>Days</b></span> <span class="hours">' + hours + ' <b>Hours</b></span> <span class="minutes">' + minutes + ' <b>Minutes</b></span> <span class="seconds">' + seconds + ' <b>Seconds</b></span>';
	    }

	}, 1000);
	// End Countdown Timer

	// SoundCloud
	// SC.initialize({
 //        client_id: 'f0b7083f9e4c053ca072c48a26e8567a'
 //    });

	var url = "https://api.soundcloud.com/tracks";
    var urlResolve = "https://api.soundcloud.com/resolve.json";

    $scope.connectSC = function() {

        $scope.recommendedTracks = [];

        SC.connect(function() {

            console.log("Logged in!");

            SC.get('/me', function(me, error) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Hello, ' + me.username);
                    console.log(me);

                    soundcloud.sc.data.user_id = me.id;
                    soundcloud.sc.data.username = me.username;

                    // $http.get('https://api-v2.soundcloud.com/profile/soundcloud:users:' + soundcloud.user_id + '?limit=1&offset=0').then(function (response) {
                    //     console.log(response);
                    // });
                }
            });

            $timeout(function() {
                $scope.getRecommendations();
            }, 0);

        });
    };

    $scope.getRecommendations = function() {
        SC.get('/me/activities', function(activities, error) {
            if (error) {
                console.log(error);
            }
            else {
                // console.log(activities);
                var newTracks = activities.collection.map(function(track) {
                    if (track.type == "track-repost") {
                        delete track.origin.reposts_count;
                        delete track.origin.user_favorite;
                        // delete track.origin.user.uri;
                        delete track.origin.user_uri;
                        delete track.origin.likes_count;
                        delete track.origin.user_playback_count;
                        if (track.origin.downloadable == null) {
                            track.origin.downloadable = false;
                        }
                        $scope.getFollows(track.origin);
                        // console.log(track);
                        return track.origin;
                    }
                    else {
                        return null;
                    }
                });
                console.log($scope.recommendedTracks);

                console.log(newTracks);

                // $timeout(function() {
                    $scope.recommendedTracks = newTracks;
                    // console.log($scope.recommendedTracks);
                // });

                console.log($scope.recommendedTracks);
            }
        });
    };

    $scope.getFollows = function(track) {
        // console.log(track);
        var url = "https://api.soundcloud.com/users/" + track.user.id;
        $http.get(url, {
          params: {
            client_id: soundcloud.sc.data.client_id,
          }
        }).then(function(response){
            // console.log(response.data);
            // $scope.initial_followers_count = response.data.followers_count;

            // console.log($scope.initial_followers_count);

            track.followers_count = response.data.followers_count;
            // return response.data.followers_count;

            // $scope.track = {
            //     track: item,
            //     initial_playback_count: item.playback_count,
            //     current_playback_count: item.playback_count,
            //     initial_follower_count: $scope.initial_followers_count,
            //     jam_points: 0
            // };

            // console.log($scope.track);
        });
    };

    if (soundcloud.sc.data.user_id) {
        $scope.getRecommendations();
    }

	$scope.getTracks = function(val) {
        var begin = val.slice(0,8);
        if (begin == "https://") {
            // console.log("SEARCH FOR SONGS")
            return $http.get(urlResolve, {
              params: {
                client_id: "f0b7083f9e4c053ca072c48a26e8567a",
                url: val,
              }
            }).then(function(response){
                console.log(response.data);

                $scope.getUrlAPI(response.data);
                // $scope.getSCUrl(response.data);
                // $scope.track = response.data;
                return (response.data);
              // return response.data.map(function(item){
              //   return {
              //    "label": item.title,
              //    "select": item
              //   }
              // });
            });
        }
        else {
            return $http.get(url, {
              params: {
                client_id: "f0b7083f9e4c053ca072c48a26e8567a",
                q: val,
              }
            }).then(function(response){
                console.log(response.data);
                return response.data;
              // return response.data.map(function(item){
              //   return {
              //    "label": item.title,
              //    "select": item
              //   }
              // });
            });
        }
  	};

    // $scope.getSCUrl = function(item) {
    //     // console.log(item);
    //     $scope.track = item;

    //     var SCUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + item.id + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';

    //     var trustedUrl = $sce.trustAsResourceUrl(SCUrl);

    //     $scope.track_url = trustedUrl;
    // };

  	$scope.onSelect = function(item, model, label) {
  		// console.log(item);
        $scope.origTrack = item;
        $scope.track_type = 'manual';

        var url = "https://api.soundcloud.com/users/" + item.user.id;
        $http.get(url, {
          params: {
            client_id: "f0b7083f9e4c053ca072c48a26e8567a",
          }
        }).then(function(response){
            console.log(response.data);
            $scope.initial_followers_count = response.data.followers_count;

            console.log($scope.initial_followers_count);

            $scope.track = item;
            $scope.track.sc_id = item.id;

            $scope.track = {
                track: item,
                initial_playback_count: item.playback_count,
                current_playback_count: item.playback_count,
                initial_follower_count: $scope.initial_followers_count,
                jam_points: 0
            };

            console.log($scope.track);

            // return response.data;
        });

  		// var SCUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + item.id + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';

    	// var trustedUrl = $sce.trustAsResourceUrl(SCUrl);

    	// $scope.track_url = trustedUrl;
  	};

    $scope.getUrlAPI = function(item) {
        $scope.origTrack = item;

        var url = "https://api.soundcloud.com/users/" + item.user.id;
        $http.get(url, {
          params: {
            client_id: "f0b7083f9e4c053ca072c48a26e8567a",
          }
        }).then(function(response){
            console.log(response.data);
            $scope.initial_followers_count = response.data.followers_count;

            console.log($scope.initial_followers_count);

            $scope.track = item;
            $scope.track.sc_id = item.id;

            $scope.track = {
                track: item,
                initial_playback_count: item.playback_count,
                current_playback_count: item.playback_count,
                initial_follower_count: $scope.initial_followers_count,
                jam_points: 0
            };

            console.log($scope.track);

            // return response.data;
        });
    }

    $scope.getPlayIncrease = function(track) {
        // get play count increase
        var currPlayCount = track.current_playback_count;
        var initPlayCount = track.initial_playback_count;

        var playIncrease = (((currPlayCount - initPlayCount) / (initPlayCount)) * 100).toFixed(1);

        return playIncrease;
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

  	$scope.postTrack = function(track, type) {
        console.log(track);
        $scope.track_type = type;
        if ($scope.track_type == 'recommendations') {
            $scope.followers_count = track.followers_count;
            delete track.followers_count;
            $scope.track = track;
        }
        if (track.playback_count <= 200) {
            $scope.error_playback_count = "Sorry. Your song needs to have at least 200 plays. Try another song.";
        }
        else {
            $http({
                url: '/api/contests/' + $scope.contestInfo.id + '/enter/' ,
                method: "POST",
                data:
                {
                    "track": track
                },
                headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                    // console.log(data);
                    if ($scope.track_type == 'recommendations') {
                        $scope.track.followers_count = $scope.followers_count;
                        // $scope.track = track;
                    }

                    $http.get('/api/users/me').then(function (response) {
                        // console.log(response.data);
                        $scope.myData = response.data;
                        if ($scope.myData.my_entries != null) {
                            for (var i=0; i < $scope.myData.my_entries.length; i++) {
                                if ($scope.myData.my_entries[i].contest == $scope.contestInfo.id) {
                                    $scope.myTrack = $scope.myData.my_entries[i];
                                    $scope.mySubmittedTrack = $scope.myData.my_entries[i].track;
                                    $scope.hasSubmitted = true;
                                    $('#shareModal').modal('show');
                                }
                            }
                        }
                    });
    //                alert("Thanks for submitting!");

    //                location.reload();
                }).error(function (data, status, headers, config) {
                    // $scope.status = status;
                    console.log(data);
                    alert("Try again.");
                });
        }
  	};

    $scope.removeSubmission = function() {
        console.log($scope.myTrack);

        $http.delete('/api/contest_entries/' + $scope.myTrack.id).then(function (response) {
            // console.log(response);
            $scope.hasSubmitted = false;  
            $scope.removedSong = "You just removed your submission. Please enter another if you dare.";          
        });

        $scope.track = null;
    };

    $scope.getReferralLink = function(userId, trackId) {
        var link = "http://nostrajamus.com/#/discover/" + userId + "/" + trackId;
        return link;
    };

    $scope.updateRefer = function(userId, trackId) {
        if (!$scope.hasSubmitted) {
            return;
        }
        else {
            $scope.referLink = "http://nostrajamus.com/#/discover/" + userId + "/" + trackId;
            $('#shareLargeModal').modal('show');
        }
    };

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

    /* BEGIN PLAYER LOGIC */

    $scope.player = globalPlayerService.player;

    $scope.playNewTrack = function(track, index, type) {
        // Start Preview
        if (type == "recommendations") {
            track.sc_id = track.id;
            globalPlayerService.player.resetTrack(track);
            var tunes = $scope.contestEntries.results.slice(index+1).map(function(elem) {
                return elem.track;
            });
            globalPlayerService.player.data.trackQueue = tunes;
            // Set the next url and such
            var nextUrl = '/api/contests/' + $scope.contestInfo.id + 'entries/?page=' + ($scope.currentPage + 1);
            globalPlayerService.player.data.nextPageUrl = nextUrl;
        }
        // End Preview
        // Start Recommendations
        else {
            globalPlayerService.player.resetTrack(track.track);
            var tunes = $scope.contestEntries.results.slice(index+1).map(function(elem) {
                return elem.track;
            });
            globalPlayerService.player.data.trackQueue = tunes;
            // Set the next url and such
            var nextUrl = '/api/contests/' + $scope.contestInfo.id + 'entries/?page=' + ($scope.currentPage + 1);
            globalPlayerService.player.data.nextPageUrl = nextUrl;
        }
        // End Recommendations
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

}]);
