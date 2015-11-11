


// GROUP PERSON
/**
 * Person Object
 * @param {[type]}  obj   obj containing a persons data
 * @param {Boolean} isXml Is the obj param actually xml
 */
function Person(obj, isXml){
	if (isXml){
		this._tmpXml = $(obj).find('semester[code' + window.config.getCurrentSemester() + '] > people > person');
		this._role = $(this._tmpXml);
		this._email = $(this._tmpXml).attr('email');
		this._xml = ims.sharepoint.getXmlByEmail(this._email);
	}
	else{
		this._email = obj.email;
		this._row = obj.row;
		this._placement = obj.placement.toLowerCase();
		this._leader = null;
		this._answers = obj.answers;
		this.course = obj.course;
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
	return !!(this._email && this._row && this._placement && this._answers.length > 0);
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
	var email = $(this._xml).find('semester[code' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > leadership > person[type=' + Config.getLeader(this._placement) + ']').attr('email');
	var person = window.config.getPerson(email);
	if (!person){
		person = ims.sharepoint.getXmlByEmail(email);
		person = new Person(person, true);
		window.config.addPerson(person);
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
		$(this._master).find('semester[code' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		$(this._leader._xml).find('semester[code' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		$(this._xml).find('semester[code' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
	}
	else{
		$(this._master).find('semester[code' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
		$(this._leader._xml).find('semester[code' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + ']').remove();
		$(this._xml).find('semester[code' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
	}
	$(this._master).find('semester[code' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
	$(this._leader._xml).find('semester[code' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys').append(xml.clone());
	$(this._xml).find('semester[code' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
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
	return $(this._xml).find('semester[code' + window.config.getCurrentSemester() + '] > people > person > courses course:contains(' + name + ')').attr('id');
}

/**
 * Puts all the survey components into xml form 
 * @return {Object} Survey in xml form
 */
Person.prototype.toXml = function(){
	var xml = $('<survey></survey>');
	var id = window.config.selectedSurvey.id;
	xml.attr('id', id);
	if(!!this.course){
		var cId = this.getCourseIdByName(this.course);
		xml.attr('courseid', cId);
	}
	for (var i = 0; i < this.answers.length; i++){
		xml.append(this.answers[i].toXml());
	}
	return xml;
}
// GROUP PERSON END



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