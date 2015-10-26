function User(obj){
	if (!obj) throw "Invalid User Object";

	if (obj['email']){
		this._email = email;
		this._xml = ims.sharepoint.getXmlByEmail(email);
	}
	if (obj['xml']){
		this._setXmlData(xml);
	}

	this._first = null;
	this._last = null;
	this._courses = [];
	this._courses = this.getCourses();
	this._surveys = [];
	this._setSurveys();
}

User.prototype._setSurveys(){
	var sem = ims.current.getCurrentSemester(); 
	var _this = this;
	$(this._xml).find('semester[code=' + sem + '] survey').each(function(){
		_this._surveys.push(new Survey(this));
	})
}

User.prototype.getFirst = function(){
	if (this._first == null){
		var sem = ims.current.getCurrentSemester(); 
		this._first = $(this._xml).find('semester[code=' + sem + ']').children().first().attr('first');
	}
	return this._first;
}

User.prototype.getLast = function(){
	if (this._last == null){
		var sem = ims.current.getCurrentSemester(); 
		this._last = $(this._xml).find('semester[code=' + sem + ']').children().first().attr('last');
	}
	return this._last;
}

User.prototype.getEmail = function(){
	return this._email;
}

User.prototype.getEmailFull = function(){
	return this._email + '@byui.edu';
}

User.prototype.getAnswer = function(sid, qid){
	var sem = ims.current.getCurrentSemester(); 
	return $(this._xml).find('semester[code=' + sem + '] survey[id=' + sid + '] answer[qid=' + qid + ']').text();
}

User.prototype.getSurvey = function(sid){

}

User.prototype.addSurvey = function(sid){

}

User.prototype.getRole = function(){

}

User.prototype.isAim = function(){

}

User.prototype.isTgl = function(){

}

User.prototype.isInstructor = function(){

}

User.prototype.setRole = function(){

}

User.prototype.getLeaderTgl = function(){

}

User.prototype.getLeaderAim = function(){

}

User.prototype.hasTakenSurvey = function(sid){

}

User.prototype.getInstructors = function(){

}

User.prototype.getTgls = function(){

}

User.prototype.isNew = function(){

}

User.prototype.getSmartGoals = function(){

}

User.prototype.getStandard = function(name){

}

User.prototype.getStandardForGroup = function(name){
	
}

User.prototype.getStandardForAll = function(name){
	
}

User.prototype.getCompletedTasks = function(){

}

User.prototype.getRoster = function(){
	if (this.isInstructor()) return null;

}

User.prototype.getHoursAsTgl = function(){

}

User.prototype.getHoursAsAim = function(){

}

User.prototype.getCourses = function(){
	if (this._courses.length == 0){
		var _this = this;
		var sem = ims.current.getCurrentSemester();
		$('semester [code=' + sem + '] course').each(function(){
			_this._courses.push(new Course(this));
		})
	}
	return this._courses;
}

User.prototype.getTotalCredits = function(){
	var total = 0;
	for (var i = 0; i < this._courses.length; i++){
		var course = this._courses[i];
		total += course.getCredits();
	}
	return total;
}