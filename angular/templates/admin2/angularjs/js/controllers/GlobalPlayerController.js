/**
 * Created by MichaelParis on 2/12/15.
 */
'use strict';

MetronicApp.controller('GlobalPlayerController', function($rootScope, $scope, globalPlayerService) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        Metronic.initAjax();
    });
    SC.initialize({
        client_id: 'f0b7083f9e4c053ca072c48a26e8567a'
    });

    $scope.player = globalPlayerService.player;

    $scope.$on('player.trackProgress.update', function (newState) {
        console.log(globalPlayerService.player.data.trackProgress);
//        $scope.trackProgress = globalPlayerService.player.data.trackProgress;
        $scope.$apply(function() {
            $scope.player.data = globalPlayerService.player.data;
        });
    });

//    $scope.trackQueue = globalPlayerData.trackQueue;

//    $scope.player.playPause = globalPlayerService.playPause;

});