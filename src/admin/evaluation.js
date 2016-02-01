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
function Evaluations(obj, file) {
	this._evaluations = obj;
	this._file = file;
	this.people = {};
	this._sem = window.config.getCurrentSemester();
}

/**
 * @name  Evaluations.getColumnLocations
 * @assign Grant
 * @description Finds the location of answer, question, and display logic
 * @todo
 *  + loop through the different data series
 *   + convert the col letter to a number
 */
Evaluations.prototype.getColumnLocations = function() {
	var newArray = [];

	for (var i = 0; i < this._evaluations.dataSeries.length; i++) {
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
Evaluations.prototype.cleanseString = function(str) {
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
 *    + logic for combined percentage
 *    + logic for combined value
 *   + add response data for evaluatee
 *  + error handling
 */
Evaluations.prototype.setAnswers = function(evaluatee, row, locations) {
	if (this.people[evaluatee] == undefined) {
		this.people[evaluatee] = {
			count: 1
		};
	} else {
		this.people[evaluatee].count++;
	}

	for (var loc = 0; loc < locations.length; loc++) {
		var quest = locations[loc].question;
		var ans = row[locations[loc].col];
		if (locations[loc].logic == 'v' && ans != "") { /*VALUE*/
			if (this.people[evaluatee][quest] == undefined) {
				this.people[evaluatee][quest] = _this.cleanseString(ans);
			} else {
				this.people[evaluatee][quest] += '\\\\' + _this.cleanseString(ans);
			}
		} else if (locations[loc].logic == 'p') { /*PERCENTAGE*/
			if (this.people[evaluatee][quest] == undefined) {
				this.people[evaluatee][quest] = (ans != "" ? parseFloat(1) : parseFloat(0));
			} else {
				this.people[evaluatee][quest] += (ans != "" ? parseFloat(1) : parseFloat(0));
			}
		} else if (locations[loc].logic == 'cp') { /*COMBINED PERCENTAGE*/
			if (ans == "") ans = "None";
			if (this.people[evaluatee][quest] == undefined) {
				this.people[evaluatee][quest] = {};
				this.people[evaluatee][quest][ans] = 1;
			} else {
				if (this.people[evaluatee][quest][ans] == undefined) {
					this.people[evaluatee][quest][ans] = 1;
				} else {
					this.people[evaluatee][quest][ans]++;
				}
			}
		} else if (locations[loc].logic == 'cv') { /*COMBINED VALUE*/
			if (this.people[evaluatee][quest] == undefined) {
				this.people[evaluatee][quest] = _this.cleanseString(ans.split(':')[0] + ': ' + row[locations[loc].col + 1]);
			} else {
				this.people[evaluatee][quest] += '\\\\' + _this.cleanseString(ans.split(':')[0] + ': ' + row[locations[loc].col + 1]);
			}
		} else if (locations[loc].logic == 'ccp') {
			
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
Evaluations.prototype.calculatePercentages = function() {
	for (var person in this.people) {  
		for (var j = 0; j < this._evaluations.dataSeries.length; j++) {
			var eval = this._evaluations.dataSeries[j];
			if (eval.logic == 'p') {
				this.people[person][eval.question] = (this.people[person][eval.question] * 100 / this.people[person].count).toPrecision(3) + '%';
			} else if (eval.logic == 'cp') {
				var sets = this.people[person][eval.question];
				for (var set in sets) {
					this.people[person][eval.question][set] = (this.people[person][eval.question][set] * 100 / this.people[person].count).toPrecision(3) + '%';
				}
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
Evaluations.prototype.sendToCSV = function() {
	var csv = "###,###,###,email,";

	/*ADD THE TITLES TO THE CSV*/
	for (var j = 0; j < this._evaluations.dataSeries.length; j++) {
		csv += this._evaluations.dataSeries[j].question.replace(/( )|(,)/g, "%20").replace(/’/g, "%27") + ",";
	}

	csv += "%0A"; // NEW LINE

	/*ADD THE PEOPLE AND THEIR DATA TO THE CSV*/
	for (var person in this.people) {
		csv += "###,###,100.100.100," + person + ",";
		for (var q in this.people[person]) {
			if (q != 'count') {
				if (typeof this.people[person][q] == "object") {
					var first = true;
					for (var set in this.people[person][q]) {
						csv += (!first ? "\\\\" : "") + set.replace(/ /g, "%20");
						csv += ":%20" + this.people[person][q][set];
						first = false;
					}
					csv += ",";
				} else if (isNaN(this.people[person][q])) {
					csv += this.people[person][q].replace(/( )|(\/\/\/)|(,)/g, "%20").replace(/’/g, "%27") + ",";
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
 * @name isByGreaterThanFor 
 * @description Checks if the role doing the evaluation is at a higher role than the one receiving the evaluation
 * @assign Grant
 * @todo
 *  + Get each role by value
 *  + Compare the roles to see if by role is greater than for role
 */
Evaluations.prototype.isByGreaterThanFor = function() {
	var vFor = this.roleAsValue(this._evaluations.eFor.toLowerCase());
	var vBy = this.roleAsValue(this._evaluations.eBy.toLowerCase());

	if (vBy > vFor) {
		return true;
	} else {
		return false;
	}
}

/**
 * @name roleAsValue 
 * @description
 * @assign Grant
 * @todo
 *  + switch statement for each role and return a value based on the role
 */
Evaluations.prototype.roleAsValue = function(role){
	switch (role) {
		case "instructor": return 1;
		case "tgl": return 2;
		case "aim": return 3;
		case "im": return 4;
		case "ocr": return 2;
		case "ocrm": return 3;
	}
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
Evaluations.prototype.parse = function() {
	var properEval = this.isByGreaterThanFor()
	_this = this;
	Sharepoint.getFile(ims.url.base + 'Master/master.xml', function(master) {
		var csv = new CSV();
		csv.readFile(_this._file, function(csv) {
			var rows = csv.data;
			var emailCol = Config.columnLetterToNumber(_this._evaluations.emailCol);
			var locations = _this.getColumnLocations();
			var questions = [];

			if (rows.length < 3) {
				alert('CSV does not have the right number of rows');
				throw 'CSV does not have the right number of rows';
			}

			var start = 0;
			for (var i = 0; i < rows.length; i++) {
				if (rows[i][2].match(/\./g) && rows[i][2].match(/\./g).length >= 2) {
					start = i;
					break;
				}
			}

			if (start == 0) {
				alert('CSV must be wrong or in an unfamiliar format');
				throw 'CSV must be wrong or in an unfamiliar format';
			}

			for (var i = start; i < rows.length; i++) {
				if (rows[i][emailCol] != undefined) {
					var xPath = 'semester[code=' + _this._sem +'] > people > person > roles > role[type=' + _this._evaluations.eFor.toLowerCase() + ']';
					var evaluator = rows[i][emailCol].split('@')[0];
					if (properEval) {
						_this.setAnswers(evaluator, rows[i], locations);
					} else {
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
							if (evaluatee != null) {
								_this.setAnswers(evaluatee, rows[i], locations);
							}
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