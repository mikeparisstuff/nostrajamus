'use strict';

MetronicApp.controller('TestController', function($rootScope, $scope, $http, $timeout, signups) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
    });
    $scope.selectedValue = "Bitchhh";

    // console.log(signups);

    $scope.signups = signups;

    $scope.countSignups = function(signupsObj) {
        return Object.keys(signupsObj).length;
    };

    $scope.save = function() {
    	$http.post('/assets', $scope.signups);
    	alert(JSON.stringify($scope.signups.results));
    };

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = true;
});