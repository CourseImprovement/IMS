window._currentUser = null;
if (ims.aes.value.ce){
	window._baseUserXml = ims.sharepoint.getXmlByEmail(ims.aes.value.ce);
}

function User(obj){
	if (!obj) throw "Invalid User Object";
	if (!obj.email) throw 'Invalid email';

	this._email = obj.email;
	this._first = null;
	this._last = null;
	this._baseRole = obj.role.toLowerCase();
	this._setPersonalInfo(obj.isBase, obj.xml);
	this._courses = [];
	this._setCourses();
	this._surveys = [];
	this._setSurveys();
	this._semesters = [];
	this._isCurrent = obj.isBase == true;
	this._new = false;
	this._role = new Role(this._baseRole, this);
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
		window._currentUser = new User({email: ims.aes.value.ce, role: ims.aes.value.cr, isBase: true});
	}
	return window._currentUser;
}

/**
 * Get the email and redirect to the logged in user
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
User.redirectToLoggedInUser = function(err){
	ims.sharepoint.redirectToLoggedInUser(err, function(email){
		User.redirectToDashboard(email);
	});
}

User.getLoggedInUserEmail = function(callback){
	ims.sharepoint.getLoggedInUserEmail(callback);
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
  var sem = ims.semesters.getCurrentCode();
  var role = $(doc).find('semester[code=' + sem + '] > people > person').attr('highestrole').toUpperCase();

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
 * Get all the roles associated with the user
 * @return {[type]} [description]
 */
User.prototype.getAllRoles = function(){	
	var roles = $(this._xml).parent().find('> role');
	var result = [];
	for (var i = 0; i < roles.length; i++){
		result.push($(roles[i]).attr('type'));
	}
	return result;
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
	var _this = this;
	$(this._xml).find('> surveys survey').each(function(){
		_this._surveys.push(new Survey(this, _this));
	})
}

/**
 * Set the basic personal information
 */
User.prototype._setPersonalInfo = function(isBase, userXml){
	var sem = ims.semesters.getCurrentCode();
 	var spot = null;
 	if (isBase){
 		spot = $(window._baseUserXml).find('semester[code=' + sem + '] > people > person');
 	}
 	else{
 		spot = $(userXml);
 	}
	this._first = $(spot).attr('first');
	this._last = $(spot).attr('last');
	this._email = $(spot).attr('email');
	this._new = $(spot).attr('new') != 'false';
	this._xml = $(spot).find('> roles > role[type=' + this._baseRole + ']');
	this._personXml = spot;
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
	$(this._xml).find('course').each(function(){
		_this._courses.push(new Course(this));
	})
}

/**
 * Get the first name of the user
 * @return {[type]} [description]
 */
User.prototype.getFirst = function(){
	return this._first;
}

/**
 * Get the last name of the user
 * @return {[type]} [description]
 */
User.prototype.getLast = function(){
	return this._last;
}

User.prototype.getHighestRole = function(){
	return $(this._xml).parent().parent().attr('highestrole');
}

/**
 * Only used for instructors
 * @type {[type]}
 */
User.prototype.getLeader = function(){
	var type = '';
	if (this._baseRole == 'tgl') type = 'aim';
	else if (this._baseRole == 'instructor') type = 'tgl';
	var result = $(this._xml).find('> leadership person[type=' + type + ']').attr('email');
	if (!result){
		result = $(this._xml).parents('semester').find('role:not([type=' + this._baseRole + '])');
		type = $(result).attr('type');
		if (type == 'tgl') type = 'aim';
		result = $(result).find('leadership person[type=' + type + ']').attr('email');
	}	
	return result;
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
	return new Role(type, this, true);
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
  val.cr = this.getRole().getRoleName().toUpperCase();
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
		if (weeklyReflections[i].getWeek() == '2'){
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
				hrsByCourse[wr[i].getCourse().getName()].push(val);
			}
			else{
				hrsByCourse[wr[i].getCourse().getName()].push(0);
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
	for (var i = 0; i < hours.length; i++){
		hours[i] = Math.floor(hours[i] * 10) / 10;
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
			if (Course.getCurrent() && Course.getCurrent().getName() != wr[i].getCourse().getName()) continue;
			var hr = wr[i].getQuestionsContainingText("weekly hours");
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hrsByCourse[wr[i].getCourse().getName()].push(val);
			}
			else{
				hrsByCourse[wr[i].getCourse().getName()].push(0);
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
			if (Course.getCurrent() && Course.getCurrent().getName() != wr[i].getCourse().getName()) continue;
			var hr = wr[i].getQuestionsContainingText(name.toLowerCase());
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hrsByCourse[wr[i].getCourse().getName()].push(val);
			}
			else{
				hrsByCourse[wr[i].getCourse().getName()].push(0);
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
	$(weeklyReflections).sort(function(a, b){
		if (a.getWeek() == 'Intro') return false;
		return parseInt(a.getWeek()) > parseInt(b.getWeek());
	});
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
		$(this._personXml).find('> courses course').each(function(){
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
 * Get a course by id
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
User.prototype.getCourseById = function(id){
	var result = null;
	var courses = this.getCourses();
	if (courses.length > 0){
		for (var i = 0; i < courses.length; i++){
			if (courses[i].getId() == id) return courses[i];
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