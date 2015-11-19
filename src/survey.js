function Survey(xml, user){
	this._course = user.getCourseById($(xml).attr('courseid'));
	this._xml = xml;
	this._user = user;
	this.id = $(xml).attr('id');
	this._config = $(Survey.getConfig()).find('survey[id=' + this.id + ']');
	this._name = $(this._config).attr('name');
	this._placement = $(this._config).attr('placement');
	this._week = $(this._config).attr('week');
	this._answers = [];
	this._setAnswers();
	this._reviewed = $(this._xml).attr('reviewed') == 'true';
}

/**
 * Get the basic survey config file
 * @return {[type]} [description]
 */
Survey.getConfig = function(){
	if (!ims._config){
		ims._config = ims.sharepoint.getSurveyConfig();
	}
	return ims._config;
}

Survey.prototype._setAnswers = function(){
	var _this = this;
	$(this._xml).find('answer').each(function(){
		_this._answers.push(new Question(this, _this));
	});
}

/**
 * Get the name of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getName = function(){
	if (this.withCourse && this._user.getCourses().length > 1){
		return this._name + ': ' + this._week + ' - ' + this.getCourse().getName();
	}
	return this._name + ': ' + this._week;
}

/**
 * Verifiy if the survey is reviewed
 * @return {Boolean} [description]
 */
Survey.prototype.isReviewed = function(){
	return this._reviewed;
}

/**
 * Get the week of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getWeek = function(){
	return this._week;
}

/**
 * Get the answers of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getAnswers = function(){
	return this._answers;
}

/**
 * Check if the survey is completed or empty
 * @return {Boolean} [description]
 */
Survey.prototype.isComplete = function(){
	return this._answers.length > 0;
}

/**
 * Checks the placement of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getPlacement = function(){
	return this._placement;
}

/**
 * Toggle if the survey has been reviewed or not
 * @return {[type]} [description]
 */
Survey.prototype.toggleReviewed = function(){
	User.getLoggedInUserEmail(function(email){
		if (!email || ims.aes.value.ce.toLowerCase() != email.toLowerCase()) return;
		var reviewed = this.isReviewed();
		this._reviewed = !reviewed;
		reviewed = this._reviewed ? 'true' : 'false';
		var id = this.id;
		$(this._user._xml).find('> surveys survey[id=' + id + ']').attr('reviewed', reviewed);
		this._user.save();
	})
}

/**
 * Search for all questions containing text
 * @param  {[type]} txt [description]
 * @return {[type]}     [description]
 */
Survey.prototype.getQuestionsContainingText = function(txt){
	var answers = this.getAnswers();
	var result = [];
	for (var i = 0; i < answers.length; i++){
		var answer = answers[i];
		if (answer.getText().toLowerCase().indexOf(txt) > -1) result.push(answer);
	}
	return result;
}

/**
 * Gets the course the survey was taken. If the course
 * is not validated, it will return null (good for debugging)
 * @return {[type]} [description]
 */
Survey.prototype.getCourse = function(){
	return this._course;
}

/**
 * Get the questions from the survey, alias for getAnswers()
 * @return {[type]} [description]
 */
Survey.prototype.getQuestions = function(){
	return this.getAnswers();
}