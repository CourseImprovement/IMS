// GROUP CONFIG
function Config(){
	console.log('new Config object was created');
	this._xml = this._getConfigXml();
}

Config.prototype.getXml = function(){
	console.log('return the config xml');
	return this._xml;
}

/**
 * RETURNS ARRAY OF ALL THE SURVEYS FROM THE CONFIG FILE
 */
Config.prototype.getSurveys = function(){
	var surveys = []; 
	$(this._xml).find('semester[code=FA15] survey').each(function(){
		surveys.push({
			name: $(this).attr('name'),
			id: $(this).attr('id'),
			xml: $(this)[0]
		});
	});
	return surveys;
	console.log('getting all the surveys');
}

/**
 * GETS THE CONFIG XML FILE FROM SHAREPOINT
 */
Config.prototype._getConfigXml = function(){
	var notEnd = true;
	Sharepoint.getFile(ims.url.base + 'config/config.xml', function(data){
		this.config._xml = $(data)[0];
	});
	console.log('get the config file xml');
}

/**
 * REMOVES A SPECIFIED SURVEY FROM THE CONFIG FILE
 * @param  {String} surveyId id of the survey to remove
 */
Config.prototype.surveyRemove = function(surveyId){
	console.log('removing a survey from the config');

	$(this._xml).find('semester[code=FA15] surveys survey[id="' + surveyId + '"]').remove();

	Sharepoint.postFile(this._xml, 'config/', 'config.xml', function(){
		alert('Survey removal was successful!')
	});
}

/**
 * COPYS A SURVEY FROM THE CONFIG FILE
 * @param  {String} survey id of the survey to copy
 */
Config.prototype.surveyCopy = function(surveyId){
	console.log('copying a survey from the config');

	var surveysNode = $(this._xml).find('semester[code=FA15] surveys');
	var surveys = $(this._xml).find('semester[code=FA15] surveys survey');
	var id = parseInt($(surveys[surveys.length - 1]).attr('id')) + 1;
	var survey = $(this._xml).find('semester[code=FA15] surveys survey[id="' + surveyId + '"]').clone();
	
	survey.attr('name', survey.attr('name') + ' (Copy)');
	survey.attr('id', id);

	$(surveysNode).append(survey);

	Sharepoint.postFile(this._xml, 'config/', 'config.xml', function(){
		alert('Survey copy was successful!');
	});
}

/**
 * [surveyRegister description]
 * @param  {[type]} name      [description]
 * @param  {[type]} emailCol  [description]
 * @param  {[type]} weekCol   [description]
 * @param  {[type]} typeCol   [description]
 * @param  {[type]} placement [description]
 * @param  {[type]} courseCol [description]
 * @param  {[type]} questions [description]
 */
Config.prototype.surveyRegister = function(name, emailCol, weekCol, typeCol, placement, courseCol, questions){
	console.log('registering a survey in the config');
	var surveys = $(this._xml).find('semester[code=FA15] surveys');
	var id = this._highestId(surveys);
	surveys.append('<survey email="' + emailCol + '" id="' + (id + 1) + '" name="' + name + '" placement="' + placement + '" type="' + typeCol + '" week="' + weekCol + '" course="' + courseCol + '"><questions></questions></survey>');
	var survey = $(surveys).find('survey[id=' + (id + 1) + '] questions');

	if (weekCol != undefined){
		survey.attr('week', weekCol);
	}

	if (courseCol != undefined){
		survey.attr('course', courseCol);
	}

	for (var i = 0; i < questions.length; i++){
		survey.append('<question col="' + questions[i].row + 
							'" id="' + (i + 1) + '" repeat="false"><text wrap="false">' + Config._cleanXml(questions[i].text) + 
							'</text><answer><if value=""></if><then bg="" color=""></then><replace what="' + Config._cleanXml(questions[i].what) + 
							'" with="' + Config._cleanXml(questions[i].awith) + '"></replace></answer></question>');
	}

	Sharepoint.postFile(this._xml, 'config/', 'config.xml', function(){
		alert('survey registered!');
	});
}

/**
 * returns the highest id of all the surveys
 * @param  {[type]} surveys [description]
 * @return {[type]}         [description]
 */
Config.prototype._highestId = function(surveys) {
	var id = 0;
	$(surveys).find('survey').each(function(){
		if (id < parseInt($(this).attr('id'))){
			id = parseInt($(this).attr('id'));
		}
	});
	return id;
}

/**
 * MODIFYS AN EXISTING SURVEY
 * @param  {String} name      The name of the survey
 * @param  {String} emailCol  column that contains the email
 * @param  {String} weekCol   column that contains the week
 * @param  {String} typeCol   column that contains the type
 * @param  {String} placement column that contains the placement
 * @param  {[type]} questions 
 * @param  {String} surveyId  id of the survey to be modified
 */
Config.prototype.surveyModify = function(name, emailCol, weekCol, typeCol, placement, courseCol, questions, surveyId){
	console.log('modifying a survey in the config');
	var survey = $(this._xml).find('semester[code=FA15] surveys survey[id="' + surveyId + '"]');
	survey.attr('name', name);
	if (survey.attr('week') != undefined){
		survey.attr('week', emailCol);
	}
	survey.attr('email', weekCol);
	survey.attr('type', typeCol);
	survey.attr('placement', placement);
	if (survey.attr('course') != undefined){
		survey.attr('course', courseCol);
	}

	$(survey).find('question').remove();
	for (var i = 0; i < questions.length; i++){
		var col = null;
		if (!isNaN(questions[i].row)){
			col = Config.toCol(questions[i].row);
		}
		else{
			col = questions[i].row;
		}

		$(survey).find('questions').append('<question id="tmp" repeat="false"><text>' + questions[i].text + '</text><answer><if value=""></if><then bg="" color=""></then><replace with="" what=""></replace></answer></question>');
		var q = $(survey).find('question[id=tmp]').attr('col', col).attr('id', i + 1);
		if (questions[i].awith != ""){
			$(q).find('answer replace').attr('with', Config._cleanXml(questions[i].awith)).attr('what', Config._cleanXml(questions[i].what));
		}
	}

	Sharepoint.postFile(this._xml, 'config/', 'config.xml', function(){
		alert('survey modified!');
	});
}

/**
 * PROCESS THE SURVEY DATA TO INDIVIDUAL XML FILES
 * @param  {String} survey id of the survey that will be processed
 * @param  {Array} rows 2D array that contains all the csv data
 */
Config.prototype.surveyProcessing = function(surveyId, rows){
	var cols = this._getSurveyColumns(surveyId);
	var hasCourse = (col.course == undefined ? false : true);
	var people = {};

	for (var i = 3; i < rows.length; i++){
		if (rows[i][cols.email] != undefined){
			var email = rows[i][cols.email].split('@')[0];
			if (people[email] == undefined){
				people[email] = {};
			}
			if (hasCourse){
				var course = rows[i][cols.course];
				people[email][course] = {};
				for (var col in cols.questions){
					people[email][course][cols.questions[col].id] = rows[i][col];
				}
			}
			else{
				for (var col in cols.questions){
					people[email][cols.questions[col].id] = rows[i][col];
				}
			}
			
		}
	}

	people = this._answerReplace(people, cols, hasCourse);
	this._uploadSurvey(people, cols, hasCourse);
}

/**
 * Replaces all the answers for the people to the proper answers
 * @param  {Object}  people    object of all the people with their answers
 * @param  {Object}  cols      object of the survey data
 * @param  {Boolean} hasCourse does the survey use a course column
 * @return {Object}            people object with the answers replaced as needed
 */
Config.prototype._answerReplace = function(people, cols, hasCourse){
	for (var col in cols.questions){
		if (cols.questions[col].replace.what != ""){
			var these = cols.questions[col].replace.what.split(';');
			var those = cols.questions[col].replace.with.split(';');
			for (var person in people){
				var id = cols.questions[col].id;
				if (hasCourse){
					for (var course in people[person]){
						for (var i = 0; i < these.length; i++){
							people[person][course][id] = people[person][course][id].replace(these[i], those[i]);
						}
					}
				}
				else{
					for (var i = 0; i < these.length; i++){
						people[person][id] = people[person][id].replace(these[i], those[i]);
					}
				}
			}
		}
	}

	return people;
}

/**
 * [leaderLevel description]
 * @param  {[type]} p [description]
 * @return {[type]}   [description]
 */
Config.leaderLevel = function(p){
	var level = "";

	if (p == 'instructor')
		level = 'tgl';
	else if (p == 'tgl')
		level = 'aim';
	else if (p == 'aim')
		level = 'im';

	return level;
}

/**
 * UPDATE AND UPLOAD XML FILES WITH SPECIFIC DATA
 * @param  {Object} people object containing all the people with their courses and their responses
 * @param  {Object} cols   contains information concerning the survey being processed
 */
Config.prototype._uploadSurvey = function(people, cols, hasCourse){
	Sharepoint.total = Object.keys(people).length;
	for (var person in people){
		Sharepoint.getFile(ims.url.base + 'master/' + person.split('@')[0] + '.xml', function(data){
			var email = $(data).find('semester[code=FA15] > people > person').attr('email');
			var placement = cols.placement.toLowerCase();
			var level = Config.leaderLevel(placement);
			var leader = $(data).find('semester[code=FA15] > people > person > roles > role[type="'  + placement + '"] > leadership > person[type=' + level + '"]').attr('email');
			var surveys = $(data).find('semester[code=FA15] > people > person > roles > role[type="' + placement + '"] > surveys');
			var survey = null;
			if (hasCourse){
				for (var course in people[email]){
					var cId = $(data).find('semester[code=FA15] > people > person > courses > course:contains(' + course + ')').attr('id');
					if ($(surveys).find('> survey[id="' + cols.id + '"][courseid="' + cId + '"]').length != 0){
						$(surveys).find('> survey[id="' + cols.id + '"][courseid="' + cId + '"]').remove();
					}
					$(surveys).append('<survey id="' + cols.id + '" reviewed="false" courseid="' + cId + '"></survey>');
					for (var id in people[email][course]){
						$(surveys).find('> survey[id="' + cols.id + '"][courseid="' + cId + '"]').append('<answer id="' + id + '">' + Config._cleanXml(people[email][course][id]) + '</answer>');
					}
				}
				survey = $(surveys).find('> survey[id="' + cols.id + '"]').clone();
			}
			else{
				if ($(surveys).find('> survey[id="' + cols.id + '"]').length != 0){
					$(surveys).find('> survey[id="' + cols.id + '"]').remove();
				}
				$(surveys).append('<survey id="' + cols.id + '" reviewed="false"></survey>');
				for (var id in people[email]){
					$(surveys).find('> survey[id="' + cols.id + '"]').append('<answer id="' + id + '">' + Config._cleanXml(people[email][id]) + '</answer>');
				}
				survey = $(surveys).find('> survey[id="' + cols.id + '"]').clone();
			}
			Sharepoint.getFile(ims.url.base + 'master/' + leader + '.xml', function(data){
				$(data).find('semester[code=FA15] > people > person > roles > role[type="' + level + '"] > stewardship > people > person[email="' + email + '"] > roles > role[type="' + placement + '"] surveys').append(survey);
				Sharepoint.postFile(data, 'master/', leader + '.xml', function(){});
			});
			Sharepoint.postFile(data, 'master/', email + '.xml', function(){
				if (Sharepoint.current == Sharepoint.total){
					setTimeout(function(){
						ims.loading.reset(); 
					}, 1000);
				}
			});
		});
	}
}

Config._cleanXml = function(str){
	if (str == undefined) return "";
	return str.replace(/&/g, '&amp;')
       		  .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
} 

/**
 * FINDS A SURVEY AND COLLECTS ALL PERTINENT INFORMATION ABOUT IT
 * @param  {String} surveyId the id for the current survey
 * @return {Object}          contains information for the current survey
 */
Config.prototype._getSurveyColumns = function(surveyId){
	var survey = $(this._xml).find('semester[code=FA15] > surveys > survey[id="' + surveyId + '"]');
	var columns = {
		id: surveyId,
		email: Config.getCol(survey.attr('email')),
		placement: survey.attr('placement'),
		type: Config.getCol(survey.attr('type')),
		name: survey.attr('name'),
		questions: {}
	};

	if ((survey.attr('week') != undefined){
		columns['week'] = Config.getCol(survey.attr('week'));
	}
	if ((survey.attr('course') != undefined){
		columns['course'] = Config.getCol(survey.attr('course'));
	}
	
	

	$(survey).find('questions question').each(function(){
		columns.questions[Config.getCol($(this).attr('col'))] = {
			question: $(this).find('text').text(),
			id: $(this).attr('id'),
			replace: {
				what: $(this).find('answer replace').attr('what'),
				with: $(this).find('answer replace').attr('with')
			}
		};
	});

	return columns;
}

/**
 * [getSurveyIdByName description]
 * @param  {[type]} survey [description]
 * @return {[type]}        [description]
 */
Config.prototype.getSurveyIdByName = function(survey){
	console.log('returning a survey Id');
}

/**
 * CONVERTS A LETTER TO THE NUMERICAL EQUIVALENT
 * @param  {String} letter  Character that maps to a column
 * @return {Integer}        the numerical column
 */
Config.getCol = function(letter){
	console.log('returning the numeric col from the letter');
	if(!isNaN(letter)) return letter;

	if (letter.length == 1){
		return letter.charCodeAt(0) - 65;
	}
	else{
		if (letter[1] == 'A') return 26;
		return (letter.charCodeAt(1) - 65) + 25;
	}
}
/**
 * CONVERTS A NUMBER TO THE COLUMN LETTER
 * @param  {String} letter  Character that maps to a column
 * @return {Integer}        the numerical column
 */
Config.toCol = function(num){
	console.log('returning the letter col from the number');
	if (num < 26){
		return String.fromCharCode(num + 65);
	}
	else{
		return "A" + String.fromCharCode((num - 26) + 65);
	}
}
// GROUP CONFIG END



window.config = new Config();