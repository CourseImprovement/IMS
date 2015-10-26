function Survey(xml){
	this._course = $(xml).attr('course');
}

Survey.prototype.getName = function(){

}

Survey.prototype.getWeek = function(){
	
}

Survey.prototype.getAnswers = function(){

}

Survey.prototype.isComplete = function(){

}

Survey.prototype.getPlacement = function(){

}

Survey.prototype.getCourse = function(){
	var isValidCourse = this._course.match(/[a-zA-Z]* ([0-9]{3}[a-zA-Z]|[0-9]{3})/g);
	isValidCourse = isValidCourse && isValidCourse.length > 0;
	if (!isValidCourse) return null;
	return this._course;
}

Survey.prototype.getQuestions = function(){

}

Survey.prototype.getAnswers = function(){

}