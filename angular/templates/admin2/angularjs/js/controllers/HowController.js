
/* Setup how page controller */
MetronicApp.controller('HowController', ['$rootScope', '$scope', 'settings', function($rootScope, $scope, settings) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = true;
    });

	$scope.max = 3;
	var value = 1;
	$scope.dynamic = value;

  // $scope.random = function() {
  //   var value = Math.floor((Math.random() * 100) + 1);
  //   var type;

  //   if (value < 25) {
  //     type = 'success';
  //   } else if (value < 50) {
  //     type = 'info';
  //   } else if (value < 75) {
  //     type = 'warning';
  //   } else {
  //     type = 'danger';
  //   }

  //   $scope.showWarning = (type === 'danger' || type === 'warning');

  //   $scope.dynamic = value;
  //   $scope.type = type;
  // };
  // $scope.random();

  // $scope.randomStacked = function() {
  //   $scope.stacked = [];
  //   var types = ['success', 'info', 'warning', 'danger'];

  //   for (var i = 0, n = Math.floor((Math.random() * 4) + 1); i < n; i++) {
  //       var index = Math.floor((Math.random() * 4));
  //       $scope.stacked.push({
  //         value: Math.floor((Math.random() * 30) + 1),
  //         type: types[index]
  //       });
  //   }
  // };
  // $scope.randomStacked();

  $scope.back = function() {
    // var type;

    if (value > 1) {
    	value--;
    	document.getElementById('how-to-play').innerHTML = '<img class="img-tutorial" src="/assets/global/img/tutorial/how_to_play_' + value + '.png">';
    	if (value == 2) {
	    	document.getElementById('jam-modal-tutorial').innerHTML = '<button type="button" class="btn btn-primary red-nostra" data-toggle="modal" data-target="#rulesModal">What are Jam Points?</button>';
	    }
	    else {
	    	document.getElementById('jam-modal-tutorial').innerHTML = '';
	    }
    }

    // $scope.showWarning = (type === 'danger' || type === 'warning');

    $scope.dynamic = value;
    // $scope.type = type;

  };

  $scope.next = function() {
	// var type;

	if (value < 3) {
		value++;
		document.getElementById('how-to-play').innerHTML = '<img class="img-tutorial" src="/assets/global/img/tutorial/how_to_play_' + value + '.png">';
		if (value == 3) {
	    	document.getElementById('jam-modal-tutorial').innerHTML = '<button type="button" class="btn btn-primary red-nostra" data-toggle="modal" data-target="#rulesModal">What are Jam Points?</button>';
	    }
	   	else {
	    	document.getElementById('jam-modal-tutorial').innerHTML = '';
	    }
	}

	// $scope.showWarning = (type === 'danger' || type === 'warning');

	$scope.dynamic = value;
	// $scope.type = type;
  };

}]);