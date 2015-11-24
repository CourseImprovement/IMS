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
	this._newMaster = null;
	this._individualFiles = null;
	this._sem = null; 
}

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
 * PERFORMS A COMPLETE SEMESTER SETUP
 */
SemesterSetup.prototype.semesterSetup = function(){
	this._createOrg();
	this._createMaster();
	this._createIndividualFiles();
	this._createRollup();
}

String.prototype.formalize = function(){
	if (this == undefined || this == null || this.length == 0) return;
	return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

/**
 * CREATES A NEW ORG FROM THE CSV
 */
SemesterSetup.prototype._createOrg = function(){
	this._org['person'] = [];

	var start = 0;
	while (this._csv[start][2] != 'email'){
		start++;
	}

	for (var rows = ++start; rows < this._csv.length; rows++){
		if (this._csv[rows].length == 1) continue;
		// INSTRUCTOR OBJECT
		var inst = {
			first: this._csv[rows][0].formalize(),
			last: this._csv[rows][1].formalize(),
			email: this._csv[rows][2].toLowerCase().split('@')[0],
			new: this._csv[rows][16].toLowerCase(),
			highestrole: 'instructor',
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
					name: this._csv[rows][3],
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
			new: false,
			highestrole: 'tgl',
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

		// TGL LEADERSHIP
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

		/*if (this._csv[rows][13] != ""){
			// OCR OBJECT
			var ocr = {
				first: this._csv[rows][13].split(' ')[0].formalize(),
				last: this._csv[rows][13].split(' ')[1].formalize(),
				email: this._csv[rows][12].toLowerCase().split('@')[0],
				isNew: null,
				role: 'ocr',
				course: null,
				stewardship: inst
			};

			// OCRM OBJECT
			var ocrm = {
				first: this._csv[rows][14].split(' ')[0].formalize(),
				last: this._csv[rows][14].split(' ')[1].formalize(),
				email: this._csv[rows][15].toLowerCase().split('@')[0],
				isNew: null,
				role: 'ocrm',
				course: null,
				stewardship: ocr
			};

			this.addOcrmToOrg(ocrm);
		}*/
	}

	for (var i = 0; i < this._org.person.length; i++){
		if (this._org.person[i].highestrole == 'aim'){
			for (var r = 0; r < this._org.person[i].roles.role.length; r++){
				if (this._org.person[i].roles.role[r].role == 'aim'){
					for (var t = 0; t < this._org.person[i].roles.role[r].stewardship.people.person.length; t++){
						var role = this._org.person[i].roles.role[r].stewardship.people.person[t].type;
						var email = this._org.person[i].roles.role[r].stewardship.people.person[t].email;
						this._org.person[i].roles.role[r].stewardship.people.person[t]['people'] = {};
						this._org.person[i].roles.role[r].stewardship.people.person[t].people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}
	}
}

SemesterSetup.prototype.addStewardship = function(email, role){
	for (var i = 0; i < this._org.person.length; i++){
		if (this._org.person[i].email == email){
			for (var r = 0; r < this._org.person[i].roles.role[r].type == role){
				return this._org.person[i].roles.role[r].stewardship.people.person;
			}
		}
	}
}

SemesterSetup.prototype.addToOrg = function(person){
	if (this._org.person.length == 0){
		this._org.person.push(person);
	}
	else {
		for (var i = 0; i < this._org.person.length; i++){
			if (this._org.person[i].email == person.email){
				// CHECK ROLE
				if (this._org.person[i].highestrole != person.highestrole){
					// CHOOSE HIGHEST ROLE
					if (!isGreater(this._org.person[i].highestrole, person.highestrole)){
						this._org.person[i].highestrole = person.highestrole;
					}
					// ADD ROLE
					var uniqueRole = true; 
					for (var r = 0; r < this._org.person[i].roles.role.length; r++){
						if (this._org.person[i].roles.role[r].type == person.roles.role[0].type){
							uniqueRole = false;
						}
					}

					if (uniqueRole){
						this._org.person[i].roles.role.push(person.roles.role[0]);
					}
				}
				else{
					for (var r = 0; r < this._org.person[i].roles.role.length; r++){
						// FIND THE ROLE THAT IS SHARED
						if (this._org.person[i].highestrole == this._org.person[i].roles.role[r].type){
							var setSteward = true;
							var setLeader = true;
							if (this._org.person[i].roles.role[r].stewardship.people != undefined){
								for (var s = 0; s < this._org.person[i].roles.role[r].stewardship.people.person.length; s++){
									if (this._org.person[i].roles.role[r].stewardship.people.person[s].email == person.roles.role[0].stewardship.people.person[0].email){
										setSteward = false;
									}
								}
								if (setSteward){
									this._org.person[i].roles.role[r].stewardship.people.person.push(person.roles.role[0].stewardship.people.person[0]);
								}
							}
							if (this._org.person[i].roles.role[r].leadership.people != undefined){
								for (var l = 0; l < this._org.person[i].roles.role[r].leadership.people.person.length; l++){
									if (this._org.person[i].roles.role[r].leadership.people.person[l].email == person.roles.role[0].leadership.people.person[0].email){
										setLeader = false;
									}
								}
								
								if (setLeader){
									this._org.person[i].roles.role[r].leadership.people.person.push(person.roles.role[0].leadership.people.person[0]);
								}
							}
						}
					}
				}
				// CHECK COURSE
				if (person.courses.course != undefined){
					if (this._org.person[i].courses.course == undefined){
						this._org.person[i].courses.course = [];
						this._org.person[i].courses.course.push(person.courses.course[0]);
					}
					else{
						for (var c = 0; c < this._org.person[i].courses.course.length; c++){
							if (this._org.person[i].courses.course[c].name == person.courses.course[0].name){
								if (this._org.person[i].courses.course[c].section != person.courses.course[0].section){
									this._org.person[i].courses.course[c].section += ' ' + person.courses.course[0].section;
								}
								if (this._org.person[i].courses.course[c].pwsection != person.courses.course[0].pwsection){
									this._org.person[i].courses.course[c].pwsection += ' ' + person.courses.course[0].pwsection;
								}
								return;
							}
						}
						person.courses.course[0].id++;
						this._org.person[i].courses.course.push(person.courses.course[0]);
					}
				}

				return;
			}
		}
		this._org.person.push(person);
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