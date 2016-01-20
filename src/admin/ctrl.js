/**
 * @start angular
 */
var app = angular.module('admin', []);
app.controller('adminCtrl', ["$scope", function($scope){
	$scope.view = 'instructions';
	$scope.surveys = window.config.surveys;
	$scope.file = null;
	$scope.isFile = false;
	$scope.prepareTool = {left: '', right: '', useCourse: false};
	$scope.selectedSurvey = window.config.surveys[0];
	$scope.question = {
		columnLetter: '',
		questionText: '',
		replaceWhat: '',
		replaceWith: ''
	};
	$scope.evaluations = {
		'for': '',
		by: '',
		emailCol: '',
		dataCols: '',
		texts: '',
		logic: ''
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

	setTimeout(function(){
		$('.ui.accordion').accordion();
	}, 10);

	$scope.menuChange = function(menuItem){
		for (var i = 0; i < $scope.menu.length; i++){
			$scope.menu[i].active = false;
		}
		$scope.selectedMenuItem = menuItem;
		menuItem.active = true;
		$scope.view = menuItem.name.toLowerCase();
		if ($scope.view.indexOf('survey') > -1 || $scope.view == 'process'){
			setTimeout(function(){
				$('.selection.dropdown').dropdown({
					onChange: function(value, text){
						surveySelected(value, text, true);
					}
				});

				if ($scope.view == 'modify survey'){
					$('#whichView').dropdown({
						onChange: function(value, text){
							$scope.selectedSurvey.placement = value;
						}
					});
				}

				if ($scope.view == 'add survey'){
					$scope.$apply(function(){
						$scope.selectedSurvey = window.config.newSurvey();
					});
				}
			}, 10);
		}
		else if ($scope.view.indexOf('qualtrics') > -1){
			setTimeout(function(){
				$('#left').dropdown({
					onChange: function(value, text){
						$scope.prepareTool.left = value;
					}
				});
				$('#right').dropdown({
					onChange: function(value, text){
						$scope.prepareTool.right = value;
					}
				});
				$('#course').checkbox({
					onChange: function(){
						$scope.prepareTool.useCourse = !$scope.prepareTool.useCourse;
					}
				});
			}, 10);
		}
		else if ($scope.view == 'instructions'){
			setTimeout(function(){
				$('.ui.accordion').accordion();
			}, 10);
		}
		else if ($scope.view == 'evaluations'){
			setTimeout(function(){
				$('#for').dropdown({
					onChange: function(value){
						$scope.evaluations['for'] = value;
					}
				});
				$('#by').dropdown({
					onChange: function(value){
						$scope.evaluations.by = value;
					}
				})
			}, 10);
		}
	}

	function surveySelected(value, text, force){
		if (typeof $scope.selectedSurvey != 'object'){
			$scope.selectedSurvey = value;
			$scope.selectedSurvey = getSelectedSurvey();
		}
		if (force){
			$scope.selectedSurvey = value;
			$scope.selectedSurvey = getSelectedSurvey();
		}
		$scope.$apply(function(){
			if (typeof $scope.selectedSurvey != 'object'){
				$scope.selectedSurvey = value;
				$scope.selectedSurvey = getSelectedSurvey();
			}
			if (force){
				$scope.selectedSurvey = value;
				$scope.selectedSurvey = getSelectedSurvey();
			}
			if ($('#whichView').length > 0){
				$('#whichView').dropdown('set selected', $scope.selectedSurvey.placement);
			}
		});
	}

	function getSelectedSurvey(){
		if (!$scope.selectedSurvey) {
			errAlert('Invalid Survey');
			return false;
		}
		else if (typeof $scope.selectedSurvey != 'string'){
			return $scope.selectedSurvey;
		}
		var id = parseInt($scope.selectedSurvey);
		for (var i = 0; i < $scope.surveys.length; i++){
			if ($scope.surveys[i].id == id){
				return $scope.surveys[i];
			}
		}
	}

	function reload(time){
		setTimeout(function(){
			window.location.reload();
		}, time);
	}

	$scope.removeSurvey = function(){
		var survey = getSelectedSurvey();
		window.config.remove(survey.id);
	}

	$scope.copySurvey = function(){
		var survey = getSelectedSurvey();
		var copy = survey.copy();
		window.config.addSurvey(copy);
	}

	$scope.chooseFile = function(){
		setTimeout(function(){
			$('body').append('<input type="file" id="surveyFile" style="display:none;">');
			$('#surveyFile').change(function(){
				$scope.$apply(function(){
					$scope.isFile = true;
				});
				$scope.file = this.files[0];
				$(this).remove();
			}).click();
		}, 100);
	}

	$scope.startProcess = function(){
		var survey = getSelectedSurvey();
		var csv = new CSV();
		csv.readFile($scope.file, function(file){
			setTimeout(function(){
				survey.process(file.data);
			}, 10);
		});
	}

	var permissionsGlobal;
	$scope.changePermissions = function(){
		if (!permissionsGlobal) permissionsGlobal = new Permissions();
		permissionsGlobal.start();
	}

	$scope.startSemesterSetup = function(){
		var csv = new CSV();
		csv.readFile($scope.file, function(file){
			setTimeout(function(){
				var s = new SemesterSetup(file.data);
				s.semesterSetup();
			}, 10);
		});
	}

	$scope.startQualtricsPrep = function(){
		var t = new Tool($scope.file, $scope.prepareTool.left, $scope.prepareTool.right, $scope.prepareTool.useCourse);
		t.parse();
	}

	$scope.addQuestion = function(){
		$('#questionModal').modal({
			onApprove: function(){
				if (!$scope.selectedSurvey){
					errAlert('Invalid Survey');
					return false;
				}
				$scope.$apply(function(){
					$scope.selectedSurvey.addQuestion(new Question({
						id: $scope.selectedSurvey.getHighestQuestionId() + 1,
						text: $scope.question.questionText,
						col: $scope.question.columnLetter.toUpperCase(),
						replaceWhat: $scope.question.replaceWhat,
						replaceWith: $scope.question.replaceWith
					}, false));
					$scope.question = {
						columnLetter: '',
						questionText: '',
						replaceWhat: '',
						replaceWith: ''
					};
				})
			},
			onHide: function(){
				$scope.$apply(function(){
					$scope.question = {
						columnLetter: '',
						questionText: '',
						replaceWhat: '',
						replaceWith: ''
					};
				});
			}
		}).modal('show');
	}

	var selectedQuestion = null;
	$scope.editQuestion = function(question){
		selectedQuestion = question;
		$scope.question = {
			columnLetter: selectedQuestion.col,
			questionText: selectedQuestion.text,
			replaceWhat: selectedQuestion.replaceWhat,
			replaceWith: selectedQuestion.replaceWith
		};
		$('#questionModal').modal({
			onApprove: function(){
				if (!$scope.selectedSurvey){
					errAlert('Invalid Survey');
					return false;
				}
				selectedQuestion.col = $scope.question.columnLetter;
				selectedQuestion.text = $scope.question.questionText;
				selectedQuestion.replaceWhat = $scope.question.replaceWhat;
				selectedQuestion.replaceWith = $scope.question.replaceWith;
			},
			onHide: function(){
				$scope.question = {
					columnLetter: '',
					questionText: '',
					replaceWhat: '',
					replaceWith: ''
				};
				selectedQuestion = null;
			}
		}).modal('show');
	}

	$scope.submitChanges = function(){
		if (!$scope.selectedSurvey){
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
	function arrayOfColumns(columns){
		if (columns.indexOf('-') > -1){
			var sets = columns.split(';');
			for (var i = 0; i < sets.length; i++){
				if (sets[i].indexOf('-') > -1){
					var start = Config.columnLetterToNumber(sets[i].split('-')[0]);
					var end = Config.columnLetterToNumber(sets[i].split('-')[1]);
					sets.splice(i, 1);
					if (start > end) {
						errAlert("columns need to be read from left to right (A-Z)");
						throw "columns need to be read from left to right (A-Z)";
					}
					for (var j = start; j <= end; j++){
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

	$scope.startEvaluations = function(){
		var ev = $scope.evaluations;
		if (ev.by == ev['for']){
			errAlert("The evaluations can not be done at the same level. e.g. by: INSTRUCTOR for: INSTRUCTOR");
			return;
		}

		for (var key in ev){
			if (ev[key] == null || ev[key] == ''){
				errAlert("Some information was left out!");
				return;
			}
		}

		if (ev.dataCols.indexOf(';') == -1 && ev.dataCols.indexOf('-') == -1 && ev.dataCols.length > 2){
			errAlert("Please seperate each column with a ';' (no spaces needed)");
			return;
		}
		
		var cs = arrayOfColumns(ev.dataCols);
		var qs = ev.texts.split(';');
		var ls = ev.logic.split(';');

		if (cs.length != qs.length || qs.length != ls.length){
			errAlert('The number of columns, questions, and logic selections do not match.\n' + 
				'Be sure they are all the same length and check that you have seperated\n' + 
				'them with semicolons');
			return;
		}

		for (var i = 0; i < cs.length; i++){
			if (cs[i] == ""){
				errAlert('One of the columns is blank.');
				return;
			} else if (qs[i] == ""){
				errAlert('One of the question texts is blank.');
				return;
			} else if (ls[i] == ""){
				errAlert('One of the logic options is blank.');
				return;
			}
		}

		var eval = [];

		for (var i = 0; i < cs.length; i++){

			if (ls[i] != 'p' && ls[i] != 'v'){
				errAlert("Use either a single 'p' (percentage) or 'v' (value) for specifying logic");
				return;
			}

			eval.push({
				col: cs[i],
				question: qs[i],
				logic: ls[i]
			});	
		}

		if ($scope.evaluations == {}){
			errAlert('Add an evaluation before you start the process.');
			return;
		}

		var e = new Evaluations({
			eBy: ev.by,
			eFor: ev['for'],
			emailCol: ev.emailCol,
			dataSeries: eval
		}, $scope.file);

		e.parse();
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
	if (list.length == 0) list.push(item);
	else if (!week || week.length == 0 || week.toLowerCase() == "intro") list.splice(list.length, 0, item);
	else if (week.toLowerCase() == "conclusion") list.splice(0, 0, item); 
	else {
		for (var i = 0; i < list.length; i++) {
			if (toInt(week) >= toInt(list[i].week)) {
				list.splice(i, 0, item);
				return list;
			}
		}
	}
	return list;
}

app.filter('reverseByWeek', function() {
  	return function(items){
      	if (items){
      		var finalSet = [];
      		var surveyTypes = {};

      		for (var i = 0; i < items.length; i++){
      			if (surveyTypes[items[i].name] == undefined) surveyTypes[items[i].name] = [];
          		surveyTypes[items[i].name].push(items[i]);
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