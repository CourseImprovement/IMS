


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
		//$scope.surveys = [];
		$scope.surveyName = '';
		$scope.surveyWeek = '';
		$scope.Placement = '';
		$scope.questions = [];
		$scope.csv = [];
		$scope.file = null;
		$scope.evaluations = {};
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
	$scope.checkPermissions = function(){

	}
	/**
	 * Alerts the user to the percentage completed
	 * @function
	 * @memberOf angular
	 */
	$scope.permissions = function(){

	}
	// GROUP - PERMISSIONS END



	// GROUP - LEADERSHIP EVALUATION
	$scope.evaluations = {};
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
		var cs = columns.split(';');
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
			eBy: bRole.splice(0,1),
			eFor: fRole.splice(0,1),
			emailCol: email,
			dataSeries: eval
		};
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
		var s = new SemesterSetup();
		s.semesterSetup();
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
	/**
	 * Select a file
	 * @function
	 * @memberOf angular
	 */
	$scope.chooseFile = function(){
		setTimeout(function(){
			$('body').append('<input type="file" id="surveyFile">');
			$('#surveyFile').change(function(){
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
		if (type == 'register'){
			// REGISTER NEW SURVEY - PERFORM IN CTRL
			var csv = new CSV();
			csv.readFile($scope.file, function(file){
				$scope.csv = file.data[1];
			});
			$scope.mode = 'RegisterStart';
		}
		else if (type == 'delete'){
			// DELETE SURVEY
			window.config.remove(id);
			$scope.mode = 'home';
		}
		else if (type == 'copy'){
			// COPY SURVEY
			var copy = survey.copy();
			window.config.addSurvey(copy);
			$scope.mode = 'home';
		}
		else if (type == 'modify'){
			// MODIFY SURVEY - PERFORM IN CTRL
			$scope.mode = 'RegisterStart';
			$scope.modifySurvey(id);
		}
		else{
			throw 'Invalid $scope.mode';
		}
	}
	/**
	 * Updates a surveys data comlumns
	 * @param  {string} id Id of the survey to be modified
	 * @function
	 * @memberOf angular
	 */
	$scope.modifySurvey = function(id){
		if (!id || id.length < 1) return;

		var survey = $(window.config._xml).find('semester[code="' + sem + '"] survey[id="' + id + '"]');
		var questions = $(survey).find('question');
		var name = $(survey).attr('name');
		var week = name.split(': Week ')[1];

		$scope.Placement = $(survey).attr('placement');
		$scope.surveyWeek = week;
		$scope.surveyName = name.split(': Week')[0];
		$scope.questions = [];
		$scope.surveyEmailCol = $(survey).attr('email');
		$scope.surveyTypeCol = $(survey).attr('type');
		$scope.surveyWeekCol = $(survey).attr('week');
		$scope.surveyCourseCol = $(survey).attr('course');
		
		for (var i = 0; i < questions.length; i++){
			var row = Config.columnLetterToNumber($(questions[i]).attr('col'));
			var text = $(questions[i]).find('text').first().text();
			var what = $(questions[i]).find('replace').attr('what');
			var awith = $(questions[i]).find('replace').attr('with');
			$scope.questions.push({col: row, text: text, replaceWhat: what, replaceWith: awith});
		}
	}
	/**
	 * Submits a newly created survey and saves it to the config file
	 * @param  {string} name      Name of the survey
	 * @param  {string} week      When the survey was taken
	 * @param  {string} placement Who the survey is for
	 * @param  {string} e         Email column
	 * @param  {string} t         Type column
	 * @param  {string} w         Week column
	 * @function
	 * @memberOf angular
	 */
	$scope.submitSurvey = function(name, week, placement, e, t, w, c){
		if (!name && !week && !placement){
			name = $('#surveyName').val();
			week = $('#surveyWeek').val();
			placement = $('#Placement').val();
		}
		name += ': Week ' + week;
		if (placement.toLowerCase() == 'aim'){
			placement = 'AIM';
		}
		else if (placement.toLowerCase() == 'tgl'){
			placement = 'TGL';
		}
		else if (placement.toLowerCase() == 'instructor'){
			placement = 'Instructor';
		}
		else{
			alert('Invalid Placement');
			return;
		}

		var emailCol = null;
		var typeCol = null;
		var weekCol = null;
		var courseCol = null;
		if ($scope.file == null){
			emailCol = e;
			typeCol = t;
			weekCol = w;
			courseCol = c;
			window.config.surveyModify(name, emailCol, weekCol, typeCol, placement, courseCol, $scope.questions, surveyId);
		}
		else{
			emailCol = $('#eCol').val();
			typeCol = $('#tCol').val();
			weekCol = $('#wCol').val();
			courseCol = $('#cCol').val();
			window.config.surveyRegister(name, emailCol, weekCol, typeCol, placement, courseCol, $scope.questions);
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
	 * @param {string} row   Data row in CSV file
	 * @param {string} text  Question text
	 * @param {string} what  What to change in text
	 * @param {string} awith Change the text with this
	 * @function
	 * @memberOf angular
	 */
	$scope.addQuestion = function(row, text, what, awith){
		setTimeout(function(){
			$scope.$apply(function(){
				if ($scope.file == null){
					row = $('#arow2').val();
				}
				else{
					row = $('#arow').val();
				}

				if (isNaN(row)){
					row = Config.columnLetterToNumber(row);
				}

				$scope.questions.push({col: parseInt(row), text: text, replaceWhat: what, replaceWith: awith});
				$scope.showDialog = false;
			});
		}, 10);
	}
	/**
	 * Edit the question
	 * @param  {Object} q Data to change
	 * @function
	 * @memberOf angular
	 */
	$scope.editQuestion = function(q){
		if ($scope.file != null){
			$scope.arow = Config.columnNumberToLetter(q.col);
			$('#arow').val($scope.arow);
		}
		else{
			$scope.arow2 = Config.columnNumberToLetter(q.col);
			$('#arow2').val($scope.arow);
		}
		$scope.atext = q.text;
		$scope.awhat = q.replaceWhat;
		$scope.awith = q.replaceWith;
		$scope.showDialog = true;
		editingQuestion.idx = $scope.questions.indexOf(q);
		editingQuestion.q = q;
		$scope.questions.splice($scope.questions.indexOf(q), 1);
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
		$scope.arow = "";
		$scope.arow2 = "";
		$scope.atext = "";
		$scope.awhat = "";
		$scope.awith = "";
		if (editingQuestion.idx > -1){
			$scope.questions.splice(editingQuestion.idx, 0, editingQuestion.q);
			editingQuestion = {};
		}
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