'use strict';

MetronicApp.controller('UserProfileController', ["$rootScope", "$scope", "$http", "$timeout", "$upload", "$sce", "myInfo", "me", function($rootScope, $scope, $http, $timeout, $upload, $sce, myInfo, me) {
    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_profile')); // set profile link active in sidebar menu 
    });

    $scope.myInfo = myInfo;
    $scope.me = me;
    // $http.get('/api/users/me').then(function(response) {
    //      $scope.myInfo = response.data;
    //     // console.log($scope.myInfo);
    //     return response.data;
    // });

    $scope.getProfilePicture = function(pic) {
      var src = '';
        
      // if (pic == null) {
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
            // return src = '/assets/admin/pages/media/profile/profile-car.jpg';
      // }
      // else {
        return pic;
      // }
    };

    $scope.getNumContests = function(entriesList) {
    	if (entriesList == null) {
    		return 0;
    	} else {
    		return Object.keys(entriesList).length;
    	}
    };

    $scope.getSrc = function(track) {
    	var SCUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + track.track.sc_id + '&amp;color=ff5252&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';

    	var trustedUrl = $sce.trustAsResourceUrl(SCUrl);

    	return trustedUrl;
    }

    $scope.getPlayIncrease = function(track) {
		// get play count increase
		var currPlayCount = track.current_playback_count;
		var initPlayCount = track.initial_playback_count;

		var playIncrease = ((currPlayCount - initPlayCount) / (initPlayCount)) * 100;

		return playIncrease.toFixed(1);
    };

    $scope.getFollowIncrease = function(track) {
		// get follower count increase
		var currFollowCount = track.current_follower_count;
		var initFollowCount = track.initial_follower_count;
		
		var followIncrease = ((currFollowCount - initFollowCount) / (initFollowCount)) * 100;

		return followIncrease.toFixed(1);
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

    $scope.selectedFile = [];
    $scope.uploadProgress = 0;

    $scope.uploadFile = function () {
        console.log($scope.myInfo);
        var file = $scope.selectedFile[0];
        var url = $scope.myInfo.url;
//        $scope.myInfo.profile_picture = file;
        $scope.upload = $upload.upload({
            url: url,
            method: 'PUT',
            data: {
                "first_name": $scope.myInfo.first_name,
                "last_name": $scope.myInfo.last_name,
                "email": $scope.myInfo.email,
                "location": $scope.myInfo.location
            },
            file: file
        }).progress(function (evt) {
//            console.log("Progress: " + parseInt(100.0 * evt.loaded / evt.total, 10));
            $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total, 10);
        }).success(function (data) {
            //do something
            alert("Profile Updated");
            $location.path("profile/account")
        });
    };

    $scope.onFileSelect = function ($files) {
        $scope.uploadProgress = 0;
        $scope.selectedFile = $files;
    };

    // $scope.saveChanges = function() {
    //     $http.put().success(successCallback);
    // }

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = true;
}]).directive('progressBar', [
    function () {
        return {
            link: function ($scope, el, attrs) {
                $scope.$watch(attrs.progressBar, function (newValue) {
                    el.css('width', newValue.toString() + '%');
                });
            }
        };
    }
]);
