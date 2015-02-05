
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
        // alert($scope.form.start_time);
        var start_time = $scope.form.start_time.split(" ");
        var start_date = start_time[0].split("/")
        $scope.form.start_time = start_date[2] + "-" + start_date[1] + "-" + start_date[0] + 'T' + start_time[1];
        console.log($scope.form.start_time);
        var end_time = $scope.form.end_time.split(" ");
        var end_date = end_time[0].split("/");
        $scope.form.end_time = end_date[2] + "-" + end_date[1] + "-" + end_date[0] + 'T' + end_time[1];
        console.log($scope.form.start_time);

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
                console.log("ERROR");
        	  	console.log(data);
                alert("Try again.");
            });
    };

}]);
