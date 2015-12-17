/**
 * @start SURVEY
 */
/**
 * @name Survey
 * @description Survey Object
 * @todo 
 *  + Remove iseval from all surveys
 */
function Survey(survey, isXml){
	if (isXml){
		this.iseval = $(survey).attr('iseval') && $(survey).attr('iseval') == 'true';
		this.id = parseInt($(survey).attr('id'));
		if ($(survey).attr('week')){
			this.week = $(survey).attr('week');
		}
		this.placement = $(survey).attr('placement');
		this.email = $(survey).attr('email');
		this.name = $(survey).attr('name');
		if ($(survey).attr('course')){
			this.course = $(survey).attr('course');
		}
		this._xml = survey;
		this.questions = [];
		this._setXmlQuestions();
		this.people = [];
	} else {
		this.iseval = survey.iseval && survey.iseval == 'true';
		this.id = parseInt(survey.id);
		if (survey.week != undefined){
			this.week = survey.week;
		}
		this.placement = survey.placement;
		this.email = survey.email;
		this.name = survey.name;
		if (survey.course){
			this.course = survey.course;
		}
		this.questions = survey.questions;
		this._xml = this.toXml();
		this.people = [];
	}
	this.processed = 0;
}
/**
 * @name getPerson 
 * @description
 * @assign Chase
 * @todo 
 *  + Try the email to be sure its someones
 *  + Go through all the people and and return the one based on their email
 */
Survey.prototype.getPerson = function(email){
	try{
		email = Person.cleanEmail(email);
	}
	catch(e){
		console.log(email);
		throw e;
	}
	for (var i = 0; i < this.people.length; i++){
		if (this.people[i]._email == email) return this.people[i];
	}
	return false;
}
/**
 * @name _setXmlQuestions
 * @description Set the questions questions by passing in the question node from the XML
 * @assign Chase
 * @todo 
 *  + Go through each question in xml and add to the survey questions
 */
Survey.prototype._setXmlQuestions = function(){
	var _this = this;
	$(this._xml).find('question').each(function(){
		_this.questions.push(new Question(this, true));
	})
}
/**
 * @name getName 
 * @description
 * @assign Chase
 * @todo 
 *  + Return the name of the survey
 */
Survey.prototype.getName = function(){
	return this.name + ': Week ' + this.week;
}
/**
 * @name toXml
 * @description Use the objects member variables to create the survey node
 * @assign Chase
 * @todo 
 *  + Create the base survey xml
 *  + Add the id, placement, type, name, email
 *  + Add week and course if necessary
 *  + Return the xml survey
 */
Survey.prototype.toXml = function(){
	var survey = $('<survey><questions></questions></survey>');
	survey.attr('id', this.id)
		.attr('placement', this.placement)
		.attr('type', this.type)
		.attr('name', this.name)
		.attr('email', this.email)
		.attr('iseval', this.iseval);

	if (this.week){
		survey.attr('week', this.week);
	}
	if (this.course){
		survey.attr('course', this.course);
	}

	return survey;
}
/**
 * @name save
 * @description Create the xml from the given objects. Remove the survey from the config file. Add the newly created xml to the config file.
 * @assign Chase 
 * @todo
 *  + Convert the current survey to xml
 *  + Convert the questions to xml
 *  + Add questions to survey
 *  + Add survey to Config
 *  + Post config
 */
Survey.prototype.save = function(){
	var survey = this.toXml();
	
	for (var i = 0; i < this.questions.length; i++){
		var q = this.questions[i];
		var xml = q.toXml();
		$(survey).find('questions').append(xml);
	}

	var parent = $(this._xml).parent();
	if (parent.length != 0){ // modified survey
		this.remove();
		parent.append(survey);
	}
	else{ // registered survey
		$(window.config._xml).find('semester[code="' + window.config.getCurrentSemester() + '"] surveys').append(survey);
	}
	

	Sharepoint.postFile(window.config._xml, 'config/', 'config.xml', function(){
		alert('Survey change was successful!');
		window.location.reload();
	});
}
/**
 * @name remove
 * @description Remove the survey from the xml of the config
 * @assign Chase
 * @todo 
 *  + Remove the survey from the xml
 *  + Set the xml to null
 */
Survey.prototype.remove = function(){
	$(this._xml).remove();
	this._xml = null;
}
/**
 * @name modify
 * @description Modifiy a certain aspect of object, if save is necessary, its there.
 * @assign Chase
 * @todo 
 *  + Check that the value is not undefined
 *  + If the current property does not equal the value, reset the value with the new one
 */
Survey.prototype.modify = function(prop, value){
	if (value == undefined) return;

	if (this[prop] != value){
		this[prop] = value;
	}
}
/**
 * @name copy
 * @description Clone and rename survey to append (Copy) and increment the id
 * @assign Chase
 * @todo
 *  + Copy the survey
 *  + Include copy in the name
 *  + Change the id to the highest id plus 1
 *  + Return new survey
 */
Survey.prototype.copy = function(){
	var cloned = $(this._xml).clone();
	$(cloned).attr('name', $(cloned).attr('name') + ' (Copy)');
	$(cloned).attr('id', window.config.getHighestSurveyId() + 1);
	return new Survey(cloned, true);
}
/**
 * @name process
 * @description Collects the questions, people, and the peoples answers
 * @assign Chase
 * @todo 
 *  + Go through each row and add people
 */
Survey.prototype.process = function(rows){
	// go through each row and add people
	var eCol = Config.columnLetterToNumber(this.email);
	var cCol = -1;
	if (this.course){
		cCol = Config.columnLetterToNumber(this.course);
	}
	var spot = 0;
	for (var i = 0; i < rows.length; i++){
		if (rows[i][2].match(/\./g) && rows[i][2].match(/\./g).length >= 2){
			spot = i;
			break;
		}
	}
	var i = spot;
	var _this = this;
	/**
	 * @name processItems 
	 * @description process all the survey data collected
	 * @assign Chase
	 * @todo 
	 *  + Clean answers and then add them to their respective individual
	 */
	function processItems(){
		if (i >= rows.length){
			window.rollup = new Rollup();
			window.rollup.update();
			for (var email in window.config.otherPeople){
				var person = window.config.otherPeople[email];
				if (person.isValid()){
					person.process();
					_this.processed++
				}
			}
			
			for (var j = 0; j < _this.people.length; j++){
				_this.people[j].save();
			}

			for (var email in window.config.otherPeople){
				window.config.otherPeople[email].save();
			}
			
			Sharepoint.postFile(window.rollup._xml, 'master/', 'rollup.xml', function(){});
			Sharepoint.postFile(window.config.getMaster(), 'master/', 'master.xml', function(){});
			
			setTimeout(function(){
				ims.loading.reset();
				alert('Completed | Please reload the page');
			}, 1200);
		} 
		// clean answers  and then add them to their respective individual
		if (i < rows.length && rows[i][eCol] != undefined){
			var person = null;
			try{
				person = window.config.getPerson(rows[i][eCol]);
			}
			catch (e){
				console.log(e);
				console.log('(Survey.prototype.process) ' + rows[i]);
				i++;
				processItems();
			}
			var again = false;
			var oldPlacement;
			if (!person){
				person = new Person({
					email: rows[i][eCol],
					row: rows[i],
					placement: _this.placement,
					answers: Answer.collect(_this, rows[i])
				}, false, true);
				oldPlacement = person._placement.toLowerCase();
			}
			else{
				person._answers = Answer.collect(_this, rows[i]);
				person._row = rows[i];
				again = true;
				oldPlacement = person._placement.toLowerCase();
				person._placement = _this.placement.toLowerCase();
			}
			if (cCol != -1){
				person.course = Survey.cleanCourse(rows[i][cCol]);
			}
			if (person.isValid()){
				if (!again) _this.people.push(person);
				person.process();
				_this.processed++;
				person._placement = oldPlacement.toLowerCase();
			}
			else{
				console.log('(Survey.prototype.process) Invalid person: ' + rows[i][eCol]);
			}
			i++;
			setTimeout(function(){
				ims.loading.set((i / rows.length) * 100);
				processItems();
			}, 10);
		}
		else if (rows[i] != undefined && rows[i][eCol] == undefined){
			i++;
			if (i == rows.length){
				ims.loading.set((i / rows.length) * 100);
				processItems();
			}
		}
	}

	processItems();
}
/**
 * @name cleanCourse 
 * @description
 * @assign Chase
 * @todo
 *  + Check if the string matches the course name form
 *   + If so, split and rejoin to ensure the proper spacing
 *  + Return trimmed string 
 */
Survey.cleanCourse = function(str){
	var found = str.match(/([a-zA-Z]{1,}[0-9]{3})/g);
	if (found && found.length > 0){
		str = str.split(/([a-zA-Z]{1,})/g).join(' ');
	}
	return str.trim().toUpperCase();
}
/**
 * @name getQuestionById
 * @description Get the question by Id
 * @assign Chase
 * @todo
 *  + Go through each question
 *   + Check if the id matches the question id passed in 
 *    + return question
 *  + Not found, return false
 */
Survey.prototype.getQuestionById = function(id){
	for (var i = 0; i < this.questions.length; i++){
		if (this.questions[i].id == id) return this.questions[i];
	}
	return false;
}
/**
 * @name hasAttrs
 * @description If the survey has the attributes of the parameter object
 * @assign Chase
 * @todo 
 *  + Get the passed in objects keys
 *  + Go through and check if the keys are the same as surveys attributes
 *  + Return a bool
 */
Survey.prototype.hasAttrs = function(obj){
	var keys = Object.keys(obj);
	for (var i = 0; i < keys.length; i++){
		if (this[keys[i]] != obj[keys[i]]) return false;
	}
	return true;
}
/**
 * @name updateQuestions 
 * @description
 * @assign Chase
 * @todo
 *  + Go through each question
 *   + As you go through the passed in questions check if they are the same
 *    + Assign the id of the old to the new
 *  + Re-id all the questions that dont have an id
 *  + Add these questions to the survey object
 */
Survey.prototype.updateQuestions = function(qs){
	for (var j = 0; j < this.questions.length; j++){
		for (var i = 0; i < qs.length; i++){
			if (Question.areSame(qs[i], this.questions[j])){
				qs[i]['id'] = this.questions[j].id;
			}
		}	
	}

	var questions = this.idQuestions(qs);
	this.questions = [];
	for (var i = 0; i < questions.length; i++){
		questions[i].col = Config.columnNumberToLetter(questions[i].col);
		this.questions.push(new Question(questions[i], false));
	}
}
/**
 * @name idQuestions 
 * @description
 * @assign Chase
 * @todo 
 *  + Go through each question and keep track of the ids
 *  + Add question ids for questions without id
 *  + Return the list of questions
 */
Survey.prototype.idQuestions = function(questions){
	var topId = 0;
	for (var i = 0; i < questions.length; i++){
		if (questions[i].id && questions[i].id > topId){
			topId = questions[i].id;
		}
	}

	for (var i = 0; i < questions.length; i++){
		if (questions[i].id == undefined){
			questions[i]['id'] = ++topId;
		}
	}

	return questions;
}
/**
 * @name getWeekNumber 
 * @description
 * @assign Chase
 * @todo 
 *  + All names have a colon, check the indexof ':'
 *  + It should be a number unless it is intro
 *  + Return intro or the number
 */
Survey.prototype.getWeekNumber = function(){
	if (this.name.indexOf(':') > -1){
		if (this.name.indexOf('Intro') > -1){
			return 'Intro';
		}
		else{
			var num = this.name.split(': Week ')[1];
			return parseInt(num);
		}
	}	
	return null;
}
/**
 * @name addQuestion 
 * @description
 * @assign Chase
 * @todo 
 *  + Make sure that the question is not already in the survey
 *  + If the question is not in the survey, add it
 */
Survey.prototype.addQuestion = function(q){
	var found = false;
	for (var i = 0; i < this.questions.length; i++){
		if (q.id == this.questions[i].id){
			found = true;
			break;
		}
	}
	if (!found){
		this.questions.push(q);
	}
}
/**
 * @name getHighestQuestionId 
 * @description Get the highest question id in the survey
 * @assign Chase
 * @todo 
 *  + Go through each question and retain the highest id
 *  + Return the highest id
 */
Survey.prototype.getHighestQuestionId = function(){
	var id = 0;
	$(this.questions).each(function(){
		if (id < this.id){
			id = this.id;
		}
	});
	return parseInt(id);
}
/**
 * @end
 */