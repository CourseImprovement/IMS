


/**
 * @start angular
 */
var app = angular.module('admin', []);
app.controller('adminCtrl', ["$scope", function($scope){
	/**
	 * Current semester
	 */
	var sem = window.config.getCurrentSemester();

	/**
	 * @start menu toggle
	 */
	/**
	 * @name reset
	 * @description Reset all variables
	 * @assign Chase and Grant
	 * @todo 
	 *  + surveyName, surveyWeek, and Placement to empty strings
	 *  + file and surveyId to null
	 *  + evalustions and editingQuestion to an empty object
	 *  + isFile to false
	 */
	function reset(){
		$scope.surveyName = '';
		$scope.surveyWeek = '';
		$scope.Placement = '';
		$scope.csv = [];
		$scope.file = null;
		$scope.evaluations = {};
		$scope.isFile = false;
		$scope.useCourse = null;
		surveyId = null;
		editingQuestion = {};
	}
	/**
	 * Used to toggle page views. Default is the 'home' page
	 */
	$scope.mode = 'home';
	/**
	 * @name changeMode
	 * @description Changes the webpages
	 * @assign Chase and Grant
	 * @todo 
	 *  + Assign the mode a value to change the web page
	 *   + if Register or Process reset the surveys
	 *   + if home reset all variables
	 */
	$scope.changeMode = function(mode){
		if (mode == 'Register' || mode == 'Process'){
			$scope.surveys = window.config.surveys;
		}

		if ($scope.mode == 'home'){
			reset();
		}
		
		$scope.mode = mode;
	}
	/**
	 * @end
	 */
	
	 /**
	  * @name UseTool 
	  * @description
	  */
	$scope.UseTool = function(left, right, useCourse){
		var t = new Tool(this.file, left, right, useCourse);
		t.parse();
	}
	
	/**
	 * @start permissions
	 */
	/**
	 * @name  checkPermissions
	 * @description Check permissions
	 * @assign Chase and Grant
	 */
	var permissionsGlobal;
	$scope.checkPermissions = function(){
		if (!permissionsGlobal) permissionsGlobal = new Permissions();
		var checked = permissionsGlobal.check();
		if (checked){
			alert('Permissions needs changes');
		}
		else{
			alert('No permission changes needed');
		}
	}
	/**
	 * @name permissions
	 * @description Alerts the user to the percentage completed
	 * @assign Chase and Grant
	 */
	$scope.permissions = function(){
		if (!permissionsGlobal) permissionsGlobal = new Permissions();
		permissionsGlobal.start();
	}
	/**
	 * @end
	 */



	/**
	 * @start Leadership Evaluation
	 */
	/**
	 * Has an evaluation been added yet
	 */
	$scope.evalAdded = false;
	/**
	 * Holds all the evaluations
	 */
	$scope.evaluations = {};
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
						alert("columns need to be read from left to right (A-Z)");
						throw "columns need to be read from left to right (A-Z)";
					}
					for (var j = start; j <= end; j++){
						sets.splice(sets.length, 0, Config.columnNumberToLetter(j));
					}
				} else {
					if (sets[i].length > 2) {
						alert("The columns that can be reached are A-ZZ");
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
	 * @name  addEvaluation
	 * @description Adds the evaluation to the evaluations array
	 * @assign Grant
	 * @todo
	 *  + check that the variables are strings and arrays
	 *  + create evals by questions
	 *  + add evaluations to evals 
	 *  + error handling
	 */
	$scope.addEvaluation = function(bRole, fRole, email, columns, questions, logics){
		if (bRole == fRole){
			alert("The evaluations can not be done at the same level. e.g. by: INSTRUCTOR for: INSTRUCTOR");
			return;
		}

		if (bRole == null || fRole == null || email == null || columns == null || questions == null || logics == null){
			alert("Some information was left out!");
			return;
		}

		if (bRole == '' || fRole == '' || email == '' || columns == '' || questions == '' || logics == ''){
			alert("Some information was left out!");
			return;
		}

		if (columns.indexOf(';') == -1 && columns.indexOf('-') == -1 && columns.length > 2){
			alert("Please seperate each column with a ';' (no spaces needed)");
			return;
		}
		
		var cs = arrayOfColumns(columns);
		var qs = questions.split(';');
		var ls = logics.split(';');

		if (cs.length != qs.length || qs.length != ls.length){
			alert('The number of columns, questions, and logic selections do not match.\n' + 
				'Be sure they are all the same length and check that you have seperated\n' + 
				'them with semicolons');
			return;
		}

		for (var i = 0; i < cs.length; i++){
			if (cs[i] == ""){
				alert('One of the columns is blank.');
				return;
			} else if (qs[i] == ""){
				alert('One of the question texts is blank.');
				return;
			} else if (ls[i] == ""){
				alert('One of the logic options is blank.');
				return;
			}
		}

		var eval = [];

		for (var i = 0; i < cs.length; i++){

			if (ls[i] != 'p' && ls[i] != 'v'){
				alert("Use either a single 'p' (percentage) or 'v' (value) for specifying logic");
				return;
			}

			eval.push({
				col: cs[i],
				question: qs[i],
				logic: ls[i]
			});	
		}

		$scope.evaluations = {
			eBy: bRole,
			eFor: fRole,
			emailCol: email,
			dataSeries: eval
		};

		$scope.evalAdded = true;
	}
	/**
	 * @name clearEvaluation
	 * @description Resets the current evaluation
	 * @assign Grant
	 * @todo 
	 *  + Clear the evaluations
	 *  + Change evalAdded to false
	 *  + Change isFile to false 
	 */
	$scope.clearEvaluation = function(){
		$scope.evaluations = {};
		$scope.evalAdded = false;
		$scope.isFile = false;
	}
	/**
	 * @name CreateEvaluationCSV
	 * @description Create a new evaluation and parses the evaluations previously gathered
	 * @assign Grant
	 * @todo 
	 *  + Make sure their are evaluations to do
	 *  + Create an Evaluations object
	 *  + Begin the parsing process
	 *  + Return to the home page
	 */
	$scope.CreateEvaluationCSV = function(){
		if ($scope.evaluations == {}){
			alert('Add an evaluation before you start the process.');
			return;
		}

		var e = new Evaluations($scope.evaluations, $scope.file);
		e.parse();
		$scope.mode = 'home';
		$scope.clearEvaluation();
	}
	/**
	 * @end
	 */



	/**
	 * @start Semester Setup
	 */
	/**
	 * @name  semesterSetup
	 * @description Creates all semester files based on provided org file 
	 * @assign Chase and Grant
	 * @todo
	 *  + Create a new CSV object
	 *  + Read the file
	 *  + Create a SemesterSetup object
	 *  + Start the semesterSetup 
	 */
	$scope.semesterSetup = function(){
		var csv = new CSV();
		csv.readFile($scope.file, function(file){
			setTimeout(function(){
				var s = new SemesterSetup(file.data);
				s.semesterSetup();
			}, 10);
		});
	}
	/**
	 * @name semesterUpdate
	 * @description Updates all semester files based on provided org file 
	 * @assign Chase and Grant
	 */
	$scope.semesterUpdate = function(){
		var s = new SemesterSetup();
		s.semesterUpdate();
	}
	/**
	 * @end
	 */
	


	/**
	 * @start Select File
	 */
	/**
	 * Contains the current file
	 */
	$scope.file = null;
	/**
	 * Has a file been chosen
	 */
	$scope.isFile = false;
	/**
	 * @name  chooseFile
	 * @description Select a file
	 * @assign Chase and Grant
	 * @todo
	 *  + Create a file input in the html using jquery
	 *  + Click to add file
	 *  + isFile is true
	 *  + file is now the selected file 
	 */
	$scope.chooseFile = function(){
		setTimeout(function(){
			$('body').append('<input type="file" id="surveyFile">');
			$('#surveyFile').change(function(){
				$scope.$apply(function(){
					$scope.isFile = true;
				});
				$scope.file = this.files[0];
				$(this).remove();
			}).click();
		}, 100);
	}
	/**
	 * @end
	 */
	


	/**
	 * @start Process Survey
	 */
	/**
	 * @name processSurvey
	 * @description Begin processing the survey
	 * @assign Chase
	 * @todo 
	 *  + Find the survey settings from the config
	 *  + This survey is now the selected survey
	 *  + Error handling
	 *  + Create a new CSV object
	 *  + Read the file
	 *  + Start the survey processing 
	 */
	$scope.processSurvey = function(id){
		var survey = window.config.getSurveyById(id);
		window.config.selectedSurvey = survey;
		$scope.selectedSurvey = survey;
		if (!survey){
			alert('Invalid Survey');
			return;
		}
		var csv = new CSV();
		csv.readFile($scope.file, function(file){
			setTimeout(function(){
				survey.process(file.data);
			}, 10);
		});
	}
	/**
	 * @end
	 */
	


	/**
	 * @start Survey Setup
	 */
	/**
	 * List of all surveys
	 */
	$scope.surveys = [];
	/**
	 * The name of the survey
	 */
	$scope.surveyName = '';
	/**
	 * Week of the survey
	 */
	$scope.surveyWeek = '';
	/**
	 * Placement of survey
	 */
	$scope.Placement = '';
	/**
	 * Holds the questions for a specific survey
	 */
	$scope.questions = [];
	/**
	 * CSV Data
	 */
	$scope.csv = [];
	/**
	 * Identifier for the survey
	 */
	var surveyId = null;
	/**
	 * Contains all the questions to change
	 */
	var editingQuestion = {};
	/**
	 * @name surveyModifications
	 * @description All survey modification go through here
	 * @assign Chase and Grant
	 * @todo
	 *  + Get the survey settings from the config
	 *  + This survey is now the selected survey
	 *  + if register a survey
	 *   + Create a new CSv object
	 *   + Read file
	 *   + Change webpages
	 *   + Start to modify a new survey
	 *  + if delete a survey
	 *   + Remove the survey from the config
	 *  + if copy a survey
	 *   + Copy the survey and increment its id 
	 *  + if modify a survey
	 *   + Change to modify a survey webpage  
	 *  + Error handling
	 */
	$scope.surveyModifications = function(type, id){
		surveyId = id;
		var survey = window.config.getSurveyById(id);
		$scope.selectedSurvey = survey;
		window.config.selectedSurvey = survey;
		if (type == 'register'){ // REGISTER NEW SURVEY - PERFORM IN CTRL
			var csv = new CSV();
			csv.readFile($scope.file, function(file){
				$scope.csv = file.data[1];
			});
			$scope.mode = 'RegisterStart';
			$scope.modifySurvey();
		}
		else if (type == 'delete'){ // DELETE SURVEY
			window.config.remove(id);
			$scope.mode = 'home';
		}
		else if (type == 'copy'){ // COPY SURVEY
			var copy = survey.copy();
			window.config.addSurvey(copy);
			$scope.mode = 'home';
		}
		else if (type == 'modify'){ // MODIFY SURVEY - PERFORM IN CTRL
			$scope.mode = 'RegisterStart';
			$scope.modifySurvey(id);
		}
		else{
			throw 'Invalid $scope.mode';
		}
	}
	/**
	 * @name modifySurvey
	 * @description Updates a surveys data comlumns
	 * @assign Chase
	 * @todo
	 *  + Get the survey to be modified
	 *  + Set the selectedSurvey
	 *  + Set the questions
	 */
	$scope.modifySurvey = function(id){
		var survey = null;
		if (!id || id.length < 1) {
			survey = window.config.newSurvey();
		}
		else{
			survey = window.config.getSurveyById(id);
		}
		window.config.selectedSurvey = survey;
		$scope.selectedSurvey = survey;
		$scope.questions = survey.questions;
	}
	/**
	 * @name  submitSurvey
	 * @description Submits a newly created survey and saves it to the config file
	 * @assign Chase
	 * @todo 
	 *  + Assign the questions to the selected survey's questions
	 *  + Save the selected survey
	 *  + Change the view to the home page
	 */
	$scope.submitSurvey = function(){
		$scope.selectedSurvey.questions = $scope.questions;
		$scope.selectedSurvey.save();
		$scope.mode = 'home';
	}
	/**
	 * @name addBlankQuestion
	 * @description Add a question to a survey
	 * @assign Chase
	 * @todo
	 *  + Show the add question dialog
	 *  + Create a new question with the id incremented
	 *  + Assign the new question to the selected question
	 */
	$scope.addBlankQuestion = function(){
		$scope.showDialog = true;
		var q = new Question({
			id: $scope.selectedSurvey.getHighestQuestionId() + 1
		}, false);

		$scope.selectedQuestion = q;
	}
	/**
	 * @name  addQuestion
	 * @description Add aquestion to a survey
	 * @assign Chase
	 * @todo 
	 *  + Remove question dialog 
	 *  + Assign the selected question to the selected survey
	 */
	$scope.addQuestion = function(){
		$scope.showDialog = false;
		$scope.selectedSurvey.addQuestion($scope.selectedQuestion);
	}
	/**
	 * @name  editQuestion
	 * @description Edit the question
	 * @assign Chase
	 * @todo 
	 *  + Assign the question as the selected question
	 *  + Show the edit question dialog
	 */
	$scope.editQuestion = function(q){
		$scope.selectedQuestion = q;
		$scope.showDialog = true;
	}
	/**
	 * @name columnNumberToLetter
	 * @description Convert a number to a letter(excel column)
	 * @assign Chase
	 * @todo
	 *  + Call the column number to letter function in config
	 *  + return value
	 */
	$scope.columnNumberToLetter = function(col){
		return Config.columnNumberToLetter(col);	
	}
	/**
	 * @name columnLetterToNumber
	 * @description Convert a letter(excel column) to a number 
	 * @assign Chase
	 * @todo
	 *  + Call the column letter to number function in config
	 *  + return value
	 */
	$scope.columnLetterToNumber = function(col){
		return Config.columnLetterToNumber(col);
	}
	/**
	 * @name removeQuestion
	 * @description Remove a question
	 * @assign Chase
	 * @todo 
	 *  + Remove the question from questions
	 */
	$scope.removeQuestion = function(q){
		$scope.questions.splice($scope.questions.indexOf(q), 1);
	}
	/**
	 * @name closeDialog
	 * @description Close the dialog
	 * @assign Chase
	 * @todo 
	 *  + Change showDialog to false 
	 */
	$scope.closeDialog = function(){
		$scope.showDialog = false;
	}
	/**
	 * @name upper
	 * @description Column Letter will always be upper case
	 * @assign Chase
	 * @todo 
	 *  + Convert the string to uppercase
	 *  + Return string
	 */
	$scope.upper = function(e){
		return $(e.target).val().toUpperCase();
	}
	/**
	 * @end
	 */
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
/**
 * @end
 */