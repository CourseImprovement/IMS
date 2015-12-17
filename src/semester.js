/**
 * @name Semester 
 * @description
 */
function Semester(obj){
	if (typeof obj == 'string'){
		this._code = obj;
	}
}

/**
 * @name Semester.getCode
 * @description Get the semester code
 */
Semester.prototype.getCode = function(){return this._code;}

/**
 * @name Semester.getHref
 * @description Get the href for the menu item
 */
Semester.prototype.getHref = function(){
	var loc = window.location.href;
	if (loc.indexOf('&sem=') > -1){
		window.location.href = loc.split('&sem=')[0] + '&sem=' + this.getCode();
	}
	else{
		window.location.href = loc + '&sem=' + this.getName();
	}
}

/**
 * @name Semesters
 * @description
 */
function Semesters(){
	this._current = null;
}

/**
 * @name Semesters.getCurrent 
 * @description
 */
Semesters.prototype.getCurrent = function(){
	if (!this._current){
		this._current = new Semester($(Survey.getConfig()).find('semester[current=true]').attr('code'));
	}
	return this._current;
}

/**
 * @name Semesters.getCurrentCode 
 * @description
 */
Semesters.prototype.getCurrentCode = function(){
	var loc = window.location.href;
	if (loc.indexOf('&sem=') > -1){
		var sem = loc.split('&sem=')[1];
		if (sem.indexOf('&') > -1){
			sem = sem.split('&')[0];
		}
		return sem; 
	}
	return this.getCurrent().getCode();
}

/**
 * ims.semesters
 * @description
 */
ims.semesters = (function(){
	return new Semesters();
})()