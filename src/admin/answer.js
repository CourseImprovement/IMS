// GROUP ANSWER
/**
 * Answer object
 * @param {Object} obj Contains a question and answer.
 */
function Answer(obj){
	this._question = obj.question;
	this._answer = obj.answer;
	this.clean();
}

/**
 * Replaces text in answers and encodes certain characters to xml
 */
Answer.prototype.clean = function(){
	if (this._answer == undefined) return;
	var ans = byui(this._answer);
	for (var i = 0; i < this._question.replaceWhat.length; i++){
		if (this._question.replaceWhat[i] == '') continue;
		ans.replace(this._question.replaceWhat[i], this._question.replaceWith[i]);
	}
	ans.encodeXml();
	this._answer = ans.val();
}

/**
 * Converts the components of the answer into xml
 * @return {Object} Answer in xml form
 */
Answer.prototype.toXml = function(){
	var xml = $('<answer></answer>');
	xml.attr('id', this._question.id);
	xml.text(this._answer);
	return xml; 
}

/**
 * Collects survey data from a csv row
 * @param  {Object} survey Contains information on the survey
 * @param  {Array}  row    A person's row from the csv file, which contains their information and answers
 * @return {Array}         The person's answers with the questions
 */
Answer.collect = function(survey, row){
	var result = [];
	for (var i = 0; i < survey.questions.length; i++){
		var answer = row[Config.columnLetterToNumber(survey.questions[i].col)];
		result.push(new Answer({
			question: survey.questions[i], 
			answer: answer
		}));
	}
	return result;
}
// GROUP ANSWER END