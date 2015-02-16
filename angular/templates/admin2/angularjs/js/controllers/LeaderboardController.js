
/* Setup general page controller */
MetronicApp.controller('LeaderboardController', ['$rootScope', '$scope', '$http', 'settings', 'leaders', '$sce', '$location', '$anchorScroll', function($rootScope, $scope, $http, settings, leaders, $sce, $location, $anchorScroll) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();
    	// set default layout mode
      $rootScope.settings.layout.pageSidebarClosed = true;
    });

    $scope.leaders = leaders;

    // $scope.gotoTastemakers = function() {
    //   // set the location.hash to the id of
    //   // the element you wish to scroll to.
    //   $location.hash('tastemakers');

    //   // call $anchorScroll()
    //   $anchorScroll();
    // };

    // $scope.gotoUpcomingJams = function(x) {
    //   // set the location.hash to the id of
    //   // the element you wish to scroll to.
    //   $location.hash('upcomingjams');

    //   // call $anchorScroll()
    //   $anchorScroll();
    // };

    $scope.getProfilePicture = function(pic) {
      var src = '';
        
      // if (pic == null) {
      //       // var randomPic = Math.random()*100;
      //       // if (randomPic < 100/3) {
      //       //     return src = '/assets/admin/pages/media/profile/profile-landscape.jpg';
      //       // }
      //       // else if (randomPic >= 100/3 && randomPic <= 200/3) {
      //       //     return src = '/assets/admin/pages/media/profile/profile-swan.jpg';
      //       // }
      //       // else if (randomPic > 200/3) {
      //       //     return src = '/assets/admin/pages/media/profile/profile-car.jpg'; 
      //       // }
      //       return src = '/assets/admin/pages/media/profile/profile-car.jpg';
      // }
      // else {
        return pic;
      // }
    };

}]);
