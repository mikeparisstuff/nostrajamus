'use strict';

MetronicApp.controller('MessageController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components        
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = true;

    $scope.formData = {};
    $scope.showThanks = false;
    $scope.submitMessage = function() {
        $http({
            url: '/api/feedback/',
            method: "POST",
            data: {
                "name": $scope.formData['name'],
                "text": $scope.formData['message'],
                "email": $scope.formData['email']
            },
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // console.log(data);
            $scope.formData = {};
            $scope.showThanks = true

        }).error(function (data, status, headers, config) {
            console.log("Error: " + data);
        });
    }
});