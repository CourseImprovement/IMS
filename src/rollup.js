window._rollupXml = null;

function Rollup(obj){
	this._level = obj.level;
	this._email = obj.email;
	this._question = obj.question;
	this._xml = null;
	this._initalXmlLoad();
	this._data = [];
	this._getData();
}

/**
 * loads the xml file if the file is not already loaded
 */
Rollup.prototype._initalXmlLoad = function(){
	if (window._rollupXml){
		this._xml = window._rollupXml;
	}
	else{
		this._xml = ims.sharepoint.getXmlByEmail('rollup');
		window._rollupXml = this._xml;
	}
}


Rollup.prototype.getData = function(){
	return this._data;
}

/**
 * returns a list of the data topics
 * @return {Array} list of data topics 
 */
Rollup.prototype._getData = function(){
	var _this = this;
	var sem = ims.semesters.getCurrentCode();
	var level = this._level.toLowerCase();
	if (level == '*'){
		$(this._xml).find('semester[code=' + sem + '] > questions question[name*="' + this._question + '"] survey').sort(function(a, b){

			var aname = $(Survey.getConfig()).find('semester[code=' + sem + '] survey[id=' + $(a).attr('id') + ']').attr('name');
			if (aname.indexOf('Intro') > -1) return false;
			var aweek = parseInt(aname.split(': Week ')[1]);
			var bname = $(Survey.getConfig()).find('semester[code=' + sem + '] survey[id=' + $(b).attr('id') + ']').attr('name');
			var bweek = parseInt(bname.split(': Week ')[1]);
			return parseInt(aweek > bweek);

		}).each(function(){
			_this._data.push($(this).attr('value'));
		});
	}
	else{
		$(this._xml).find('semester[code=' + sem + '] person[email=' + this._email + '][type=' + level + '] question[name*="' + this._question + '"] survey').sort(function(a, b){

			var aname = $(Survey.getConfig()).find('semester[code=' + sem + '] survey[id=' + $(a).attr('id') + ']').attr('name');
			if (aname.indexOf('Intro') > -1) return false;
			var aweek = parseInt(aname.split(': Week ')[1]);
			var bname = $(Survey.getConfig()).find('semester[code=' + sem + '] survey[id=' + $(b).attr('id') + ']').attr('name');
			var bweek = parseInt(bname.split(': Week ')[1]);
			return parseInt(aweek > bweek);

		}).each(function(){
			_this._data.push($(this).attr('value'));
		});
	}
}