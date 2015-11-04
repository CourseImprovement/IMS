var app = angular.module('ims', ['highcharts-ng']);

if (!ims.error){
	app.controller('view', ['$scope', 'highchartsNG', function($scope, highchartsNG){
		var currentUser = User.getCurrent();

		// MENU
		$scope.redirectHome = User.redirectHome;
		$scope.user = currentUser;
		$scope.semester = ims.semesters;
		$scope.searchOpened = false;
		$scope.roleMenu = currentUser.getRole().getRolesMenu().getItems();
		$scope.showRoleMenu = false;
		$scope.cols = currentUser.getRole().getTiles();
		$scope.selectedRole = window._selectedRole;
		$scope.backButton = currentUser.backButton();

		$scope.back = function(){
			User.redirectBack();
		}

		$scope.openRoleMenu = function(){
			var right = '71px';
			if ($('.back-btn').length > 0){
				right = '71px';
			}
			else{
				right = '39px';
			}
			$('.semester-popup-dropdown').css({right: right, top: '39px'});
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.showRoleMenu = true;
				})
			}, 2);
		}

		$scope.openCourseMenu = function(e){
			var right = '71px';
			if ($('.back-btn').length > 0){
				right = '71px';
			}	
			else{
				right = '10px';
			}		
			$('.semester-popup-dropdown3').css({right: right, top: '39px'});
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.showCourseMenu = true;
				})
			}, 2);
		}

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

		$scope.appendChart = function(tile){
			setTimeout(function(){
				$('#' + tile.config).highcharts(tile.data);
			}, 10);
		}

		$scope.redirect = function(href){
			window.location.href = href;
		}

		$scope.changelimit = function(person){
			if (person.oldLimit > -1){
				person.limit = person.oldLimit;
				person.oldLimit = -1;
			}	
			else{
				person.oldLimit = person.limit;
				person.limit = 90;
			}
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

		$(document).keyup(function(e){
			if (e.keyCode == 27){
				$scope.$apply(function(){
					$scope.closeOverlay();
					$scope.toggleMenu();
				})
			}
		});

		// GLOBAL
		$scope.toggleMenu = function(){
			$scope.closeSearch();
			$scope.showRoleMenu = false;
			$scope.showCourseMenu = false;
		}

		$scope.questionClick = function(e){
			//$(e.target).parent().find('.hidden').slideToggle();
			var div = $(e.target.nodeName == 'I' ? e.target.parentNode : e.target);
			var pos = div.attr('data-position');
			msg = div.attr('data-title');
			if (msg && msg.length > 0){
				ims.tooltip(e, msg, pos);
			}
		}

		$scope.questionClickOut = function(e){
			$('#tooltip, #tooltip-left').remove();
		}

		$scope.closeOverlay = function(e){
			$('.rawDataOverlay').fadeOut('fast');
			$('.background-cover').fadeOut('fast');
			$(document.body).css({overflow: 'auto'});
		}

		$('.background-cover').click(function(){
			$scope.$apply(function(){
				$scope.closeOverlay();
			})
		})

		$scope.openSurveyData = function(survey){
			$scope.selectedSurvey = survey;
			if ($(window).width() <= 1100){
				$('.rawDataOverlay').css({left: '10px', top: '10px', right: '10px', bottom: '10px'});
			}
			$('.rawDataOverlay').fadeIn();
			$('.background-cover').fadeIn();
			$(document.body).css({overflow: 'hidden'});
		}

		$scope.searching = function(q, e){
			if (e.keyCode == 27){
				$scope.closeSearch();
			}
			else{
				setTimeout(function(){
					var q = $(e.target).val();
					$scope.$apply(function(){
						$scope.suggestions = currentUser.getSuggested(q);
					})
				}, 10);
			}
		}

		$scope.toggleReviewed = function(survey){
			// little hack
			setTimeout(function(){
				survey.toggleReviewed();
				$scope.$apply();
			}, 10);
		}

	}]);
	
	/**
	 * Revers the items in an ng-repeat
	 */
	app.filter('reverse', function() {
	  return function(items) {
	    if (items) return items.slice().reverse();
	  };
	});

	/**
	 * Remove the duplates from the suggestions ng-repeat
	 */
	app.filter('noDuplicates', function(){
		return function(items){
			var result = [];
			var found = {};
			for (var i = 0; i < items.length; i++){
				var first = items[i].user.getRole().getRoleName().toUpperCase().slice(0, 4);
				var last = items[i].user.getFullName();
				if (!found[first + ' - ' + last]){
					result.push(items[i]);
					found[first + ' - ' + last] = true;
				}
			}
			return result;
		}
	})
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

			setTimeout(function(){
				User.redirectToLoggedInUser(function(){
						$('#searchScreen, #enterEmail').fadeIn();
				});
			}, 10);
			$scope.search = function(e, val){
				if (e.keyCode == 13){
					User.redirectToDashboard(val);
				}
			}
	  	
		}]);
	}
}