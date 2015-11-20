


// GROUP SEMESTER SETUP
/**
 * Semester Setup Object
 * @param {Array} csv Contains the rows from the csv file
 */
function SemesterSetup(csv){
	this._csv = csv;
	this._org = {};
	this._rollup = null;
	this._master = null;
	this._individualFiles = null;
	this._sem = null; 
}

/**
 * Person object for setup
 * @param {Object} obj person object
 */
function OSMPerson(obj){
	this.first = obj.first;
	this.last = obj.last;
	this.email = obj.email;
	this.isNew = obj.isNew;
	this.roles = [];
	this.roles.push(obj.role);
	this.courses = [];
	if (obj.course != null){
		this.courses.push(new Course(obj.course));
	}
	this.stewardship = [];
	if (this.roles[0] != 'instructor'){
		this.stewardship.push(new OSMPerson(obj.stewardship));
	}
}

/**
 * Add a course or section to a person
 * @param {Object} course course object
 */
OSMPerson.prototype.addCourse = function(course){
	for (var i = 0; i < this.courses.length; i++){
		if (this.courses[i].name == course.name){
			if (course.section != ""){
				this.courses[i].section += ' ' + course.section;
			}
			else{
				this.courses[i].pwsection += ' ' + course.pwsection;
			}
			return;
		}
	}
	this.courses.push(new Course(course));
}

/**
 * [addRole description]
 * @param {[type]} role [description]
 */
OSMPerson.prototype.addRole = function(role){
	for (var i = 0; i < this.roles.length; i++){
		if (this.roles[i] == role){
			return;
		}
	}
	this.roles.push(role);
}

/**
 * Course Object
 * @param {Object} obj course object
 */
function Course(obj){
	this.name = obj.name; 
	this.section = obj.section; 
	this.credits = obj.credits; 
	this.isPilot = obj.isPilot; 
	this.pwsection = obj.pwsection;
}

/**
 * PERFORMS A COMPLETE SEMESTER SETUP
 */
SemesterSetup.prototype.semesterSetup = function(){
	this._createOrg();
	this._createMaster();
	this._createIndividualFiles();
	this._createRollup();
}

/**
 * CREATES A NEW ORG FROM THE CSV
 */
SemesterSetup.prototype._createOrg = function(){
	this._org['IM'] = [];
	this._org['OCRM'] = [];

	var start = 0;
	while (this._csv[start][2] != 'email'){
		start++;
	}

	for (var rows = ++start; rows < this._csv.length; rows++){
		if (this._csv[rows].length == 1) continue;
		// INSTRUCTOR OBJECT
		var inst = {
			first: this._csv[rows][0],
			last: this._csv[rows][1],
			email: this._csv[rows][2],
			isNew: this._csv[rows][16],
			role: 'instructor',
			course: {
				name: this._csv[rows][3],
				credits: this._csv[rows][4],
				isPilot: this._csv[rows][17]
			},
			stewardship: null
		};

		if (this._csv[rows][19] == 'TRUE'){
			inst.course['pwsection'] = this._csv[rows][5];
			inst.course['section'] = '';
		}
		else{
			inst.course['section'] = this._csv[rows][5];
			inst.course['pwsection'] = '';
		}

		// TGL OBJECT
		var tgl = {
			first: this._csv[rows][7].split(' ')[0],
			last: this._csv[rows][7].split(' ')[1],
			email: this._csv[rows][6],
			isNew: null,
			role: 'tgl',
			course: null,
			stewardship: inst
		};
		
		// AIM OBJECT
		var aim = {
			first: this._csv[rows][9].split(' ')[0],
			last: this._csv[rows][9].split(' ')[1],
			email: this._csv[rows][8],
			isNew: null,
			role: 'aim',
			course: null,
			stewardship: tgl
		};

		// IM OBJECT
		var im = {
			first: this._csv[rows][11].split(' ')[0],
			last: this._csv[rows][11].split(' ')[1],
			email: this._csv[rows][10],
			isNew: null,
			role: 'im',
			course: null,
			stewardship: aim
		};

		// OCR OBJECT
		var ocr = {
			first: this._csv[rows][13].split(' ')[0],
			last: this._csv[rows][13].split(' ')[1],
			email: this._csv[rows][12],
			isNew: null,
			role: 'ocr',
			course: null,
			stewardship: inst
		};

		// OCRM OBJECT
		var ocrm = {
			first: this._csv[rows][14].split(' ')[0],
			last: this._csv[rows][14].split(' ')[1],
			email: this._csv[rows][15],
			isNew: null,
			role: 'ocrm',
			course: null,
			stewardship: ocr
		};

		this.addImToOrg(im);
		if (ocrm.email != "" && ocr.email != ""){
			this.addOcrmToOrg(ocrm);
		}
	}
}

/**
 * Adds a person and their subordinates into the organization
 * @param {Object} im person object that contains stewards
 */
SemesterSetup.prototype.addImToOrg = function(im){
	if (this._org.IM.length == 0){
		this._org.IM.push(new OSMPerson(im));
	}
	else{
		for (var i = 0; i < this._org.IM.length; i++){ // IM LEVEL
			if (this._org.IM[i].email == im.email){ // DOES THE IM ALREADY EXIST
				for (var a = 0; a < this._org.IM[i].stewardship.length; a++){ // AIM LEVEL
					if (this._org.IM[i].stewardship[a].email == im.stewardship.email){ // DOES THE AIM ALREADY EXIST
						for (var t = 0; t < this._org.IM[i].stewardship[a].stewardship.length; t++){ // TGL LEVEL
							if (this._org.IM[i].stewardship[a].stewardship[t].email == im.stewardship.stewardship.email){ // DOES THE TGL ALREADY EXIST
								for (var l = 0; l < this._org.IM[i].stewardship[a].stewardship[t].stewardship.length; l++){ // INSTRUCTOR LEVEL
									if (this._org.IM[i].stewardship[a].stewardship[t].stewardship[l].email == im.stewardship.stewardship.stewardship.email){ // DOES THE INSTRUCTOR ALREADY EXIST
										this._org.IM[i].stewardship[a].stewardship[t].stewardship[l].addCourse(im.stewardship.stewardship.stewardship.course); // ADD COURSE OR SECTION TO INSTRUCTOR
										return;
									}
								}
								this._org.IM[i].stewardship[a].stewardship[t].stewardship.push(new OSMPerson(im.stewardship.stewardship.stewardship)); // ADD INST
								return;
							}
						}
						this._org.IM[i].stewardship[a].stewardship.push(new OSMPerson(im.stewardship.stewardship)); // ADD TGL
						return;
					}
				}
				this._org.IM[i].stewardship.push(new OSMPerson(im.stewardship[0])); // ADD AIM
				return;
			}
		}
		this._org.IM.push(new OSMPerson(im)); // ADD IM
	}
}

/**
 * Adds a person with their subordinates to the organization
 * @param {Object} ocrm Person object with subordinates
 */
SemesterSetup.prototype.addOcrmToOrg = function(ocrm){
	if (this._org.OCRM.length == 0){
		this._org.OCRM.push(new OSMPerson(ocrm));
	}
	else{
		for (var m = 0; m < this._org.OCRM.length; m++){ // OCRM LEVEL
			if (this._org.OCRM[m].email == ocrm.email){
				for (var o = 0; o < this._org.OCRM[m].stewardship.length; o++){ // OCR LEVEL
					if (this._org.OCRM[m].stewardship[o].email == ocrm.stewardship.email){
						for (var i = 0; i < this._org.OCRM[m].stewardship[o].stewardship.length; i++){ // INST LEVEL
							if (this._org.OCRM[m].stewardship[o].stewardship[i].email == ocrm.stewardship.stewardship.email){
								return;
							}
						}
						this._org.OCRM[m].stewardship[o].stewardship.push(new OSMPerson(ocrm.stewardship.stewardship)); // ADD INST
						return;
					}
				}
				this._org.OCRM[m].stewardship.push(new OSMPerson(ocrm.stewardship)); // ADD OCR
				return;
			}
		}
		this._org.OCRM.push(new OSMPerson(ocrm)); // ADD OCRM
	}
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