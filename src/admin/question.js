


// GROUP QUESTION
/**
 * Question Object
 * @param {Object}  question Information for a question
 * @param {Boolean} isXml    Is the question param xml
 */
function Question(question, isXml){
	if (isXml){
		this.id = parseInt($(question).attr('id'));
		this.text = $(question).text();
		this.col = $(question).attr('col');
		this.replaceWhat = $(question).attr('replacewhat');
		this.replaceWith = $(question).attr('replacewith');
		this._xml = question;
	}
	else{
		this.id = parseInt(question.id);
		this.text = question.text;
		this.col = Config.columnNumberToLetter(question.col);
		this.replaceWhat = question.replaceWhat;
		this.replaceWith = question.replaceWith;
		this._xml = this.toXml();
	}
}

Question.areSame = function(newQ, oldQ){
	if (newQ.text != oldQ.text || 
		newQ.col != oldQ.col ||
		newQ.replaceWith != oldQ.replaceWith || 
		newQ.replaceWhat != oldQ.replaceWhat){
		return false;
	}
	else{
		return true;
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
 * @return {Object} Question in xml form
 */
Question.prototype.toXml = function(){
	var xml = $('<question></question>');
	$(xml).attr('id', this.id).attr('col', this.col);
	$(xml).text(this.text);
	$(xml).attr('replacewith', this.replaceWith).attr('replacewhat', this.replaceWhat);
	return xml;
}
// GROUP QUESTION END