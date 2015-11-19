


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
	if (obj.course != null){
		this._courses.push(new Course(obj.course));
	}
	this._stewardship = [];
	if (obj.stewardship != null){
		this._stewardship.push(new OSMPerson(obj.stewardship));
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
	this._org['IM'] = [];
	this._org['OCRM'] = [];

	var start = 0;
	while (this._csv[start][2] != 'email'){
		start++;
	}
	//    0         1       2       3             4                5               6        7        8       9      10      11      12     13       14       15         16          17    18      19       20
	//firstname|lastname|email|coursenumber|totalCredits|JenzabarSectionNumber|TglEmail|TglName|AimEmail|AimName|ImEmail|ImName|OcrEmail|OcrName|OcrmName|OcrmEmail|isNewTeacher|isPilot|IsOcr|isPathway|Semester

	for (var rows = ++start; rows < this._csv.length; rows++){
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
		var im = new OSMPerson({
			first: this._csv[rows][11].split(' ')[0],
			last: this._csv[rows][11].split(' ')[1],
			email: this._csv[rows][10],
			isNew: null,
			role: 'im',
			course: null,
			stewardship: aim
		});

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
		var ocrm = new OSMPerson({
			first: this._csv[rows][14].split(' ')[0],
			last: this._csv[rows][14].split(' ')[1],
			email: this._csv[rows][15],
			isNew: null,
			role: 'ocrm',
			course: null,
			stewardship: ocr
		});
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