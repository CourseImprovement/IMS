function Tool(file, left, right, course) {
	this.file = file;
	this.left = left.toLowerCase();
	this.right = right.toLowerCase();
	this.course = course;
}

/**
 * @name getColumn 
 * @description
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
 * @name parse 
 * @description
 */
Tool.prototype.parse = function() {
	var csv = new CSV();
	csv.readFile(this.file, function(csv) {
		var rows = csv.data;
		var l = this.getColumn(this.left);
		var r = this.getColumn(this.right);

		for (var i = 0; i < rows.length; i++) {
			if (l == 0) {

			} else {

			}

			if (r == 0) {

			} else {

			}
		}
	});
}