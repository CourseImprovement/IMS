var app = angular.module('ims', ['highcharts-ng']);

if (!ims.error){
	app.controller('view', ['$scope', 'highchartsNG', function($scope, highchartsNG){
		var currentUser = User.getCurrent();

		// MENU
		$scope.redirectHome = User.redirectHome;
		$scope.user = currentUser;
		$scope.semesters = currentUser.getSemesterMenu();
		$scope.searchOpened = false;
		$scope.roleMenu = currentUser.getRole().getRolesMenu().getItems();
		$scope.showRoleMenu = false;
		$scope.showSemesterMenu = false;
		$scope.cols = currentUser.getRole().getTiles();
		$scope.selectedRole = window._selectedRole;
		$scope.backButton = currentUser.backButton();
		$scope.ims = ims;

		/**
		 * @name back 
		 * @description Go back to the previous webpage
		 */
		$scope.back = function(){
			User.redirectBack();
		}

		/**
		 * @name selectedSuggestion
		 * @description Go to the person selected
		 */
		$scope.selectedSuggestion = function(item){
			var user = new User({email: $(item._xml).attr('email'), role: $(item._xml).attr('type'), isBase: false, xml: item._xml});
			user.redirectTo();
		}

		/**
		 * @name openRoleMenu 
		 * @description Show a list of roles that the user has
		 */
		$scope.openRoleMenu = function(){
			var right = ($(window).width() - ($('.role-drop-down-public').offset().left + $('.role-drop-down-public').outerWidth()));
			$('.semester-popup-dropdown').css({right: right, top: '39px'});
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.showRoleMenu = true;
				})
			}, 2);
		}

		/**
		 * @name toggleSubMenu 
		 * @description Toggle the views of the sub menu
		 */
		$scope.toggleSubMenu = function(e){
			$(e.target).find('ul').slideToggle();
		}

		/**
		 * @name openCourseMenu 
		 * @description
		 */
		$scope.openCourseMenu = function(e){
			var right = ($(window).width() - ($('.course-drop-down').offset().left + $('.course-drop-down').outerWidth()));
			$('.semester-popup-dropdown3').css({right: right, top: '39px'});
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.showCourseMenu = true;
				})
			}, 2);
		}

		/**
		 * @name  openSemesterMenu
		 * @todo
		 *  + Set the drop down for the semester
		 */
		$scope.openSemesterMenu = function(e){
			var right = ($(window).width() - ($('.semester-drop-down-public').offset().left + $('.semester-drop-down-public').outerWidth()));		
			$('.semester-popup-dropdown2').css({right: right + 'px', top: '39px'});
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.showSemesterMenu = true;
				})
			}, 2);
		}

		/**
		 * @name openSearch 
		 * @description
		 */
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

		/**
		 * @name appendChart 
		 * @description
		 */
		$scope.appendChart = function(tile){
			setTimeout(function(){
				$('#' + tile.config).highcharts(tile.data);
			}, 10);
		}

		/**
		 * @name redirect 
		 * @description
		 */
		$scope.redirect = function(href){
			window.location.href = href;
		}

		/**
		 * @name changelimit 
		 * @description     
		 */
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

		/**
		 * @name closeSearch 
		 * @description
		 */
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
		/**
		 * @name toggleMenu 
		 * @description
		 */
		$scope.toggleMenu = function(){
			$scope.closeSearch();
			$scope.showRoleMenu = false;
			$scope.showCourseMenu = false;
			$scope.showSemesterMenu = false;
		}

		/**
		 * @name questionClick 
		 * @description
		 */
		$scope.questionClick = function(e){
			//$(e.target).parent().find('.hidden').slideToggle();
			var div = $(e.target.nodeName == 'I' ? e.target.parentNode : e.target);
			var pos = div.attr('data-position');
			msg = div.attr('data-title');
			if (msg && msg.length > 0){
				ims.tooltip(e, msg, pos);
			}
		}

		/**
		 * @name questionClickOut 
		 * @description
		 */
		$scope.questionClickOut = function(e){
			$('#tooltip, #tooltip-left').remove();
		}

		/**
		 * @name closeOverlay 
		 * @description
		 */
		$scope.closeOverlay = function(e){
			$('.rawDataOverlay').fadeOut('fast');
			$('.background-cover').fadeOut('fast');
			$(document.body).css({overflow: 'auto'});
		}

		/**
		 * @name background-cover
		 * @description
		 */
		$('.background-cover').click(function(){
			$scope.$apply(function(){
				$scope.closeOverlay();
			})
		})

		/**
		 * @name openSurveyData 
		 * @description
		 */
		$scope.openSurveyData = function(survey){
			$scope.selectedSurvey = survey;
			if ($(window).width() <= 1100){
				$('.rawDataOverlay').css({left: '10px', top: '10px', right: '10px', bottom: '10px'});
			}
			$('.rawDataOverlay').fadeIn();
			$('.background-cover').fadeIn();
			$(document.body).css({overflow: 'hidden'});
		}

		/**
		 * @name searching 
		 * @description
		 */
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

		/**
		 * @name toggleReviewed 
		 * @description
		 */
		$scope.toggleReviewed = function(survey){
			// little hack
			setTimeout(function(){
				survey.toggleReviewed();
				$scope.$apply();
			}, 10);
		}

		/**
		 * @name toggleMobileMenu 
		 * @description
		 */
		$scope.toggleMobileMenu = function(e){
			$('.mobile-menu-side').toggleClass('show-menu');
			if ($('.mobile-menu-side').hasClass('show-menu')){
				$('body').css({overflow: 'hidden'});
			}
			else{
				$('body').css({overflow: 'auto'});
			}
		}

		$scope.computer = new Computer();

		$(window).resize(function(){
			OneCol();
		})
		OneCol();

		/**
		 * @name OneCol 
		 * @description
		 */
		function OneCol(){
			var w = $(window).width();
			if (w <= 1100){
				$('.menu').addClass('hidden');
				$('.menu-mobile').removeClass('hidden');
			}
			else{
				$('.menu').removeClass('hidden');
				$('.menu-mobile').addClass('hidden');
			}
		}

	}]);

	/**
	 * @name toInt 
	 * @description Converts a str to a num and handles it if it is a range of numbers by choosing the first number
	 * @todo 
	 *  + Check that the str is not intro week
		 *  + Check for a dash
	 *  + Convert the string to an int
	 */
	function toInt(str) {
		if (str == "") return -1;
		if (str.toLowerCase().indexOf('intro') > -1) return 0;
		if (str.toLowerCase().indexOf('conclusion') > -1) return 100;

		var num = 0;

		if (str.indexOf('-') == -1) {
			num = parseInt(str);
		} else {
			num = parseInt(str.substring(0, str.indexOf('-')));
		}

		return num;
	}

	/**
	 * @name addItemReverseOrder 
	 * @description Adds a single item to the given array based on the value of the week
	 * @todo 
	 *  + If the week is empty then it is added to the end
	 *  + Add item based on items in list
	 *  + Return list 
	 */
	function addItemReverseOrder(list, item) {
		if (item['_week'] ==  undefined) {
			list.splice(list.length, 0, item);
			return list;
		}
		var week = item._week;
		if (!list) return [];
		if (list.length == 0) {
			list.push(item);
			return list;
		} else if (week == "") {
			list.splice(list.length, 0, item);
			return list;
		} else if (week.toLowerCase() == "conclusion") {
			list.splice(0, 0, item);
			return list;
		}else {
			for (var i = 0; i < list.length; i++) {
				if (toInt(week) >= toInt(list[i]._week)) {
					list.splice(i, 0, item);
					return list;
				}
			}
		}
	}

	/**
	 * @name angular.filter.reverseByWeek
	 * @description Reverses the items in an ng-repeat by id
	 * @todo
	 *  + Filter by week (Grant)
	 */
	app.filter('reverseByWeek', function() {
	  	return function(items){
	      	if (items){
	      		var finalSet = [];
	      		var surveyTypes = {};

	      		for (var i = 0; i < items.length; i++){
	      			if (surveyTypes[items[i]._name] == undefined) surveyTypes[items[i]._name] = [];
	          		surveyTypes[items[i]._name].push(items[i]);
	          	}

	          	for (var s in surveyTypes){
	          		var set = [];
	          		for (var i = 0; i < surveyTypes[s].length; i++){
		          		set = addItemReverseOrder(set, surveyTypes[s][i]);
		          	}
		          	finalSet = finalSet.concat(set);
	          	}
	          	
	          	return finalSet;
	      	}
	  	} 
	});
	
	/**
	 * @name reverse
	 * @description Reverse the items in an ng-repeat
	 */
	app.filter('reverse', function() {
	  return function(items) {
	    if (items) return items.slice().reverse();
	  };
	});

	/**
	 * @name noDuplicates
	 * @description Remove the duplates from the suggestions ng-repeat
	 */
	app.filter('noDuplicates', function(){
		return function(items){
			return items;
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