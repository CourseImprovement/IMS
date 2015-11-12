//  GROUP IMS
/**
 * IMS Object
 */
window.ims = {};
ims.url = {};
ims.url._base = window.location.protocol + '//' + window.location.hostname + '/sites/onlineinstructionreporting/onlineinstructionreportingdev/';
ims.url.relativeBase = '/sites/onlineinstructionreporting/onlineinstructionreportingdev/';
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
 * Sharepoint rest api calls
 * @type {Object}
 */
var Sharepoint = {
	/**
	 * Retrieves file from sharepoint
	 * @param  {String}   url      Location of the file in sharepoint
	 * @param  {Function} callback Callback the file
	 * @param  {Object}   err      Notifies of an error
	 */
	getFile: function(url, callback, err){
		$.get(url, function(map){
			callback(map);
		}).fail(function(a, b, c){
			if (err) err(a, b, c);
		})
	},
	/**
	 * Posts a file to sharepoint
	 * @param  {String}   str      The file in string form
	 * @param  {String}   path     Destination of the file
	 * @param  {String}   fileName Name of the file
	 * @param  {Function} callback Successful or unsuccessful post
	 */
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

/**
 * Sharepoint items
 * @namespace ims.sharepoint
 * @memberOf ims
 * @type {Object}
 */
ims.sharepoint = {
	/**
	 * The base url for the api calls
	 * @type {String}
	 * @memberOf ims.sharepoint
	 */
	base: '../',
	/**
	 * The relative base for the api calls
	 * @type {String}
	 * @memberOf ims.sharepoint
	 */
	relativeBase: window.location.pathname.split('Shared%20Documents/index.aspx')[0],
	/**
	 * Make a Sharepoint post request. This is most commly used when a file is being posted 
	 * to the sharepoint server.
	 * @param  {string}   hostUrl     base url of post request
	 * @param  {string}   restCommand rest command
	 * @param  {Object}   data        JSON object
	 * @param  {Function} callback    callback function
	 * @return {string}               In the callback, the first arg is a string
	 * @memberOf ims.sharepoint
	 * @function
	 */
	makePostRequest: function(hostUrl, restCommand, data, callback) {
	    var executor = new SP.RequestExecutor(hostUrl);
	    var info = {
	      'url': restCommand,
	      'method': "POST",
	      'data': JSON.stringify(data),
	      'success': callback
	    };  
	    executor.executeAsync(info);
	},	
	/**
	 * Posts the current user xml file.
	 * @return {null} Nothing is returned
	 * @function
	 * @memberOf ims.sharepoint
	 */
	postFile: function(u){
		function str2ab(str) {
			// new TextDecoder(encoding).decode(uint8array);
		  return new TextEncoder('utf8').encode(str);
		}
		
		var buffer = str2ab((new XMLSerializer()).serializeToString(_baseUserXml));

		var fileName = User.getCurrent().getEmail() + '.xml';
		var url = ims.sharepoint.base + "_api/Web/GetFolderByServerRelativeUrl('" + ims.sharepoint.relativeBase + "Instructor%20Reporting/Master')/Files/add(overwrite=true, url='" + fileName + "')";
    		$['ajax']({
			    'url': ims.sharepoint.base + "_api/contextinfo",
			    'header': {
			        "accept": "application/json; odata=verbose",
			        "content-type": "application/json;odata=verbose"
			    },
			    'type': "POST",
			    'contentType': "application/json;charset=utf-8"
			}).done(function(d) {
				jQuery['ajax']({
		        'url': url,
		        'type': "POST",
		        'data': buffer,
		        'processData': false,
		        'headers': {
		            "accept": "application/json;odata=verbose",
		            "X-RequestDigest": $(d).find('d\\:FormDigestValue, FormDigestValue').text()
		        },
		        'success': function(){
		        	
		        }
		    });
		});
	},
	/**
	 * Get the semester configuration file. This file allows for us to see which semester is the current semester.
	 *
	 * <pre><code>
	 *  var currentSemester = $(ims.sharepoint.getSemesterConfiguration()).find('[current=true]').attr('name');
	 * </code></pre>
	 *
	 * 
	 * @return {XMLDocument} Use JQuery to find the current semester
	 * @function
	 * @memberOf ims.sharepoint
	 */
	getSemesterConfig: function(){
		var url = ims.sharepoint.base + 'Instructor%20Reporting/config/semesters.xml';
		var doc = null;
		$['ajax']({
		    'url': url,
		    'success': function(d) {
		      	doc = d;
		    },
		    'async': false
	    });
	  	return doc;
	},	
	/**
	 * Get a XML file for a given user by email address.
	 * @param  {string} email The first part of the users given email address
	 * @return {XMLDocument}       Use JQuery to find the current users document
	 * @function
	 * @memberOf ims.sharepoint
	 */
	getXmlByEmail: function(email){
		var url = ims.sharepoint.base + 'Instructor%20Reporting/Master/' + email + '.xml';
		var doc = null;
		$['ajax']({
		    'url': url,
		    'success': function(d) {
		      	doc = d;
		    },
		    'error': function(a, b, c){
		    	if (a && a.responseText && a.responseText.indexOf('404') > -1){
		    		doc = null;
		    	}	
		    	else if (c && c.message.indexOf('Invalid XML') > -1){
		    		var out = '';
					for (var i = 0; i < a.responseText.length; i++){
						if (i % 2 == 0){
							out += a.responseText[i];
						}
					}
					doc = $['parseXML'](a.responseText);
		    	}
		    },
		    'async': false
	    });
	  	return doc;
	}
};
// GROUP SHAREPOINT END


/**
 * Replace xml characters with encoded xml characters
 * @return {[type]} [description]
 */
String.prototype.encodeXML = function(){
	if (this == undefined) return "";
	return this.replace(/&/g, '&amp;')
       		   .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
}

Array.prototype.sum = function(){
	if (this == undefined) return false;
	var sum = 0;
	for (var i = 0; i < this.length; i++){
		if (Number.isFloat(this[i])){
			sum += this[i];
		}
	}
	return sum;
}

Number.isInt = function(n){
    return Number(n) === n && n % 1 === 0;
}

Number.isFloat = function(n){
    return n === Number(n) && n % 1 !== 0;
}



// GROUP ANSWER
/**
 * Answer object
 * @param {Object} obj Contains a question and answer.
 */
function Answer(obj){
	this._question = obj.question;
	this._answer = obj.answer;
	this.clean();
}

/**
 * Replaces text in answers and encodes certain characters to xml
 */
Answer.prototype.clean = function(){
	for (var i = 0; i < this._question.replaceWhat.length; i++){
		var replaceWhat = new RegExp(this._question.replaceWhat[i], 'g');
		var replaceWith = new RegExp(this._question.replaceWith[i], 'g');
		this._answer = this._answer.replace(replaceWhat, replaceWith);
	}
	this._answer.encodeXML();
}

/**
 * Converts the components of the answer into xml
 * @return {Object} Answer in xml form
 */
Answer.prototype.toXml = function(){
	var xml = $('<answer></answer>');
	xml.attr('id', this._question.id);
	xml.text(this._answer);
	return xml; 
}

/**
 * Collects survey data from a csv row
 * @param  {Object} survey Contains information on the survey
 * @param  {Array}  row    A person's row from the csv file, which contains their information and answers
 * @return {Array}         The person's answers with the questions
 */
Answer.collect = function(survey, row){
	var result = [];
	for (var i = 0; i < survey.questions.length; i++){
		var answer = row[survey.questions[i].col];
		result.push(new Answer({
			question: survey.questions[i], 
			answer: answer
		}));
	}
	return result;
}
// GROUP ANSWER END



// GROUP CONFIG
/**
 * Config Object
 */
function Config(){
	this.surveys = [];
	this._initSetup();
	this._xml;
	this.semesters = ims.sharepoint.getSemesterConfig();
	this.selectedSurvey = null;
	this.otherPeople = {};
}

/**
 * Gets the current semester from the semester xml file
 * @return {String} The semester name. e.g. FA15, WI16
 */
Config.prototype.getCurrentSemester = function(){
	return $(this.semesters).find('[current=true]').attr('name');
}

/**
 * Get all the serveys
 * @return {[type]} [description]
 */
Config.prototype.getSurveys = function(){
	return this.surveys;
}

/**
 * Returns the survey using the id
 * @param  {Integer} id Numerical id for the survey
 * @return {Object}    Xml of the survey with id of 'id'
 */
Config.prototype.getSurveyById = function(id){
	for (var i = 0; i < this.surveys.length; i++){
		if (this.surveys[i].id == parseInt(id)) return this.surveys[i];
	}
	return null;
}

/** 
 * Inital setup. Create the survey objects
 */
Config.prototype._initSetup = function(){
	var _this = this;
	Sharepoint.getFile(ims.url.base + 'config/config.xml', function(data){
		_this._xml = $(data)[0];
		console.log('getting all the surveys');
		$(_this._xml).find('semester[code=' + _this.getCurrentSemester() + '] survey').each(function(){
			_this.surveys.push(new Survey($(this), true));
		});
	});
}

/**
 * Find a survey based on the criteria in an object
 * @param  {Object} obj Contains information for a survey
 * @return {Object}     Survey that contains information of param obj
 */
Config.prototype.findSurvey = function(obj){
	var found = null;
	$(this.surveys).each(function(){
		if (this.hasAttrs(obj)) found = this;
	});
	return found;
}

/**
 * Create a survey based on a passed through object.
 * TODO:
 * 	figure out what the object is and add it to the survey object.
 * @param  {Object} obj Contains all information for a survey
 * @return {Object}     The new survey object that was just created
 */
Config.prototype.createSurvey = function(obj){
	var spot = this.surveys.length;
	this.surveys.push(new Survey(obj, false));	
	return this.surveys[spot];
}

/**
 * Get the next highest survey id
 * @return {Integer} Highest id for a survey
 */
Config.prototype.getHighestSurveyId = function(){
	var id = 0;
	$(this.surveys).each(function(){
		if (id < this.id){
			id = this.id;
		}
	});
	return id;
}

/**
 * Get a person from first the survey, then from global
 * @param  {String} email Email of a person to find
 * @return {Object}       The object of a person with attribute 'email'
 */
Config.prototype.getPerson = function(email){
	try{
		email = Person.cleanEmail(email);
	}
	catch(e){
		console.log(email);
		throw e;
	}
	var person = this.selectedSurvey.getPerson(email);
	if (!person){
		person = this.otherPeople[email];
	}
	return person;
}

/**
 * Add person to global list
 * @param {Object} person Contains all information regarding a person
 */
Config.prototype.addPerson = function(email, person){
	this.otherPeople[email] = person;
}

/**
 * Get the master file
 * @return {Object} Master xml file from sharepoint
 */
Config.prototype.getMaster = function(){
	if (!this._master){
		this._master = ims.sharepoint.getXmlByEmail('master');
	}
	return this._master;
}

/**
 * Get the next up leader as string
 * @param  {String} p  A role
 * @return {String}    That role's immediate leader
 */
Config.prototype._getSurveyColumns = function(surveyId){
	var survey = $(this._xml).find('semester[code=FA15] > surveys > survey[id="' + surveyId + '"]');
	var columns = {
		id: surveyId,
		email: Config.getCol(survey.attr('email')),
		placement: survey.attr('placement'),
		type: Config.getCol(survey.attr('type')),
		name: survey.attr('name'),
		questions: {}
	};

	if (survey.attr('week') != undefined){
		columns['week'] = Config.getCol(survey.attr('week'));
	}
	if (survey.attr('course') != undefined){
		columns['course'] = Config.getCol(survey.attr('course'));
	}
	
	

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

Config.getLeader = function(p){
	switch (p){
		case 'instructor': return 'tgl';
		case 'tgl': return 'aim';
		case 'aim': return 'im';
		default: throw 'Invalid ' + p;
	}
}


/**
 * Convert a column letter to number
 * @param  {String} letter  Letter combination referencing an excel column
 * @return {Integer}        Numerical value of the excel column
 */
Config.columnLetterToNumber = function(letter){
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
 * TODO:
 * 		- Change AZ as the highest to BZ
 * @param  {Integer} number Numerical value that is associated with an excel column
 * @return {String}         Column as a string
 */
Config.columnNumberToLetter = function(number){
	console.log('returning the letter col from the number');
	if (num < 26){
		return String.fromCharCode(num + 65);
	}
	else{
		return "A" + String.fromCharCode((num - 26) + 65);
	}
}
// GROUP CONFIG END



/**
 * Only one survey instance can be initalized at one time
 * @type {Config}
 */
window.config = new Config();



// GROUP CSV
/**
 * CSV Object
 */
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
 * @param  {Object}   file     Contains the selected file
 * @param  {Function} callback callbacks the csv data
 */
CSV.prototype.readFile = function(file, callback){
	console.log('retrieving data form csv');
	var reader = new FileReader();

	reader.onload = function(e) {
	  var text = reader.result;
	  text = text.replace(/@byui.edu/g, '');
	  csv = Papa.parse(text);
	  callback(csv);
	}
	reader.readAsText(file, 'utf8');
}

/**
 * DOWNLOAD A STRING AS A CSV
 * @param  {String} csvString CSV in string form
 */
CSV.downloadCSV = function(csvString){
	console.log('CSV downloaded')
}
// GROUP CSV END



/**
 * @namespace angular
 * @typedef {Object} Xml_Document An xml document which contians organizational data and personnel data 
 */
var app = angular.module('admin', []);
app.controller('adminCtrl', ["$scope", function($scope){

	var sem = window.config.getCurrentSemester();

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
			$scope.surveys = window.config.surveys;
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
	$scope.processSurvey = function(id){
		var survey = window.config.getSurveyById(id);
		window.config.selectedSurvey = survey;
		if (!survey){
			alert('Error');
			return;
		}
		var csv = new CSV();
		csv.readFile($scope.file, function(file){
			survey.process(file.data);
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
/**
 * Permissions Object
 */
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



// GROUP PERSON
/**
 * Person Object
 * @param {[type]}  obj   obj containing a persons data
 * @param {Boolean} isXml Is the obj param actually xml
 */
function Person(obj, isXml, downloadXml){
	if (isXml){
		this._tmpXml = $(obj).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person');
		this._role = $(this._tmpXml);
		this._email = $(this._tmpXml).attr('email');
		this.cleanEmailInternal();
		if (downloadXml){
			this.getXml();
		}
		else{
			this._xml = obj;
		}
	}
	else{
		this._email = obj.email;
		this.cleanEmailInternal();
		this._row = obj.row;
		this._placement = obj.placement.toLowerCase();
		this._leader = null;
		this._answers = obj.answers;
		this.course = obj.course;
	}
	this._valid = true;
}

Person.cleanEmail = function(email){
	if (!email) throw 'Invalid Email';
	if (email.indexOf('@') > -1){
		email = email.split('@')[0];
	}
	return email;
}

Person.prototype.cleanEmailInternal = function(){
	try{
		this._email = Person.cleanEmail(this._email);
	}
	catch(e){
		this._valid = false;
	}
}

/**
 * Save this person's xml to their sharepoint file
 */
Person.prototype.save = function(){
	Sharepoint.postFile(this._xml, 'master/', this._email + '.xml', function(){});
}

/**
 * Checks to see if the person object is valid
 * @return {Boolean} Is the person's information valid
 */
Person.prototype.isValid = function(){
	return !!(this._email && this._row && this._placement && this._answers.length > 0) && this._valid;
}

/**
 * [getXml description]
 */
Person.prototype.getXml = function(){
	if (!this._xml){
		this._xml = ims.sharepoint.getXmlByEmail(this._email);
	}
}

/**
 * Retrieves a person's leader
 */
Person.prototype.getLeader = function(){
	var email = $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > leadership > person[type=' + Config.getLeader(this._placement) + ']').attr('email');
	var person = null;
	try {
		person = window.config.getPerson(email);;
	}
	catch (e){
		console.log(e);
		console.log('Lookup email: ' + email + ' - person email: ' + this._email);
	}
	if (!person){
		person = new Person({email: email, placement: Config.getLeader(this._placement)}, false, true);
		window.config.addPerson(email, person);
		
	}
	this._leader = person;
}

/**
 * Process a person's survey data
 */
Person.prototype.process = function(){
	this.getXml();
	this.getLeader();
	this._leader._placement = Config.getLeader(this._placement);
	this._master = window.config.getMaster();
	var xml = this.toXml();
	var id = window.config.selectedSurvey.id;
	if (!!this.course){
		$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
	}
	else{
		$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
		$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + ']').remove();
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
	}
	$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
	$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys').append(xml.clone());
	$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
}

/**
 * End of semester fix: remove if statement
 * @param  {String} name Name of the course the survey was taken for
 * @return {String}      The id of 'name'
 */
Person.prototype.getCourseIdByName = function(name){
	if (name.indexOf('PATH') > -1){
		name = name.split(' ')[0];
	}
	return $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > courses course:contains(' + name + ')').attr('id');
}

/**
 * Puts all the survey components into xml form 
 * @return {Object} Survey in xml form
 */
Person.prototype.toXml = function(){
	var xml = $('<survey reviewed="false"></survey>');
	var id = window.config.selectedSurvey.id;
	xml.attr('id', id);
	if(!!this.course){
		this.course = this.getCourseIdByName(this.course);
		xml.attr('courseid', this.course);
	}
	for (var i = 0; i < this._answers.length; i++){
		xml.append(this._answers[i].toXml());
	}
	return xml;
}
// GROUP PERSON END



// GROUP QUESTION
/**
 * Question Object
 * @param {Object}  question Information for a question
 * @param {Boolean} isXml    Is the question param xml
 */
function Question(question, isXml){
	if (isXml){
		this.id = parseInt($(question).attr('id'));
		this.text = $(question).find('text').text();
		this.col = Config.columnLetterToNumber($(question).attr('col'));
		this.replaceWhat = $(question).find('replace').attr('what');
		this.replaceWith = $(question).find('replace').attr('with');
		if (this.replaceWith.indexOf(';') > -1){
			this.replaceWith = this.replaceWith.split(';');
		}
		if (this.replaceWhat.indexOf(';') > -1){
			this.replaceWhat = this.replaceWhat.split(';');
		}
		this._xml = question;
	}
}

/**
 * Modify a variable in the object. This does not, however, 
 * save the object, that can only be done at the survey level.
 * @param  {[type]} prop [description]
 * @param  {[type]} val  [description]
 * @return {[type]}      [description]
 */
Question.prototype.modify = function(prop, val){
	this[prop] = val;
}

/**
 * Create the question XML node and append the other nodes
 * <question id name>
 * 	<text></text>
 * 	<replace with what/>
 * </question>
 * @return {Object} Question in xml form
 */
Question.prototype.toXml = function(){
	var xml = $('<question><text></text><replace /></question>');
	$(xml).attr('id', this.id);
	$(xml).find('text').text(this.text);
	$(xml).find('replace').attr('with', this.replaceWith.join(';')).attr('what', this.replaceWhat.join(';'));
	return xml;
}
// GROUP QUESTION END

window._rollup;

// GROUP ROLLUP
/**
 * Rollup Object
 */
function Rollup(){
	this._xml = ims.sharepoint.getXmlByEmail('rollup');
	window._rollup = this._xml;
	this._surveyId = window.config.selectedSurvey.id;
	this._week = window.config.selectedSurvey.getWeekNumber();
	this._questions = [];
	this._master = window.config.getMaster();
}

Rollup.avg = function(sum, count){
	return Math.floor((sum / count) * 10) / 10;
}

/**
 * [update description]
 * @return {[type]} [description]
 */
Rollup.prototype.update = function(){
	var master = window.config.getMaster();
	var _this = this;
	var questions = [
		'Seek Development Opportunities',
		'Inspire a Love for Learning',
		'Develop Relationships with and among Students',
		'Embrace University Citizenship',
		'Building Faith in Jesus Christ',
		'Weekly Hours'
	]
	// GETS THE SURVEY CURRENTLY TAKEN AND FINDS THE IDS FOR EACH INSTRUCTOR STANDARD
	$(window.config._xml).find('semester[code=' + window.config.getCurrentSemester() + '] survey[id=' + this._surveyId + '] question').each(function(){
		for (var i = 0; i < questions.length; i++){
			if ($(this).find('text:contains("' + questions[i] + '")').length > 0){
				_this._questions.push({
					id: $(this).attr('id'),
					spot: i
				});
			}
		}
	});

	var result = {}
	for (var i = 0; i < this._questions.length; i++){
		result[this._questions[i].spot] = {};
	}

	$(master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=instructor]').each(function(){
		var leader = $(this).find('leadership person[type=tgl]').attr('email');
		console.log(leader + ' - ' + $(this).parents('person').attr('email'));
		for (var i = 0; i < _this._questions.length; i++){
			if (questions[_this._questions[i].spot] == 'Weekly Hours'){
				var sum = 0;
				var credits = 0;
				$(this).find('survey[id=' + _this._surveyId + '] answer[id=' + _this._questions[i].id + ']').each(function(){
					if ($(this).text().length == 0) return;
					var courseid = $(this).parents('survey').attr('courseid');
					credits += parseInt($(this).parents('roles').parent().find("course[id=" + courseid + ']').attr('credit'));
					sum += parseFloat($(this).text());
				});
				if (isNaN(sum) || isNaN(credits) || sum == 0 || credits == 0){
					console.log($(this).parents('person').attr('email') + ' - 0 credits');
					continue;
				}
				if (credits == 1){
					credits = 1.5 * credits;
				}
				else if (credits == 2){
					credits = 2.25 * credits;
				}
				else if (credits >= 3){
					credits = 3 * credits;
				}
				if (!result[_this._questions[i].spot][leader]) result[_this._questions[i].spot][leader] = [];
				var avg = Rollup.avg(sum, credits);
				result[_this._questions[i].spot][leader].push(avg);
			}
			else{
				var text = $(this).find('survey[id=' + _this._surveyId + '] answer[id=' + _this._questions[i].id + ']').text();
				if (text.length == 0) continue;
				if (!result[_this._questions[i].spot][leader]) result[_this._questions[i].spot][leader] = [];
				result[_this._questions[i].spot][leader].push(parseFloat(text));
			}
		}
	});

	var top = {};
	var aims = {};

	for (var q in result){
		top[q] = {total: 0, sum: 0}
		for (var tgl in result[q]){
			var ary = result[q][tgl];
			var isAim = $(master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + tgl + ']').attr('highestrole') == 'aim';
			if (isAim){
				if (!aims[q]) aims[q] = {};
				if (!aims[q][tgl]) aims[q][tgl] = [];
				aims[q][tgl].concat(result[q][tgl].raw);
			}
			var count = ary.length;
			var sum = 0;
			for (var i = 0; i < count; i++){
				sum += ary[i];
				top[q].sum += ary[i];
				top[q].total++;
			}
			var avg = Rollup.avg(sum, count);
			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + tgl + '][type=tgl] question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
		}
		for (var aim in aims[q]){
			var ary = aims[q][aim];
			var count = ary.length;
			var sum = ary.sum();
			var avg = Rollup.avg(sum, count);

			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + tgl + '][type=aim] question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
		}
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > questions > question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
	}

	var a = 10;
}

Rollup.prototype.aimLevelUpdate = function(){
	var questions = [
		'Seek Development Opportunities',
		'Inspire a Love for Learning',
		'Develop Relationships with and among Students',
		'Embrace University Citizenship',
		'Building Faith in Jesus Christ',
		'Weekly Hours'
	]
	var result = {};
	var _this = this;
	$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[highestrole=aim]').each(function(){
		var email = $(this).attr('email'); 
		result[email] = {};
		for (var i = 0; i < _this._questions.length; i++){
			result[email][_this._questions[i].spot] = [];
			$(this).find('> roles > role[type=aim] > stewardship > people person').each(function(){
				$(_this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email="' + $(this).attr('email') + '"]').each(function(){
					var text = $(this).find('survey[id=' + _this._surveyId + '] answer[id=' + _this._questions[i].id + ']').text();
					if (text.length == 0) return;
					if (questions[_this._questions[i].spot] == 'Weekly Hours'){
						var credits = 0;
						$(this).find('> courses course').each(function(){
							var credit = parseFloat($(this).attr('credit'));
							if (credit == 1){
								credit = 1.5 * credit;
							}
							else if (credits == 2){
								credit = 2.25 * credit;
							}
							else if (credit >= 3){
								credit = 3 * credit;
							}
							credits += credit;
						});
						result[email][_this._questions[i].spot].push({
							hours: parseFloat(text),
							credits: credits
						});
					}
					else {
						result[email][_this._questions[i].spot].push(parseFloat(text));
					}
				});
			});
		}
	});
	
	for (var a in result){
		for (var q in result[a]){
			var total = result[a][q].length;
			var credits = 0
			var sum = 0;
			var question = $(window._rollup).find('semester[code=' + window.config.getCurrentSemester() + '] people > person[email=' + a + '][type=aim] question[name="' + questions[q] + '"]');
			
			if (question[q] == 'Weekly Hours'){
				total = 0;
				for (var i = 0; i < result[a][q].length; i++){
					sum += result[a][q][i].hours;
					total += result[a][q][i].credits;
				}
			}
			else{
				for (var i = 0; i < result[a][q].length; i++){
					sum += result[a][q][i];
				}
			}
			
			var avg = sum / total;
			$(question).append('<survey id="' + this._surveyId + '" value="' + avg + '"/>');
		}
	}

	console.log(window._rollup);
}
// GROUP ROLLUP END



// GROUP SEMESTER SETUP
/**
 * Semester Setup Object
 * @param {Array} csv Contains the rows from the csv file
 */
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



// GROUP SURVEY
/**
 * Survey Object
 * @param {Object}  survey A surveys information
 * @param {Boolean} isXml  Is the survey in xml form
 */
function Survey(survey, isXml){
	if (isXml){
		this.id = parseInt($(survey).attr('id'));
		if ($(survey).attr('week')){
			this.week = $(survey).attr('week');
		}
		this.placement = $(survey).attr('placement');
		this.type = $(survey).attr('type');
		this.email = $(survey).attr('email');
		this.name = $(survey).attr('name');
		if ($(survey).attr('course')){
			this.course = $(survey).attr('course');
		}
		this._xml = survey;
		this.questions = [];
		this._setXmlQuestions();
		this.people = [];
	}
	this.processed = 0;
}

/**
 * [getPerson description]
 * @param  {String} email A person's email
 * @return {Object}       Person with the email of 'email'
 */
Survey.prototype.getPerson = function(email){
	try{
		email = Person.cleanEmail(email);
	}
	catch(e){
		console.log(email);
		throw e;
	}
	for (var i = 0; i < this.people.length; i++){
		if (this.people[i]._email == email) return this.people[i];
	}
	return false;
}

/**
 * Set the questions questions by passing in the question node from
 * the XML
 */
Survey.prototype._setXmlQuestions = function(){
	var _this = this;
	$(this._xml).find('question').each(function(){
		_this.questions.push(new Question(this, true));
	})
}

/**
 * Use the objects member variables to create the survey node
 * @return {Object} Survey in xml form
 */
Survey.prototype.toXml = function(){
	var survey = $('<survey><questions></questions></survey>');
	survey.attr('id', this.id)
		.attr('placement', this.placement)
		.attr('type', this.type)
		.attr('name', this.name);

	if (this.week){
		survey.attr('week', this.week);
	}
	if (this.course){
		survey.attr('course', this.course);
	}

	return survey;
}

/**
 * Create the xml from the given objects. Remove the survey from the
 * config file. Add the newly created xml to the config file. 
 */
Survey.prototype.save = function(){
	var survey = this.toXml();

	for (var i = 0; i < this.questions.length; i++){
		var q = this.questions[i];
		var xml = q.toXml();
		$(survey).find('questions').append(xml);
	}

	var parent = $(this._xml).parent();
	this.remove();
	parent.append(survey);

	// Sharepoint.postFile(window.config._xml, 'config/', 'config.xml', function(){
	// 	alert('Survey removal was successful!')
	// });
}

/**
 * Remove the survey from the xml of the config
 */
Survey.prototype.remove = function(){
	$(this._xml).remove();
}

/**
 * Modifiy a certain aspect of object, if save is necessary, its there.
 * @param  {String} prop   [description]
 * @param  {String} value  [description]
 * @param  {Boolean} save  [description]
 */
Survey.prototype.modify = function(prop, value, save){
	this[prop] = value;
	if (save){
		this.save();
	}
}

/**
 * Clone and rename survey to append (Copy) and increment the id
 * @return {Object} New survey object
 */
Survey.prototype.copy = function(){
	var cloned = $(this._xml).clone();
	$(cloned).attr('name', $(cloned).attr('name') + ' (Copy)');
	$(cloned).attr('id', window.config.getHighestSurveyId() + 1);
	return new Survey(cloned, true);
}

/**
 * Collects the questions, people, and the peoples answers
 * @param  {Array]} rows Rows from the csv
 */
Survey.prototype.process = function(rows){
	// go through each row and add people
	var eCol = Config.columnLetterToNumber(this.email);
	var cCol = -1;
	if (this.course){
		cCol = Config.columnLetterToNumber(this.course);
	}
	var spot = 0;
	for (var i = 0; i < rows.length; i++){
		if (rows[i][2].match(/\./g) && rows[i][2].match(/\./g).length >= 2){
			spot = i;
			break;
		}
	}
	for (var i = spot; i < rows.length; i++){
		// clean answers  and then add them to their respective individual
		if (rows[i][eCol] != undefined){
			var person = null;
			try{
				person = window.config.getPerson(rows[i][eCol]);
			}
			catch (e){
				console.log(e);
				console.log(rows[i]);
				continue;
			}
			var again = false;
			var oldPlacement;
			if (!person){
				person = new Person({
					email: rows[i][eCol],
					row: rows[i],
					placement: this.placement,
					answers: Answer.collect(this, rows[i])
				}, false, true);
				oldPlacement = person._placement.toLowerCase();
			}
			else{
				person._answers = Answer.collect(this, rows[i]);
				person._row = rows[i];
				again = true;
				oldPlacement = person._placement.toLowerCase();
				person._placement = this.placement.toLowerCase();
			}
			if (cCol != -1){
				person.course = Survey.cleanCourse(rows[i][cCol]);
			}
			if (person.isValid()){
				if (!again) this.people.push(person);
				person.process();
				this.processed++;
				person._placement = oldPlacement.toLowerCase();
			}
			else{
				console.log('Invalid person: ' + rows[i][eCol]);
			}
		}
	}

	// for (var email in window.config.otherPeople){
	// 	var person = window.config.otherPeople[email];
	// 	if (person.isValid()){
	// 		person.process();
	// 		this.processed++
	// 	}
	// }

	var rollup = new Rollup();
	rollup.update();
	
	/*for (var i = 0; i < this.people.length; i++){
		this.people[i].save();
	}

	for (var email in window.config.otherPeople){
		window.config.otherPeople[email].save();
	}
	Sharepoint.postFile(window.config.getMaster(), 'master/', 'master.xml', function(){});
	*/
}

Survey.cleanCourse = function(str){
	var found = str.match(/([a-zA-Z]{1,}[0-9]{3})/g);
	if (found && found.length > 0){
		str = str.split(/([a-zA-Z]{1,})/g).join(' ');
	}
	return str.trim().toUpperCase();
}

/**
 * Get the question by Id
 * @param  {Integer} id The id of a question within the survey
 * @return {Object}     A question with id of 'id'
 */
Survey.prototype.getQuestionById = function(id){
	for (var i = 0; i < this.questions.length; i++){
		if (this.questions[i].id == id) return this.questions[i];
	}
	return false;
}

/**
 * If the survey has the attributes of the parameter object
 * @param  {Object}  obj Survey information
 * @return {Boolean}     Has the same attributes
 */
Survey.prototype.hasAttrs = function(obj){
	var keys = Object.keys(obj);
	for (var i = 0; i < keys.length; i++){
		if (this[keys[i]] != obj[keys[i]]) return false;
	}
	return true;
}

Survey.prototype.getWeekNumber = function(){
	
}
// GROUP SURVEY END