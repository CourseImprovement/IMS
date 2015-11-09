// GROUP SEMESTER SETUP
function SemesterSetup(csv){
	console.log('new SemesterSetup object was created');
	this._csv = csv;
	this._map = null;
	this._rollup = null;
	this._master = null;
	this._individualFiles = null;
	this._sem = null; 
}

/**
 * PERFORMS A COMPLETE SEMESTER SETUP
 * @return {[type]} [description]
 */
SemesterSetup.prototype.semesterSetup = function(){
	console.log('semester is being setup');
	this._createMap();
	this._createIndividualFiles();
	this._createMaster();
	this._createRollup();
}

/**
 * CREATES A NEW SEMESTER MAP SECTION IN THE MAP FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createMap = function(){
	console.log('map is being created');
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
	console.log('map is being created');
}

/**
 * CREATES A NEW SEMESTER SECTIONS IN ALL OF THE PEOPLES FILES FROM THE MAP FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createIndividualFiles = function(){
	console.log('individual files are being created');
}

/**
 * UPDATES THE CURRENT SEMESTER SETUP
 * @return {[type]} [description]
 */
SemesterSetup.prototype.semesterUpdate = function(){
	console.log('semester is being updated');
	if (this._isDifferent()){
		this._updateMap();
		this._updateIndividualFiles();
		this._updateMaster();
		this._updateRollup();
	}
}

/**
 * CHECKS IF THE MAP HAS CHANGED
 * @return {Boolean} [description]
 */
SemesterSetup.prototype._isDifferent = function(){
	console.log('are the semesters already the same');
}

/**
 * CHECKS FOR MAP CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateMap = function(){
	console.log('map is being updated');
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