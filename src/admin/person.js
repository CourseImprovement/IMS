


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
		console.log('email 1:' + $(this._tmpXml).attr('email'));
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
	this._xml = ims.sharepoint.getXmlByEmail(this._email);
}

/**
 * Retrieves a person's leader
 */
Person.prototype.getLeader = function(){
	console.log('email 2:' + $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > leadership > person[type=' + Config.getLeader(this._placement) + ']').attr('email'));
	var email = $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > leadership > person[type=' + Config.getLeader(this._placement) + ']').attr('email');
	var person = window.config.getPerson(email);
	if (!person){
		person = ims.sharepoint.getXmlByEmail(email);
		person = new Person(person, true, false);
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