function Survey(xml){
	this._course = $(xml).attr('course');
}

/**
 * Get the name of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getName = function(){

}

/**
 * Get the week of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getWeek = function(){
	
}

/**
 * Get the answers of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getAnswers = function(){

}

/**
 * Check if the survey is completed or empty
 * @return {Boolean} [description]
 */
Survey.prototype.isComplete = function(){

}

/**
 * Checks the placement of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getPlacement = function(){

}

/**
 * Gets the course the survey was taken. If the course
 * is not validated, it will return null (good for debugging)
 * @return {[type]} [description]
 */
Survey.prototype.getCourse = function(){
	var isValidCourse = this._course.match(/[a-zA-Z]* ([0-9]{3}[a-zA-Z]|[0-9]{3})/g);
	isValidCourse = isValidCourse && isValidCourse.length > 0;
	if (!isValidCourse) return null;
	return this._course;
}

/**
 * Get the questions from the survey
 * @return {[type]} [description]
 */
Survey.prototype.getQuestions = function(){

}