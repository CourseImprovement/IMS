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

/**
 * Get the current user (the current dashboard user)
 * @return {[type]} [description]
 */
User.getCurrent = function(){

}

/**
 * Internal function to populate the users surveys into the _surveys
 * array
 */
User.prototype._setSurveys(){
	var sem = ims.current.getCurrentSemester(); 
	var _this = this;
	$(this._xml).find('semester[code=' + sem + '] survey').each(function(){
		_this._surveys.push(new Survey(this));
	})
}

/**
 * Get the first name of the user
 * @return {[type]} [description]
 */
User.prototype.getFirst = function(){
	if (this._first == null){
		var sem = ims.current.getCurrentSemester(); 
		this._first = $(this._xml).find('semester[code=' + sem + ']').children().first().attr('first');
	}
	return this._first;
}

/**
 * Get the last name of the user
 * @return {[type]} [description]
 */
User.prototype.getLast = function(){
	if (this._last == null){
		var sem = ims.current.getCurrentSemester(); 
		this._last = $(this._xml).find('semester[code=' + sem + ']').children().first().attr('last');
	}
	return this._last;
}

/**
 * Get the email of the user
 * @return {[type]} [description]
 */
User.prototype.getEmail = function(){
	return this._email;
}

/**
 * Get the email of the user including the @byui.edu
 * @return {[type]} [description]
 */
User.prototype.getEmailFull = function(){
	return this._email + '@byui.edu';
}

/**
 * Get the user answers by surveyId and questionId
 * @param  {[type]} sid [description]
 * @param  {[type]} qid [description]
 * @return {[type]}     [description]
 */
User.prototype.getAnswer = function(sid, qid){
	var sem = ims.current.getCurrentSemester(); 
	return $(this._xml).find('semester[code=' + sem + '] survey[id=' + sid + '] answer[qid=' + qid + ']').text();
}

/**
 * Get the full name of the user with a space between the first
 * and last name, and a capital first letter of each name.
 * @return {[type]} [description]
 */
User.prototype.getFullName = function(){

}

/**
 * Get a specific survey from the user
 * @param  {[type]} sid [description]
 * @return {[type]}     [description]
 */
User.prototype.getSurvey = function(sid){

}

/**
 * Add a survey to the user
 * @param {[type]} sid [description]
 */
User.prototype.addSurvey = function(sid){

}

// GROUP: Roles
/**
 * Get the users role relative to the current user and their role
 * @return {[type]} [description]
 */
User.prototype.getRole = function(){

}

/**
 * validates that the getRole == AIM
 * @return {Boolean} [description]
 */
User.prototype.isAim = function(){

}

/**
 * validates that the getRole == TGL
 * @return {Boolean} [description]
 */
User.prototype.isTgl = function(){

}

/**
 * validates that the getRole == INSTRUCTOR
 * @return {Boolean} [description]
 */
User.prototype.isInstructor = function(){

}

/**
 * Set the role of the user
 */
User.prototype.setRole = function(){

}
// END GROUP: Roles

/**
 * Get the leader TGL
 * @return {[type]} [description]
 */
User.prototype.getLeaderTgl = function(){

}

/**
 * Get the leader AIM
 * @return {[type]} [description]
 */
User.prototype.getLeaderAim = function(){

}

/**
 * Get the Instructors under this user
 * @return {[type]} [description]
 */
User.prototype.getInstructors = function(){

}

/**
 * Validate a survey has been taken by id
 * @param  {[type]}  sid [description]
 * @return {Boolean}     [description]
 */
User.prototype.hasTakenSurvey = function(sid){

}

/**
 * Get a lower user by their email address
 * @param  {[type]} email [description]
 * @return {[type]}       [description]
 */
User.prototype.getUserByEmail = function(email){
	
}

/**
 * Get the TGLs below this person. Note this has
 * to be either an AIM or an IM
 * @return {[type]} [description]
 */
User.prototype.getTgls = function(){

}

/**
 * Validates if the instructor is a new instructor
 * or not.
 * @return {Boolean} [description]
 */
User.prototype.isNew = function(){

}

/**
 * Returns an array of SMART goals if taken
 * @return {[type]} [description]
 */
User.prototype.getSmartGoals = function(){

}

/**
 * Gets a standard by name if taken any
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
User.prototype.getStandard = function(name){

}

/**
 * Gets the rollup for a standard by name for the group.
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
User.prototype.getStandardForGroup = function(name){
	
}

/**
 * Gets a rollup for a standard for all instructors
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
User.prototype.getStandardForAll = function(name){
	
}

/**
 * Get the completed instructor tasks
 * @return {[type]} [description]
 */
User.prototype.getCompletedTasks = function(){

}

/**
 * Get a list of all those below the user
 * @return {[type]} [description]
 */
User.prototype.getRoster = function(){
	if (this.isInstructor()) return null;

}

/**
 * Get the hours as a TGL
 * @return {[type]} [description]
 */
User.prototype.getHoursAsTgl = function(){

}

/**
 * Get the hours as an AIM
 * @return {[type]} [description]
 */
User.prototype.getHoursAsAim = function(){

}

/**
 * Get the target hours for this user.
 * @return {[type]} [description]
 */
User.prototype.getTargetHours = function(){

}

/**
 * Get an array of the weekly reflections
 * @return {[type]} [description]
 */
User.prototype.getWeeklyReflections = function(){

}

/**
 * Redirect the url to a specific place
 * @return {[type]} [description]
 */
User.prototype.redirectTo = function(){

}

/**
 * All graph related functions are grouped for convinence
 * @type {Object}
 */
User.prototype.graph = {
	/**
	 * Instructor standards graph as an Instructor
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	instructorStandard: function(name){

	},
	/**
	 * Instructor hours graph as an Instructor
	 * @return {[type]} [description]
	 */
	instructorHours: function(){

	},
	/**
	 * Instructor hours as TGL
	 * @return {[type]} [description]
	 */
	instructorHoursAsTgl: function(){

	},
	/**
	 * Instructor standards as TGL
	 * @return {[type]} [description]
	 */
	instructorStandardAsTgl: function(){

	},
	/**
	 * Instructor hours as AIM
	 * @return {[type]} [description]
	 */
	instructorHoursAsAim: function(){

	}
}

/**
 * Get an array of Course objects
 * @return {Array} [description]
 */
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

/**
 * Get the total Credits this user is taking
 * @return {[type]} [description]
 */
User.prototype.getTotalCredits = function(){
	var total = 0;
	for (var i = 0; i < this._courses.length; i++){
		var course = this._courses[i];
		total += course.getCredits();
	}
	return total;
}