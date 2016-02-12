/**
 * @start angular
 */
var app = angular.module('admin', []);
app.controller('adminCtrl', ["$scope", function($scope) {
	$scope.view = 'instructions';
	$scope.surveys = window.config.surveys;
	$scope.file = null;
	$scope.isFile = false;
	$scope.prepareTool = {left: '', right: '', useCourse: false};
	$scope.selectedSurvey = window.config.surveys[0];
	$scope.question = {
		columnLetter: '',
		questionText: '',
		replaces: []
	};
	$scope.savedEvaluations = [];
	$scope.evaluation = {
		id: '',
		name: '',
		'for': '',
		by: '',
		emailCol: '',
		dataSeries: []
	}

	$scope.menu = [
		{name: 'Instructions', icon: 'home', active: true},
		{name: 'Process', icon: 'settings', active: false},
		{name: 'Permissions', icon: 'spy', active: false},
		{name: 'Semester Setup', icon: 'puzzle', active: false},
		{name: 'Evaluations', icon: 'doctor', active: false},
		{name: 'Qualtrics Prep', icon: 'lightning', active: false},
		{name: 'Add Survey', icon: 'plus', active: false},
		{name: 'Remove Survey', icon: 'remove', active: false},
		{name: 'Copy Survey', icon: 'copy', active: false},
		{name: 'Modify Survey', icon: 'edit', active: false}
	];

	$scope.selectedMenuItem = $scope.menu[0];

	setTimeout(function() {
		$('.ui.accordion').accordion();
	}, 10);
	/**
	 * @name hasPageBeenEdited 
	 * @description checks to see if a page has been edited
	 * @assign Chase
	 * @todo
	 *  + Determine if the view may need to check if uses really wants to leave
	 *   + Check if its respective data has been set
	 */
	function hasPageBeenEdited() {
		if ($scope.view == 'add survey' || $scope.view == 'modify survey') {
			var s = $scope.selectedSurvey;
			if (s != null) {
				if (!!s.name || !!s.week || !!s.email || !!s.course) {
					return true;
				}
			}
		} else if ($scope.view == 'evaluations') {
			var e = $scope.evaluation;
			if (e.by != '' || e.emailCol != '' || e['for'] != '' || e.dataSeries.length > 0) {
				return true;
			}
		}
		return false;
	}
	/**
	 * @name menuChange 
	 * @description changes the webpage between the different views
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.menuChange = function(menuItem) {
		var proceed = true;
		if (hasPageBeenEdited()) {
			proceed = confirm('Are you sure you want to leave this page?');
			if (proceed) {
				$scope.evaluation = {
					id: '',
					name: '',
					'for': '',
					by: '',
					emailCol: '',
					dataSeries: []
				}
			}
		}
		if (proceed) {
			for (var i = 0; i < $scope.menu.length; i++) {
				$scope.menu[i].active = false;
			}
			$scope.selectedMenuItem = menuItem;
			menuItem.active = true;
			$scope.view = menuItem.name.toLowerCase();
			if ($scope.view.indexOf('survey') > -1 || $scope.view == 'process') {
				setTimeout(function(){
					$('.selection.dropdown:not(#whichView)').dropdown({
						onChange: function(value, text) {
							surveySelected(value, text, true);
						}
					});

					if ($scope.view == 'modify survey' || $scope.view == 'add survey') {
						$('#whichView').dropdown({
							onChange: function(value, text) {
								$scope.selectedSurvey.placement = value;
							}
						});
					}

					if ($scope.view == 'add survey') {
						$scope.$apply(function() {
							$scope.selectedSurvey = window.config.newSurvey();
							$scope.selectedSurvey.isNew = true;
						});
					}
					else {
						if ($scope.selectedSurvey && $scope.selectedSurvey.isNew) {
							$scope.selectedSurvey.remove();
							$scope.selectedSurvey = null;
							window.config.selectedSurvey = null;
							$scope.$apply(function() {
								$scope.surveys = window.config.surveys;
							});
						}
					}
				}, 10);
			}
			else if ($scope.view.indexOf('qualtrics') > -1) {
				setTimeout(function() {
					$('#left').dropdown({
						onChange: function(value, text) {
							$scope.prepareTool.left = value;
						}
					});
					$('#right').dropdown({
						onChange: function(value, text) {
							$scope.prepareTool.right = value;
						}
					});
					$('#course').checkbox({
						onChange: function() {
							$scope.prepareTool.useCourse = !$scope.prepareTool.useCourse;
						}
					});
				}, 10);
			}
			else if ($scope.view == 'instructions') {
				setTimeout(function() {
					$('.ui.accordion').accordion();
				}, 10);
			}
			else if ($scope.view == 'evaluations') {
				
				$scope.savedEvaluations = window.config.evaluations;
			
				setTimeout(function() {
					$('.selection.dropdown:not(#whichView)').dropdown({
						onChange: function(value, text) {
							evaluationSelected(value, text);
						}
					});
					$('#for').dropdown({
						onChange: function(value){
							$scope.evaluation['for'] = value;
						}
					});
					$('#by').dropdown({
						onChange: function(value) {
							$scope.evaluation.by = value;
						}
					})
				}, 10);
			}
		}
	}
	/**
	 * @name evaluationSelected 
	 * @description fills out the evaluation form with a selected evaluation
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	function evaluationSelected(id, text) {
		for (var i = 0; i < $scope.savedEvaluations.length; i++) {
			if ($scope.savedEvaluations[i].id == id) {
				$scope.$apply(function(){
					$scope.evaluation = $scope.savedEvaluations[i];
					$('#for').dropdown('set selected', $scope.evaluation['for']);
					$('#by').dropdown('set selected', $scope.evaluation.by);
				});
			}
		}
	}
	/**
	 * @name surveySelected 
	 * @description Sets the selected survey
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	function surveySelected(value, text, force) {
		if (typeof $scope.selectedSurvey != 'object') {
			$scope.selectedSurvey = value;
			$scope.selectedSurvey = getSelectedSurvey();
			window.config.selectedSurvey = $scope.selectedSurvey;
		}
		if (force) {
			$scope.selectedSurvey = value;
			$scope.selectedSurvey = getSelectedSurvey();
			window.config.selectedSurvey = $scope.selectedSurvey;
		}
		$scope.$apply(function() {
			if (typeof $scope.selectedSurvey != 'object') {
				$scope.selectedSurvey = value;
				$scope.selectedSurvey = getSelectedSurvey();
				window.config.selectedSurvey = $scope.selectedSurvey;
			}
			if (force) {
				$scope.selectedSurvey = value;
				$scope.selectedSurvey = getSelectedSurvey();
				window.config.selectedSurvey = $scope.selectedSurvey;
			}
			if ($('#whichView').length > 0) {
				$('#whichView').dropdown('set selected', $scope.selectedSurvey.placement);
			}
		});
	}
	/**
	 * @name getSelectedSurvey 
	 * @description Get a survey from the list of surveys
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	function getSelectedSurvey() {
		if (!$scope.selectedSurvey) {
			errAlert('Invalid Survey');
			return false;
		}
		else if (typeof $scope.selectedSurvey != 'string') {
			return $scope.selectedSurvey;
		}
		var id = parseInt($scope.selectedSurvey);
		for (var i = 0; i < $scope.surveys.length; i++) {
			if ($scope.surveys[i].id == id) {
				return $scope.surveys[i];
			}
		}
	}
	/**
	 * @name reload 
	 * @description sets the reload time of the window
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	function reload(time) {
		setTimeout(function(){
			window.location.reload();
		}, time);
	}
	/**
	 * @name removeSurvey 
	 * @description remove a survey from the config file
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.removeSurvey = function() {
		var survey = getSelectedSurvey();
		window.config.remove(survey.id);
	}
	/**
	 * @name copySurvey 
	 * @description copy a survey
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.copySurvey = function() {
		var survey = getSelectedSurvey();
		var copy = survey.copy();
		window.config.addSurvey(copy);
	}
	/**
	 * @name chooseFile 
	 * @description get a file from the client
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.chooseFile = function() {
		setTimeout(function() {
			$('body').append('<input type="file" id="surveyFile" style="display:none;">');
			$('#surveyFile').change(function() {
				$scope.$apply(function() {
					$scope.isFile = true;
				});
				$scope.file = this.files[0];
				$(this).remove();
			}).click();
		}, 100);
	}
	/**
	 * @name startProcess 
	 * @description Begin to process surveys
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.startProcess = function() {
		var survey = getSelectedSurvey();
		var csv = new CSV();
		csv.readFile($scope.file, function(file) {
			setTimeout(function() {
				survey.process(file.data);
			}, 10);
		});
	}
	var permissionsGlobal;
	/**
	 * @name changePermissions 
	 * @description Begin to change permissions
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.changePermissions = function() {
		if (!permissionsGlobal) permissionsGlobal = new Permissions();
		permissionsGlobal.start();
	}
	/**
	 * @name startSemesterSetup 
	 * @description begin the semester setup process
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.startSemesterSetup = function() {
		var csv = new CSV();
		csv.readFile($scope.file, function(file) {
			setTimeout(function() {
				var s = new SemesterSetup(file.data);
				s.semesterSetup();
			}, 10);
		});
	}
	/**
	 * @name startQualtricsPrep 
	 * @description Prepares csv that can be used for organizational lookups
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.startQualtricsPrep = function() {
		var t = new Tool($scope.file, $scope.prepareTool.left, $scope.prepareTool.right, $scope.prepareTool.useCourse);
		t.parse();
	}
	/**
	 * @name removeQuestion 
	 * @description remove a question from the selected survey
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.removeQuestion = function(question) {
		if (selectedQuestion == null) {
			$scope.question = {
				columnLetter: '',
				questionText: '',
				replaces: []
			};
		}
		else{
			for (var i = 0; i < $scope.selectedSurvey.questions.length; i++) {
				if ($scope.selectedSurvey.questions[i].id == selectedQuestion.id) {
					$scope.selectedSurvey.questions.splice(i, 1);
				}
			}
		}
	}
	/**
	 * @name Replaces 
	 * @description replace text for answers to questions
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	function Replaces(type) {
		var result = '';
		if (type == 'what') {
			for (var i = 0; i < $scope.question.replaces.length; i++) {
				if (result.length > 0) {
					result += ';';
				}
				result += $scope.question.replaces[i]['what'];
			}
		}
		else if (type == 'with') {
			for (var i = 0; i < $scope.question.replaces.length; i++) {
				if (result.length > 0) { 
					result += ';';
				}
				result += $scope.question.replaces[i]['with'];
			}
		}
		return result;
	}
	/**
	 * @name ReplacesCreate 
	 * @description adds the items that will be replaces 'what' with 'with'
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	function ReplacesCreate(awhat, awith) {
		var bwhat = awhat.split(';');
		var bwith = awith.split(';');
		var result = [];
		for (var i = 0; i < bwhat.length; i++) {
			result.push({
				'with': bwith[i],
				'what': bwhat[i]
			});
		}
		return result;
	}
	/**
	 * @name addQuestion 
	 * @description Add a question to the selected survey
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.addQuestion = function() {
		$('#questionModal').modal({
			onApprove: function() {
				if (!$scope.selectedSurvey) {
					errAlert('Invalid Survey');
					return false;
				}
				$scope.$apply(function() {
					$scope.selectedSurvey.addQuestion(new Question({
						id: $scope.selectedSurvey.getHighestQuestionId() + 1,
						text: $scope.question.questionText,
						col: $scope.question.columnLetter.toUpperCase(),
						replaceWhat: Replaces('what'),
						replaceWith: Replaces('with')
					}, false));
					$scope.question = {
						columnLetter: '',
						questionText: '',
						replaces: []
					};
					$scope['what'] = '';
					$scope['with'] = '';
				})
			},
			onHide: function() {
				$scope.$apply(function() {
					$scope.question = {
						columnLetter: '',
						questionText: '',
						replaces: []
					};
					$scope['what'] = '';
					$scope['with'] = '';
				});
			}
		}).modal('show');
	}
	/**
	 * @name removeReplaces 
	 * @description remove a replace set
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.removeReplaces = function(r, idx) {
		$scope.question.replaces.splice(idx, 1);
	}
	/**
	 * @name addReplace 
	 * @description Add a replace set
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.addReplace = function(wh, wi) {
		$scope.question.replaces.push({
			'what': wh,
			'with': wi
		});
		$scope['what'] = '';
		$scope['with'] = '';
	}
	var selectedQuestion = null;
	/**
	 * @name editQuestion 
	 * @description Edit a quesiton from the selected survey
	 * @assign Chase
	 * @todo 
	 *  + complete
	 */
	$scope.editQuestion = function(question) {
		selectedQuestion = question;
		$scope.question = {
			columnLetter: selectedQuestion.col,
			questionText: selectedQuestion.text,
			replaces: ReplacesCreate(selectedQuestion.replaceWhat, selectedQuestion.replaceWith)
		};
		$('#questionModal').modal({
			onApprove: function() {
				if (!$scope.selectedSurvey) {
					errAlert('Invalid Survey');
					return false;
				}
				selectedQuestion.col = $scope.question.columnLetter;
				selectedQuestion.text = $scope.question.questionText;
				selectedQuestion.replaceWhat = Replaces('what');
				selectedQuestion.replaceWith = Replaces('with');
				$scope.question = {
					columnLetter: '',
					questionText: '',
					replaces: []
				};
				$scope['what'] = '';
				$scope['with'] = '';
			},
			onHide: function() {
				$scope.question = {
					columnLetter: '',
					questionText: '',
					replaces: []
				};
				$scope['what'] = '';
				$scope['with'] = '';
				selectedQuestion = null;
			}
		}).modal('show');
	}
	/**
	 * @name submitChanges 
	 * @description Saves the selected survey
	 * @assign Chase
	 * @todo 
	 *  + complete 
	 */
	$scope.submitChanges = function() {
		if (!$scope.selectedSurvey) {
			errAlert('Invalid Survey');
			return false;
		}
		$scope.selectedSurvey.save();
	}
	/**
	 * @name arrayOfColumns
	 * @description Gets the columns in forms A;B;C;D or A-D or A-D;E
	 * @assign Grant
	 * @todo 
	 *  + Check if there is more than one column
	 *  + Split the string on the ';'
	 *  + Start adding letters to new array
	 *   + if the letter contains a '-' then get and add all letters in between 
	 */
	function arrayOfColumns(columns) {
		if (columns.indexOf('-') > -1) {
			var sets = columns.split(';');
			for (var i = 0; i < sets.length; i++) {
				if (sets[i].indexOf('-') > -1) {
					var start = Config.columnLetterToNumber(sets[i].split('-')[0]);
					var end = Config.columnLetterToNumber(sets[i].split('-')[1]);
					sets.splice(i, 1);
					if (start > end) {
						errAlert("columns need to be read from left to right (A-Z)");
						throw "columns need to be read from left to right (A-Z)";
					}
					for (var j = start; j <= end; j++) {
						sets.splice(sets.length, 0, Config.columnNumberToLetter(j));
					}
				} else {
					if (sets[i].length > 2) {
						errAlert("The columns that can be reached are A-ZZ");
						throw "The columns that can be reached are A-ZZ";
					}
				}
			}
			return sets;
		}
		else{
			return columns.split(';');
		}
	}
	/**
	 * @name startEvaluations 
	 * @description Begin the process of parsing evaluations 
	 * @assign Grant
	 * @todo 
	 *  + Validate the incoming information
	 *  + Create a new evaluation
	 *  + Process the evaluation
	 */
	$scope.startEvaluations = function() {
		var ev = $scope.evaluation;

		for (var key in ev) { // error handling
			if (ev[key] == null || ev[key] == '') {
				errAlert("Some information was left out!");
				return;
			}
		}

		if (ev.by == ev['for']) { // error handling
			errAlert("The evaluations can not be done at the same level. e.g. by: INSTRUCTOR for: INSTRUCTOR");
			return;
		}

		var series = ev.dataSeries;
		for (var i = 0; i < series.length; i++) {
			if (series[i].text == '' ||
			series[i].col == '' ||
			series[i].logic == '') {
				errAlert("Some information was left out!");
				return;
			}
			series[i].col = series[i].col.toUpperCase();
		}

		var e = new Evaluations({
			eBy: ev.by,
			eFor: ev['for'],
			emailCol: ev.emailCol.toUpperCase(),
			dataSeries: ev.dataSeries
		}, $scope.file);

		e.parse();
	}
	/**
	 * @name addEvaluation 
	 * @description Add an evaluation to the current evaluation
	 * @assign Grant
	 * @todo
	 *  + Push a new question object onto the current evaluation
	 */
	$scope.addEvaluation = function() {
		$scope.evaluation.dataSeries.push({
			text: '',
			col: '',
			logic: ''
		});
	}
	/**
	 * @name removeEvaluation 
	 * @description Remove an evaluation from the config file
	 * @assign Grant
	 * @todo
	 *  + Get the id of the evaluation to be removed
	 *  + Remove the evaluation from the config
	 */
	$scope.removeEvaluation = function() {
		var evalId = $('#evalList').attr('value');
		window.config.removeEvaluation(evalId);
	}
	/**
	 * @name removeEvalQuestion 
	 * @description Remove a question from the current evaluation
	 * @assign Grant
	 * @todo
	 *  + Remove question at the index passed in
	 */
	$scope.removeEvalQuestion = function(index) {
		$scope.evaluation.dataSeries.splice(index, 1);
	}
	/**
	 * @name saveEvaluation 
	 * @description Save the current evaluation to the config
	 * @assign Grant
	 * @todo
	 *  + Validate the incoming information
	 *  + Create a new evaluation
	 *  + Save the evaluation
	 */
	$scope.saveEvaluation = function() {
		var ev = $scope.evaluation;

		for (var key in ev) { // error handling
			if (key != 'id') {
				if (ev[key] == null || ev[key] == '') {
					errAlert("Some information was left out!");
					return;
				}
			}
		}

		if (ev.by == ev['for']) { // error handling
			errAlert("The evaluations can not be done at the same level. e.g. by: INSTRUCTOR for: INSTRUCTOR");
			return;
		}

		var series = ev.dataSeries;
		for (var i = 0; i < series.length; i++) {
			if (series[i].text == '' ||
			series[i].col == '' ||
			series[i].logic == '') {
				errAlert("Some information was left out of a question!");
				return;
			}
			series[i].col = series[i].col.toUpperCase();
		}

		var e = new Evaluations({
			eBy: ev.by,
			eFor: ev['for'],
			emailCol: ev.emailCol.toUpperCase(),
			dataSeries: ev.dataSeries
		}, $scope.file);

		e.save(ev['name'], ev['id']);
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
		if (item['week'] ==  undefined) {
			list.splice(list.length, 0, item);
			return list;
		}
		var week = item.week;
		if (!list) return [];
		var weekAsInt = Number(week);
		if (isNaN(weekAsInt)){
			if (week == "") list.splice(list.length, 0, item);
			else if (week.toLowerCase().indexOf('pre') > -1) list.splice(list.length, 0, item);
			else if (week.toLowerCase().indexOf('intro') > -1) list.splice(list.length, 0, item);
			else if (week.toLowerCase().indexOf('concl') > -1) list.splice(0, 0, item);
			else list.splice(0, 0, item);
			return list;
		}
		else{
			for (var i = 0; i < list.length; i++) {
				if (toInt(week) >= toInt(list[i].week)) {
					list.splice(i, 0, item);
					return list;
				}
			}

			list.splice(list.length, 0, item);
			return list;
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
							if (items[i].name == undefined) console.log(i);
							if (surveyTypes[items[i].name] == undefined) surveyTypes[items[i].name] = [];
							surveyTypes[items[i].name].push(items[i]);
						}

						var keys = Object.keys(surveyTypes).sort();
						for (var j = keys.length - 1; j != -1; j--){
							var s = keys[j];
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

app.directive('allCaps', function($compile) {
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, element, attrs) {
			element.keyup(function() {
				if (typeof this.value == 'string') this.value = this.value.toUpperCase();
			});
		}
	}
});