


/**
 * @start Config
 */
/**
 * @name Config
 * @description Config Object
 * @assign Chase and Grant
 * @todo
 *  + Create update script for the dev and live config.xml file to add isEval='false' to all survey nodes. (Grant)
 *  + Add isEval to Survey object (Grant)
 *  + Add isEval to admin.aspx (Grant)
 *  + Add isEval to ctrl.js (Grant)
 *  + Update the dashboard to filter the evaluations from the completed tasks tiles (Chase)
 */
function Config(){
	this.surveys = [];
	this._xml = null;
	this._initSetup();
	this.selectedSurvey = null;
	this.otherPeople = {};
}
/**
 * @name addSurvey
 * @description Add a survey to the list of surveys
 * @assign Chase and Grant
 * @todo 
 *  + Add the survey to config object surveys
 *  + Add the survey xml to the config file
 */
Config.prototype.addSurvey = function(survey){
	this.surveys.push(survey);
	$(this._xml).find('semester[code=' + this.getCurrentSemester() + '] surveys').append(survey._xml);
	this.save();
}
/**
 * @name newSurvey
 * @description Creates a new survey and returns it
 * @assign Chase and Grant
 * @todo 
 *  + Create a new survey
 *  + Add new survey to config object's surveys
 *  + Return new survey
 */
Config.prototype.newSurvey = function(){
	var survey = new Survey({
		iseval: false,
		id: this.getHighestSurveyId() + 1,
		questions: []
	}, false);
	this.surveys.push(survey);
	return survey;
}
/**
 * @name getCurrentSemester
 * @description Gets the current semester from the semester xml file
 * @assign Chase and Grant
 * @todo 
 *  + If the current semester is unkown 
 *   + Get the current semester
 *  + return the current semester 
 */
Config.prototype.getCurrentSemester = function(){
	if (!this._currentSemester) this._currentSemester = $(this._xml).find('[current=true]').attr('code');
	return this._currentSemester;
}
/**
 * @name getSurveys
 * @description Get all the serveys
 * @assign Chase and Grant
 * @todo 
 *  + return the config objects surveys
 */
Config.prototype.getSurveys = function(){
	return this.surveys;
}
/**
 * @name getSurveyById
 * @description Returns the survey using the id
 * @assign Chase and Grant
 * @todo 
 *  + Loop through all the config objects surveys
 *   + If the current survey equals the id passed in return the survey
 *  + If not found return null
 */
Config.prototype.getSurveyById = function(id){
	for (var i = 0; i < this.surveys.length; i++){
		if (this.surveys[i].id == parseInt(id)) return this.surveys[i];
	}
	return null;
}
/**
 * @name remove
 * @description Remove a survey from the config by id
 * @assign Chase and Grant
 * @todo 
 *  + Loop through all the config objects surveys
 *   + If the survey's id equals the id passed in remove it
 *  + Reset the surveys with the new list
 *  + Save the config file
 */
Config.prototype.remove = function(id){
	var newSurveys = [];
	for (var i = 0; i < this.surveys.length; i++){
		if (this.surveys[i].id != parseInt(id)) 
			newSurveys.push(this.surveys[i]);
		else{
			$(this._xml).find('semester[code=' + this.getCurrentSemester() + '] survey[id="' + id + '"]').remove();
		}
	}
	this.surveys = newSurveys;
	this.save();
}
/** 
 * @name _initSetup
 * @description Create the survey objects
 * @assign Chase and Grant
 * @todo 
 *  + Get the config file from sharepoint
 *  + Set this config object's xml with the data callbacked
 *  + Collect the different surveys from the config file to add to the config object
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
 * @name findSurvey
 * @description Find a survey based on the criteria in an object
 * @assign Chase and Grant
 * @todo
 *  + Go through each survey in the config object
 *  + Return the survey or null if not there
 */
Config.prototype.findSurvey = function(obj){
	var found = null;
	$(this.surveys).each(function(){
		if (this.hasAttrs(obj)) found = this;
	});
	return found;
}
/**
 * @name createSurvey
 * @description Create a survey based on a passed through object.
 * @assign Chase and Grant
 * @todo
 *  + Add the survey object passed in to the config's surveys.
 *  + Return the created survey
 */
Config.prototype.createSurvey = function(obj){
	var spot = this.surveys.length;
	this.surveys.push(new Survey(obj, false));	
	return this.surveys[spot];
}
/**
 * @name getHighestSurveyId
 * @description Get the next highest survey id
 * @assign Chase and Grant
 * @todo 
 *  + Loop through the config object's surveys
 *   + Check for the highest id
 *    - Well done Chase, you found it!
 *  + return the highest id
 */
Config.prototype.getHighestSurveyId = function(){
	var id = 0;
	$(this.surveys).each(function(){
		if (id < this.id){
			id = this.id;
		}
	});
	return parseInt(id);
}
/**
 * @name getPerson
 * @description Get a person from first the survey, then from global
 * @assign Chase and Grant
 * @todo 
 *  + Remove the @ and everything right of it
 *  + Get the person
 *  + Return the person
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
 * @name addPerson
 * @description Add person to global list
 * @assign Chase and Grant
 * @todo 
 *  + Add a person to the other people list
 */
Config.prototype.addPerson = function(email, person){
	this.otherPeople[email] = person;
}
/**
 * @name getMaster
 * @description Get the master file
 * @assign Chase and Grant
 * @todo 
 *  + If the master is not there get the master from Sharepoint
 *  + Return the master
 */
Config.prototype.getMaster = function(){
	if (!this._master){
		this._master = ims.sharepoint.getXmlByEmail('master');
	}
	return this._master;
}
/**
 * @name getMap
 * @description get the map file
 * @assign Chase and Grant
 * @todo 
 *  + If the map is not there get the map from Sharepoint
 *  + Return the map
 *  + Possibly remove this function
 */
Config.prototype.getMap = function(){
	if (!this._map){
		this._map = ims.sharepoint.getXmlByEmail('map');
	}
	return this._map;
}
/**
 * @name _getSurveyColumns
 * @description Get the next up leader as string
 * @assign Chase and Grant
 * @todo 
 *  + Get the survey by the id
 *  + Add all the survey column data to the columns object
 *  + possibly add week
 *  + possibly add course
 *  + Go through the questions
 *   + Add them to the columns object
 *  + return columns
 */
Config.prototype._getSurveyColumns = function(surveyId){
	var survey = $(this._xml).find('semester[code="' + $(this._xml).find('semesters semester[current=true]').attr('code') + '"] > surveys > survey[id="' + surveyId + '"]');
	var columns = {
		iseval: survey.attr('iseval'),
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
/**
 * @name surveyModify
 * @description
 * @assign Chase and Grant
 * @todo 
 *  + Get a survey by its id
 *  + Change its week, placement, type, email, name, and course
 *  + Update the questions
 *  + Save the survey
 */
Config.prototype.surveyModify = function(name, emailCol, weekCol, typeCol, placement, courseCol, questions, surveyId, iseval){
	var survey = window.config.getSurveyById(surveyId);
	survey.modify('week', weekCol);
	survey.modify('placement', placement);
	survey.modify('type', typeCol);
	survey.modify('email', emailCol);
	survey.modify('name', name);
	survey.modify('course', courseCol);
	survey.modify('iseval', iseval);
	survey.updateQuestions(questions);
	survey.save();
}
/**
 * @name surveyRegister 
 * @description
 * @assign Chase and Grant
 * @todo
 *  + Save the survey
 *  + Add the survey to the config objects surveys
 */
Config.prototype.surveyRegister = function(survey){
	survey.save();
	this.surveys.push(survey);
}
/**
 * @name save 
 * @description
 * @assign Chase and Grant
 * @todo 
 *  + Save the config xml to sharepoint
 */
Config.prototype.save = function(){
	Sharepoint.postFile(this._xml, 'config/', 'config.xml', function(){
		alert('Survey change was successful!');
		window.location.reload();
	});
}
/**
 * @name getLeader 
 * @description
 * @assign Chase and Grant
 * @todo 
 *  + return the leader of the passed in placement
 */
Config.getLeader = function(p){
	switch (p){
		case 'instructor': return 'tgl';
		case 'tgl': return 'aim';
		case 'aim': return 'im';
		default: throw 'Invalid ' + p;
	}
}
/**
 * @name columnLetterToNumber
 * @description Convert a column letter to number
 * @assign Chase and Grant
 * @todo 
 *  + Check if the letter is already a number
 *  + Return the numeric value of the letters
 */
Config.columnLetterToNumber = function(letter){
	if(!isNaN(letter)) return letter;

	if (letter.length == 1){
		return letter.charCodeAt(0) - 65;
	}
	else{
		if (letter[1] == 'A') return 26;
		return (letter.charCodeAt(1) - 65) + 26;
	}
}
/**
 * @name columnNumberToLetter
 * @description
 * @assign Chase and Grant
 * @todo
 *  + Change AZ as the highest to BZ
 *  + Check if the num is already a letter
 *  + Return letter combination
 */
Config.columnNumberToLetter = function(num){
	if(isNaN(num)) return num;

	if (num < 26){
		return String.fromCharCode(num + 65);
	}
	else{
		return String.fromCharCode(Math.floor(num / 26) + 64) + String.fromCharCode(num % 26 + 65);
	}
}
/**
 * @end
 */



/**
 * Only one survey instance can be initalized at one time
 */
window.config = new Config();