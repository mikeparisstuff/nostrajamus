'use strict';

MetronicApp.controller('TestController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
    });
    $scope.selectedValue = "Bitchhh";

    // console.log(signups);

    // $scope.signups = signups;

    // $scope.countSignups = function(signupsObj) {
    //     return Object.keys(signupsObj).length;
    // };

    // $scope.save = function() {
    // 	$http.post('/assets', $scope.signups);
    // 	alert(JSON.stringify($scope.signups.results));
    // };

    // function hoverTiles(){
    //     var tiles = $('.button-leader');
    //     tiles.hover(function(){
    //         tiles.removeClass('active-leader');
    //         $(this).addClass('active-leader');
    //     })
    // }
        
    // $(document).ready(function() {
    //     hoverTiles();
    // })

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = true;
});