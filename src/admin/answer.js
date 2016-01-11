/**
 * @start Group Answer
 */
/**
 * @name  Answer
 * @description Answer object
 * @assign Chase
 */
function Answer(obj) {
	this._question = obj.question;
	this._answer = obj.answer;
	this.clean();
}
/**
 * @name clean
 * @description Replaces text in answers and encodes certain characters to xml
 * @assign Chase
 * @todo 
 *  + Make sure the answer is not undefined
 *  + Remove unnecessary characters
 *  + Replace the Whats with the Withs
 */
Answer.prototype.clean = function() {
	if (this._answer == undefined) return;
	var ans = byui(this._answer);
	for (var i = 0; i < this._question.replaceWhat.length; i++) {
		if (this._question.replaceWhat[i] == '') continue;
		ans.replace(this._question.replaceWhat[i], this._question.replaceWith[i]);
	}
	ans.encodeXml();
	this._answer = ans.val();
}
/**
 * @name toXml
 * @description Converts the components of the answer into xml
 * @assign Chase
 * @todo 
 *  + Create the start of the answer xml
 *  + Create the id attribute for the answer
 *  + Add the answer text
 *  + return the xml
 */
Answer.prototype.toXml = function() {
	var xml = $('<answer></answer>');
	xml.attr('id', this._question.id);
	xml.text(this._answer);
	return xml; 
}
/**
 * @name collect
 * @description Collects survey data from a csv row
 * @assign Chase
 * @todo 
 *  + Go through each survey question
 *   + Get the answer for each question from the rows
 *   + Append the answer to the result array
 *  + Return result  
 */
Answer.collect = function(survey, row) {
	var result = [];
	for (var i = 0; i < survey.questions.length; i++) {
		var answer = row[Config.columnLetterToNumber(survey.questions[i].col)];
		result.push(new Answer({
			question: survey.questions[i], 
			answer: answer
		}));
	}
	return result;
}
/**
 * @end
 */