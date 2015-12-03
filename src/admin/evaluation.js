// GROUP EVALUATIONS
/**
 * Evaluations
 * @param {Array} array all data necessary for evaluations
 */
function Evaluations(obj, file){
	this._evaluations = obj;
	this._file = file;
	this.people = {};
}

/**
 * Finds the location of answer, question, and display logic
 * @param  {Array} array contains the instructions for an evaluations data series
 * @return {Array}       new array containing the proper column locations (in nmeric form)
 */
Evaluations.prototype.getColumnLocations = function(array){
	var newArray = [];

	for (var i = 0; i < array.length; i++){
		newArray.push({
			col: Config.columnLetterToNumber(array[i].col),
			question: array[i].question,
			logic: array[i].logic
		});
	}

	return newArray;
}

/**
 * Removes html form a string 
 * @param  {String} str a string
 * @return {String}     new clean string
 */
Evaluations.prototype.cleanseString = function(str){
	if(str == undefined || str.length == 0) return str;

	if (str.indexOf('<span style="font-size:16px;">') != -1){
		str = str.replace('<span style="font-size:16px;">', '');
	}

	if (str.indexOf('<span style="font-family:arial,helvetica,sans-serif;">') != -1){
		str = str.replace('<span style="font-family:arial,helvetica,sans-serif;">', '');
	}

	if (str.indexOf('</span></span>') != -1){
		str = str.replace('</span></span>', '');
	}

	if (str.indexOf('<span style="color:#B22222;">') != -1){
		str = str.replace('<span style="color:#B22222;">', '');
	}

	if (str.indexOf('</span>') != -1){
		str = str.replace('</span>', '');
	}

	return str;
}

/**
 * @name Evaluations.setAnswers
 * @assign Grant
 * @todo
 *  + add evaluatee to Evaluations' people
 *   + add one to number of evaluators
 *  + go through the row for responses
 *   + get the question and answer
 *    + logic for value
 *    + logic for percentage
 *   + add response data for evaluatee
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
 * @todo
 *  + go through each person
 *   + go through each evaluation
 *    + check if the logic type is percentage (p)
 *    + perform percentage math
 *    + replace answer with new percentage 
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
 * @todo
 *  + add questions to the top of csv
 *  + go through each person
 *   + go through each question
 *    + add answer to string
 *    + encode all spaces, commas, new lines, and slashes
 *  + download string as csv
 */
Evaluations.prototype.sendToCSV = function(){
	var csv = "email,";

	/*ADD THE TITLES TO THE CSV*/
	for (var j = 0; j < this._evaluations.dataSeries.length; j++){
		csv += this._evaluations.dataSeries[j].question.replace(/( )|(,)/g, "%20") + ",";
	}

	csv += "%0A"; // NEW LINE

	/*ADD THE PEOPLE AND THEIR DATA TO THE CSV*/
	for (var person in this.people){
		csv += person + ",";
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
	a.download    = 'myFile.csv';

	document.body.appendChild(a);
	a.click();
}

/**
 * @assign Grant
 * @todo 
 *  + get the master
 *  + convert csv to array
 *  + go through each evaluation
 *   + get the email of evaluator
 *   + get evaluatee
 *   + collect evaluation results for evaluatee
 *  + calculate the percentage
 *  @description Collect the evaluation information from a CSV.
 */
Evaluations.prototype.parse = function(){
	_this = this;
	Sharepoint.getFile(ims.url.base + 'Master/master.xml', function(master){
		var csv = new CSV();
		csv.readFile(_this._file, function(csv){
			var rows = csv.data;
			var emailCol = Config.columnLetterToNumber(_this._evaluations.emailCol);
			var locations = _this.getColumnLocations(_this._evaluations.dataSeries);
			var questions = [];

			for (var i = 3; i < rows.length; i++){
				if (rows[i][emailCol] != undefined){
					var xPath = 'semester[code=FA15] > people > person > roles > role[type="' + _this._evaluations.eFor.toLowerCase() + '"]';
					var evaluator = rows[i][emailCol].split('@')[0];
					var evaluatee = null;
					if ($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]').length > 0){
						evaluatee = $(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]').parents('person').attr('email');
						_this.setAnswers(evaluatee, rows[i], locations);
					}
				}
			}

			_this.calculatePercentages();
			_this.sendToCSV();
		});
	});
};
// GROUP EVALUATIONS END