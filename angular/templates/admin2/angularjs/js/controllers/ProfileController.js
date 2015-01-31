
/* Setup general page controller */
MetronicApp.controller('ProfileController', ['$rootScope', '$scope', 'settings', 'myInfo', function($rootScope, $scope, settings, myInfo) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	$scope.myInfo = myInfo;

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });
}]);
