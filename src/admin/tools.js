/**
 * @name Tool 
 * @description This tool is meant to parse the OSM semester setup report
 * @assign Grant
 */
function Tool(file, recipient, course) {
	this.file = file;
	this.recipient = recipient.toLowerCase();
	this.course = course;
	this.set = this.getColumnSet(this.recipient);
	this.csv = [];
}

/**
 * @name getColumnSet 
 * @description Returns the first column associated with the role
 * @assign Grant
 * @todo 
 *  + Compare the role
 *   + Return the proper role column location
 */
Tool.prototype.getColumnSet = function(role) {
	var list = [];

	switch (role) {
		case 'instructor': {
			list = [0,6,9,12,15];
			break;
		}
		case 'tgl': {
			list = [6,9,12,0];
			break;
		}
		case 'aim': {
			list = [9,12,6,0];
			break;
		}
		case 'im': {
			list = [12,9,6,0];
			break;
		}
		case 'ocr': {
			list = [15,0];
			break;
		}
		case 'ocrm': {
			list = [18,15,0];
			break;
		}
	}

	if (this.course) {
		list.splice(1,0,4);
		list.splice(1,0,3);
	}

	return list;
}

/**
 * @name contains 
 * @description Checks if the recipient/right combination is already present
 * @assign Grant
 * @todo 
 *  + Go through each line in the csv
 *   + Check if course is a factor
 *    + Yes: verify that the course and person are unique
 *     + Return true if true
 *    + No: Check that the person is unique
 *     + Return true if true
 *  + If the personif not there return false
 */
Tool.prototype.contains = function(str) {
	for (var i = 0; i < this.csv.length; i++) {
		if (this.course){
			var newStr = str.split(',');
			var newCsv = this.csv[i].split(',');

			if (newStr[3] == newCsv[3] && newStr[2] == newCsv[2]) {
				var credits = parseInt(newCsv[4]) + parseInt(newStr[4]);

				newCsv[4] = credits;
				this.csv[i] = newCsv.join(',');

				return true;
			}
		} else {
			if (str == this.csv[i]) {
				return true;
			}
		}
	}
	return false;
}

/**
 * @name getRow
 * @description gets a row from the csv using the recipient and right roles as parameters
 * @assign Grant
 * @todo 
 *  + Find the locations of the recipient and right side
 *  + Is the recipient or right an Instructor?
 *   + Yes
 *    + Get the email, first name, and last name from the csv
 *    + Get course if nescessary
 *    + Create a new string from the    data
 *   + No
 *    + Get the email
 *    + Parse the first and last name from the csv
 *    + Create a new string from the data
 *  + Repeat above steps for both recipient and right
 */
Tool.prototype.getRow = function(row) {
	var line = '';
	
	if (this.recipient == 'instructor' && row[2].toLowerCase() == row[6].toLowerCase()) {
		var newSet = null;
		
		if (this.course) {
			newSet = [0,3,4,9];
		} else {
			newSet = [0,9];
		}

		for (var i = 0; i < newSet.length; i++) {
			if (row[newSet[i]] != "") {
				line += this.getNameInformation(newSet[i], row) + (i < newSet.length - 1 ? ',' : ''); 
			}
		}
	} else {
		for (var i = 0; i < this.set.length; i++) {
			if (row[this.set[i]] != "") {
				line += this.getNameInformation(this.set[i], row) + (i < this.set.length - 1 ? ',' : ''); 
			}
		}
	}

	if (this.recipient == 'tgl') {
		var newSet = [9,6];
		var newLine = '';
		
		for (var i = 0; i < newSet.length; i++) {
			if (row[this.set[i]] != "") {
				newLine += this.getNameInformation(newSet[i], row) + (i < newSet.length - 1 ? ',,,,,,,' : ''); 
			}
		}

		if (!this.contains(newLine)) {
			this.csv.push(newLine);
		}
	}

	return line;
}

/**
 * @name getNameInformation 
 * @description Gathers the first name, last name, and email of a row given an index
 * @assign Grant
 * @todo
 *  + Check if the index belongs to a course, instructor, or some other leader
 *  + Return the first name, last name, and email as a string
 */
Tool.prototype.getNameInformation = function(idx, row) {
	if (idx == 0) {
		return row[idx] + ',' + row[idx + 1] + ',' + row[idx + 2].toLowerCase() + '@byui.edu';
	} else if (idx == 3 || idx == 4) {
		return row[idx];
	} else {
		return row[idx + 1] + ',' + row[idx + 2] + ',' + row[idx].toLowerCase() + '@byui.edu';
	}
}

/**
 * @name getTitleRow 
 * @description Get the heading for each column that will be used
 * @assign Grant
 * @todo
 */
Tool.prototype.getTitleRow = function() {
	var title = 'FirstName,LastName,PrimaryEmail,';
	if (this.course) {
		title += 'course,CreditHours,';
	}
	switch (this.recipient) {
		case 'instructor': return title += 'TGLFirstName,TGLLastName,TGLEmail,AIMFirstName,AIMLastName,AIMEmail,IMFirstName,IMLastName,IMEmail,OCRFirstName,OCRLastName,OCREmail';
		case 'tgl': return title += 'AIMFirstName,AIMLastName,AIMEmail,IMFirstName,IMLastName,IMEmail,InstructorFirstName,InstructorLastName,InstructorEmail';
		case 'aim': return title += 'IMFirstName,IMLastName,IMEmail,TGLFirstName,TGLLastName,TGLEmail,InstructorFirstName,InstructorLastName,InstructorEmail';
		case 'im': return title += 'AIMFirstName,AIMLastName,AIMEmail,TGLFirstName,TGLLastName,TGLEmail,InstructorFirstName,InstructorLastName,InstructorEmail';
		case 'ocr': return title += 'OCRMFirstName,OCRMLastName,OCRMEmail,InstructorFirstName,InstructorLastName,InstructorEmail';
		case 'ocrm': return title += 'OCRFirstName,OCRLastName,OCREmail,InstructorFirstName,InstructorLastName,InstructorEmail';
	}
}

/**
 * @name parse 
 * @description parses the csv into a new csv and downloads it to your computer
 * @assign Grant
 * @todo
 *  + Create a new CSV()
 *  + Get name of the recipient and right side
 *  + Begin the new csv file as an array with titles for each column
 *  + Go through each line of the csv
 *   + Add people that are not already contained
 *  + Download the new csv
 *   + Join the csv array
 *   + Name the file using the recipient and right role names
 */
Tool.prototype.parse = function() {
	var csv = new CSV();
	var recipient = (this.recipient.length > 7 ? 'Instructor' : this.recipient.toUpperCase());
	var _this = this;

	csv.readFile(this.file, function(csv) {
		var rows = csv.data;

		_this.csv.push(_this.getTitleRow());
		
		for (var i = 4; i < rows.length; i++) {
			if (rows[i].length < 3) continue;

			var row = _this.getRow(rows[i]);

			if (!_this.contains(row)) {
				_this.csv.push(row);
			}
		}

		var a      = document.createElement('a');

		a.href     = 'data:attachment/csv,' + _this.csv.join('%0A');
		a.target   = '_blank';
		a.download = recipient + '_evaluation.csv';
		document.body.appendChild(a);
		a.click();
	});
}