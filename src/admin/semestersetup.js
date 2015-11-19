


// GROUP SEMESTER SETUP
/**
 * Semester Setup Object
 * @param {Array} csv Contains the rows from the csv file
 */
function SemesterSetup(csv){
	console.log('new SemesterSetup object was created');
	this._csv = csv;
	this._org = {};
	this._rollup = null;
	this._master = null;
	this._individualFiles = null;
	this._sem = null; 
}

function OSMPerson(obj){
	console.log('creating a new person');
	this._first = obj.first;
	this._last = obj.last;
	this._email = obj.email;
	this._isNew = obj.isNew;
	this._roles = [];
	this._roles.push(obj.role);
	this._courses = [];
	this._courses.push(new Course(obj.course));
	this._stewardship = [];
	this._stewardship.push(new OSMPerson(obj.stewardship));
}

OSMPerson.prototype.addCourse = function(course){

}

OSMPerson.prototype.addRole = function(role){

}

function Course(obj){
	console.log('creating a new course');
	this._name = obj.name; 
	this._section = obj.section; 
	this._credits = obj.credits; 
	this._isPilot = obj.isPilot; 
	this._pwsection = obj.pwsection;
}

/**
 * PERFORMS A COMPLETE SEMESTER SETUP
 */
SemesterSetup.prototype.semesterSetup = function(){
	console.log('semester is being setup');
	this._createOrg();
	this._createMaster();
	this._createIndividualFiles();
	this._createRollup();
}

/**
 * CREATES A NEW ORG FROM THE CSV
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createOrg = function(){
	console.log('rollup is being created');
}

/**
 * CREATES A NEW SEMESTER ROLLUP SECTION IN THE ROLLUP FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createRollup = function(){
	console.log('rollup is being created');
}

/**
 * CREATES A NEW SEMESTER MASTER SECTION IN THE MASTER FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createMaster = function(){
	console.log('master is being created');
}

/**
 * CREATES A NEW SEMESTER SECTIONS IN ALL OF THE PEOPLES FILES FROM THE MAP FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createIndividualFiles = function(){
	console.log('individual files are being created');
}

/**
 * CHECKS IF THE MAP HAS CHANGED
 * @return {Boolean} [description]
 */
SemesterSetup.prototype._isDifferent = function(){
	console.log('are the semesters already the same');
}

/**
 * CHECKS FOR ROLLUP CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateRollup = function(){
console.log('rollup is being updated');
}

/**
 * CHECKS FOR MASTER CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateMaster = function(){
	console.log('master is being updated');
}

/**
 * CHECKS FOR INDIVIDUAL FILE CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateIndividualFiles = function(){
	console.log('individual files are being updated');
}
// GROUP SEMESTER SETUP END
// 