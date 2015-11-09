//  GROUP IMS
/**
 * [ims description]
 * @type {Object}
 */
window.ims = {};
ims.url = {};
ims.url._base = 'https://webmailbyui.sharepoint.com/sites/onlineinstructionreporting/';
ims.url.relativeBase = '/sites/onlineinstructionreporting/';
ims.url.base = ims.url._base + 'instructor%20Reporting/';
ims.url.api = ims.url._base + '_api/';
ims.url.site = ims.url._base; 
/**
 * UI loading class
 * @type {Object}
 * @namespace ims.loading
 * @memberOf ims
 */
ims.loading = {
	/**
	 * Set the percentage of loading bar
	 * @param {integer} percent A number between 0 and 100
	 * @function
	 * @memberOf ims.loading
	 */
	set: function(percent){
		$('.bar').css({width: percent + '%'});
	},
	/**
	 * Resets the loading bar
	 * @function
	 * @memberOf ims.loading
	 */
	reset: function(){
		$('.bar').css({width: 0});
	}
}
// GROUP IMS END



// GROUP SHAREPOINT 
/**
 * [Sharepoint description]
 * @type {Object}
 */
var Sharepoint = {
	getFile: function(url, callback, err){
		$.get(url, function(map){
			callback(map);
		}).fail(function(a, b, c){
			if (err) err(a, b, c);
		})
	},
	postFile: function(str, path, fileName, callback){
		var buffer = (new XMLSerializer()).serializeToString(str);
		$.ajax({
		    url: ims.url.api + "contextinfo",
		    header: {
		        "accept": "application/json; odata=verbose",
		        "content-type": "application/json;odata=verbose"
		    },
		    type: "POST",
		    contentType: "application/json;charset=utf-8"
		}).done(function(d){
			var url = ims.url.api + "Web/GetFolderByServerRelativeUrl('" + ims.url.relativeBase + "Instructor%20Reporting/" + path + "')/Files/add(overwrite=true, url='" + fileName + "')";
			jQuery.ajax({
		        url: url,
		        type: "POST",
		        data: buffer,
		        processData: false,
		        headers: {
		            "accept": "application/json;odata=verbose",
		            "X-RequestDigest": $(d).find('d\\:FormDigestValue, FormDigestValue').text()
		        },
		        success: function(){
		        	if (Sharepoint.total != 0){
		        		ims.loading.set(Math.floor((++Sharepoint.current / Sharepoint.total) * 100));
		        	}
		        	callback();	
		        },
		        error: function(){
		        	alert("Error saving");
		        }
		    });
		});
	},
	total: 0,
	current: 0
}
// GROUP SHAREPOINT END
// GROUP CONFIG
function Config(){
	console.log('new Config object was created');
	this._xml = this._getConfigXml();
}

Config.prototype.getXml = function(){
	console.log('return the config xml');
	return this._xml;
}

/**
 * RETURNS ARRAY OF ALL THE SURVEYS FROM THE CONFIG FILE
 */
Config.prototype.getSurveys = function(){
	var surveys = []; 
	$(this._xml).find('semester[code=FA15] survey').each(function(){
		surveys.push({
			name: $(this).attr('name'),
			id: $(this).attr('id'),
			xml: $(this)[0]
		});
	});
	return surveys;
	console.log('getting all the surveys');
}

/**
 * GETS THE CONFIG XML FILE FROM SHAREPOINT
 */
Config.prototype._getConfigXml = function(){
	var notEnd = true;
	Sharepoint.getFile(ims.url.base + 'config/config.xml', function(data){
		this.config._xml = $(data)[0];
	});
	console.log('get the config file xml');
}

/**
 * REMOVES A SPECIFIED SURVEY FROM THE CONFIG FILE
 * @param  {String} surveyId id of the survey to remove
 */
Config.prototype.surveyRemove = function(surveyId){
	console.log('removing a survey from the config');

	$(this._xml).find('semester[code=FA15] surveys survey[id="' + surveyId + '"]').remove();

	Sharepoint.postFile(this._xml, 'config/', 'config.xml', function(){
		alert('Survey removal was successful!')
	});
}

/**
 * COPYS A SURVEY FROM THE CONFIG FILE
 * @param  {String} survey id of the survey to copy
 */
Config.prototype.surveyCopy = function(surveyId){
	console.log('copying a survey from the config');

	var surveysNode = $(this._xml).find('semester[code=FA15] surveys');
	var surveys = $(this._xml).find('semester[code=FA15] surveys survey');
	var id = parseInt($(surveys[surveys.length - 1]).attr('id')) + 1;
	var survey = $(this._xml).find('semester[code=FA15] surveys survey[id="' + surveyId + '"]').clone();
	
	survey.attr('name', survey.attr('name') + ' (Copy)');
	survey.attr('id', id);

	$(surveysNode).append(survey);

	Sharepoint.postFile(this._xml, 'config/', 'config.xml', function(){
		alert('Survey copy was successful!');
	});
}

/**
 * REGISTERS A NEW SURVEY
 */
Config.prototype.surveyRegister = function(name, emailCol, weekCol, typeCol, placement, courseCol, questions){
	console.log('registering a survey in the config');
	var surveys = $(this._xml).find('semester[code=FA15] surveys');
	var id = this._highestId(surveys);
	surveys.append('<survey email="' + emailCol + 
							'" id="' + (id + 1) + 
							'" name="' + name + 
							'" placement="' + placement + 
							'" type="' + typeCol + 
							'" week="' + weekCol + 
							'" course="' + courseCol + 
							'"><questions></questions></survey>');
	var survey = $(surveys).find('survey[id=' + (id + 1) + '] questions');

	for (var i = 0; i < questions.length; i++){
		survey.append('<question col="' + questions[i].row + 
							'" id="' + (i + 1) + '" repeat="false"><text wrap="false">' + Config._cleanXml(questions[i].text) + 
							'</text><answer><if value=""></if><then bg="" color=""></then><replace what="' + Config._cleanXml(questions[i].what) + 
							'" with="' + Config._cleanXml(questions[i].awith) + '"></replace></answer></question>');
	}
}

/**
 * returns the highest id of all the surveys
 * @param  {[type]} surveys [description]
 * @return {[type]}         [description]
 */
Config.prototype._highestId = function(surveys) {
	var id = 0;
	$(surveys).find('survey').each(function(){
		if (id < parseInt($(this).attr('id'))){
			id = parseInt($(this).attr('id'));
		}
	});
	return id;
}

/**
 * MODIFYS AN EXISTING SURVEY
 * @param  {String} name      The name of the survey
 * @param  {String} emailCol  column that contains the email
 * @param  {String} weekCol   column that contains the week
 * @param  {String} typeCol   column that contains the type
 * @param  {String} placement column that contains the placement
 * @param  {[type]} questions 
 * @param  {String} surveyId  id of the survey to be modified
 */
Config.prototype.surveyModify = function(name, emailCol, weekCol, typeCol, placement, courseCol, questions, surveyId){
	console.log('modifying a survey in the config');
	var survey = $(this._xml).find('semester[code=FA15] surveys survey[id="' + surveyId + '"]');
	survey.attr('name', name);
	survey.attr('week', emailCol);
	survey.attr('email', weekCol);
	survey.attr('type', typeCol);
	survey.attr('placement', placement);
	survey.attr('course', courseCol);

	$(survey).find('question').remove();
	for (var i = 0; i < questions.length; i++){
		var col = null;
		if (!isNaN(questions[i].row)){
			col = Config.toCol(questions[i].row);
		}
		else{
			col = questions[i].row;
		}

		$(survey).find('questions').append('<question id="tmp" repeat="false"><text>' + questions[i].text + '</text><answer><if value=""></if><then bg="" color=""></then><replace with="" what=""></replace></answer></question>');
		var q = $(survey).find('question[id=tmp]').attr('col', col).attr('id', i + 1);
		if (questions[i].awith != ""){
			$(q).find('answer replace').attr('with', Config._cleanXml(questions[i].awith)).attr('what', Config._cleanXml(questions[i].what));
		}
	}

	Sharepoint.postFile(this._xml, 'config/', 'config.xml', function(){
		alert('survey modified');
	});
}

/**
 * PROCESS THE SURVEY DATA TO INDIVIDUAL XML FILES
 * @param  {String} survey id of the survey that will be processed
 * @param  {Array} rows 2D array that contains all the csv data
 */
Config.prototype.surveyProcessing = function(surveyId, rows){
	var cols = this._getSurveyColumns(surveyId);
	var hasCourse = false;
	var people = {};

	for (var i = 3; i < rows.length; i++){
		if (rows[i][cols.email] != undefined){
			var email = rows[i][cols.email].split('@')[0];
			var course = rows[i][cols.course];
			if (people[email] == undefined){
				people[email] = {};
			}
			if (course != null){
				people[email][course] = {};
				for (var col in cols.questions){
					people[email][course][cols.questions[col].id] = rows[i][col];
				}
				hasCourse = true;
			}
			else{
				for (var col in cols.questions){
					people[email][cols.questions[col].id] = rows[i][col];
				}
			}
			
		}
	}

	people = this._answerReplace(people, cols, hasCourse);
	this._uploadSurvey(people, cols, hasCourse);
}

/**
 * Replaces all the answers for the people to the proper answers
 * @param  {Object}  people    object of all the people with their answers
 * @param  {Object}  cols      object of the survey data
 * @param  {Boolean} hasCourse does the survey use a course column
 * @return {Object}            people object with the answers replaced as needed
 */
Config.prototype._answerReplace = function(people, cols, hasCourse){
	for (var col in cols.questions){
		if (cols.questions[col].replace.what != ""){
			var these = cols.questions[col].replace.what.split(';');
			var those = cols.questions[col].replace.with.split(';');
			for (var person in people){
				var id = cols.questions[col].id;
				if (hasCourse){
					for (var course in people[person]){
						for (var i = 0; i < these.length; i++){
							people[person][course][id] = people[person][course][id].replace(these[i], those[i]);
						}
					}
				}
				else{
					for (var i = 0; i < these.length; i++){
						people[person][id] = people[person][id].replace(these[i], those[i]);
					}
				}
			}
		}
	}

	return people;
}

/**
 * UPDATE AND UPLOAD XML FILES WITH SPECIFIC DATA
 * @param  {Object} people object containing all the people with their courses and their responses
 * @param  {Object} cols   contains information concerning the survey being processed
 */
Config.prototype._uploadSurvey = function(people, cols, hasCourse){
	Sharepoint.total = Object.keys(people).length;
	for (var person in people){
		Sharepoint.getFile(ims.url.base + 'master/' + person.split('@')[0] + '.xml', function(data){
			var email = $(data).find('semester[code=FA15] > people > person').attr('email');
			var surveys = $(data).find('semester[code=FA15] > people > person > roles > role[type="' + cols.placement.toLowerCase() + '"] > surveys');
			if (hasCourse){
				for (var course in people[email]){
					var cId = $(data).find('semester[code=FA15] > people > person > courses > course:contains(' + course + ')').attr('id');
					if ($(surveys).find('> survey[id="' + cols.id + '"][courseid="' + cId + '"]').length != 0){
						$(surveys).find('> survey[id="' + cols.id + '"][courseid="' + cId + '"]').remove();
					}
					$(surveys).append('<survey id="' + cols.id + '" reviewed="false" courseid="' + cId + '"></survey>');
					for (var id in people[email][course]){
						$(surveys).find('> survey[id="' + cols.id + '"][courseid="' + cId + '"]').append('<answer id="' + id + '">' + Config._cleanXml(people[email][course][id]) + '</answer>');
					}
				}
			}
			else{
				for (var course in people[email]){
					if ($(surveys).find('> survey[id="' + cols.id + '"]').length != 0){
						$(surveys).find('> survey[id="' + cols.id + '"]').remove();
					}
					$(surveys).append('<survey id="' + cols.id + '" reviewed="false"></survey>');
					for (var id in people[email]){
						$(surveys).find('> survey[id="' + cols.id + '"]').append('<answer id="' + id + '">' + Config._cleanXml(people[email][course][id]) + '</answer>');
					}
				}
			}
			
			Sharepoint.postFile(data, 'master/', email + '.xml', function(){
				if (Sharepoint.current == Sharepoint.total){
					setTimeout(function(){
						ims.loading.reset(); 
					}, 1000);
				}
			});
		});
	}
}

Config._cleanXml = function(str){
	return str.replace(/&/g, '&amp;')
       		  .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
} 

/**
 * FINDS A SURVEY AND COLLECTS ALL PERTINENT INFORMATION ABOUT IT
 * @param  {String} surveyId the id for the current survey
 * @return {Object}          contains information for the current survey
 */
Config.prototype._getSurveyColumns = function(surveyId){
	var survey = $(this._xml).find('semester[code=FA15] > surveys > survey[id="' + surveyId + '"]');
	var columns = {
		id: surveyId,
		email: Config.getCol(survey.attr('email')),
		placement: survey.attr('placement'),
		type: Config.getCol(survey.attr('type')),
		week: Config.getCol(survey.attr('week')),
		name: survey.attr('name'),
		course: Config.getCol(survey.attr('course')),
		questions: {}
	};
	
	$(survey).find('questions question').each(function(){
		columns.questions[Config.getCol($(this).attr('col'))] = {
			question: $(this).find('text').text(),
			id: $(this).attr('id'),
			replace: {
				what: $(this).find('answer replace').attr('what'),
				with: $(this).find('answer replace').attr('with')
			}
		};
	});

	return columns;
}

/**
 * [getSurveyIdByName description]
 * @param  {[type]} survey [description]
 * @return {[type]}        [description]
 */
Config.prototype.getSurveyIdByName = function(survey){
	console.log('returning a survey Id');
}

/**
 * CONVERTS A LETTER TO THE NUMERICAL EQUIVALENT
 * @param  {String} letter  Character that maps to a column
 * @return {Integer}        the numerical column
 */
Config.getCol = function(letter){
	console.log('returning the numeric col from the letter');
	if(!isNaN(letter)) return letter;

	if (letter.length == 1){
		return letter.charCodeAt(0) - 65;
	}
	else{
		if (letter[1] == 'A') return 26;
		return (letter.charCodeAt(1) - 65) + 25;
	}
}
/**
 * CONVERTS A NUMBER TO THE COLUMN LETTER
 * @param  {String} letter  Character that maps to a column
 * @return {Integer}        the numerical column
 */
Config.toCol = function(num){
	console.log('returning the letter col from the number');
	if (num < 26){
		return String.fromCharCode(num + 65);
	}
	else{
		return "A" + String.fromCharCode((num - 26) + 65);
	}
}
// GROUP CONFIG END
// 
// 
window.config = new Config();
// GROUP CSV
function CSV(){
	console.log('new CSV object created');
	this._data = null;
}

/**
 * GET THE CSV'S DATA IN ARRAY FORM
 */
CSV.prototype.getData = function(){
	console.log('return CSV data');
}

/**
 * READ THE CSV INTO _DATA
 */
CSV.prototype.readFile = function(file, callback){
	console.log('retrieving data form csv');
	var reader = new FileReader();

	reader.onload = function(e) {
	  var text = reader.result;
	  csv = Papa.parse(text);
	  callback(csv);
	}
	reader.readAsText(file, 'utf8');
}

/**
 * DOWNLOAD A STRING AS A CSV
 */
CSV.downloadCSV = function(csvString){
	console.log('CSV downloaded')
}
// GROUP CSV END
/**
 * @namespace angular
 */ 

/**
 * @typedef {Object} Xml_Document An xml document which contians organizational data and personnel data 
 */
var app = angular.module('admin', []);
app.controller('adminCtrl', ["$scope", function($scope){


	// GROUP - MENU TOGGLE
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
			$scope.surveys = window.config.getSurveys();
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
	$scope.evaluations = [];
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
	$scope.addEvaluation = function(role, email, columns, questions, logics){
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

		$scope.evaluations.push({
			title: role,
			emailCol: email,
			dataSeries: eval
		});
	}
	/**
	 * Create a new evaluation and parses the evaluations previously gathered
	 * @memberOf angular
	 * @function
	 */
	$scope.CreateEvaluationCSV = function(){
		var e = new Evaluations($scope.evaluations);
		e.parseCSV();
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
	$scope.processSurvey = function(survey){
		var csv = new CSV();
		csv.readFile($scope.file, function(file){
			window.config.surveyProcessing(survey, file.data);
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
	$scope.surveyModifications = function(type, survey){
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
			window.config.surveyRemove(survey);
			$scope.mode = 'home';
		}
		else if (type == 'copy'){
			// COPY SURVEY
			window.config.surveyCopy(survey);
			$scope.mode = 'home';
		}
		else if (type == 'modify'){
			// MODIFY SURVEY - PERFORM IN CTRL
			$scope.mode = 'RegisterStart';
			$scope.modifySurvey(survey);
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
		surveyId = id;
		var config = window.config.getXml()
		var survey = $(config).find('semester[code=FA15] survey[id="' + id + '"]');
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
			var row = Config.getCol($(questions[i]).attr('col'));
			var text = $(questions[i]).find('text').first().text();
			var what = $(questions[i]).find('replace').attr('what');
			var awith = $(questions[i]).find('replace').attr('with');
			$scope.questions.push({row: row, text: text, what: what, awith: awith});
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
		if (surveyId != null){
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
				if ($scope.file != null){
					if (row != $('#arow2').val())
						row = $('#arow2').val();
					if (!row)
						row = $('#arow').val();
					row = Config.getCol(row);
				}
				else{
					row = parseInt($('#arow').val());
				}
				if (isNaN(row) || row.length == 0){
					row = $('#arow').val();
				}
				if (isNaN(row) || row.length == 0){
					row = $('#arow2').val();
				}
				
				$scope.questions.push({row: row, text: text, what: what, awith: awith});
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
			$scope.arow2 = ims.csv.toCol(q.row);
		}
		else{
			$scope.arow = q.row;
		}
		if (Number.isInteger(parseInt($scope.arow))){
			$scope.arow = parseInt($scope.arow);
			q.row = $scope.arow;
			setTimeout(function(){
				$('#arow').val($scope.arow);
			}, 100);
		}
		$scope.atext = q.text;
		$scope.awhat = q.what;
		$scope.awith = q.awith;
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
// GROUP PERMISSIONS
function Permissions(){
	console.log('new Permissions object created');
	this._map = null;
	this._toChange = null;
}

/**
 * CHECK IF THERE ARE ANY CHANGES TO DO
 */
Permissions.prototype.check = function(){
	console.log('Checking if permissions need changing');
}

/**
 * UPDATE THE PERMISSIONS ON VARIOUS FILES
 */
Permissions.prototype.update = function(){
	console.log('updating the permissions');
}
// GROUP PERMISSIONS END
// GROUP SEMESTER SETUP
function SemesterSetup(csv){
	console.log('new SemesterSetup object was created');
	this._csv = csv;
	this._map = null;
	this._rollup = null;
	this._master = null;
	this._individualFiles = null;
	this._sem = null; 
}

/**
 * PERFORMS A COMPLETE SEMESTER SETUP
 * @return {[type]} [description]
 */
SemesterSetup.prototype.semesterSetup = function(){
	console.log('semester is being setup');
	this._createMap();
	this._createIndividualFiles();
	this._createMaster();
	this._createRollup();
}

/**
 * CREATES A NEW SEMESTER MAP SECTION IN THE MAP FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createMap = function(){
	console.log('map is being created');
}

/**
 * CREATES A NEW SEMESTER ROLLUP SECTION IN THE ROLLUP FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createRollup = function(){
	console.log('rollup is being created');
}

/**
 * CREATES A NEW SEMESTER MASTER SECTION IN THE MASTER FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createMaster = function(){
	console.log('map is being created');
}

/**
 * CREATES A NEW SEMESTER SECTIONS IN ALL OF THE PEOPLES FILES FROM THE MAP FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createIndividualFiles = function(){
	console.log('individual files are being created');
}

/**
 * UPDATES THE CURRENT SEMESTER SETUP
 * @return {[type]} [description]
 */
SemesterSetup.prototype.semesterUpdate = function(){
	console.log('semester is being updated');
	if (this._isDifferent()){
		this._updateMap();
		this._updateIndividualFiles();
		this._updateMaster();
		this._updateRollup();
	}
}

/**
 * CHECKS IF THE MAP HAS CHANGED
 * @return {Boolean} [description]
 */
SemesterSetup.prototype._isDifferent = function(){
	console.log('are the semesters already the same');
}

/**
 * CHECKS FOR MAP CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateMap = function(){
	console.log('map is being updated');
}

/**
 * CHECKS FOR ROLLUP CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateRollup = function(){
console.log('rollup is being updated');
}

/**
 * CHECKS FOR MASTER CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateMaster = function(){
	console.log('master is being updated');
}

/**
 * CHECKS FOR INDIVIDUAL FILE CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateIndividualFiles = function(){
	console.log('individual files are being updated');
}
// GROUP SEMESTER SETUP END
// 