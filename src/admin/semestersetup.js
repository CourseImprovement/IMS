


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
	this._first = obj._first;
	this._last = obj._last;
	this._email = obj._email;
	this._isNew = obj._isNew;
	this._roles = [];
	this._roles.push(obj._role);
	this._courses = [];
	if (obj._course != null){
		this._courses.push(new Course(obj._course));
	}
	this._stewardship = [];
	if (obj._stewardship != null){
		this._stewardship.push(new OSMPerson(obj._stewardship));
	}
}

OSMPerson.prototype.addCourse = function(course){
	for (var i = 0; i < this._courses.length; i++){
		if (this._courses[i].name == course.name){
			if (course.section != undefined){
				this._courses[i].section += ' ' + course.section;
			}
			else{
				this._courses[i]._pwsection += ' ' + course.section;
			}
			return;
		}
	}
	this._courses.push(new Course(course));
}

OSMPerson.prototype.addRole = function(role){
	for (var i = 0; i < this._roles.length; i++){
		if (this._roles[i] == role){
			return;
		}
	}
	this._roles.push(role);
}

function Course(obj){
	console.log('creating a new course');
	this._name = obj._name; 
	this._section = obj._section; 
	this._credits = obj._credits; 
	this._isPilot = obj._isPilot; 
	this._pwsection = obj._pwsection;
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
	this._org['IM'] = [];
	this._org['OCRM'] = [];

	var start = 0;
	while (this._csv[start][2] != 'email'){
		start++;
	}
	//    0         1       2       3             4                5               6        7        8       9      10      11      12     13       14       15         16          17    18      19       20
	//firstname|lastname|email|coursenumber|totalCredits|JenzabarSectionNumber|TglEmail|TglName|AimEmail|AimName|ImEmail|ImName|OcrEmail|OcrName|OcrmName|OcrmEmail|isNewTeacher|isPilot|IsOcr|isPathway|Semester

	for (var rows = ++start; rows < this._csv.length; rows++){
		if (this._csv[rows].length == 1) continue;
		// INSTRUCTOR OBJECT
		var inst = {
			_first: this._csv[rows][0],
			_last: this._csv[rows][1],
			_email: this._csv[rows][2],
			_isNew: this._csv[rows][16],
			_role: 'instructor',
			_course: {
				name: this._csv[rows][3],
				credits: this._csv[rows][4],
				isPilot: this._csv[rows][17]
			},
			_stewardship: null
		};

		if (this._csv[rows][19] == 'TRUE'){
			inst._course['_pwsection'] = this._csv[rows][5];
			inst._course['_section'] = '';
		}
		else{
			inst._course['_section'] = this._csv[rows][5];
			inst._course['_pwsection'] = '';
		}

		// TGL OBJECT
		var tgl = {
			_first: this._csv[rows][7].split(' ')[0],
			_last: this._csv[rows][7].split(' ')[1],
			_email: this._csv[rows][6],
			_isNew: null,
			_role: 'tgl',
			_course: null,
			_stewardship: inst
		};
		
		// AIM OBJECT
		var aim = {
			_first: this._csv[rows][9].split(' ')[0],
			_last: this._csv[rows][9].split(' ')[1],
			_email: this._csv[rows][8],
			_isNew: null,
			_role: 'aim',
			_course: null,
			_stewardship: tgl
		};

		// IM OBJECT
		var im = new OSMPerson({
			_first: this._csv[rows][11].split(' ')[0],
			_last: this._csv[rows][11].split(' ')[1],
			_email: this._csv[rows][10],
			_isNew: null,
			_role: 'im',
			_course: null,
			_stewardship: aim_
		});

		// OCR OBJECT
		var ocr = {
			_first: this._csv[rows][13].split(' ')[0],
			_last: this._csv[rows][13].split(' ')[1],
			_email: this._csv[rows][12],
			_isNew: null,
			_role: 'ocr',
			_course: null,
			_stewardship: inst
		};

		// OCRM OBJECT
		var ocrm = new OSMPerson({
			_first: this._csv[rows][14].split(' ')[0],
			_last: this._csv[rows][14].split(' ')[1],
			_email: this._csv[rows][15],
			_isNew: null,
			_role: 'ocrm',
			_course: null,
			_stewardship: ocr
		});

		this.addImToOrg(im);
		this.addOcrmToOrg(ocrm);
	}
}

SemesterSetup.prototype.addImToOrg = function(im){
	if (this._org.IM.length == 0){
		this._org.IM.push(im);
	}
	else{
		for (var i = 0; i < this._org.IM.length; i++){ // IM LEVEL
			if (this._org.IM[i]._email == im._email){
				for (var a = 0; a < this._org.IM[i]._stewardship.length; a++){ // AIM LEVEL
					if (this._org.IM[i]._stewardship[a]._email == im._stewardship[0]._email){
						for (var t = 0; t < this._org.IM[i]._stewardship[a]._stewardship.length; t++){ // TGL LEVEL
							if (this._org.IM[i]._stewardship[a]._stewardship[t]._email == im._stewardship[0]._stewardship[0]._email){
								for (var l = 0; l < this._org.IM[i]._stewardship[a]._stewardship[t]._stewardship.length; l++){ // INSTRUCTOR LEVEL
									if (this._org.IM[i]._stewardship[a]._stewardship[t]._stewardship[l]._email == im._stewardship[0]._stewardship[0]._stewardship[0]._email){
										return;
									}
								}
								this._org.IM[i]._stewardship[a]._stewardship[t]._stewardship.push(new OSMPerson(im._stewardship[0]._stewardship[0]._stewardship[0]));
								return;
							}
						}
						this._org.IM[i]._stewardship[a]._stewardship.push(new OSMPerson(im._stewardship[0]._stewardship[0]));
						return;
					}
				}
				this._org.IM[i]._stewardship.push(new OSMPerson(im._stewardship[0]));
				return;
			}
		}
		this._org.IM.push(im);
	}
}

SemesterSetup.prototype.addOcrmToOrg = function(ocrm){
	if (this._org.OCRM.length == 0){
		this._org.OCRM.push(ocrm);
	}
	else{
		for (var i = 0; i < this._org.OCRM.length; i++){
			
		}
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