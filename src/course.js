function Course(xml){
	this._name = $(xml).text();
	if ($(xml).attr('section') != undefined) {
		this._sections = $(xml).attr('section').indexOf(' ') > -1 ? $(xml).attr('section').split(' ') : [$(xml).attr('section')];
	}
	if ($(xml).attr('pwsection') != undefined) {
		this._pwsections = $(xml).attr('pwsection').indexOf(' ') > -1 ? $(xml).attr('pwsection').split(' ') : [$(xml).attr('pwsection')];
	}
	this._credits = parseInt($(xml).attr('credits'));
	this._pilot = $(xml).attr('pilot') == 'true';
	this._id = $(xml).attr('id');
}

Course.prototype.getId = function(){return this._id;}

/**
 * @name Course.getName
 * @description Get the name of the course
 */
Course.prototype.getName = function(){return this._name;}

/** 
 * @name Course.getSections
 * @description Get the sections for the course in an Array
 */
Course.prototype.getSections = function(){return this._sections;}

/**
 * @name Course.getCredits
 * @description Get the credits for the course
 */
Course.prototype.getCredits = function(){return this._credits;}

/**
 * @name Course.isPilot
 * @description Checks if the course is piloting
 */
Course.prototype.isPilot = function(){return this._pilot;}

/**
 * @name getHref
 * @description Get the href for the course
 */
Course.prototype.getHref = function(){
	var loc = window.location.href;
	if (loc.indexOf('&c=') > -1){
		return loc.split('&c=')[0] + '&c=' + this.getName();
	}
	else{
		return loc + '&c=' + this.getName();
	} 
}

/**
 * @name Course.getCurrent 
 * @description Returns the course that is currently being viewed
 */
Course.getCurrent = function(){
	if (ims.params.c){
		var course = decodeURI(ims.params.c);
		return User.getCurrent().getCourse(course);
	}
	return null;
}