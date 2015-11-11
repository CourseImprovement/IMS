function Config(){
	this.surveys = [];
	this._initSetup();
	this._xml;
	this.semesters = ims.sharepoint.getSemesterConfig();
	this.selectedSurvey;
	this.otherPeople = {};
}

Config.prototype.getCurrentSemester = function(){
	return $(this.semesters).find('[current=true]').attr('name');
}

/** 
 * Inital setup. Create the survey objects
 * @return {[type]} [description]
 */
Config.prototype._initSetup = function(){
	Sharepoint.getFile(ims.url.base + 'config/config.xml', function(data){
		this._xml = $(data)[0];
		console.log('getting all the surveys');
		$(this._xml).find('semester[code=' + this.getCurrentSemester() + '] survey').each(function(){
			this.surveys.push(new Survey($(this), true));
		});
	});
}

/**
 * Find a survey based on the criteria in an object
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
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
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
Config.prototype.createSurvey = function(obj){
	var spot = this.surveys.length;
	this.surveys.push(new Survey(obj, false));	
	return this.surveys[spot];
}

/**
 * Get the next highest survey id
 * @return {[type]} [description]
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
 * @param  {[type]} email [description]
 * @return {[type]}       [description]
 */
Config.prototype.getPerson = function(email){
	var person = this.selectedSurvey.getPerson(email);
	if (!person){
		person = this.otherPeople[email];
	}
	return person;
}

/**
 * Add person to global list
 * @param {[type]} person [description]
 */
Config.prototype.addPerson = function(person){
	this.otherPeople[person.email] = person;
}

/**
 * Get the master file
 * @return {[type]} [description]
 */
Config.prototype.getMaster = function(){
	if (!this._master){
		this._master = ims.sharepoint.getXmlByEmail('master');
	}
	return this._master;
}

/**
 * Get the next up leader as string
 * @param  {[type]} p [description]
 * @return {[type]}   [description]
 */
Config.getLeader = function(p){
	switch (p){
		case 'instructor' return 'tgl';
		case 'tgl': return 'aim';
		case 'aim': return 'im';
		default: throw 'Invalid';
	}
}


/**
 * Convert a column letter to number
 * @param  {[type]} letter [description]
 * @return {[type]}        [description]
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
 * @param  {[type]} number [description]
 * @return {[type]}        [description]
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



/**
 * Only one survey instance can be initalized at one time
 * @type {Config}
 */
window.config = new Config();