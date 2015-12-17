/**
 * @name Question 
 * @description
 */
function Question(xml, survey){
	this._answer = $(xml).text();
	this._survey = survey;
	this._xml = xml;
	this._id = $(xml).attr('id');
	this._surveyId = survey.id;
	this._qconfig = $(Survey.getConfig()).find('survey[id=' + this._surveyId + '] question[id=' + this._id + ']')[0];
	this._text = $(this._qconfig).text();
	this._cleanAnswer();
}

/**
 * @name Question.getText
 * @description Get the text of the survey
 */
Question.prototype.getText = function(){
	return this._text;
}

/**
 * @name Question.getAnswer
 * @description Get the answer for the question
 */
Question.prototype.getAnswer = function(){
	return this._answer;
}

/**
 * @name Question.getSmartName
 * @description Get the smart goal title
 */
Question.prototype.getSmartName = function(){
	return this._text.split('SMART Goal')[1];
}

/**
 * @name Question.hasAnswer
 * @description Checks for an answer
 */
Question.prototype.hasAnswer = function(){
	return this.getText() && this.getText().length > 0;
}

/**
 * @name Question._cleanAnswer
 * @description Internal function to clean the answer based on the configurations
 */
Question.prototype._cleanAnswer = function(){
	this._answer = this._answer.replace(/[^\x00-\x7F]/g, '');
	this._answer = this._answer.replace(/\\/g, '\n');
	var rwhat = $(this._qconfig).attr('replacewhat');
	var rwith = $(this._qconfig).attr('replacewith');
	if (rwhat && rwhat.length > 0){
		rwhat = rwhat.split(';');
	}
	if (rwith && rwith.length > 0){
		rwith = rwith.split(';');
	}
	if (!rwith || !rwhat) return;
	if (rwith.length != rwhat.length) return;
	for (var i = 0; i < rwhat.length; i++){
		var r = new RegExp(rwhat[i], 'g');
		this._answer = this._answer.replace(r, rwith[i]);
	}
}