function Role(role, user){
	this._role = role;
	this._user = user;

	if (role.toLowerCase() == 'instructor'){
		this._org = null;
	}
	else{
		this._org = this._setOrg();
	}
}

Role.prototype.getTiles = function(){

}

/**
 * return the name of the current role
 * @return {String} instructor, aim, or tgl
 */
Role.prototype.getRoleName = function(){
	return this._role;
}

/**
 * return the lowers in an object
 * @return {Object} Current users organization
 */
Role.prototype.getOrg = function(){
	return this._org;
}

/**
 * creates the users organization
 * @return {Object} Current users organization
 */
Role.prototype._setOrg = function(){
	var org = [];
	var sem = ims.semesters.getCurrentCode();
	var topRole = $(this._user._xml).find('semester[code=' + sem + ']').children().first()[0].nodeName.toLowerCase();
	var lowerRole = this._nextLower(topRole);
	return this._recursiveChildren(topRole, lowerRole);
}

Role.prototype._nextLower = function(role){
	switch (role){
		case 'im': return 'aim';
		case 'aim': return 'tgl';
		case 'tgl': return 'instructor';

		case 'atgl': return 'tgl';

		case 'iaim': return 'aim';
		case 'itgl': return 'tgl';

		case 'ocr': return 'instructor';
		case 'ocrm': return 'ocr';
		default: {
			return null;
		}
	}
}

Role.prototype._recursiveChildren = function(topRole, lower){
	var org = [];
	var lowerRole = this._nextLower(lower);
	if (lowerRole == null) return org;
	var sem = ims.semesters.getCurrentCode();
	var loopies = $(this._user._xml).find('semester[code=' + sem + '] ' + topRole + ' ' + lower);
	for (var i = 0; i < loopies.length; i++){
		var underlings = this._recursiveChildren(lower, lowerRole);
		var o = {
			user: new User({xml: loopies[i], role: lower, dontCreateRoles: true}),
			lower: underlings
		};
		org.push(o);
	}
	return org;
}

/**
 * returns collection of average standards by week for a group
 * @param  {String} name name of a standard
 * @return {Array}      average value for standard in group by week
 */
Role.prototype.getQuestionForGroup = function(name){

}

/**
 * returns collection of average standards by week for everyone
 * @param  {String} name name of a standard
 * @return {Array}      average value for standard in entire org by week
 */
Role.prototype.getQuestionForAll = function(name){
	return new Rollup({level: '*', email: '', question: name});
}

/**
 * returns a list of the various people in the users group
 * @return {Object} object contains all underlings
 */
Role.prototype.getRoster = function(){
	if (this._role == 'instructor') return null;

	return this._org;
}

/**
 * return supervisor
 * @return {[type]} [description]
 */
Role.prototype.getLeader = function(){

}

/**
 * return collection of underlings
 * @return {[type]} [description]
 */
Role.prototype.getLower = function(){
	var result = [];
	$(this._org).each(function(){
		result.push(this.user);
	})
	return result;
}

/**
 * return collection of completed and incompleted tasks by underlings
 * @return {[type]} [description]
 */
Role.prototype.getLowerTasks = function(){
	var underlings = this.getLower();
	var users = [];
	for (var i = 0; i < underlings.length; i++){
		users.push(new User({email: underlings[i].getEmail()}));
	}
	return users;
}

/**
 * return collection of completed tasks for current user
 * @return {[type]} [description]
 */
Role.prototype.getCompletedTasks = function(){

}

/**
 * Gets the roles menu, if instructor return null
 * @return {[type]} [description]
 */
Role.prototype.getRolesMenu = function(){
	if (this._role == 'instructor') return null;
	var org = this._org;
	var people = [];
	for (var i = 0; i < org.length; i++){
		people.push({
			value: org[i].user.getFullName(),
			href: org[i].user.getHref()
		});
	}
	return new Menu(people);
}
// END GROUP: Menu