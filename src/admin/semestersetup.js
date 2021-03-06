/**
 * @start Semester Setup
 */
/**
 * Semester Setup Object
 */
function SemesterSetup(csv) {
	this._csv = csv;
	this._org = {};
	this._rollup = ims.sharepoint.getXmlByEmail('rollup');
	this._master = ims.sharepoint.getXmlByEmail('master');
}
/**
 * @name isGreater 
 * @description determines which of the two roles is greater
 * @assign Grant
 * @todo 
 *  + Compare the first role with im, aim, tgl, ocrm, ocr, and instructor
 *  + Return a bool  
 */
function isGreater(role1, role2) {
	if (role1 == 'im') {
		return true;
	} else if (role1 == 'aim') {
		if (role2 == 'im') {
			return false;
		} else {
			return true;
		}
	} else if (role1 == 'tgl') {
		if (role2 == 'aim' || role2 == 'im') {
			return false;
		} else {
			return true;
		}
	} else if (role1 == 'ocrm') {
		return true;
	} else if (role1 == 'ocr') {
		if (role1 == 'ocrm') {
			return false;
		} else {
			return true;
		}
	} else if (role1 == 'instructor') {
		if (role2 == 'instructor') {
			return true;
		} else {
			return false;
		}
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
SemesterSetup.prototype.semesterSetup = function() {
	var _this = this;
	function processItems(i) {		
		switch (i) {
			case 0: _this._createOrg(); break;
			case 1: _this._createMaster(); break;
			case 2: _this._createIndividualFiles(); break;
			case 3: _this._createRollup(); break;
			case 4: _this._createConfig(); break;
			default: return;
		}

		setTimeout(function(){
			++i
			ims.loading.set((20 * i));
			if (i == 5) return;
			processItems(i);
		}, 10);
	}
	
	setTimeout(function(){
		ims.loading.reset();
		ims.loading.set(10);
		processItems(0);
	}, 10)
}
/**
 * @name formalize 
 * @description capitalizes the first letter and lowercases the rest
 * @assign Grant
 * @todo 
 *  + Make sure the string is not undefined, null, or empty
 *  + Return the string where the first letter is capitalized and the rest are lowercased
 */
String.prototype.formalize = function() {
	if (this == undefined || this == null || this.length == 0) return;
	var a = this.replace('*', '');
	return a.charAt(0).toUpperCase() + a.slice(1).toLowerCase();
}

SemesterSetup.prototype._isSameSem = function() {
	var code = $(window.config._xml).find('semesters semester[current=true]').attr('code');
	return code == this._org.semester.code;
}

/**
 * @name _createConfig
 * @description
 */
SemesterSetup.prototype._createConfig = function() {
	var config = $(window.config._xml).find('semesters semester[current=true]').clone();
	$(config).attr('code', this._org.semester.code);

	if (this._isSameSem()) {
		$(window.config._xml).find('semesters semester[current=true]').remove();
	}
	
	$(window.config._xml).find('semesters semester[current=true]').attr('current', 'false');
	$(window.config._xml).find('semesters').append(config);
	//console.log(window.config._xml);
	Sharepoint.postFile(window.config._xml, 'config/', 'config.xml', function(){});
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
SemesterSetup.prototype._createOrg = function() {
	this._org['semester'] = {
		code: ''
	}
	this._org.semester['people'] = {};
	this._org.semester.people['person'] = [];

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
							person: [{
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
							}]
						}
					}	
				}]
			},
			courses: {
				course: this.addCourse(this._csv[rows][2].toLowerCase().split('@')[0])
			}
		};

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
								type: 'instructor',
								roles: {
									role: [{
										type: 'instructor',
										surveys: {},
										stewardship: {},
										leadership: {
											people: {
												person: [{
													first: this._csv[rows][7].split(' ')[0].formalize(),
													last: this._csv[rows][7].split(' ')[1].formalize(),
													email: this._csv[rows][6].toLowerCase().split('@')[0],
													type: 'tgl'
												},{
													first: this._csv[rows][9].split(' ')[0].formalize(),
													last: this._csv[rows][9].split(' ')[1].formalize(),
													email: this._csv[rows][8].toLowerCase().split('@')[0],
													type: 'aim'
												},{
													first: this._csv[rows][11].split(' ')[0].formalize(),
													last: this._csv[rows][11].split(' ')[1].formalize(),
													email: this._csv[rows][10].toLowerCase().split('@')[0],
													type: 'im'
												}]
											}
										}	
									}]
								},
								courses: {
									course: this.addCourse(this._csv[rows][2].toLowerCase().split('@')[0])
								}
							}]
						}
					},
					leadership: {
						people: {
							person: [{
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
						}  
					}
				},{
					type: 'instructor',
					surveys: {},
					stewardship: {},
					leadership: {
						people: {
							person: [{
								first: this._csv[rows][9].split(' ')[0].formalize(),
								last: this._csv[rows][9].split(' ')[1].formalize(),
								email: this._csv[rows][8].toLowerCase().split('@')[0],
								type: 'tgl'
							},{
								first: this._csv[rows][11].split(' ')[0].formalize(),
								last: this._csv[rows][11].split(' ')[1].formalize(),
								email: this._csv[rows][10].toLowerCase().split('@')[0],
								type: 'aim'
							}]
						}  
					}
				}]
			},
			courses: {
				course: this.addCourse(this._csv[rows][6].toLowerCase().split('@')[0])
			}
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
								type: 'tgl',
								courses: {
									course: this.addCourse(this._csv[rows][6].toLowerCase().split('@')[0])
								},
								roles: {
									role:[{
										type: 'tgl',
										surveys: {},
										stewardship: {
											people:{
												person: []
											}
										},
										leadership: {
											people: {
												person: [{
													first: this._csv[rows][9].split(' ')[0].formalize(),
													last: this._csv[rows][9].split(' ')[1].formalize(),
													email: this._csv[rows][8].toLowerCase().split('@')[0],
													type: 'aim'
												},{
													first: this._csv[rows][11].split(' ')[0].formalize(),
													last: this._csv[rows][11].split(' ')[1].formalize(),
													email: this._csv[rows][10].toLowerCase().split('@')[0],
													type: 'im'
												}]
											}
										}
									}]
								}
							}]
						}
					},
					leadership: {
						people: {
							person: [{
								first: this._csv[rows][11].split(' ')[0].formalize(),
								last: this._csv[rows][11].split(' ')[1].formalize(),
								email: this._csv[rows][10].toLowerCase().split('@')[0],
								type: 'im'
							}]
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
								type: 'instructor',
								courses: {
									course: this.addCourse(this._csv[rows][6].toLowerCase().split('@')[0])
								},
								roles: {
									role:[{
										type: 'instructor',
										surveys: {},
										stewardship: {
											people:{
												person: []
											}
										},
										leadership: {
											people: {
												person: [{
													first: this._csv[rows][9].split(' ')[0].formalize(),
													last: this._csv[rows][9].split(' ')[1].formalize(),
													email: this._csv[rows][8].toLowerCase().split('@')[0],
													type: 'tgl'
												},{
													first: this._csv[rows][11].split(' ')[0].formalize(),
													last: this._csv[rows][11].split(' ')[1].formalize(),
													email: this._csv[rows][10].toLowerCase().split('@')[0],
													type: 'aim'
												}]
											}
										}
									}]
								}
							}]
						}
					},
					leadership: {
						people: {
							person: [{
								first: this._csv[rows][11].split(' ')[0].formalize(),
								last: this._csv[rows][11].split(' ')[1].formalize(),
								email: this._csv[rows][10].toLowerCase().split('@')[0],
								type: 'aim'
							}]
						}
					}
				}]
			},
			courses: {
				course: this.addCourse(this._csv[rows][8].toLowerCase().split('@')[0])
			}
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
								type: 'aim',
								courses: {
									course: this.addCourse(this._csv[rows][8].toLowerCase().split('@')[0])
								},
								roles: {
									role: [{
										type: 'aim',
										surveys: {},
										stewardship: {
											people:{
												person: []
											}
										},
										leadership: {
											people: {
												person: [{
													first: this._csv[rows][11].split(' ')[0].formalize(),
													last: this._csv[rows][11].split(' ')[1].formalize(),
													email: this._csv[rows][10].toLowerCase().split('@')[0],
													type: 'im'
												}]
											}
										}
									}]
								}
							}]
						}
					},
					leadership: {}
				}]
			},
			courses: {
				course: this.addCourse(this._csv[rows][10].toLowerCase().split('@')[0])
			}
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
									type: 'instructor',
									roles: {
										role: [{
											type: 'instructor',
											surveys: {},
											stewardship: {
												people: {
													person: []
												}
											},
											leadership: {
												people: {
													person: [{
														first: this._csv[rows][13].split(' ')[0].formalize(),
														last: this._csv[rows][13].split(' ')[1].formalize(),
														email: this._csv[rows][12].toLowerCase().split('@')[0],
														type: 'ocr'
													}]
												}
											}
										}]
									},
									courses: {
										course: this.addCourse(this._csv[rows][2].toLowerCase().split('@')[0])
									}
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
				courses: {
					course: this.addCourse(this._csv[rows][12].toLowerCase().split('@')[0])
				}
			};

			// OCRM OBJECT
			ocrm = {
				first: this._csv[rows][15].split(' ')[0].formalize(),
				last: this._csv[rows][15].split(' ')[1].formalize(),
				email: this._csv[rows][14].toLowerCase().split('@')[0],
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
				courses: {
					course: this.addCourse(this._csv[rows][14].toLowerCase().split('@')[0])
				}
			};
		}

		if (ocr != null){
			inst.roles.role[0].leadership.people.person.push({
				first: this._csv[rows][15].split(' ')[0].formalize(),
				last: this._csv[rows][15].split(' ')[1].formalize(),
				email: this._csv[rows][14].toLowerCase().split('@')[0],
				type: 'ocrm'
			},{
				first: this._csv[rows][13].split(' ')[0].formalize(),
				last: this._csv[rows][13].split(' ')[1].formalize(),
				email: this._csv[rows][12].toLowerCase().split('@')[0],
				type: 'ocr'
			});

			// OCR LEADERSHIP
			ocr.roles.role[0].leadership.people.person = [{
				first: this._csv[rows][15].split(' ')[0].formalize(),
				last: this._csv[rows][15].split(' ')[1].formalize(),
				email: this._csv[rows][14].toLowerCase().split('@')[0],
				type: 'ocrm'
			}]
		}

		this.addToOrg(im);
		this.addToOrg(aim);
		this.addToOrg(tgl);
		this.addToOrg(inst);
		if (ocr != null){
			this.addToOrg(ocr);
			this.addToOrg(ocrm);
		}
	}

	// ADD AIM AND OCRM STEWARDSHIP OF STEWARDSHIP
	for (var i = 0; i < this._org.semester.people.person.length; i++) {
		if (this._org.semester.people.person[i].highestrole == 'aim') {
			for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
				if (this._org.semester.people.person[i].roles.role[r].type == 'aim'){
					for (var t = 0; t < this._org.semester.people.person[i].roles.role[r].stewardship.people.person.length; t++) {
						var role = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].type;
						var email = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].email;
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].roles.role[0].stewardship['people'] = {};
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].roles.role[0].stewardship.people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}

		if (this._org.semester.people.person[i].highestrole == 'ocrm') {
			for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
				if (this._org.semester.people.person[i].roles.role[r].type == 'ocrm') {
					for (var t = 0; t < this._org.semester.people.person[i].roles.role[r].stewardship.people.person.length; t++) {
						var role = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].type;
						var email = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].email;
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t]['people'] = {};
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}
	}

	// ADD IM STEWARDSHIP OF STEWARDSHIP
	for (var i = 0; i < this._org.semester.people.person.length; i++) {
		if (this._org.semester.people.person[i].highestrole == 'im') {
			for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
				if (this._org.semester.people.person[i].roles.role[r].type == 'im') {
					for (var a = 0; a < this._org.semester.people.person[i].roles.role[r].stewardship.people.person.length; a++) {
						var role = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[a].type;
						var email = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[a].email;
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[a].roles.role[0].stewardship['people'] = {};
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[a].roles.role[0].stewardship.people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}
	}
}
/**
 * @name addCourse 
 * @description
 */
SemesterSetup.prototype.addCourse = function(email) {
	var course = [];
	var start = 0;
	var idx = 0;
	while (this._csv[start][2] != 'email') {
		start++;
	}

	for (var i = start; i < this._csv.length; i++) {
		if (this._csv[i][2] == email) {
			var pos = 0;
			var duplicate = false;
			
			for (var c = 0; c < course.length; c++) {
				if (course[c].$text == this._csv[i][3]) {
					duplicate = true;
					pos = c;
				}
			}

			if (duplicate) {
				if (this._csv[i][19] == 'TRUE') {
					if (course[pos].pwsection == '') {
						course[pos].pwsection = this._csv[i][5];
					} else {
						course[pos].pwsection += ' ' + this._csv[i][5];
					}
				} else {
					if (course[pos].section == '') {
						course[pos].section = this._csv[i][5];
					} else {
						course[pos].section += ' ' + this._csv[i][5];
					}
				}
			} else {
				course.push({
					id: 1,
					$text: this._csv[i][3],
					credits: this._csv[i][4],
					pilot: this._csv[i][17].toLowerCase(),
					ocr: this._csv[i][18].toLowerCase()
				});

				if (this._csv[i][19] == 'TRUE') {
					course[idx]['pwsection'] = this._csv[i][5];
					course[idx]['section'] = '';
				} else {
					course[idx]['section'] = this._csv[i][5];
					course[idx]['pwsection'] = '';
				}

				idx++;
			}
		}
	}

	return course;
}
/**
 * @name addStewardship 
 * @description
 * @assign Grant
 * @todo 
 *  + Loop through each person in org
 *   + Add stewardship to the person
 */
SemesterSetup.prototype.addStewardship = function(email, role) {
	for (var i = 0; i < this._org.semester.people.person.length; i++) {
		if (this._org.semester.people.person[i].email == email) {
			for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
				if (this._org.semester.people.person[i].roles.role[r].type == role) {
					return this._org.semester.people.person[i].roles.role[r].stewardship.people.person;
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
SemesterSetup.prototype.addToOrg = function(person) {
	if (this._org.semester.people.person.length == 0) {
		this._org.semester.people.person.push(person);
	}
	else {
		for (var i = 0; i < this._org.semester.people.person.length; i++) {
			if (this._org.semester.people.person[i].email == person.email) { // THE PERSON IS ALREADY IN THE ORG
				// CHECK ROLE
				if (this._org.semester.people.person[i].highestrole != person.highestrole) {
					// CHOOSE HIGHEST ROLE
					if (!isGreater(this._org.semester.people.person[i].highestrole, person.highestrole)) {
						this._org.semester.people.person[i].highestrole = person.highestrole;
					}
					// ADD ROLE
					var uniqueRole = true; 
					for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
						if (this._org.semester.people.person[i].roles.role[r].type == person.roles.role[0].type) {
							uniqueRole = false;
						}
					}

					if (uniqueRole) {
						this._org.semester.people.person[i].roles.role.push(person.roles.role[0]);
					}
				} else {
					for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
						// FIND THE ROLE THAT IS SHARED
						if (person.roles.role[r] != undefined && this._org.semester.people.person[i].roles.role[r].type == person.roles.role[r].type) {
							var setSteward = true;
							var setLeader = true;
							if (this._org.semester.people.person[i].roles.role[r].stewardship.people != undefined) {
								for (var s = 0; s < this._org.semester.people.person[i].roles.role[r].stewardship.people.person.length; s++) {
									if (this._org.semester.people.person[i].roles.role[r].stewardship.people.person[s].email == person.roles.role[0].stewardship.people.person[0].email) {
										setSteward = false;
									}
								}

								if (setSteward) {
									this._org.semester.people.person[i].roles.role[r].stewardship.people.person.push(person.roles.role[r].stewardship.people.person[0]);
								}
							}
							if (this._org.semester.people.person[i].roles.role[r].leadership.people != undefined) {
								for (var l = 0; l < this._org.semester.people.person[i].roles.role[r].leadership.people.person.length; l++) {
									if (this._org.semester.people.person[i].roles.role[r].leadership.people.person[l].email == person.roles.role[0].leadership.people.person[0].email) {
										setLeader = false;
									}
								}
								
								if (setLeader) {
									this._org.semester.people.person[i].roles.role[r].leadership.people.person.push(person.roles.role[0].leadership.people.person[0]);
								}
							}
						}
					}
				}
				return;
			}
		}
		this._org.semester.people.person.push(person);
	}
}
/**
 * @name _createRollup
 * @description Creates a new semester rollup section in the rollup file
 * @assign Grant
 */
SemesterSetup.prototype._createRollup = function() {
	console.log('rollup is being created');
	var code = this._org.semester.code;
	var people = this._org.semester.people.person;
	var semester = $('<semesters><semester code="' + code + '"><people></people></semester></semesters>');
	for (var p = 0; p < people.length; p++) {
		for (var r = 0; r < people[p].roles.role.length; r++) {
			var role = people[p].roles.role[r].type;
			if (role != 'instructor' && role != 'ocr' && role != 'ocrm') {
				var person = {
					email: people[p].email,
					type: role,
					questions: {
						question: [{
							name: 'Seek Development Opportunities'
						},{
							name: 'Inspire a Love for Learning'
						},{
							name: 'Develop Relationships with and among Students'
						},{
							name: 'Embrace University Citizenship'
						},{
							name: 'Building Faith in Jesus Christ'
						},{
							name: 'Weekly Hours'
						}]
					}
				}
				semester.find('semester > people').append(byui.createNode('person', person));
			}
		}
	}
	var questions = {
		question: [{
			name: 'Seek Development Opportunities'
		},{
			name: 'Inspire a Love for Learning'
		},{
			name: 'Develop Relationships with and among Students'
		},{
			name: 'Embrace University Citizenship'
		},{
			name: 'Building Faith in Jesus Christ'
		},{
			name: 'Weekly Hours'
		}]
	};
	semester.find('semester').append(byui.createNode('questions', questions));
	
	if (this._isSameSem()) {
		$(this._rollup).find('semesters semester[code="' + code + '"]').remove();
	}

	$(this._rollup).find('semesters').append($(semester).find('semester').clone());
	
	//console.log(this._rollup);
	Sharepoint.postFile(this._rollup, 'master/', 'rollup.xml', function(){});
}
/**
 * @name _createMaster
 * @description Creates a new semester master section in the master file
 * @assign Grant
 */
SemesterSetup.prototype._createMaster = function() {
	console.log('master is being created');
	var newMaster = byui.createNode('semesters', this._org);
	if (this._isSameSem()) {
		$(this._master).find('semesters semester[code="' + this._org.semester.code + '"]').remove();
	}
	$(this._master).find('semesters').append($(newMaster).find('semester').clone());
	//console.log(this._master);
	Sharepoint.postFile(this._master, 'master/', 'master.xml', function(){});
}
/**
 * @name _createIndividualFiles
 * @description Creates a new semester sections in all of the peoples files from the map file
 * @assign Grant
 */
SemesterSetup.prototype._createIndividualFiles = function() {
	console.log('individual files are being created');
	var code = this._org.semester.code;
	var people = this._org.semester.people.person;
	for (var p = 0; p < people.length; p++) {
		var semester = $('<semesters><semester code="' + code + '"><people></people></semester></semesters>');
		var person = byui.createNode('person', people[p]);
		semester.find('semester > people').append(person);
		var xml = ims.sharepoint.getXmlByEmail(people[p].email);
		if (xml != null) {
			if (this._isSameSem()) {
				$(xml).find('semesters semester[code="' + code + '"]').remove();
			}
			$(xml).find('semesters').append($(semester).find('semester').clone());
		} else {
			xml = $.parseXML((new XMLSerializer()).serializeToString(semester[0]));
		}
		//console.log(xml);
		Sharepoint.postFile(xml, 'master/', people[p].email + '.xml', function(){});
	}
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