


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
	email = Person.cleanEmail(email);
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
		default: throw 'Invalid';
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