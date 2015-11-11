


// GROUP CSV
/**
 * CSV Object
 */
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
 * @param  {Object}   file     Contains the selected file
 * @param  {Function} callback callbacks the csv data
 */
CSV.prototype.readFile = function(file, callback){
	console.log('retrieving data form csv');
	var reader = new FileReader();

	reader.onload = function(e) {
	  var text = reader.result;
	  text = text.replace(/@byui.edu/g, '');
	  csv = Papa.parse(text);
	  callback(csv);
	}
	reader.readAsText(file, 'utf8');
}

/**
 * DOWNLOAD A STRING AS A CSV
 * @param  {String} csvString CSV in string form
 */
CSV.downloadCSV = function(csvString){
	console.log('CSV downloaded')
}
// GROUP CSV END