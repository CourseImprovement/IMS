


// GROUP SURVEY
/**
 * Survey Object
 * @param {Object}  survey A surveys information
 * @param {Boolean} isXml  Is the survey in xml form
 */
function Survey(survey, isXml){
	if (isXml){
		this.id = parseInt($(survey).attr('id'));
		if ($(survey).hasAttr('week')){
			this.week = $(survey).attr('week');
		}
		this.placement = $(survey).attr('placement');
		this.type = $(survey).attr('type');
		this.email = $(survey).attr('email');
		this.name = $(survey).attr('name');
		if ($(survey).hasAttr('course')){
			this.course = $(survey).attr('course');
		}
		this._xml = survey;
		this.questions = [];
		this._setXmlQuestions();
		this.people = [];
	}
}

/**
 * [getPerson description]
 * @param  {String} email A person's email
 * @return {Object}       Person with the email of 'email'
 */
Survey.prototype.getPerson = function(email){
	for (var i = 0; i < this.people.length; i++){
		if (this.people[i].email == email) return this.people[i];
	}
	return false;
}

/**
 * Set the questions questions by passing in the question node from
 * the XML
 */
Survey.prototype._setXmlQuestions = function(){
	$(this._xml).find('question').each(function(){
		this.questions.push(new Question(this));
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
	for (var i = 4; i < rows[i].length){
		// clean answers and then add them to their respective individual
		var person = this.getPerson(rows[i][eCol]);
		if (!person){
			person = new Person({
				email: rows[i][eCol],
				row: rows[i],
				placement: this.placement,
				answers: Answers.collect(this, rows[i])
			});
		}
		else{
			person._answers = Answers.collect(this, rows[i]);
			person._row = rows[i];
		}
		if (eCol == -1) continue;
		person.course = rows[i][cCol];
		if (person.isValid()){
			person.process();
			this.people.push(person);
		}
	}
	
	/*for (var i = 0; i < this.people.length; i++){
		this.people[i].save();
	}

	for (var email in window.config.otherPeople){
		window.config.otherPeople[email].save();
	}

	Sharepoint.postFile(window.config.getMaster(), 'master/', 'master.xml', function(){});*/
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