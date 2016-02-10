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
		return loc.split('&sem=')[0] + '&sem=' + this.getCode();
	}
	else{
		return loc + '&sem=' + this.getName();
	}
}

/**
 * @name  Semester.getName
 * @todo
 *  + Get the name of the semester
 */
Semester.prototype.getName = function(){
	return this._code.toUpperCase();
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
		var url = this.getFromUrl();
		if (url){
			this._current = new Semester($(Survey.getConfig()).find('semester[code=' + url + ']').attr('code'));
		}
		else{
			this._current = new Semester($(Survey.getConfig()).find('semester[current=true]').attr('code'));
		}
	}
	return this._current;
}

Semesters.prototype.getFromUrl = function(){
	var loc = window.location.href;
	if (loc.indexOf('&sem=') > -1){
		var sem = loc.split('&sem=')[1];
		if (sem.indexOf('&') > -1){
			sem = sem.split('&')[0];
		}
		return sem; 
	}
	return false;
}

/**
 * @name Semesters.getCurrentCode 
 * @description
 */
Semesters.prototype.getCurrentCode = function(){
	var url = this.getFromUrl();
	if (url) return url;
	return this.getCurrent().getCode();
}

/**
 * ims.semesters
 * @description
 */
ims.semesters = (function(){
	return new Semesters();
})()