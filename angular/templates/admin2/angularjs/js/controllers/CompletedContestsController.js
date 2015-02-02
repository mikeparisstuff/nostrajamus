
/* Setup general page controller */
MetronicApp.controller('CompletedContestsController', ['$rootScope', '$scope', 'settings', 'contestInfo', 'contestEntries', '$sce', function($rootScope, $scope, settings, contestInfo, contestEntries, $sce) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.contestInfo = contestInfo;
    $scope.contestEntries = contestEntries;

   	$scope.getSrc = function(track) {
    	var SCUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + track.track.sc_id + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';

    	var trustedUrl = $sce.trustAsResourceUrl(SCUrl);

    	return trustedUrl;
    };    

    // pagination
    $scope.currentPage = 0;
    $scope.pageSize = 5;

    $scope.numberOfPages=function() {
        return Math.ceil($scope.contestEntries.results.length/$scope.pageSize);                
    };
}]);
