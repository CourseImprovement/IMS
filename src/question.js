function Question(xml, survey){
	this._answer = $(xml).text();
	this._survey = survey;
	this._xml = xml;
	this._id = $(xml).attr('qid');
	this._surveyId = survey.id;
	this._text = $(Survey.getConfig()).find('survey[id=' + this._surveyId + '] question[id=' + this._id + '] text').text();
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

}

/**
 * Get the column the question appears from the CSV
 * @return {[type]} [description]
 */
Question.prototype.getCol = function(){

}