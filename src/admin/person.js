


/**
 * @start Person
 */
/**
 * @name Person
 * @description Person Object
 */
function Person(obj, isXml, downloadXml){
	if (isXml){
		this._tmpXml = $(obj).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person');
		this._placement = $(this._tmpXml).attr('highestrole');
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
	if (downloadXml){
		this.getXml();
	}
	else{
		this._xml = obj;
	}
	this._valid = true;
}
/**
 * @name cleanEmail 
 * @description Remove the '@' symbol and everything after
 * @assign Chase
 * @todo 
 *  + Check that the email is not undefined
 *  + Search for the '@' character
 *  + Remove everything from the '@' to the end
 */
Person.cleanEmail = function(email){
	if (!email) throw 'Invalid Email';
	if (email.indexOf('@') > -1){
		email = email.split('@')[0];
	}
	return email;
}
/**
 * @name cleanEmailInternal 
 * @description Clean the person object's email
 * @assign Chase
 * @todo
 *  + Try to clean a person's email
 */
Person.prototype.cleanEmailInternal = function(){
	try{
		this._email = Person.cleanEmail(this._email);
	}
	catch(e){
		this._valid = false;
	}
}
/**
 * @name save
 * @description Save this person's xml to their sharepoint file
 * @assign Chase
 * @todo 
 *  + Post the person's xml file
 */
Person.prototype.save = function(callback){
	if ($(this._xml)[0] && this._email){
		Sharepoint.postFile($(this._xml)[0], 'master/', this._email + '.xml', callback);
	}
}
/**
 * @name isValid
 * @description Checks to see if the person object is valid
 * @assign Chase
 * @todo
 *  + Return if the email, row, placement, and answers and not undefined
 */
Person.prototype.isValid = function(){
	return !!(this._email && this._row && this._placement && this._answers.length > 0) && this._valid;
}
/**
 * @name getXml 
 * @description Get the person's xml from sharepoint
 * @assign Chase
 * @todo 
 *  + If the person's xml has not been retrieved yet, get it.
 */
Person.prototype.getXml = function(){
	if (!this._xml){
		this._xml = ims.sharepoint.getXmlByEmail(this._email);
	}
}
/**
 * @name getLeader
 * @description Retrieves a person's leader
 * @assign Chase
 * @todo
 *  + Get the email of the person's leader
 *  + Get the person from config
 *  + Create a new person
 *  + Add the person to the leader of person
 */
Person.prototype.getLeader = function(){
	var email = $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > leadership > people > person[type=' + Config.getLeader(this._placement) + ']').attr('email');
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
 * @name process
 * @description Process a person's survey data
 * @assign Chase
 * @todo 
 *  + Get the person's xml
 *  + Get the person's leaders
 *  + Add data to xml in the: master, leaders, person's files
 */
Person.prototype.process = function(){
	this.getXml();
	if (!window.config.selectedSurvey.iseval){
		this.getLeader();
		this._leader._placement = Config.getLeader(this._placement);
	}
	this._master = window.config.getMaster();
	var xml = this.toXml();
	var id = window.config.selectedSurvey.id;
	if (!!this.course){
		$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		if (!window.config.selectedSurvey.iseval){
			$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		}
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
	}
	else{
		$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
		if (!window.config.selectedSurvey.iseval){
			$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + ']').remove();
		}
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
	}
	$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
	if (!window.config.selectedSurvey.iseval){
		$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys').append(xml.clone());
	}
	$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
}
/**
 * @name getCourseIdByName
 * @description End of semester fix: remove if statement
 * @assign Chase
 * @todo 
 *  + Check if course is pathway
 *  + Find the course in the person's xml
 *  + return the id
 */
Person.prototype.getCourseIdByName = function(name){
	if (name.indexOf('PATH') > -1){
		name = name.split(' ')[0];
	}
	return $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > courses course:contains(' + name + ')').attr('id');
}
/**
 * @name toXml
 * @description Puts all the survey components into xml form 
 * @assign Chase
 * @todo 
 *  + Create the base survey xml
 *  + Add the id
 *  + Add course id if there is one
 *  + Add the answers
 *  + return the xml
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
/**
 * @end
 */