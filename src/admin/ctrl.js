


/**
 * @namespace angular
 * @typedef {Object} Xml_Document An xml document which contians organizational data and personnel data 
 */
var app = angular.module('admin', []);
app.controller('adminCtrl', ["$scope", function($scope){

	var sem = window.config.getCurrentSemester();

	// GROUP - MENU TOGGLE
	/**
	 * Reset all variables
	 */
	function reset(){
		$scope.surveyName = '';
		$scope.surveyWeek = '';
		$scope.Placement = '';
		//$scope.questions = [];
		$scope.csv = [];
		$scope.file = null;
		$scope.evaluations = {};
		$scope.isFile = false;
		surveyId = null;
		editingQuestion = {};
	}
	
	/**
	 * Toggle page views. Default is the 'home' page
	 * @memberOf angular
	 * @type {String}
	 */
	$scope.mode = 'home';
	/**
	 * Changes $scope.mode
	 * @param  {string} mode Type of view
	 * @memberOf angular
	 * @function
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
	// GROUP - MENU TOGGLE END
	


	// GROUP - PERMISSIONS
	/**
	 * Check permissions 
	 * @see {@link ims.permissions#needsChanges}
	 * @memberOf angular
	 * @function
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
	 * Alerts the user to the percentage completed
	 * @function
	 * @memberOf angular
	 */
	$scope.permissions = function(){
		if (!permissionsGlobal) permissionsGlobal = new Permissions();
	}
	// GROUP - PERMISSIONS END



	// GROUP - LEADERSHIP EVALUATION
	/**
	 * [evalAdded description]
	 * @type {Boolean}
	 */
	$scope.evalAdded = false;
	/**
	 * [evaluations description]
	 * @type {Object}
	 */
	$scope.evaluations = {};
	/**
	 * [arrayOfColumns description]
	 * @param  {[type]} columns [description]
	 * @return {[type]}         [description]
	 */
	function arrayOfColumns(columns){
		if (columns.indexOf('-') > -1){
			var sets = columns.split(';');
			for (var i = 0; i < sets.length; i++){
				if (sets[i].indexOf('-') > -1){
					var start = Config.columnLetterToNumber(sets[i].split('-')[0]);
					var end = Config.columnLetterToNumber(sets[i].split('-')[1]);
					sets.splice(i, 1);
					if (start > end) throw "columns need to be read from left to right";
					for (var j = start; j <= end; j++){
						sets.splice(i, 0, Config.columnNumberToLetter(j));
					}
				}
			}
			return sets.sort();
		}
		else{
			return columns.split(';');
		}
	}
	/**
	 * Adds the evaluation to the evaluations array
	 * @param {String} role      The role of the ones being evaluated
	 * @param {String} email     Column that contains the email
	 * @param {String} columns   Column where the data is located
	 * @param {String} questions The Text for the data column
	 * @param {String} logics    How to display the data (Percentage or Value)
	 * @memberOf angular
	 * @function
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
		
		var cs = arrayOfColumns(columns);
		var qs = questions.split(';');
		var ls = logics.split(';');

		var eval = [];

		for (var i = 0; i < cs.length; i++){
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
	 * Resets the current evaluation
	 */
	$scope.clearEvaluation = function(){
		$scope.evaluations = {};
		$scope.evalAdded = false;
		$scope.isFile = false;
	}
	/**
	 * Create a new evaluation and parses the evaluations previously gathered
	 * @memberOf angular
	 * @function
	 */
	$scope.CreateEvaluationCSV = function(){
		var e = new Evaluations($scope.evaluations, $scope.file);
		e.parseCSV();
		$scope.mode = 'home';
	}
	// GROUP - LEADERSHIP EVALUATION END



	// GROUP - SEMESTER SETUP
	/**
	 * Creates all semester files based on provided org file 
	 * @see {@link ims.surveys#readAsCsv2}
	 * @memberOf angular
	 * @function
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
	 * Updates all semester files based on provided org file 
	 * @see {@link ims.surveys#readAsCsv2}
	 * @memberOf angular
	 * @function
	 */
	$scope.semesterUpdate = function(){
		var s = new SemesterSetup();
		s.semesterUpdate();
	}
	// GROUP - SEMESTER SETUP END
	


	// GROUP - SELECT FILE
	/**
	 * Contains the current file
	 * @type {[type]}
	 */
	$scope.file = null;
	$scope.isFile = false;
	/**
	 * Select a file
	 * @function
	 * @memberOf angular
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
	// GROUP - SELECT FILE END
	


	// GROUP - PROCESS SURVEY
	/**
	 * Begin processing the survey
	 * @param  {string} survey Current survey being processed
	 * @function
	 * @memberOf angular
	 */
	$scope.processSurvey = function(id){
		var survey = window.config.getSurveyById(id);
		window.config.selectedSurvey = survey;
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
	// GROUP - PROCESS SURVEY END
	


	// GROUP - SURVEY SETUP
	/**
	 * List of all surveys
	 * @memberOf angular
	 * @type {Array}
	 */
	$scope.surveys = [];
	/**
	 * The name of the survey
	 * @type {String}
	 * @memberOf angular
	 */
	$scope.surveyName = '';
	/**
	 * Week of the survey
	 * @type {String}
	 * @memberOf angular
	 */
	$scope.surveyWeek = '';
	/**
	 * Placement of survey
	 * @type {String}
	 * @memberOf angular
	 */
	$scope.Placement = '';
	/**
	 * Holds the questions for a specific survey
	 * @type {Array}
	 * @memberOf angular
	 */
	$scope.questions = [];
	/**
	 * [csv description]
	 * @type {Array}
	 */
	$scope.csv = [];
	/**
	 * Identifier for the survey
	 * @type {null}
	 */
	var surveyId = null;
	/**
	 * Contains all the questions to change
	 * @type {Object}
	 * @memberOf angular
	 */
	var editingQuestion = {};
	/**
	 * [surveyModifications description]
	 * @return {[type]} [description]
	 */
	$scope.surveyModifications = function(type, id){
		surveyId = id;
		var survey = window.config.getSurveyById(id);
		window.config.selectedSurvey = survey;
		if (type == 'register'){ // REGISTER NEW SURVEY - PERFORM IN CTRL
			var csv = new CSV();
			csv.readFile($scope.file, function(file){
				$scope.csv = file.data[1];
			});
			$scope.mode = 'RegisterStart';
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
	 * Updates a surveys data comlumns
	 * @param  {String} id Id of the survey to be modified
	 * @function
	 * @memberOf angular
	 */
	$scope.modifySurvey = function(id){
		if (!id || id.length < 1) return;

		var survey = window.config.getSurveyById(id);
		window.config.selectedSurvey = survey;
		$scope.selectedSurvey = survey;
		$scope.questions = survey.questions;
	}
	/**
	 * Submits a newly created survey and saves it to the config file
	 * @param  {String} name      Name of the survey
	 * @param  {String} week      When the survey was taken
	 * @param  {String} placement Who the survey is for
	 * @param  {String} e         Email column
	 * @param  {String} t         Type column
	 * @param  {String} w         Week column
	 * @function
	 * @memberOf angular
	 */
	$scope.submitSurvey = function(){
		$scope.selectedSurvey.questions = $scope.questions;
		if ($scope.file == null){
			$scope.selectedSurvey.save();
		}
		else{
			var emailCol = $('#eCol').val();
			var typeCol = $('#tCol').val();
			var weekCol = $('#wCol').val();
			var courseCol = $('#cCol').val();
			var placement = $('#Placement').val();
			var id = window.config.getHighestSurveyId()++;
			var survey = new Survey({
					email: emailCol, 
					type: typeCol, 
					week: weekCol, 
					course: courseCol, 
					placement: placement, 
					id: id, 
					questions: $scope.questions
				}, 
				false);
			window.config.surveyRegister(survey);
		}

		$scope.mode = 'home';
	}
	/**
	 * Add a question to a survey
	 * @function
	 * @memberOf angular
	 */
	$scope.addBlankQuestion = function(){
		$scope.showDialog = true;
		$scope.arow = "";
		$scope.atext = "";
		$scope.awhat = "";
		$scope.awith = "";
		$scope.arow2 = "";
	}
	/**
	 * Add aquestion to a survey
	 * @param {String} row   Data row in CSV file
	 * @param {String} text  Question text
	 * @param {String} what  What to change in text
	 * @param {String} awith Change the text with this
	 * @function
	 * @memberOf angular
	 */
	$scope.addQuestion = function(){
		$scope.showDialog = false;
	}
	/**
	 * Edit the question
	 * @param  {Object} q Data to change
	 * @function
	 * @memberOf angular
	 */
	$scope.editQuestion = function(q){
		$scope.selectedQuestion = q;
		$scope.showDialog = true;
	}

	$scope.columnNumberToLetter = function(col){
		return Config.columnNumberToLetter(col);	
	}

	$scope.columnLetterToNumber = function(col){
		return Config.columnLetterToNumber(col);
	}
	/**
	 * Remove a question
	 * @param  {Object} q Question to be removed
	 * @function
	 * @memberOf angular
	 */
	$scope.removeQuestion = function(q){
		$scope.questions.splice($scope.questions.indexOf(q), 1);
	}
	/**
	 * Close the dialog
	 * @function
	 * @memberOf angular
	 */
	$scope.closeDialog = function(){
		$scope.showDialog = false;
	}
	/**
	 * Column Letter will always be upper case
	 * @param  {Event} e Event
	 * @function
	 * @memberOf angular
	 */
	$scope.upper = function(e){
		return $(e.target).val().toUpperCase();
	}
	// GROUP - SURVEY SETUP END
}]);