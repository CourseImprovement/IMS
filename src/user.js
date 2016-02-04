window._currentUser = null;
if (ims.aes.value.ce){
	window._baseUserXml = ims.sharepoint.getXmlByEmail(ims.aes.value.ce);
}

/**
 * @name User 
 * @description
 */
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
	this._role = new Role(this._baseRole, this, !this._isCurrent);
}

/**
 * @name User.HoursStandard
 * @description The standard for instructor hours per credit
 */
User.HoursStandard = 3.5;

/**
 * @name User.getCurrent
 * @description Get the current user (the current dashboard user)
 */
User.getCurrent = function(){
	if (!window._currentUser){
		window._currentUser = new User({email: ims.aes.value.ce, role: ims.aes.value.cr, isBase: true});
	}
	return window._currentUser;
}

/**
 * @name User.redirectToLoggedInUser
 * @description Get the email and redirect to the logged in user
 */
User.redirectToLoggedInUser = function(err){
	ims.sharepoint.redirectToLoggedInUser(err, function(email){
		User.redirectToDashboard(email);
	});
}

/**
 * @name User.getLoggedInUserEmail 
 * @description
 */
User.getLoggedInUserEmail = function(callback){
	ims.sharepoint.getLoggedInUserEmail(callback);
}

/**
 * @name User.redirectToDashboard
 * @description The inital search for person
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
 * @name User.getSuggested
 * @description Get the suggested list
 */
User.prototype.getSuggested = function(q){
	return this._role.getSuggested(q);
}

/**
 * @name User.getAllRoles
 * @description Get all the roles associated with the user
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
 * @name User.canSearch
 * @description
 * @todo 
 * 	+ call this._role.canSearch();
 */
User.prototype.canSearch = function(){
	var roleName = this.getRole().getRoleName().toLowerCase();
	return roleName == 'aim' || roleName == 'im';
}

/**
 * @name User.isLeader
 * @todo
 * 	+ call this._role.isLeader();
 */
User.prototype.isLeader = function(){
	var r = this.getRole().getRoleName().toLowerCase();
	return r == 'aim' || r == 'tgl' || r == 'atgl' || r == 'im';
}

/**
 * @name User.isCurrent 
 * @description
 */
User.prototype.isCurrent = function(){
	if (ims.aes.value.e != ims.aes.value.ce) return false;
	return this._isCurrent;
}

/**
 * @name User._setSurveys
 * @description Internal function to populate the users surveys into the _surveys
 * array
 */
User.prototype._setSurveys = function(){ 
	var sem = ims.semesters.getCurrentCode();
	var _this = this;
	$(this._xml).find('> surveys survey').each(function(){
		var id = $(this).attr('id');
		if ($(ims._config).find('semester[code="' + sem + '"] survey[id="' + id + '"]').length != 0) {
			_this._surveys.push(new Survey(this, _this));
		}
	})
}

/**
 * @name User._setPersonalInfo
 * @description Set the basic personal information
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
	if (this._xml.length == 0){
		this._xml = spot;
	}
	this._personXml = spot;
}

/**
 * @name User.showCourseMenu
 * @description Show the course menu for an instructor
 */
User.prototype.showCourseMenu = function(){
	var role = this.getRole().getRoleName().toUpperCase();
	return role == 'INSTRUCTOR' && this.getCourses().length > 1;
}

/**
 * @name User.selectedCourse
 * @description Returns the selected course if the user is an instructor
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
 * @name User._setCourses
 * @description Set the courses
 */
User.prototype._setCourses = function(){
	var _this = this;
	if ($(this._xml).find('> course').length != 0){
		$(this._xml).find('> course').each(function(){
			_this._courses.push(new Course(this));
		});
	}
}

/**
 * @name User.getFirst
 * @description Get the first name of the user
 */
User.prototype.getFirst = function(){
	return this._first;
}

/**
 * @name User.getLast
 * @description Get the last name of the user
 */
User.prototype.getLast = function(){
	return this._last;
}

/**
 * @name User.getHighestRole 
 * @description
 */
User.prototype.getHighestRole = function(){
	return $(this._xml).parent().parent().attr('highestrole');
}

/**
 * @name User.getLeader
 * @description Only used for instructors
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
 * @name User.getEmail
 * @description Get the email of the user
 */
User.prototype.getEmail = function(){
	return this._email;
}

/**
 * @name User.getFullEmail
 * @description Get the email of the user including the @byui.edu
 */
User.prototype.getFullEmail = function(){
	return this._email + '@byui.edu';
}

/**
 * @name User.getFullName
 * @description Get the full name of the user with a space between the first
 * and last name, and a capital first letter of each name.
 */
User.prototype.getFullName = function(){
	return this._first + ' ' + this._last;
}

/**
 * @name User.getSurvey
 * @description Get a specific survey from the user
 */
User.prototype.getSurvey = function(sid){
	var surveys = this.getSurveys();
	for (var i = 0; i < surveys.length; i++){
		if (surveys[i].id.toLowerCase() == sid.toLowerCase()) return surveys[i];
	}
}

/**
 * @name User.save
 * @description Save the xml to the server
 */
User.prototype.save = function(){
	ims.sharepoint.postFile(this);
}

/**
 * @name User.getSurveys
 * @description Get an Array of the surveys
 */
User.prototype.getSurveys = function(){
	return this._surveys;
}

/**
 * @name USer.getSurveysByPlacement
 * @description Get the survey by placement
 */
User.prototype.getSurveysByPlacement = function(placement){
	var surveys = [];
	for (var i = 0; i < this._surveys.length; i++){
		if (this._surveys[i].getPlacement().toLowerCase() == placement.toLowerCase()){
			surveys.push(this._surveys[i]);
		}
	}
	return surveys;
}

// GROUP: Roles
/**
 * @name User.getRole
 * @description Get the users role relative to the current user and their role
 */
User.prototype.getRole = function(){
	return this._role;
}

/**
 * @name User.getRoleAs
 * @description Get the role as with a hat
 */
User.prototype.getRoleAs = function(type){
	return new Role(type, this, true);
}

/**
 * @name User.isNew
 * @description Validates if the instructor is a new instructor
 * or not.
 */
User.prototype.isNew = function(){
	return this._new;
}

/**
 * @name User.getHref
 * @description Get the href for the user
 */
User.prototype.getHref = function(){
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
 * @name User.getSmartGoals
 * @description Returns an array of SMART goals if taken
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
 * @name User.getTargetHours
 * @description Get the target hours for this user.
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

/**
 * @name User.backButton 
 * @description
 */
User.prototype.backButton = function(){
	return ims.aes.value.ce != ims.aes.value.e;
}

/**
 * @name User.getHours
 * @description Get the weekly hours averaged out by course
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
 * @name User.getHoursRaw
 * @description Get the weekly hours averaged out by course
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

/**
 * @name User.getStandard 
 * @description
 */
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
			if (hr.length > 0 && hr[0].hasAnswer()){
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
			if (hr.length > 0 && hr[0].hasAnswer()){
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
 * @name User.getWeeklyReflections
 * @description Get an array of the weekly reflections
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
 * @name User.redirectTo
 * @description Redirect the url to a specific place
 */
User.prototype.redirectTo = function(){
  var email = this._email;
  var val = JSON.parse(JSON.stringify(ims.aes.value));
  val.ce = email;
  val.cr = this._role.getRoleName().toUpperCase();
  val.pe = val.e;
  val.pr = val.i;
  var str = JSON.stringify(val);
  var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
  window.location.href = window.location.href.split('?v=')[0] + '?v=' + en;
}

/**
 * @name User.redirectHome
 * @description Redirect to the base dashboard
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
 * @name User.redirectBack
 * @description Redirects back to the previous page
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
 * @name User.getCourses
 * @description Get an array of Course objects
 */
User.prototype.getCourses = function(){
	if (this._courses.length == 0){
		var _this = this;
		if ($(this._personXml).find('> courses course').length != 0){
			$(this._personXml).find('> courses course').each(function(){
				_this._courses.push(new Course(this));
			});
		} else {
			_this._courses = [];
		}
	}
	return this._courses;
}

/**
 * @name User.getCourse
 * @description Get a course by name
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
 * @name User.getCourseById
 * @description Get a course by id
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
 * @name User.getTotalCredits
 * @description Get the total Credits this user is taking
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
 * @name User.getSemesters
 * @description Get a list of available semesters for this user
 */
User.prototype.getSemesters = function(){
	if (this._semesters.length == 0){
		var _this = this;
		$(window._baseUserXml).find('semester').each(function(){
			_this._semesters.push(new Semester($(this).attr('code')));
		});	
	}
	return this._semesters;		
}

//GROUP: Menu
/**
 * @name User.getSemesterMenu
 * @description Gets the semester Menu
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
 * @name User.getCoursesMenu
 * @description Gets the courses menu, if no courses needed, return null
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