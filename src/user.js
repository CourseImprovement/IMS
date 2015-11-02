window._currentUser = null;
window._userXml = {};

function User(obj){
	if (!obj) throw "Invalid User Object";

	if (obj['email']){
		this._email = obj['email'];
		if (_userXml[this._email]){
			this._xml = _userXml[this._email]
		}
		else{
			this._xml = ims.sharepoint.getXmlByEmail(this._email);
			_userXml[this._email] = this._xml;
		}

		this._first = null;
		this._last = null;
		this._setPersonalInfo();
		this._courses = [];
		this._setCourses();
		this._surveys = [];
		this._setSurveys();
		this._semesters = [];
		this._isCurrent = obj.current == true;
		this._new = false;

	}
	if (obj['xml']){
		this._xml = obj['xml'];
		this._first = null;
		this._last = null;
		this._setPersonalInfo(true);
		this._courses = [];
		this._surveys = [];
		this._semesters = [];
		this._isCurrent = obj.current == true;
		this._new = false;
	}
	if (this._isCurrent){
		this._role = new Role(ims.aes.value.cr, this);
	}
	else if (obj.role){
		this._role = new Role(obj.role, this);
	}
}

/**
 * The standard for instructor hours per credit
 * @type {Number}
 */
User.HoursStandard = 3.5;

/**
 * Get the current user (the current dashboard user)
 * @return {[type]} [description]
 */
User.getCurrent = function(){
	if (!window._currentUser){
		window._currentUser = new User({email: ims.aes.value.ce, current: true});
	}
	return window._currentUser;
}

User.redirectToLoggedInUser = function(err){
	ims.sharepoint.redirectToLoggedInUser(err, function(email){
		User.redirectToDashboard(email);
	});
}

/**
 * The inital search for person
 * @param  {[type]} email [description]
 * @return {[type]}       [description]
 */
User.redirectToDashboard = function(email){
	if (email.indexOf('@')) email = email.split('@')[0];
  var doc = ims.sharepoint.getXmlByEmail(email);
  if (doc == null) {
    redirectError();
  }
  var role = '';
  var sem = ims.semesters.getCurrentCode();
  var inst = $(doc).find('semester[code=' + sem + '] > instructor');
  var tgl = $(doc).find('semester[code=' + sem + '] > tgl');
  var aim = $(doc).find('semester[code=' + sem + '] > aim');
  if (inst.length > 0){
    role = 'INSTRUCTOR';
  }
  else if (tgl.length > 0){
    role = 'TGL';
  }
  else if (aim.length > 0){
    role = 'AIM';
  }

  var obj = {
    ce: email,
    cr: role,
    i: role,
    e: email
  };
  var aes = ims.aes.encrypt(JSON.stringify(obj), ims.aes.key.hexDecode());
  window.location.href = window.location.href.split('aspx')[0] + 'aspx?v=' + aes;
}

/**
 * Get the suggested list
 * @param  {[type]} q [description]
 * @return {[type]}   [description]
 */
User.prototype.getSuggested = function(q){
	return this._role.getSuggested(q);
}

/**
 * TODO:
 * 	call this._role.canSearch();
 * @return {[type]} [description]
 */
User.prototype.canSearch = function(){
	var roleName = this.getRole().getRoleName().toLowerCase();
	return roleName == 'aim' || roleName == 'im';
}

/**
 * TODO:
 * 	call this._role.isLeader();
 * @return {Boolean} [description]
 */
User.prototype.isLeader = function(){
	var r = this.getRole().getRoleName().toLowerCase();
	return r == 'aim' || r == 'tgl' || r == 'atgl' || r == 'im';
}

User.prototype.isCurrent = function(){
	if (ims.aes.value.e != ims.aes.value.ce) return false;
	return this._isCurrent;
}

/**
 * Internal function to populate the users surveys into the _surveys
 * array
 */
User.prototype._setSurveys = function(){
	var sem = ims.semesters.getCurrentCode(); 
	var _this = this;
	$(this._xml).find('semester[code=' + sem + '] survey').each(function(){
		_this._surveys.push(new Survey(this, _this));
	})
}

/**
 * Set the basic personal information
 */
User.prototype._setPersonalInfo = function(noSpot){
	var sem = ims.semesters.getCurrentCode();
	var spot;
	if (noSpot){
		spot = this._xml;
	}
	else{
		spot = $(this._xml).find('semester[code=' + sem + ']').children().first();
	}
	this._first = $(spot).attr('first');
	this._last = $(spot).attr('last');
	this._email = $(spot).attr('email');
	this._new = $(spot).attr('new') != 'False';
}

/**
 * Show the course menu for an instructor
 * @return {[type]} [description]
 */
User.prototype.showCourseMenu = function(){
	var role = this.getRole().getRoleName().toUpperCase();
	return role == 'INSTRUCTOR' && this.getCourses().length > 1;
}

/**
 * Returns the selected course if the user is an instructor
 * @return {[type]} [description]
 */
User.prototype.selectedCourse = function(){
	if (ims.params.c && !this._selectedCourse){
		var course = decodeURI(ims.params.c);
		this._selectedCourse = this.getCourse(course);
	}
	else{
		return ims.params.c ? this._selectedCourse : null;
	}
}

/**
 * Set the courses
 */
User.prototype._setCourses = function(){
	var _this = this;
	var sem = ims.semesters.getCurrentCode();
	$(this._xml).find('semester[code=' + sem + '] course').each(function(){
		_this._courses.push(new Course(this));
	})
}

/**
 * Get the first name of the user
 * @return {[type]} [description]
 */
User.prototype.getFirst = function(){
	if (this._first == null){
		var sem = ims.semesters.getCurrentCode(); 
		this._first = $(this._xml).find('semester[code=' + sem + ']').children().first().attr('first');
	}
	return this._first;
}

/**
 * Get the last name of the user
 * @return {[type]} [description]
 */
User.prototype.getLast = function(){
	if (this._last == null){
		var sem = ims.semesters.getCurrentCode(); 
		this._last = $(this._xml).find('semester[code=' + sem + ']').children().first().attr('last');
	}
	return this._last;
}

/**
 * Only used for instructors
 * @type {[type]}
 */
User.prototype.getLeader = function(){
	var sem = ims.semesters.getCurrentCode(); 
	return $(this._xml).find('semester[code=' + sem + ']').children().first().attr('tgl_email');
}

/**
 * Get the email of the user
 * @return {[type]} [description]
 */
User.prototype.getEmail = function(){
	return this._email;
}

/**
 * Get the email of the user including the @byui.edu
 * @return {[type]} [description]
 */
User.prototype.getFullEmail = function(){
	return this._email + '@byui.edu';
}

/**
 * Get the user answers by surveyId and questionId
 * @param  {[type]} sid [description]
 * @param  {[type]} qid [description]
 * @return {[type]}     [description]
 */
User.prototype.getAnswer = function(sid, qid){
	var sem = ims.semesters.getCurrentCode(); 
	return $(this._xml).find('semester[code=' + sem + '] survey[id=' + sid + '] answer[qid=' + qid + ']').text();
}

/**
 * Get the full name of the user with a space between the first
 * and last name, and a capital first letter of each name.
 * @return {[type]} [description]
 */
User.prototype.getFullName = function(){
	return this._first + ' ' + this._last;
}

/**
 * Get a specific survey from the user
 * @param  {[type]} sid [description]
 * @return {[type]}     [description]
 */
User.prototype.getSurvey = function(sid){
	var surveys = this.getSurveys();
	for (var i = 0; i < surveys.length; i++){
		if (surveys[i].id.toLowerCase() == sid.toLowerCase()) return surveys[i];
	}
}

/**
 * Save the xml to the server
 * @return {[type]} [description]
 */
User.prototype.save = function(){
	ims.sharepoint.postFile(this);
}

/**
 * Get an Array of the surveys
 * @return {[type]} [description]
 */
User.prototype.getSurveys = function(){
	return this._surveys;
}

/**
 * Get the survey by placement
 * @param  {[type]} placement [description]
 * @return {[type]}           [description]
 */
User.prototype.getSurveysByPlacement = function(placement){
	var surveys = [];
	for (var i = 0; i < this._surveys.lenth; i++){
		if (this._surveys[i].getPlacement().toLowerCase() == placement.toLowerCase()){
			surveys.push(this._surveys[i]);
		}
	}
	return surveys;
}

// GROUP: Roles
/**
 * Get the users role relative to the current user and their role
 * @return {[type]} [description]
 */
User.prototype.getRole = function(){
	return this._role;
}

/**
 * Get the role as with a hat
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
User.prototype.getRoleAs = function(type){
	return new Role(type, this);
}

/**
 * Validates if the instructor is a new instructor
 * or not.
 * @return {Boolean} [description]
 */
User.prototype.isNew = function(){
	return this._new;
}

/**
 * Get the href for the user
 * @return {[type]} [description]
 */
User.prototype.getHref = function(){
	if (this._email == 'davismel'){
		var a = 10;
	}
	var val = JSON.parse(JSON.stringify(ims.aes.value));
  val.ce = this.getEmail();
  val.cr = this.getRole().getRoleName();
  val.pe = val.e;
  val.pr = val.i;
  var str = JSON.stringify(val);
  var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
  var href = window.location.href;
  if (href.indexOf('v=') > -1){
  	return href.split('v=')[0] + 'v=' + en;
  }
  return;
}

/**
 * Returns an array of SMART goals if taken
 * @return {[type]} [description]
 */
User.prototype.getSmartGoals = function(){
	var weeklyReflections = this.getWeeklyReflections();
	var goals = [];
	for (var i = 0; i < weeklyReflections.length; i++){
		if (weeklyReflections[i].getName().toLowerCase().indexOf('week 2') > -1){
			goals = weeklyReflections[i].getQuestionsContainingText('smart');
		}
	}
	return goals;
}

/**
 * Get the target hours for this user.
 * @return {[type]} [description]
 */
User.prototype.getTargetHours = function(){
	var credits = this.getTotalCredits();
	if (credits == 1){
		return 1.5 * User.HoursStandard;
	}
	else if (credits == 2){
		return 2.25 * User.HoursStandard;
	}
	else if (credits >= 3){
		return credits * User.HoursStandard;
	}
	else{
		return 0;
	}
}

User.prototype.backButton = function(){
	return ims.aes.value.ce != ims.aes.value.e;
}

/**
 * Get the weekly hours averaged out by course
 * @return {[type]} [description]
 */
User.prototype.getHours = function(){
	var wr = this.getWeeklyReflections();
	var hours = [];
	var courses = this.getCourses();
	var hrsByCourse = {};
	var stub = courses[0].getName();
	var credits = this.getTotalCredits();
	for (var i = 0; i < courses.length; i++){
		hrsByCourse[courses[i].getName()] = [];
	}
	if (courses.length > 1){
		for (var i = 0; i < wr.length; i++){
			var hr = wr[i].getQuestionsContainingText("weekly hours");
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hrsByCourse[wr[i].getCourse()].push(val);
			}
			else{
				hrsByCourse[wr[i].getCourse()].push(0);
			}
		}
		for (var i = 0; i < hrsByCourse[stub].length; i++){
			var total = 0;
			for (var j = 0; j < courses.length; j++){
				total += hrsByCourse[courses[j].getName()][i];
			}
			if (credits == 1){
				hours.push(total / 1.5);
			}
			else if (credits == 2){
				hours.push(total / 2.25);
			}
			else if (credits >= 3){
				hours.push(total / credits);
			}
		}
	}
	else{
		for (var i = 0; i < wr.length; i++){
			var hr = wr[i].getQuestionsContainingText("weekly hours");
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				if (credits == 1){
					hours.push(val / 1.5);
				}
				else if (credits == 2){
					hours.push(val / 2.25);
				}
				else if (credits >= 3){
					hours.push(val / credits);
				}
			}
			else{
				hours.push(0);
			}
		}
	}
	return hours;
}

/**
 * Get the weekly hours averaged out by course
 * @return {[type]} [description]
 */
User.prototype.getHoursRaw = function(){
	var wr = this.getWeeklyReflections();
	var hours = [];
	var courses = this.getCourses();
	var hrsByCourse = {};
	var stub = Course.getCurrent() ? Course.getCurrent().getName() : courses[0].getName();
	var credits = this.getTotalCredits();
	for (var i = 0; i < courses.length; i++){
		if (Course.getCurrent() && Course.getCurrent().getName() != courses[i].getName()) continue;
		hrsByCourse[courses[i].getName()] = [];
	}
	if (courses.length > 1){
		for (var i = 0; i < wr.length; i++){
			if (Course.getCurrent() && Course.getCurrent().getName() != wr[i].getCourse()) continue;
			var hr = wr[i].getQuestionsContainingText("weekly hours");
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hrsByCourse[wr[i].getCourse()].push(val);
			}
			else{
				hrsByCourse[wr[i].getCourse()].push(0);
			}
		}
		for (var i = 0; i < hrsByCourse[stub].length; i++){
			var total = 0;
			for (var j = 0; j < courses.length; j++){
				if (Course.getCurrent() && Course.getCurrent().getName() != courses[j].getName()) continue;
				total += hrsByCourse[courses[j].getName()][i];
			}
			hours.push(total);
		}
	}
	else{
		for (var i = 0; i < wr.length; i++){
			var hr = wr[i].getQuestionsContainingText("weekly hours");
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hours.push(val);
			}
			else{
				hours.push(0);
			}
		}
	}
	return hours;
}

User.prototype.getStandard = function(name){
	var wr = this.getWeeklyReflections();
	var hours = [];
	var courses = this.getCourses();
	var hrsByCourse = {};
	var stub = Course.getCurrent() ? Course.getCurrent().getName() : courses[0].getName();
	for (var i = 0; i < courses.length; i++){
		if (Course.getCurrent() && Course.getCurrent().getName() != courses[i].getName()) continue;
		hrsByCourse[courses[i].getName()] = [];
	}
	if (courses.length > 1){
		for (var i = 0; i < wr.length; i++){
			if (Course.getCurrent() && Course.getCurrent().getName() != wr[i].getCourse()) continue;
			var hr = wr[i].getQuestionsContainingText(name.toLowerCase());
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hrsByCourse[wr[i].getCourse()].push(val);
			}
			else{
				hrsByCourse[wr[i].getCourse()].push(0);
			}
		}
		for (var i = 0; i < hrsByCourse[stub].length; i++){
			var total = 0;
			var totalCourses = 0;
			for (var j = 0; j < courses.length; j++){
				if (Course.getCurrent() && Course.getCurrent().getName() != courses[j].getName()) continue;
				totalCourses++;
				total += hrsByCourse[courses[j].getName()][i];
			}
			hours.push(total / totalCourses);
		}
	}
	else{
		for (var i = 0; i < wr.length; i++){
			var hr = wr[i].getQuestionsContainingText(name.toLowerCase());
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hours.push(val);
			}
			else{
				hours.push(0);
			}
		}
	}
	return hours;
}

/**
 * Get an array of the weekly reflections
 * @return {[type]} [description]
 */
User.prototype.getWeeklyReflections = function(){
	var surveys = this.getSurveys();
	var weeklyReflections = [];
	for (var i = 0; i < surveys.length; i++){
		if (surveys[i].getName().toLowerCase().indexOf('weekly reflection') > -1){
			weeklyReflections.push(surveys[i]);
		}
	}
	return weeklyReflections;
}

/**
 * Redirect the url to a specific place
 * @return {[type]} [description]
 */
User.prototype.redirectTo = function(){
  var email = this._email;
  var val = JSON.parse(JSON.stringify(ims.aes.value));
  val.ce = email;
  val.cr = this._role.getName().toUpperCase();
  val.pe = val.e;
  val.pr = val.i;
  var str = JSON.stringify(val);
  var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
  window.location.href = window.location.href.split('?v=')[0] + '?v=' + en;
}

/**
 * Redirect to the base dashboard
 * @return {[type]} [description]
 */
User.redirectHome = function(){
	var val = JSON.parse(JSON.stringify(ims.aes.value));
  val.ce = val.e;
  val.cr = val.i;
  val.pe = val.e;
  val.pr = val.i;
  var str = JSON.stringify(val);
  var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
  window.location.href = window.location.href.split('?v=')[0] + '?v=' + en;
}

/**
 * Redirects back to the previous page
 * @return {[type]} [description]
 */
User.redirectBack = function(){
	var val = JSON.parse(JSON.stringify(ims.aes.value));
  if (val.pe){
    val.ce = val.pe;
    val.cr = val.pr;
    val.pe = val.e;
    val.pr = val.i;
  }
  var str = JSON.stringify(val);
  var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
  window.location.href = window.location.href.split('?v=')[0] + '?v=' + en;
}

/**
 * Get an array of Course objects
 * @return {Array} [description]
 */
User.prototype.getCourses = function(){
	if (this._courses.length == 0){
		var _this = this;
		var sem = ims.semesters.getCurrentCode();
		$(this._xml).find('semester [code=' + sem + '] course').each(function(){
			_this._courses.push(new Course(this));
		})
	}
	return this._courses;
}

/**
 * Get a course by name
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
User.prototype.getCourse = function(name){
	var result = null;
	var courses = this.getCourses();
	if (courses.length > 0){
		for (var i = 0; i < courses.length; i++){
			if (courses[i].getName().toUpperCase() == name.toUpperCase()) return courses[i];
		}
	}
	return result;
}

/**
 * Get the total Credits this user is taking
 * @return {[type]} [description]
 */
User.prototype.getTotalCredits = function(){
	var total = 0;
	var courses = this.getCourses();
	for (var i = 0; i < courses.length; i++){
		var course = courses[i]; 
		total += course.getCredits();
	}
	return total;
}

/**
 * Get a list of available semesters for this user
 * @return {[type]} [description]
 */
User.prototype.getSemesters = function(){
	if (this._semesters.length == 0){
		var _this = this;
		$(this._xml).find('semester').each(function(){
			_this._semesters.push(new Semester($(this).attr('code')));
		});	
	}
	return this._semesters;		
}

//GROUP: Menu
/**
 * Gets the semester Menu
 * @return {[type]} [description]
 */
User.prototype.getSemesterMenu = function(){
	var semesters = this.getSemesters();
	var prepare = [];
	for (var i = 0; i < semesters.length; i++){
		prepare.push({
			value: semesters[i].getCode(),
			href: semesters[i].getHref()
		})
	}
	return new Menu(prepare);
}

/**
 * Gets the courses menu, if no courses needed, return null
 * @return {[type]} [description]
 */
User.prototype.getCoursesMenu = function(){
	var courses = this.getCourses();
	var prepare = [];
	for (var i = 0; i < courses.length; i++){
		prepare.push({
			value: course[i].getName(),
			href: course[i].getHref()
		});
	}
	return new Menu(prepare);
}
// END GROUP: Menu