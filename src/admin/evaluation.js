/**
 * @start evaluations
 */
/**
 * @name  Evaluations
 * @assign Grant
 * @description object used to assign data from the evaluator to the evaluatee
 * @todo
 *  + set the evaluations object
 *  + set the csv file location
 */
function Evaluations(obj, file){
	this._evaluations = obj;
	this._file = file;
	this.people = {};
}

/**
 * @name  Evaluations.getColumnLocations
 * @assign Grant
 * @description Finds the location of answer, question, and display logic
 * @todo
 *  + loop through the different data series
 *   + convert the col letter to a number
 */
Evaluations.prototype.getColumnLocations = function(){
	var newArray = [];

	for (var i = 0; i < this._evaluations.dataSeries.length; i++){
		newArray.push({
			col: Config.columnLetterToNumber(this._evaluations.dataSeries[i].col),
			question: this._evaluations.dataSeries[i].question,
			logic: this._evaluations.dataSeries[i].logic
		});
	}

	return newArray;
}

/**
 * @name  Evaluations.cleanseString
 * @assign Grant
 * @description
 * @todo
 *  + check that the string is not null or empty
 *  + replace unwanted html
 *  + error handling
 */
Evaluations.prototype.cleanseString = function(str){
	if(str == undefined || str.length == 0) return str;
	return str.replace(/<[^>]*>/g, '');
}

/**
 * @name Evaluations.setAnswers
 * @assign Grant
 * @description
 * @todo
 *  + add evaluatee to Evaluations' people
 *   + add one to number of evaluators
 *  + go through the row for responses
 *   + get the question and answer
 *    + logic for value
 *    + logic for percentage
 *   + add response data for evaluatee
 *  + error handling
 */
Evaluations.prototype.setAnswers = function(evaluatee, row, locations){
	if (this.people[evaluatee] == undefined){
		this.people[evaluatee] = {
			count: 1
		};
	} else {
		this.people[evaluatee].count++;
	}

	for (var loc = 0; loc < locations.length; loc++){
		var quest = locations[loc].question;
		var ans = row[locations[loc].col];
		if (locations[loc].logic == 'v' && ans != ""){ /*VALUE*/
			if (this.people[evaluatee][quest] == undefined){
				this.people[evaluatee][quest] = _this.cleanseString(ans);
			} else{
				this.people[evaluatee][quest] += ' ' + _this.cleanseString(ans);
			}
		} else if (locations[loc].logic == 'p'){ /*PERCENTAGE*/
			if (this.people[evaluatee][quest] == undefined){
				this.people[evaluatee][quest] = (ans != "" ? parseFloat(1) : parseFloat(0));
			} else{
				this.people[evaluatee][quest] += (ans != "" ? parseFloat(1) : parseFloat(0));
			}
		}
	}
}

/**
 * @name Evaluations.calculatePercentages
 * @assign Grant
 * @description
 * @todo
 *  + go through each person
 *   + go through each evaluation
 *    + check if the logic type is percentage (p)
 *    + perform percentage math
 *    + replace answer with new percentage 
 *  + error handling
 */
Evaluations.prototype.calculatePercentages = function(){
	for (var person in this.people){
		for (var j = 0; j < this._evaluations.dataSeries.length; j++){
			var eval = this._evaluations.dataSeries[j];
			if (eval.logic == 'p'){
				this.people[person][eval.question] = (this.people[person][eval.question] * 100 / this.people[person].count).toPrecision(3) + '%';
			}
		}
	}
}

/**
 * @name Evaluations.sendToCSV
 * @assign Grant
 * @description
 * @todo
 *  + add questions to the top of csv
 *  + go through each person
 *   + go through each question
 *    + add answer to string
 *    + encode all spaces, commas, new lines, and slashes
 *  + download string as csv
 *  + error handling
 */
Evaluations.prototype.sendToCSV = function(){
	var csv = "###,###,###,email,";

	/*ADD THE TITLES TO THE CSV*/
	for (var j = 0; j < this._evaluations.dataSeries.length; j++){
		csv += this._evaluations.dataSeries[j].question.replace(/( )|(,)/g, "%20") + ",";
	}

	csv += "%0A"; // NEW LINE

	/*ADD THE PEOPLE AND THEIR DATA TO THE CSV*/
	for (var person in this.people){
		csv += "###,###,100.100.100," + person + ",";
		for (var q in this.people[person]){
			if (q != 'count'){
				if (isNaN(this.people[person][q])){
					csv += this.people[person][q].replace(/( )|(\/\/\/)|(,)/g, "%20") + ",";
				} else {
					csv += this.people[person][q] + ",";
				}
			}
		}
		csv += "%0A";
	}

	/*SAVE THE NEWLY CREATED STRING AS A CSV FILE*/
	var a         = document.createElement('a');
	a.href        = 'data:attachment/csv,' + csv;
	a.target      = '_blank';
	a.download    = 'Evaluation.csv';

	document.body.appendChild(a);
	a.click();
}

/**
 * @name  Evaluations.parse
 * @assign Grant
 * @description Collect the evaluation information from a CSV.
 * @todo 
 *  + get the master
 *  + convert csv to array
 *  + go through each evaluation
 *   + get the email of evaluator
 *   + get evaluatee
 *   + collect evaluation results for evaluatee
 *  + calculate the percentage
 *  + error handling
 */
Evaluations.prototype.parse = function(){
	_this = this;
	Sharepoint.getFile(ims.url.base + 'Master/master.xml', function(master){
		var csv = new CSV();
		csv.readFile(_this._file, function(csv){
			var rows = csv.data;
			var emailCol = Config.columnLetterToNumber(_this._evaluations.emailCol);
			var locations = _this.getColumnLocations();
			var questions = [];

			if (rows.length < 3) throw 'CSV does not have the right number of rows';

			for (var i = 3; i < rows.length; i++){
				if (rows[i][emailCol] != undefined) {
					var xPath = 'semester[code=FA15] > people > person > roles > role[type="' + _this._evaluations.eFor.toLowerCase() + '"]';
					var evaluator = rows[i][emailCol].split('@')[0];
					var evaluatee = null;
					if ($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]').length > 0) {
						if ($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]').length > 1) {
							if (evaluator == $($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]')[0]).parents('person').attr('email')) {
								evaluatee = $($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]')[1]).parents('person').attr('email');
							} else {
								evaluatee = $($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]')[0]).parents('person').attr('email');
							}
						} else {
							evaluatee = $(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]').parents('person').attr('email');
						}
						if (evaluatee != null){
							_this.setAnswers(evaluatee, rows[i], locations);
						}
					}
				}
			}

			_this.calculatePercentages();
			_this.sendToCSV();
		});
	});
};
/**
 * @end
 */