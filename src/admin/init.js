//  GROUP IMS
/**
 * [ims description]
 * @type {Object}
 */
window.ims = {};
ims.url = {};
ims.url._base = window.location.protocol + '//' + window.location.hostname + '/sites/onlineinstructionreporting/';
ims.url.relativeBase = '/sites/onlineinstructionreporting/';
ims.url.base = ims.url._base + 'instructor%20Reporting/';
ims.url.api = ims.url._base + '_api/';
ims.url.site = ims.url._base; 
/**
 * UI loading class
 * @type {Object}
 * @namespace ims.loading
 * @memberOf ims
 */
ims.loading = {
	/**
	 * Set the percentage of loading bar
	 * @param {integer} percent A number between 0 and 100
	 * @function
	 * @memberOf ims.loading
	 */
	set: function(percent){
		$('.bar').css({width: percent + '%'});
	},
	/**
	 * Resets the loading bar
	 * @function
	 * @memberOf ims.loading
	 */
	reset: function(){
		$('.bar').css({width: 0});
	}
}
// GROUP IMS END



// GROUP SHAREPOINT 
/**
 * [Sharepoint description]
 * @type {Object}
 */
var Sharepoint = {
	getFile: function(url, callback, err){
		$.get(url, function(map){
			callback(map);
		}).fail(function(a, b, c){
			if (err) err(a, b, c);
		})
	},
	postFile: function(str, path, fileName, callback){
		var buffer = (new XMLSerializer()).serializeToString(str);
		$.ajax({
		    url: ims.url.api + "contextinfo",
		    header: {
		        "accept": "application/json; odata=verbose",
		        "content-type": "application/json;odata=verbose"
		    },
		    type: "POST",
		    contentType: "application/json;charset=utf-8"
		}).done(function(d){
			var url = ims.url.api + "Web/GetFolderByServerRelativeUrl('" + ims.url.relativeBase + "Instructor%20Reporting/" + path + "')/Files/add(overwrite=true, url='" + fileName + "')";
			jQuery.ajax({
		        url: url,
		        type: "POST",
		        data: buffer,
		        processData: false,
		        headers: {
		            "accept": "application/json;odata=verbose",
		            "X-RequestDigest": $(d).find('d\\:FormDigestValue, FormDigestValue').text()
		        },
		        success: function(){
		        	if (Sharepoint.total != 0){
		        		ims.loading.set(Math.floor((++Sharepoint.current / Sharepoint.total) * 100));
		        	}
		        	callback();	
		        },
		        error: function(){
		        	alert("Error saving");
		        }
		    });
		});
	},
	total: 0,
	current: 0
}
// GROUP SHAREPOINT END


/**
 * Replace xml characters with encoded xml characters
 * @return {[type]} [description]
 */
String.prototype.encodeXML = function(){
	if (this == undefined) return "";
	return this.replace(/&/g, '&amp;')
       		  .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
}