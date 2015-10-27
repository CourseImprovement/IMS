function Course(xml){
	this._name = $(xml).text();
	this._credits = parseInt($(xml).attr('credit'));
	this._sections = $(xml).attr('section').indexOf(' ') > -1 ? $(xml).attr('section').split(' ') : [$(xml).attr('section')];
	this._pilot = $(xml).attr('pilot') == 'True';
}

/**
 * Get the name of the course
 * @return {[type]} [description]
 */
Course.prototype.getName = function(){return this._name;}

/** 
 * Get the sections for the course in an Array
 * @return {[type]} [description]
 */
Course.prototype.getSections = function(){return this._sections;}

/**
 * Get the credits for the course
 * @return {[type]} [description]
 */
Course.prototype.getCredits = function(){return this._credits;}

/**
 * Checks if the course is piloting
 * @return {Boolean} [description]
 */
Course.prototype.isPilot = function(){return this._pilot;}