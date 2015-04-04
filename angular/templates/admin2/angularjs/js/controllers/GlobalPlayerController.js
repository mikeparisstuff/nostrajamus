/**
 * Created by MichaelParis on 2/12/15.
 */
'use strict';

MetronicApp.controller('GlobalPlayerController', function($rootScope, $scope, globalPlayerService, api) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        Metronic.initAjax();
    });
    SC.initialize({
        client_id: 'f0b7083f9e4c053ca072c48a26e8567a'
    });

    $scope.player = globalPlayerService.player;
    $scope.api = api;

    api.getLikes();

    if (globalPlayerService.player.data.trackQueue.length == 0 ) {
        globalPlayerService.player.getDefaultQueue();
    }

    $scope.$on('player.data.trackProgress.update', function (newState) {
//        console.log(globalPlayerService.player.data.trackProgress);
//        $scope.trackProgress = globalPlayerService.player.data.trackProgress;
        $scope.$apply(function() {
            $scope.player.data.trackProgress = globalPlayerService.player.data.trackProgress;
        });
    });

    $scope.$on('player.data.trackQueue.update', function() {
       $scope.$apply(function() {
            $scope.player.data.trackQueue = globalPlayerService.player.data.trackQueue;
        });
    });

    $scope.$watch(function() {return globalPlayerService.player.data.trackQueue;}, function(current, previous){
        $scope.player.data.trackQueue = current;
    });

    $scope.forceApply = function() {
        $scope.$apply(function() {
            $scope.player.data.trackQueue = globalPlayerService.player.data.trackQueue;
        });
    };

    $scope.modalTrackInfo = {};
    $scope.updateInfo = function(entry) {
        console.log(entry);
        // entry.percentage_increase = (((entry.playback_count - entry.initial_playback_count)/entry.initial_playback_count)*100).toFixed(2).toString();
        // entry.initial_playback_count = entry.initial_playback_count.toString();
        // entry.current_playback_count = entry.current_playback_count.toString();
        // entry.current_follower_count = entry.current_follower_count.toString();
        $scope.modalTrackInfo = entry;
        $('#infoModal').modal('show');
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

    $scope.getCroppedImageUrl = function(url) {
        var cropped = url.replace("-large", "-t300x300");
        return cropped;
    };

    $scope.modalClose = function() {
        $('#infoModal').modal('hide');
    }

    $scope.updateRefer = function(trackId) {
        $scope.referLink = "http://nostrajamus.com/#/tracks/" + trackId;
        $('#shareGlobalModal').modal('show');
    };

//    $scope.trackQueue = globalPlayerData.trackQueue;

//    $scope.player.playPause = globalPlayerService.playPause;

});