


/**
 * @start CSV
 */
/**
 * @name CSV
 * @description CSV Object
 */
function CSV(){
	console.log('new CSV object created');
	this._data = null;
}
/**
 * @name getData
 * @description Get the CSV's data in array form
 * @assign Grant
 * @todo 
 *  - Return the data
 */
CSV.prototype.getData = function(){
	console.log('return CSV data');
}
/**
 * @name readFile
 * @description Read the CSV into _data
 * @assign Grant
 * @todo
 *  + Create a new fileReader
 *  + Convert the file into an object
 *  + Callback the csv object
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
 * @name downloadCSV
 * @description Download a string as a CSV
 * @assign Grant
 * @todo
 *  - Check that the proper characters have been encoded
 *  - Save the file
 */
CSV.downloadCSV = function(csvString){
	console.log('CSV downloaded')
}
/**
 * @end
 */