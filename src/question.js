function Question(xml, survey){
	this._answer = $(xml).text();
	this._survey = survey;
	this._xml = xml;
	this._id = $(xml).attr('qid');
	this._surveyId = survey.id;
	this._qconfig = $(Survey.getConfig()).find('survey[id=' + this._surveyId + '] question[id=' + this._id + ']')[0];
	this._text = $(this._qconfig).find('text').text();
	this._cleanAnswer();
}

/**
 * Get the text of the survey
 * @return {[type]} [description]
 */
Question.prototype.getText = function(){
	return this._text;
}

/**
 * Get the answer for the question
 * @return {[type]} [description]
 */
Question.prototype.getAnswer = function(){
	return this._answer;
}

/**
 * Get the smart goal title
 * @return {[type]} [description]
 */
Question.prototype.getSmartName = function(){
	return this._text.split('SMART Goal')[1];
}

/**
 * Checks for an answer
 * @return {Boolean} [description]
 */
Question.prototype.hasAnswer = function(){
	return this.getText() && this.getText().length > 0;
}

/**
 * Internal function to clean the answer based on the configurations
 * @return {[type]} [description]
 */
Question.prototype._cleanAnswer = function(){
	this._answer = this._answer.replace(/\\/g, '\n');
	var replace = $(this._qconfig).find('replace');
	var rwhat = replace.attr('what');
	var rwith = replace.attr('with');
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