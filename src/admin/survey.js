function Survey(survey, isXml){
	if (isXml){
		this.id = parseInt($(survey).attr('id'));
		if ($(survey).hasAttr('week')){
			this.week = $(survey).attr('week');
		}
		this.placement = $(survey).attr('placement');
		this.type = $(survey).attr('type');
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
 * @return {[type]} [description]
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
 * @return {[type]} [description]
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
 * @return {[type]} [description]
 */
Survey.prototype.remove = function(){
	$(this._xml).remove();
}

/**
 * Modifiy a certain aspect of object, if save is necessary, its there.
 * @param  {[type]} prop  [description]
 * @param  {[type]} value [description]
 * @param  {[type]} save  [description]
 * @return {[type]}       [description]
 */
Survey.prototype.modify = function(prop, value, save){
	this[prop] = value;
	if (save){
		this.save();
	}
}

/**
 * Clone and rename survey to append (Copy) and increment the id
 * @return {[type]} [description]
 */
Survey.prototype.copy = function(){
	var cloned = $(this._xml).clone();
	$(cloned).attr('name', $(cloned).attr('name') + ' (Copy)');
	$(cloned).attr('id', window.config.getHighestSurveyId() + 1);
	return new Survey(cloned, true);
}

Survey.prototype.process = function(){

}

Survey.prototype.answerReplace = function(){

}

/**
 * Get the question by Id
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
Survey.prototype.getQuestionById = function(id){
	for (var i = 0; i < this.questions.length; i++){
		if (this.questions[i].id == id) return this.questions[i];
	}
	return false;
}

/**
 * If the survey has the attributes of the parameter object
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
Survey.prototype.hasAttrs = function(obj){
	var keys = Object.keys(obj);
	for (var i = 0; i < keys.length; i++){
		if (this[keys[i]] != obj[keys[i]]) return false;
	}
	return true;
}