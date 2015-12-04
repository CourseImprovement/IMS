/**
 * @start Semester Setup
 */
/**
 * Semester Setup Object
 */
function SemesterSetup(csv){
	this._csv = csv;
	this._org = {};
	this._rollup = null;
	this._master = null;
	this._newMaster = null;
	this._individualFiles = null;
	this._sem = null; 
}
/**
 * @name isGreater 
 * @description determines which of the two roles is greater
 * @assign Grant
 * @todo 
 *  + Compare the first role with im, aim, tgl, ocrm, ocr, and instructor
 *  + Return a bool  
 */
function isGreater(role1, role2){
	if (role1 == 'im'){
		return true;
	}
	else if (role1 == 'aim'){
		if (role2 == 'im')
			return false;
		else
			return true;
	}
	else if (role1 == 'tgl'){
		if (role2 == 'aim' || role2 == 'im')
			return false;
		else
			return true;
	}
	else if (role1 == 'ocrm'){
		return true;
	}
	else if (role1 == 'ocr'){
		if (role1 == 'ocrm')
			return false;
		else
			return true;
	}
	else if (role1 == 'instructor'){
		if (role2 == 'instructor')
			return true;
		else
			return false;
	}
}
/**
 * @name semestersetup
 * @description Performs a complete semester setup
 * @assign Grant
 * @todo 
 *  + Call function to create org
 *  + Call function to create master
 *  + Call function to create individual files
 *  + Call function to create rollup
 */
SemesterSetup.prototype.semesterSetup = function(){
	this._createOrg();
	this._createMaster();
	this._createIndividualFiles();
	this._createRollup();
}
/**
 * @name formalize 
 * @description capitalizes the first letter and lowercases the rest
 * @assign Grant
 * @todo 
 *  + Make sure the string is not undefined, null, or empty
 *  + Return the string where the first letter is capitalized and the rest are lowercased
 */
String.prototype.formalize = function(){
	if (this == undefined || this == null || this.length == 0) return;
	return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

/**
 * @name _createOrg
 * @description Creates a new org from the csv
 * @assign Grant
 * @todo 
 *  + Get the new semester code
 *  + Go through each row of OSM report
 *   + Create instructor object
 *    + Add course
 *   + Create tgl object
 *    + Add stewardship: instructor object
 *    + Add leadership: aim object
 *   + Create aim object
 *    + Add stewardship: tgl object
 *    + Add leadership: im object
 *   + Create im object
 *    + Add stewardship: aim object
 *   + Create ocr object
 *    + Add stewardship: instructor object
 *    + Add leadership: ocrm object
 *   + create ocrm object 
 *    + Add stewardship: ocr object
 *  + Add aim, im, and ocrm full stewardship
 */
SemesterSetup.prototype._createOrg = function(){
	this._org['semester'] = {
		code: ''
	}
	this._org.semester['person'] = [];

	var start = 0;
	while (this._csv[start][2] != 'email'){
		start++;
	}

	var sem = this._csv[++start][20].toUpperCase();
	this._org.semester.code = sem[0] + sem[1] + sem[sem.length - 2] + sem[sem.length - 1];

	for (var rows = start; rows < this._csv.length; rows++){
		if (this._csv[rows].length == 1) continue;
		// INSTRUCTOR OBJECT
		var inst = {
			first: this._csv[rows][0].formalize(),
			last: this._csv[rows][1].formalize(),
			email: this._csv[rows][2].toLowerCase().split('@')[0],
			highestrole: 'instructor',
			new: this._csv[rows][16].toLowerCase(),
			roles: {
				role: [{
					type: 'instructor',
					surveys: {},
					stewardship: {},
					leadership: {
						people: {
							person: []
						}
					}	
				}]
			},
			courses: {
				course: [{
					id: 1,
					$text: this._csv[rows][3],
					credits: this._csv[rows][4],
					pilot: this._csv[rows][17].toLowerCase(),
					ocr: this._csv[rows][18].toLowerCase()
				}]
			}
		};

		if (this._csv[rows][19] == 'TRUE'){
			inst.courses.course[0]['pwsection'] = this._csv[rows][5];
			inst.courses.course[0]['section'] = '';
		}
		else{
			inst.courses.course[0]['section'] = this._csv[rows][5];
			inst.courses.course[0]['pwsection'] = '';
		}

		// TGL OBJECT
		var tgl = {
			first: this._csv[rows][7].split(' ')[0].formalize(),
			last: this._csv[rows][7].split(' ')[1].formalize(),
			email: this._csv[rows][6].toLowerCase().split('@')[0],
			highestrole: 'tgl',
			new: false,
			roles: {
				role: [{
					type: 'tgl',
					surveys: {},
					stewardship: {
						people: {
							person: [{
								first: this._csv[rows][0].formalize(),
								last: this._csv[rows][1].formalize(),
								email: this._csv[rows][2].toLowerCase().split('@')[0],
								type: 'instructor'
							}]
						}
					},
					leadership: {
						people: {
							person: []
						}  
					}
				},{
					type: 'instructor',
					surveys: {},
					stewardship: {},
					leadership: {
						people: {
							person: []
						}  
					}
				}]
			},
			courses: {}
		};
		
		// AIM OBJECT
		var aim = {
			first: this._csv[rows][9].split(' ')[0].formalize(),
			last: this._csv[rows][9].split(' ')[1].formalize(),
			email: this._csv[rows][8].toLowerCase().split('@')[0],
			highestrole: 'aim',
			new: false,
			roles: {
				role: [{
					type: 'aim',
					surveys: {},
					stewardship: {
						people: {
							person: [{
								first: this._csv[rows][7].split(' ')[0].formalize(),
								last: this._csv[rows][7].split(' ')[1].formalize(),
								email: this._csv[rows][6].toLowerCase().split('@')[0],
								type: 'tgl'
							}]
						}
					},
					leadership: {
						people: {
							person: []
						}
					}
				},{
					type: 'tgl',
					surveys: {},
					stewardship: {
						people: {
							person: [{
								first: this._csv[rows][7].split(' ')[0].formalize(),
								last: this._csv[rows][7].split(' ')[1].formalize(),
								email: this._csv[rows][6].toLowerCase().split('@')[0],
								type: 'instructor'
							}]
						}
					},
					leadership: {}
				}]
			},
			courses: {}
		};

		// IM OBJECT
		var im = {
			first: this._csv[rows][11].split(' ')[0].formalize(),
			last: this._csv[rows][11].split(' ')[1].formalize(),
			email: this._csv[rows][10].toLowerCase().split('@')[0],
			highestrole: 'im',
			new: false,
			roles: {
				role: [{
					type: 'im',
					surveys: {},
					stewardship: {
						people: {
							person: [{
								first: this._csv[rows][9].split(' ')[0].formalize(),
								last: this._csv[rows][9].split(' ')[1].formalize(),
								email: this._csv[rows][8].toLowerCase().split('@')[0],
								type: 'aim'
							}]
						}
					},
					leadership: {}
				}]
			},
			courses: {}
		};

		var ocr = null;
		var ocrm = null;

		if (this._csv[rows][13] != ""){
			// OCR OBJECT
			ocr = {
				first: this._csv[rows][13].split(' ')[0].formalize(),
				last: this._csv[rows][13].split(' ')[1].formalize(),
				email: this._csv[rows][12].toLowerCase().split('@')[0],
				highestrole: 'ocr',
				new: false,
				roles: {
					role: [{
						type: 'ocr',
						surveys: {},
						stewardship: {
							people: {
								person: [{
									first: this._csv[rows][0].formalize(),
									last: this._csv[rows][1].formalize(),
									email: this._csv[rows][2].toLowerCase().split('@')[0],
									type: 'instructor'
								}]
							}
						},
						leadership: {
							people: {
								person: []
							}
						}
					}]
				},
				courses: {}
			};

			// OCRM OBJECT
			ocrm = {
				first: this._csv[rows][14].split(' ')[0].formalize(),
				last: this._csv[rows][14].split(' ')[1].formalize(),
				email: this._csv[rows][15].toLowerCase().split('@')[0],
				highestrole: 'ocrm',
				new: false,
				roles: {
					role: [{
						type: 'ocrm',
						surveys: {},
						stewardship: {
							people: {
								person: [{
									first: this._csv[rows][13].split(' ')[0].formalize(),
									last: this._csv[rows][13].split(' ')[1].formalize(),
									email: this._csv[rows][12].toLowerCase().split('@')[0],
									type: 'ocr'
								}]
							}
						},
						leadership: {}
					}]
				},
				courses: {}
			};
		}

		// INSTRUCTOR LEADERSHIP
		inst.roles.role[0].leadership.people.person = [{
			first: this._csv[rows][11].split(' ')[0].formalize(),
			last: this._csv[rows][11].split(' ')[1].formalize(),
			email: this._csv[rows][10].toLowerCase().split('@')[0],
			type: 'im'
		},{
			first: this._csv[rows][9].split(' ')[0].formalize(),
			last: this._csv[rows][9].split(' ')[1].formalize(),
			email: this._csv[rows][8].toLowerCase().split('@')[0],
			type: 'aim'
		},{
			first: this._csv[rows][7].split(' ')[0].formalize(),
			last: this._csv[rows][7].split(' ')[1].formalize(),
			email: this._csv[rows][6].toLowerCase().split('@')[0],
			type: 'tgl'
		}];

		if (ocr != null){
			inst.roles.role[0].leadership.people.person.push({
				first: this._csv[rows][14].split(' ')[0].formalize(),
				last: this._csv[rows][14].split(' ')[1].formalize(),
				email: this._csv[rows][15].toLowerCase().split('@')[0],
				type: 'ocrm'
			},{
				first: this._csv[rows][13].split(' ')[0].formalize(),
				last: this._csv[rows][13].split(' ')[1].formalize(),
				email: this._csv[rows][12].toLowerCase().split('@')[0],
				type: 'ocr'
			});

			// OCR LEADERSHIP
			ocr.roles.role[0].leadership.people.person = [{
				first: this._csv[rows][14].split(' ')[0].formalize(),
				last: this._csv[rows][14].split(' ')[1].formalize(),
				email: this._csv[rows][15].toLowerCase().split('@')[0],
				type: 'ocrm'
			}]
		}

		// TGL LEADERSHIP
		// AS TGL
		tgl.roles.role[0].leadership.people.person = [{
			first: this._csv[rows][11].split(' ')[0].formalize(),
			last: this._csv[rows][11].split(' ')[1].formalize(),
			email: this._csv[rows][10].toLowerCase().split('@')[0],
			type: 'im'
		},{
			first: this._csv[rows][9].split(' ')[0].formalize(),
			last: this._csv[rows][9].split(' ')[1].formalize(),
			email: this._csv[rows][8].toLowerCase().split('@')[0],
			type: 'aim'
		}]
		// AS INSTRUCTOR
		tgl.roles.role[1].leadership.people.person = [{
			first: this._csv[rows][9].split(' ')[0].formalize(),
			last: this._csv[rows][9].split(' ')[1].formalize(),
			email: this._csv[rows][8].toLowerCase().split('@')[0],
			type: 'tgl'
		}]

		// AIM LEADERSHIP
		aim.roles.role[0].leadership.people.person = [{
			first: this._csv[rows][11].split(' ')[0].formalize(),
			last: this._csv[rows][11].split(' ')[1].formalize(),
			email: this._csv[rows][10].toLowerCase().split('@')[0],
			type: 'im'
		}];

		this.addToOrg(inst);
		this.addToOrg(tgl);
		this.addToOrg(aim);
		this.addToOrg(im);
		if (ocr != null){
			this.addToOrg(ocr);
			this.addToOrg(ocrm);
		}
	}

	// ADD AIM AND OCRM STEWARDSHIP
	for (var i = 0; i < this._org.semester.person.length; i++){
		if (this._org.semester.person[i].highestrole == 'aim'){
			for (var r = 0; r < this._org.semester.person[i].roles.role.length; r++){
				if (this._org.semester.person[i].roles.role[r].type == 'aim'){
					for (var t = 0; t < this._org.semester.person[i].roles.role[r].stewardship.people.person.length; t++){
						var role = this._org.semester.person[i].roles.role[r].stewardship.people.person[t].type;
						var email = this._org.semester.person[i].roles.role[r].stewardship.people.person[t].email;
						this._org.semester.person[i].roles.role[r].stewardship.people.person[t]['people'] = {};
						this._org.semester.person[i].roles.role[r].stewardship.people.person[t].people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}

		if (this._org.semester.person[i].highestrole == 'ocrm'){
			for (var r = 0; r < this._org.semester.person[i].roles.role.length; r++){
				if (this._org.semester.person[i].roles.role[r].type == 'ocrm'){
					for (var t = 0; t < this._org.semester.person[i].roles.role[r].stewardship.people.person.length; t++){
						var role = this._org.semester.person[i].roles.role[r].stewardship.people.person[t].type;
						var email = this._org.semester.person[i].roles.role[r].stewardship.people.person[t].email;
						this._org.semester.person[i].roles.role[r].stewardship.people.person[t]['people'] = {};
						this._org.semester.person[i].roles.role[r].stewardship.people.person[t].people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}
	}

	// ADD IM STEWARDSHIP
	for (var i = 0; i < this._org.semester.person.length; i++){
		if (this._org.semester.person[i].highestrole == 'im'){
			for (var r = 0; r < this._org.semester.person[i].roles.role.length; r++){
				if (this._org.semester.person[i].roles.role[r].type == 'im'){
					for (var a = 0; a < this._org.semester.person[i].roles.role[r].stewardship.people.person.length; a++){
						var role = this._org.semester.person[i].roles.role[r].stewardship.people.person[a].type;
						var email = this._org.semester.person[i].roles.role[r].stewardship.people.person[a].email;
						this._org.semester.person[i].roles.role[r].stewardship.people.person[a]['people'] = {};
						this._org.semester.person[i].roles.role[r].stewardship.people.person[a].people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}
	}
}
/**
 * @name addStewardship 
 * @description
 * @assign Grant
 * @todo 
 *  + Loop through each person in org
 *   + Add stewardship to the person
 */
SemesterSetup.prototype.addStewardship = function(email, role){
	for (var i = 0; i < this._org.semester.person.length; i++){
		if (this._org.semester.person[i].email == email){
			for (var r = 0; r < this._org.semester.person[i].roles.role.length; r++){
				if (this._org.semester.person[i].roles.role[r].type == role){
					return this._org.semester.person[i].roles.role[r].stewardship.people.person;
				}
			}
		}
	}
}
/**
 * @name addToOrg 
 * @description
 * @assign Grant
 * @todo
 *  + Check if the person is already in org
 *   + If in org already check role, course, and section
 */
SemesterSetup.prototype.addToOrg = function(person){
	if (this._org.semester.person.length == 0){
		this._org.semester.person.push(person);
	}
	else {
		for (var i = 0; i < this._org.semester.person.length; i++){
			if (this._org.semester.person[i].email == person.email){
				// CHECK ROLE
				if (this._org.semester.person[i].highestrole != person.highestrole){
					// CHOOSE HIGHEST ROLE
					if (!isGreater(this._org.semester.person[i].highestrole, person.highestrole)){
						this._org.semester.person[i].highestrole = person.highestrole;
					}
					// ADD ROLE
					var uniqueRole = true; 
					for (var r = 0; r < this._org.semester.person[i].roles.role.length; r++){
						if (this._org.semester.person[i].roles.role[r].type == person.roles.role[0].type){
							uniqueRole = false;
						}
					}

					if (uniqueRole){
						this._org.semester.person[i].roles.role.push(person.roles.role[0]);
					}
				}
				else{
					for (var r = 0; r < this._org.semester.person[i].roles.role.length; r++){
						// FIND THE ROLE THAT IS SHARED
						if (this._org.semester.person[i].highestrole == this._org.semester.person[i].roles.role[r].type){
							var setSteward = true;
							var setLeader = true;
							if (this._org.semester.person[i].roles.role[r].stewardship.people != undefined){
								for (var s = 0; s < this._org.semester.person[i].roles.role[r].stewardship.people.person.length; s++){
									if (this._org.semester.person[i].roles.role[r].stewardship.people.person[s].email == person.roles.role[0].stewardship.people.person[0].email){
										setSteward = false;
									}
								}
								if (setSteward){
									this._org.semester.person[i].roles.role[r].stewardship.people.person.push(person.roles.role[0].stewardship.people.person[0]);
								}
							}
							if (this._org.semester.person[i].roles.role[r].leadership.people != undefined){
								for (var l = 0; l < this._org.semester.person[i].roles.role[r].leadership.people.person.length; l++){
									if (this._org.semester.person[i].roles.role[r].leadership.people.person[l].email == person.roles.role[0].leadership.people.person[0].email){
										setLeader = false;
									}
								}
								
								if (setLeader){
									this._org.semester.person[i].roles.role[r].leadership.people.person.push(person.roles.role[0].leadership.people.person[0]);
								}
							}
						}
					}
				}
				// CHECK COURSE
				if (person.courses.course != undefined){
					if (this._org.semester.person[i].courses.course == undefined){
						this._org.semester.person[i].courses.course = [];
						this._org.semester.person[i].courses.course.push(person.courses.course[0]);
					}
					else{
						for (var c = 0; c < this._org.semester.person[i].courses.course.length; c++){
							if (this._org.semester.person[i].courses.course[c].$text == person.courses.course[0].$text){
								if (this._org.semester.person[i].courses.course[c].section != person.courses.course[0].section){
									this._org.semester.person[i].courses.course[c].section += ' ' + person.courses.course[0].section;
								}
								if (this._org.semester.person[i].courses.course[c].pwsection != person.courses.course[0].pwsection){
									this._org.semester.person[i].courses.course[c].pwsection += ' ' + person.courses.course[0].pwsection;
								}
								return;
							}
						}
						person.courses.course[0].id++;
						this._org.semester.person[i].courses.course.push(person.courses.course[0]);
					}
				}
				return;
			}
		}
		this._org.semester.person.push(person);
	}
}
/**
 * @name _createRollup
 * @description Creates a new semester rollup section in the rollup file
 * @assign Grant
 */
SemesterSetup.prototype._createRollup = function(){
	console.log('rollup is being created');
}
/**
 * @name _createMaster
 * @description Creates a new semester master section in the master file
 * @assign Grant
 */
SemesterSetup.prototype._createMaster = function(){
	console.log('master is being created');
}
/**
 * @name _createIndividualFiles
 * @description Creates a new semester sections in all of the peoples files from the map file
 * @assign Grant
 */
SemesterSetup.prototype._createIndividualFiles = function(){
	console.log('individual files are being created');
}
/**
 * @name _isDifferent
 * @description Checks if the map has changed
 * @assign Grant
 */
SemesterSetup.prototype._isDifferent = function(){
	console.log('are the semesters already the same');
}
/**
 * @name _updateRollup
 * @description Checks for rollup changes and changes to be the most current
 * @assign Grant
 */
SemesterSetup.prototype._updateRollup = function(){
console.log('rollup is being updated');
}
/**
 * @name _updateMaster
 * @description Checks for master changes and changes to be the most current
 * @assign Grant
 */
SemesterSetup.prototype._updateMaster = function(){
	console.log('master is being updated');
}
/**
 * @name _updateIndividualFiles
 * @description Checks for individual file changes and changes to be the most current
 * @assign Grant
 */
SemesterSetup.prototype._updateIndividualFiles = function(){
	console.log('individual files are being updated');
}
/**
 * @end
 */