


/**
 * @start Question
 */
/**
 * Question Object
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
/**
 * @name areSame 
 * @description Checks to see if the two questions passed in are the same
 * @assign Chase
 * @todo 
 *  + Are the texts, cols, replacewiths, and replacewhats the same
 *  + return a bool
 */
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
 * @name modify
 * @description Modify a variable in the object. This does not, however, save the object, that can only be done at the survey level.
 * @assign Chase
 * @todo 
 *  + Assign a new property and value to the question object
 */
Question.prototype.modify = function(prop, val){
	this[prop] = val;
}
/**
 * @name toXml
 * @description Create the question XML node and append the other nodes
 *              <question id name>
 * 	             <text></text>
 * 	             <replace with what/>
 *              </question>
 * @assign Chase
 * @todo 
 *  + Create the base question xml
 *  + Update the id
 *  + Add the text to the question
 *  + Add the replacewhats and the replacewiths
 *  + Return the new xml
 */
Question.prototype.toXml = function(){
	var xml = $('<question></question>');
	$(xml).attr('id', this.id).attr('col', this.col);
	$(xml).text(this.text);
	$(xml).attr('replacewith', this.replaceWith).attr('replacewhat', this.replaceWhat);
	return xml;
}
/**
 * @end
 */