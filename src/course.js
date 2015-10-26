function Course(xml){
	this._name = $(xml).text();
	this._credits = parseInt($(xml).attr('credit'));
	this._sections = $(xml).attr('section');
	this._pilot = $(xml).attr('pilot') == 'True';
}

Course.prototype.getName = function(){return this._name;}

Course.prototype.getSections = function(){return this._sections;}

Course.prototype.getCredits = function(){return this._credits;}

Course.prototype.isPilot = function(){return this._pilot;}