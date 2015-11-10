function Config(){
	this.surveys = [];
	this._initSetup();
	this._xml;
}

Config.prototype._initSetup = function(){
	Sharepoint.getFile(ims.url.base + 'config/config.xml', function(data){
		this._xml = $(data)[0];
		console.log('getting all the surveys');
		$(this._xml).find('semester[code=FA15] survey').each(function(){
			this.surveys.push(new Survey($(this), true));
		});
	});
}

Config.prototype.findSurvey = function(obj){
	var found = null;
	$(this.surveys).each(function(){
		if (this.hasAttrs(obj)) found = this;
	});
	return found;
}

Config.prototype.createSurvey = function(obj){
	var spot = this.surveys.length;
	this.surveys.push(new Survey(obj, false));	
	return this.surveys[spot];
}

Config.prototype.getHighestId = function(){
	var id = 0;
	$(this.surveys).each(function(){
		if (id < this.id){
			id = this.id;
		}
	});
	return id;
}

Config.prototype.getLeader = function(p){
	switch (p){
		case 'instructor' return 'tgl';
		case 'tgl': return 'aim';
		case 'aim': return 'im';
		default: throw 'Invalid';
	}
}

Config.prototype.columnLetterToNumber = function(letter){
	console.log('returning the numeric col from the letter');
	if(!isNaN(letter)) return letter;

	if (letter.length == 1){
		return letter.charCodeAt(0) - 65;
	}
	else{
		if (letter[1] == 'A') return 26;
		return (letter.charCodeAt(1) - 65) + 25;
	}
}

/**
 * TODO:
 * 		- Change AZ as the highest to BZ
 * @param  {[type]} number [description]
 * @return {[type]}        [description]
 */
Config.prototype.columnNumberToLetter = function(number){
	console.log('returning the letter col from the number');
	if (num < 26){
		return String.fromCharCode(num + 65);
	}
	else{
		return "A" + String.fromCharCode((num - 26) + 65);
	}
}





window.config = new Config();