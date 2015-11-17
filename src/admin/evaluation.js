


// GROUP EVALUATIONS
/**
 * Evaluations
 * @param {Array} array all data necessary for evaluations
 */
function Evaluations(array, file){
	this._evaluations = array;
	this._file = file;
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
 * Searches for an email in the email column, returns the index
 * @param  {String} email    email to be found
 * @param  {Array} rows     contains the entire csv seperated by rows in an array
 * @param  {Integer} emailCol index of the email col
 * @return {Integer}          index of the email
 */
Evaluations.prototype.getRowIndex = function(email, rows, emailCol){
	for (var i = 0; i < rows.length; i++){
		if (rows[i][emailCol] != undefined && rows[i][emailCol].split('@')[0] == email){
			return i;
		}
	}

	return null;
}

/**
 * Converts the evaluaiton data into csv form and saves it to your computer
 * @param  {Object} obj contains all the evaluation data
 * @param  {Array} top contains all the titles for the top of the csv
 */
Evaluations.prototype.sendToCSV = function(obj, top){
	var csv = "";
	/*ADD THE TITLES TO THE CSV*/
	for (var j = 0; j < top.length; j++){
		csv += top[j].replace(/( )|(,)/g, "%20") + ",";
	}
	csv += "%0A";
	/*ADD THE PEOPLE AND THEIR DATA TO THE CSV*/
	var people = Object.keys(obj);
	for (var i = 0; i < people.length; i++){
		var evals = obj[people[i]];
		if (evals.length != 0){
			csv += people[i] + ",";
			for (var j = 0; j < evals.length; j++){
				var answer = null;
				if (isNaN(evals[j].a)){
					if (evals[j].a != undefined){
						answer = evals[j].a.replace(/( )|(\/\/\/)|(,)/g, "%20");
						answer = answer.replace(/(\\\\)/g, "");
					}
					else{
						answer = "";
					}
				}
				else{
					answer = evals[j].a.toPrecision(4);
				}
				csv += answer + ",";
			} 
			csv += "%0A";
		}
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
 * Looks for th elocation of the question in an array of questions and answers
 * @param  {String} q     question text
 * @param  {Array} qAnda array containing all questions and answers
 * @return {Integer}       index of the question location, or -1 if not there
 */
Evaluations.prototype.qIndex = function(q, qAnda){
	if (qAnda.length == 0) return -1;

	for (var i = 0; i < qAnda.length; i++){
		if (q == qAnda[i].q){
			return i;
		}
	}

	return -1;
}

/**
 * Creates an object from the csv, with the people getting evaluated and what their underlings said 
 * @return {Object} people object containing all the Evaluation data
 */
Evaluations.prototype.parseCSV = function(){
	_this = this;
	Sharepoint.getFile(ims.url.base + 'master/map.xml', function(mapXml){
		var csv = new CSV();
		csv.readFile(_this._file, function(csv){
			var count = {};
			var people = {};
			var numEvals = _this._evaluations.length;
			/*LOOP THROUGH EACH GROUP BEING EVALUATED E.G. OCR, TGL, AIM*/
			for (var e = 0; e < numEvals; e++){
				var evaluatees = $(mapXml).find('semester[code=FA15] ' + _this._evaluations[e].fRole.toLowerCase());
				var emailCol = Config.columnLetterToNumber(_this._evaluations[e].emailCol);
				var locations = _this.getColumnLocations(_this._evaluations[e].dataSeries);
				var rows = csv.data;
				/*COLLECT THE ROLES FROM THE MAP FILE*/
				for (var s = 0; s < evaluatees.length; s++){
					var sEmail = $(evaluatees[s]).attr('email');
					count[sEmail] = 0;
					people[sEmail] = [];
					var lowers = $(evaluatees[s]).children();
					/*COLLECT ALL THE UNDERLINGS FROM THE MAIN ROLE*/
					for (var l = 0; l < lowers.length; l++){
						var lEmail = $(lowers[l]).attr('email');
						if (lEmail != sEmail){
							var row = _this.getRowIndex(lEmail, rows, emailCol);
							/*MAKE SURE THE EVALUATOR EXISTS*/
							if (row != null){
								count[sEmail]++;
								for (var loc = 0; loc < locations.length; loc++){
									var quest = locations[loc].question;
									var ans = rows[row][locations[loc].col];
									var index = _this.qIndex(quest, people[sEmail]);
									/*PORTRAY THE DATA BY THE GIVEN VALUE*/
									if (locations[loc].logic == 'v'){
										if (index == -1){
											people[sEmail].push({
												q: quest,
												a: _this.cleanseString(ans)
											});
										}
										else{
											people[sEmail][index].a += (ans != "" ? '///' : "") + _this.cleanseString(ans);
										}
									}		
									/*PORTAY THE DATA BY THE PERCENTAGE DONE*/
									else if (locations[loc].logic == 'p'){
										if (index == -1){
											if (ans != "")
												ans = parseFloat(1);
											else
												ans = parseFloat(0);

											people[sEmail].push({
												q: quest,
												a: ans
											});
										}
										else{
											if (ans != "")
												people[sEmail][index].a += parseFloat(1);
											else
												people[sEmail][index].a += parseFloat(0);
										}
									}
								}
							}
						}
					}
				}
			}
			/*PERFORM THE PERCENTAGE AND COLLECT THE QUESTIONS*/
			var top = ['email'];
			var done = false;
			for (var person in people){
				for (var i = 0; i < people[person].length; i++){
					if (!isNaN(people[person][i].a)){
						people[person][i].a = people[person][i].a * 100 / count[person];
					}

					if (!done && people[person][i].q != undefined){
						top.push(people[person][i].q);
					}
				}
				done = true;
			}

			_this.sendToCSV(people, top);
		});
	});
}
// GROUP EVALUATIONS END