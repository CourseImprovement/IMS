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
	if (level == 'aim' || level == 'tgl') {
		$(this._xml).find('semester[code=' + sem + '] ' + level + '[email=' + this._email + '] > rollup[question*="' + this._question + '"] week').sort(function(a, b){
			if ($(a).attr('week') == 'Intro') return false;
			return parseInt($(a).attr('week')) > parseInt($(b).attr('week'));
		}).each(function(){
			_this._data.push($(this).text());
		});
	}
	else{
		$(this._xml).find('semester[code=' + sem + '] > rollup[question*="' + this._question + '"] week').sort(function(a, b){
			if ($(a).attr('week') == 'Intro') return false;
			return parseInt($(a).attr('week')) > parseInt($(b).attr('week'));
		}).each(function(){
			_this._data.push($(this).text());
		});
	}	
}