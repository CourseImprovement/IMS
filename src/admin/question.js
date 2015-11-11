function Question(question, isXml){
	if (isXml){
		this.id = parseInt($(question).attr('id'));
		this.text = $(question).find('text').text();
		this.col = Config.columnLetterToNumber($(question).attr('col'));
		this.replaceWhat = $(question).find('replace').attr('what');
		this.replaceWith = $(question).find('replace').attr('with');
		if (this.replaceWith.indexOf(';') > -1){
			this.replaceWith = this.replaceWith.split(';');
		}
		if (this.replaceWhat.indexOf(';') > -1){
			this.replaceWhat = this.replaceWhat.split(';');
		}
		this._xml = question;
	}
}

/**
 * Modify a variable in the object. This does not, however, 
 * save the object, that can only be done at the survey level.
 * @param  {[type]} prop [description]
 * @param  {[type]} val  [description]
 * @return {[type]}      [description]
 */
Question.prototype.modify = function(prop, val){
	this[prop] = val;
}

/**
 * Create the question XML node and append the other nodes
 * <question id name>
 * 	<text></text>
 * 	<replace with what/>
 * </question>
 * @return {[type]} [description]
 */
Question.prototype.toXml = function(){
	var xml = $('<question><text></text><replace /></question>');
	$(xml).attr('id', this.id);
	$(xml).find('text').text(this.text);
	$(xml).find('replace').attr('with', this.replaceWith.join(';')).attr('what', this.replaceWhat.join(';'));
	return xml;
}