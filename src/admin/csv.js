// GROUP CSV
function CSV(){
	console.log('new CSV object created');
	this._data = null;
}

/**
 * GET THE CSV'S DATA IN ARRAY FORM
 */
CSV.prototype.getData = function(){
	console.log('return CSV data');
}

/**
 * READ THE CSV INTO _DATA
 */
CSV.prototype.readFile = function(file, callback){
	console.log('retrieving data form csv');
	var reader = new FileReader();

	reader.onload = function(e) {
	  var text = reader.result;
	  csv = Papa.parse(text);
	  callback(csv);
	}
	reader.readAsText(file, 'utf8');
}

/**
 * DOWNLOAD A STRING AS A CSV
 */
CSV.downloadCSV = function(csvString){
	console.log('CSV downloaded')
}
// GROUP CSV END