var app = angular.module('ims', ['highcharts-ng']);

if (!ims.error){
	app.controller('view', ['$scope', function($scope){
		var currentUser = User.getCurrent();

		//$scope.tiles = currentUser.getRole().getTiles();

		// MENU
		$scope.redirectHome = User.redirectHome;
		$scope.user = currentUser;
		$scope.semester = ims.semesters;
		$scope.searchOpened = false;
		$scope.openSearch = function(){
			setTimeout(function(){
				$scope.$apply(function(){
					$('#search').addClass('search-open');
					setTimeout(function(){
						$('.searchInput').focus();
					}, 10);
					$scope.searchOpened = true;
				})
			}, 20);
		}

		$scope.closeSearch = function(){
			$('#search').removeClass('search-open');
			$scope.searchOpened = false;
			$scope.suggestions = [];
		}

		if (!ims.aes.value.ce){
			$('#searchScreen').fadeIn();
		}
		else{
			$('#fade').fadeIn();
		}

		// GLOBAL
		$scope.toggleMenu = function(){
			$scope.closeSearch();
		}

	}]);
}
else{
	if (!ims.search){
		app.controller('view', ['$scope', function($scope){

			$('#errMsg').html('Invalid person or Inadequate Access');
	  	$('#error').fadeIn();
	  	
		}]);
	}
	else{
		app.controller('view', ['$scope', function($scope){

			$('#searchScreen, #enterEmail').fadeIn();
			$scope.search = function(e, val){
				if (e.keyCode == 13){
					User.redirectToDashboard(val);
				}
			}
	  	
		}]);
	}
}