/**
 * @name Tool 
 * @description This tool is meant to parse the OSM semester setup report
 * @assign Grant
 */
function Tool(file, left, right, course) {
	this.file = file;
	this.left = left.toLowerCase();
	this.right = right.toLowerCase();
	this.course = course;
	this.csv = [];
}

/**
 * @name getColumn 
 * @description Returns the first column associated with the role
 * @assign Grant
 * @todo 
 *  + Compare the role
 *   + Return the proper role column location
 */
Tool.prototype.getColumn = function(role) {
	switch (role) {
		case 'instructor': return 0;
		case 'tgl': return 6;
		case 'aim': return 8;
		case 'im': return 10;
		case 'ocr': return 12;
		case 'ocrm': return 14;
	}
}

/**
 * @name contains 
 * @description Checks if the left/right combination is already present
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
		if (this.course != null){
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
 * @description gets a row from the csv using the left and right roles as parameters
 * @assign Grant
 * @todo 
 *  + Find the locations of the left and right side
 *  + Is the left or right an Instructor?
 *   + Yes
 *    + Get the email, first name, and last name from the csv
 *    + Get course if nescessary
 *    + Create a new string from the data
 *   + No
 *    + Get the email
 *    + Parse the first and last name from the csv
 *    + Create a new string from the data
 *  + Repeat above steps for both left and right
 */
Tool.prototype.getRow = function(row) {
	var line = '';
	var l = this.getColumn(this.left);
	var r = this.getColumn(this.right);

	if (l == 0) {
		var email = row[l + 2].toLowerCase() + '@byui.edu';

		line += row[l].formalize() + ',' + row[l + 1].formalize() + ',' + email + ',';

		if (this.course != null) {
			line += row[3] + ',' + row[4] + ',';
		}
	} else {
		var email = row[l].toLowerCase() + '@byui.edu';
		var first = row[l + 1].split(' ')[0].formalize();
		var last = row[l + 1].split(' ')[1].formalize();

		line += first + ',' + last + ',' + email + ',';

		if (this.course != null) {
			line += row[3] + ',' + row[4] + ',';
		}
	}

	if (r == 0) {
		var email = row[r + 2].toLowerCase() + '@byui.edu';

		line += row[r].formalize() + ',' + row[r + 1].formalize() + ',' + email + ',';
	} else {
		var email = row[r].toLowerCase() + '@byui.edu';
		var first = row[r + 1].split(' ')[0].formalize();
		var last = row[r + 1].split(' ')[1].formalize();

		line += first + ',' + last + ',' + email + ',';
	}

	var parts = line.split(','); // Test if they are apart of their own group

	if (this.course != null) { // Is the course needed
		if (parts[2] == parts[7]) { 
			if (l > r) {
				parts[0] = row[9].split(' ')[0].formalize();
				parts[1] = row[9].split(' ')[1].formalize();
				parts[2] = row[8].toLowerCase() + '@byui.edu';
			} else {
				parts[5] = row[9].split(' ')[0].formalize();
				parts[6] = row[9].split(' ')[1].formalize();
				parts[7] = row[8].toLowerCase() + '@byui.edu';
			}

			line = parts.join(',');
		}
	} else {
		if (parts[2] == parts[5]) { 
			if (l > r) {
				parts[0] = row[9].split(' ')[0].formalize();
				parts[1] = row[9].split(' ')[1].formalize();
				parts[2] = row[8].toLowerCase() + '@byui.edu';
			} else {
				parts[4] = row[9].split(' ')[0].formalize();
				parts[6] = row[9].split(' ')[1].formalize();
				parts[5] = row[8].toLowerCase() + '@byui.edu';
			}

			line = parts.join(',');
		}
	}

	return line;
}

/**
 * @name parse 
 * @description parses the csv into a new csv and downloads it to your computer
 * @assign Grant
 * @todo
 *  + Create a new CSV()
 *  + Get name of the left and right side
 *  + Begin the new csv file as an array with titles for each column
 *  + Go through each line of the csv
 *   + Add people that are not already contained
 *  + Download the new csv
 *   + Join the csv array
 *   + Name the file using the left and right role names
 */
Tool.prototype.parse = function() {
	var csv = new CSV();
	var right = (this.right.length > 7 ? 'Instructor' : this.right.toUpperCase());
	var left = (this.left.length > 7 ? 'Instructor' : this.left.toUpperCase());
	var _this = this;

	csv.readFile(this.file, function(csv) {
		var rows = csv.data;

		if (_this.course != null) {
			_this.csv.push('FirstName,LastName,PrimaryEmail,course,CreditHours,' + right + 'FirstName,' + right + 'LastName,' + right + 'Email');
		} else {
			_this.csv.push('FirstName,LastName,PrimaryEmail,' + right + 'FirstName,' + right + 'LastName,' + right + 'Email');	
		}
		
		for (var i = 4; i < rows.length; i++) {
			if (rows[i].length < 3) continue;

			var row = _this.getRow(rows[i]);

			if (!_this.contains(row)) {
				_this.csv.push(row);
			}
		}

		var a         = document.createElement('a');

		a.href        = 'data:attachment/csv,' + _this.csv.join('%0A');
		a.target      = '_blank';
		a.download    = left + '_' + right + '.csv';
		document.body.appendChild(a);
		a.click();
	});
}