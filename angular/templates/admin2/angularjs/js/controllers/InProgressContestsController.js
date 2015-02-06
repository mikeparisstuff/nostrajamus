
/* Setup general page controller */
MetronicApp.controller('InProgressContestsController', ['$rootScope', '$scope', 'settings', 'contestInfo', 'contestEntries', '$sce', '$http', function($rootScope, $scope, settings, contestInfo, contestEntries, $sce, $http) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.contestInfo = contestInfo;
    $scope.contestEntries = contestEntries;

    $scope.timeOffset = function(date, offset) {
        var d = new Date(date);

        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

        var nd = new Date(utc + (3600000*offset));

        var formattedTime = moment(nd).format("MM/DD/YYYY, h:mm A");
        return formattedTime;
    }

    $scope.contestInfo.start_time = $scope.timeOffset($scope.contestInfo.start_time, '+0');
    $scope.contestInfo.end_time = $scope.timeOffset($scope.contestInfo.end_time, '+0');

    $scope.getSrc = function(track) {
        var SCUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + track.track.sc_id + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';

        var trustedUrl = $sce.trustAsResourceUrl(SCUrl);

        return trustedUrl;
    };

    // pagination
    $scope.currentPage = 1;
    $scope.pageSize = 5;

    $scope.numberOfPages=function() {
        return Math.ceil($scope.contestEntries.count/$scope.pageSize);                
    };


    $scope.prevPage = function() {
        $scope.currentPage = $scope.currentPage - 1;

        $http({
            url: '/api/contests/' + $scope.contestInfo.id + "/entries/?page=" + $scope.currentPage,
            method: "GET",
            // data: JSON.stringify($scope.form),
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // console.log(data);
            $scope.contestEntries = data;
            console.log($scope.contestEntries);
            // console.log("SUCCESS");
        }).error(function (data, status, headers, config) {
            // $scope.status = status;
            // console.log(data);
            // console.log("FAILURE");
        });
    }

    $scope.nextPage = function() {
        $scope.currentPage = $scope.currentPage + 1;

        $http({
            url: '/api/contests/' + $scope.contestInfo.id + "/entries/?page=" + $scope.currentPage,
            method: "GET",
            // data: JSON.stringify($scope.form),
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // console.log(data);
            $scope.contestEntries = data;
            console.log($scope.contestEntries);
            // console.log("SUCCESS");
        }).error(function (data, status, headers, config) {
            // $scope.status = status;
            // console.log(data);
            // console.log("FAILURE");
        });
    }

    $scope.getRanks = function() {
        return ($scope.currentPage-1) * $scope.pageSize;
    }

}]);