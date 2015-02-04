
/* Setup general page controller */
MetronicApp.controller('AdminController', ['$rootScope', '$scope', 'settings', '$http', function($rootScope, $scope, settings, $http) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.form = {
        title: "", 
	    contest_picture: null, 
	    soundcloud_playlist_link: "", 
	    description: "", 
	    prize: "", 
	    max_entries: "", 
	    type: null, 
	    entry_fee: null, 
	    opponent_type: null, 
	    prize_payout: null, 
	    songs_per_entrant: null, 
	    is_live: false, 
	    start_time: null, 
	    end_time: null, 
	    editors_pick: null, 
	    creator: null
    };

    $scope.submitForm = function() {

    	// $scope.form.max_entries = "-1";
    	// $scope.form.type = "POOL";
    	// $scope.form.opponent_type = "ANYONE";
    	// $scope.form.prize_payout = "WINNERTAKESALL";

    	$scope.form.max_entries = parseInt($scope.form.max_entries);
    	$scope.form.entry_fee = parseInt($scope.form.entry_fee);
    	$scope.form.songs_per_entrant = parseInt($scope.form.songs_per_entrant);
    	$scope.form.editors_pick = parseInt($scope.form.editors_pick);

    	console.log($scope.form);

        $http({
            url: '/api/contests/',
            method: "POST",
            data: JSON.stringify($scope.form),
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
        	  	console.log(data);
                alert("Contest created! Thanks for submitting!");
            }).error(function (data, status, headers, config) {
                // $scope.status = status;
        	  	console.log(data);
                alert("Try again.");
            });
    };

}]);
