'use strict';

MetronicApp.controller('LoginController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
    });
    // $scope.selectedValue = "Bitchhh";

    // console.log(contests);

    // $scope.contests = contests;

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = true;
});