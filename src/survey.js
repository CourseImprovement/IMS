/**
 * @name Survey 
 * @description
 */
function Survey(xml, user){
	this._course = user.getCourseById($(xml).attr('courseid'));
	this._xml = xml;
	this._user = user;
	this.id = $(xml).attr('id');
	var sem = ims.semesters.getCurrentCode();
	this._config = $(Survey.getConfig()).find('semester[code=' + sem + '] survey[id=' + this.id + ']');
	this._name = $(this._config).attr('name');
	this._placement = $(this._config).attr('placement');
	this._week = $(this._config).attr('week');
	if (!this._week) this._week = "";
	this._answers = [];
	this._setAnswers();
	this._reviewed = $(this._xml).attr('reviewed') == 'true';
}

/**
 * @name Survey.getConfig
 * @description Get the basic survey config file
 */
Survey.getConfig = function(){
	if (!ims._config){
		ims._config = ims.sharepoint.getSurveyConfig();
	}
	return ims._config;
}

/**
 * @name Survey.getNameById
 * @description 
 * @todo
 *  + Get the survey name by an id
 */
Survey.getNameById = function(id){
	var config = Survey.getConfig();
	var survey = $(config).find('semester[current=true] survey[id=' + id + ']');
	return $(survey).attr('name') + ': ' + $(survey).attr('week');
}

/**
 * @name Survey._setAnswers 
 * @description
 */
Survey.prototype._setAnswers = function(){
	var _this = this;
	$(this._xml).find('answer').each(function(){
		_this._answers.push(new Question(this, _this));
	});
}

/**
 * @name Survey.getName
 * @description Get the name of the survey
 */
Survey.prototype.getName = function(){
	if (this.withCourse && this._user.getCourses().length > 1){
		return this._name + ': ' + this._week + ' - ' + this.getCourse().getName();
	}
	return this._name + ': ' + this._week;
}

/**
 * @name Survey.isReviewed
 * @description Verifiy if the survey is reviewed
 */
Survey.prototype.isReviewed = function(){
	return this._reviewed;
}

/**
 * @name Survey.getWeek
 * @description Get the week of the survey
 */
Survey.prototype.getWeek = function(){
	return this._week;
}

/**
 * @name Survey.isEvaluation 
 * @description
 */
Survey.prototype.isEvaluation = function(){
	return $(this._config).attr('iseval') == 'true';
}

/**
 * @name Survey.getAnswers
 * @description Get the answers of the survey
 */
Survey.prototype.getAnswers = function(){
	return this._answers;
}

/**
 * @name Survey.isComplete
 * @description Check if the survey is completed or empty
 */
Survey.prototype.isComplete = function(){
	return this._answers.length > 0;
}

/**
 * @name Survey.getPlacement
 * @description Checks the placement of the survey
 */
Survey.prototype.getPlacement = function(){
	return this._placement;
}

/**
 * @name Survey.toggleReviewed
 * @description Toggle if the survey has been reviewed or not
 */
Survey.prototype.toggleReviewed = function(){
	var _this = this;
	User.getLoggedInUserEmail(function(email){
		if (!email || ims.aes.value.ce.toLowerCase() != email.toLowerCase()) return;
		var reviewed = _this.isReviewed();
		_this._reviewed = !reviewed;
		reviewed = _this._reviewed ? 'true' : 'false';
		var id = _this.id;
		$(_this._user._xml).find('> surveys survey[id=' + id + ']').attr('reviewed', reviewed);
		_this._user.save();
	})
}

/**
 * @name Survey.getQuestionsContainingText
 * @description Search for all questions containing text
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
 * @name Survey.getCourse
 * @description Gets the course the survey was taken. If the course
 * is not validated, it will return null (good for debugging)
 */
Survey.prototype.getCourse = function(){
	return this._course;
}

/**
 * @name Survey.getQuestions
 * @description Get the questions from the survey, alias for getAnswers()
 */
Survey.prototype.getQuestions = function(){
	return this.getAnswers();
}