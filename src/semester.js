function Semester(obj){
	if (typeof obj == 'string'){
		this._code = obj;
	}
	else{
		// xml
	}
}

/**
 * Get the semester code
 * @return {[type]} [description]
 */
Semester.prototype.getCode = function(){return this._code;}

/**
 * Get the href for the menu item
 * @return {[type]} [description]
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

function Semesters(){
	this._xml = ims.sharepoint.getSemesterConfig();
	this._current = null;
}

Semesters.prototype.getCurrent = function(){
	if (!this._current){
		this._current = new Semester($(this._xml).find('[current=true]').attr('name'));
	}
	return this._current;
}

Semesters.prototype.getCurrentCode = function(){
	return this.getCurrent().getCode();
}

ims.semesters = (function(){
	return new Semesters();
})()