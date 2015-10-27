/**
 * Sharepoint items
 * @namespace ims.sharepoint
 * @memberOf ims
 * @type {Object}
 */
ims.sharepoint = {
	/**
	 * The base url for the api calls
	 * @type {String}
	 * @memberOf ims.sharepoint
	 */
	base: '../',
	/**
	 * The relative base for the api calls
	 * @type {String}
	 * @memberOf ims.sharepoint
	 */
	relativeBase: window.location.pathname.split('Shared%20Documents/index.aspx')[0],
	/**
	 * Make a Sharepoint post request. This is most commly used when a file is being posted 
	 * to the sharepoint server.
	 * @param  {string}   hostUrl     base url of post request
	 * @param  {string}   restCommand rest command
	 * @param  {Object}   data        JSON object
	 * @param  {Function} callback    callback function
	 * @return {string}               In the callback, the first arg is a string
	 * @memberOf ims.sharepoint
	 * @function
	 */
	makePostRequest: function(hostUrl, restCommand, data, callback) {
    var executor = new SP.RequestExecutor(hostUrl);
    var info = {
      'url': restCommand,
      'method': "POST",
      'data': JSON.stringify(data),
      'success': callback
    };  
    executor.executeAsync(info);
	},	
	/**
	 * Get the survey configuration file. This file houses all the configurations for the surveys.
	 * @return {XMLDocument} Usually we use JQuery to filter down through the document
	 */
	getSurveyConfig: function(){
		var url = ims.sharepoint.base + 'Instructor%20Reporting/config/config.xml';
		var doc = null;
		$['ajax']({
	    'url': url,
	    'success': function(d) {
	      doc = d;
	    },
	    'async': false
	  });
	  return doc;
	},
	/**
	 * Posts the current user xml file.
	 * @return {null} Nothing is returned
	 * @function
	 * @memberOf ims.sharepoint
	 */
	postCurrentFile: function(){
		function str2ab(str) {
			// new TextDecoder(encoding).decode(uint8array);
		  return new TextEncoder('utf8').encode(str);
		}

		var role = ims.current.getRole();
		var sem = ims.current.getCurrentSemester();

		var buffer = str2ab(ims.globals.person.doc.firstChild.outerHTML);

		var fileName = ims.current.getEmail() + '.xml';
		var url = ims.sharepoint.base + "_api/Web/GetFolderByServerRelativeUrl('" + ims.sharepoint.relativeBase + "Instructor%20Reporting/Master')/Files/add(overwrite=true, url='" + fileName + "')";
    $['ajax']({
		    'url': ims.sharepoint.base + "_api/contextinfo",
		    'header': {
		        "accept": "application/json; odata=verbose",
		        "content-type": "application/json;odata=verbose"
		    },
		    'type': "POST",
		    'contentType': "application/json;charset=utf-8"
		}).done(function(d) {
			jQuery['ajax']({
	        'url': url,
	        'type': "POST",
	        'data': buffer,
	        'processData': false,
	        'headers': {
	            "accept": "application/json;odata=verbose",
	            "X-RequestDigest": $(d).find('d\\:FormDigestValue, FormDigestValue').text()
	        },
	        'success': function(){
	        	
	        }
	    });
		});
	},
	/**
	 * Marks a certain users survey as reviewed.
	 * @param  {string} id       The ID of the survey
	 * @param  {string} email    The first part of the email address
	 * @param  {Boolean} reviewed If the survey has been reviewed or not
	 * @return {null}          Nothing is returned
	 * @function
	 * @memberOf ims.sharepoint
	 */
	markAsReviewed: function(id, email, reviewed){

		function str2ab(str) {
			// new TextDecoder(encoding).decode(uint8array);
		  return new TextEncoder('utf8').encode(str);
		}

		var role = ims.current.getRole();
		var sem = ims.current.getCurrentSemester();
		if (role == 'AIM'){
			var doc = $(ims.globals.tgls[email]).find('semester[code=' + sem + '] survey[id=' + id + ']').attr('reviewed', reviewed ? 'true' : 'false');

			var buffer = str2ab($(doc).closest('semesters')[0].outerHTML);

			var fileName = email + '.xml';
			var url = ims.sharepoint.base + "_api/Web/GetFolderByServerRelativeUrl('" + ims.sharepoint.relativeBase + "Instructor%20Reporting/Master')/Files/add(overwrite=true, url='" + fileName + "')";
	    $['ajax']({
			    'url': ims.sharepoint.base + "_api/contextinfo",
			    'header': {
			        "accept": "application/json; odata=verbose",
			        "content-type": "application/json;odata=verbose"
			    },
			    'type': "POST",
			    'contentType': "application/json;charset=utf-8"
			}).done(function(d) {
				jQuery.ajax({
		        'url': url,
		        'type': "POST",
		        'data': buffer,
		        'processData': false,
		        'headers': {
		            "accept": "application/json;odata=verbose",
		            "X-RequestDigest": $(d).find('d\\:FormDigestValue, FormDigestValue').text()
		        },
		        'success': function(){
		        	
		        }
		    });
			});
		}
		else if (role == 'TGL'){
			var doc = $(ims.globals.instructors[email]).find('semester[code=' + sem + '] survey[id=' + id + ']').attr('reviewed', reviewed ? 'true' : 'false');

			var buffer = str2ab($(doc).closest('semesters')[0].outerHTML);

			var fileName = email + '.xml';
			var url = ims.sharepoint.base + "_api/Web/GetFolderByServerRelativeUrl('" + ims.sharepoint.relativeBase + "Instructor%20Reporting/Master')/Files/add(overwrite=true, url='" + fileName + "')";
	    $['ajax']({
			    'url': ims.sharepoint.base + "_api/contextinfo",
			    'header': {
			        "accept": "application/json; odata=verbose",
			        "content-type": "application/json;odata=verbose"
			    },
			    'type': "POST",
			    'contentType': "application/json;charset=utf-8"
			}).done(function(d) {
				jQuery.ajax({
		        'url': url,
		        'type': "POST",
		        'data': buffer,
		        'processData': false,
		        'headers': {
		            "accept": "application/json;odata=verbose",
		            "X-RequestDigest": $(d).find('d\\:FormDigestValue, FormDigestValue').text()
		        },
		        'success': function(){
		        	
		        }
		    });
			});
		}
	},
	/**
	 * Get the semester configuration file. This file allows for us to see which semester is the current semester.
	 *
	 * <pre><code>
	 *  var currentSemester = $(ims.sharepoint.getSemesterConfiguration()).find('[current=true]').attr('name');
	 * </code></pre>
	 *
	 * 
	 * @return {XMLDocument} Use JQuery to find the current semester
	 * @function
	 * @memberOf ims.sharepoint
	 */
	getSemesterConfig: function(){
		var url = ims.sharepoint.base + 'Instructor%20Reporting/config/semesters.xml';
		var doc = null;
		$['ajax']({
	    'url': url,
	    'success': function(d) {
	      doc = d;
	    },
	    'async': false
	  });
	  return doc;
	},	
	/**
	 * Get a XML file for a given user by email address.
	 * @param  {string} email The first part of the users given email address
	 * @return {XMLDocument}       Use JQuery to find the current users document
	 * @function
	 * @memberOf ims.sharepoint
	 */
	getXmlByEmail: function(email){
		var url = ims.sharepoint.base + 'Instructor%20Reporting/Master/' + email + '.xml'
		var doc = null;
		$['ajax']({
	    'url': url,
	    'success': function(d) {
	      doc = d;
	    },
	    'error': function(a, b, c){
	    	if (a && a.responseText && a.responseText.indexOf('404') > -1){
	    		doc = null;
	    	}	
	    	else if (c && c.message.indexOf('Invalid XML') > -1){
	    		var out = '';
					for (var i = 0; i < a.responseText.length; i++){
						if (i % 2 == 0){
							out += a.responseText[i];
						}
					}
					doc = $['parseXML'](a.responseText);
	    	}
	    },
	    'async': false
	  });
	  return doc;
	},
	/**
	 * Send an Email from Sharepoint
	 * @param  {String} from    The from email address
	 * @param  {String} to      The to email address
	 * @param  {String} body    The body of the email
	 * @param  {String} subject The subject of the email
	 */
	sendEmail: function(from, to, body, subject, callback) {
		body = ims.data.cleanEmail(body);
		$['ajax']({
		    'url': ims.sharepoint.base + "_api/contextinfo",
		    'header': {
		        "accept": "application/json; odata=verbose",
		        "content-type": "application/json;odata=verbose"
		    },
		    'type': "POST",
		    'contentType': "application/json;charset=utf-8"
		}).done(function(d) {
			//Get the relative url of the site
			//http://sharepoint.stackexchange.com/questions/150833/sp-utilities-utility-sendemail-with-additional-headers-javascript
			//https://codeplayandlearn.wordpress.com/2015/07/11/send-email-through-rest-api-in-sharepoint/
	    var urlTemplate = ims.sharepoint.base + "_api/SP.Utilities.Utility.SendEmail";
	    $.ajax({
	        contentType: 'application/json',
	        url: urlTemplate,
	        type: "POST",
	        data: JSON.stringify({
	            'properties': {
	                '__metadata': {
	                    'type': 'SP.Utilities.EmailProperties'
	                },
	                'From': from,
	                'To': {
	                    'results': [to]
	                },
	                'Body': body,
	                'Subject': subject,
	                "AdditionalHeaders":
	                {
	                	"__metadata":
	                    {"type":"Collection(SP.KeyValue)"},
	                    "results":
	                    [ 
	                        {               
	                            "__metadata": {
	                            "type": 'SP.KeyValue'
	                        },
	                            "Key": "Test-Field",
	                            "Value": 'willdenc@byui.edu',
	                            "ValueType": "Edm.String"
	                       },
	                       {               
	                            "__metadata": {
	                            "type": 'SP.KeyValue'
	                        },
	                            "Key": "Reply-To",
	                            "Value": 'willdenc@byui.edu',
	                            "ValueType": "Edm.String"
	                       }
	                    ]
	                }
	            }
	        }),
	        headers: {
	            "Accept": "application/json;odata=verbose",
	            "content-type": "application/json;odata=verbose",
	            "X-RequestDigest": $(d).find('d\\:FormDigestValue, FormDigestValue').text()
	        },
	        success: function(data) {
	            callback(data);
	        },
	        error: function(err) {
	            callback('Error in sending Email: ' + JSON.stringify(err));
	        }
	      });	
		});
	}
};
