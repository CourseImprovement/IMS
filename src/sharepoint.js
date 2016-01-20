/**
 * @name ims.sharepoint
 * @description Sharepoint items
 */
ims.sharepoint = {
	/**
	 * @name ims.sharepoint.base
	 * @description The base url for the api calls
	 */
	base: '../',
	/**
	 * @name ims.sharepoint.relativeBase
	 * @description The relative base for the api calls
	 */
	relativeBase: window.location.pathname.split('Shared%20Documents/index.aspx')[0],
	/**
	 * @name ims.sharepoint.makePostRequest
	 * @description Make a Sharepoint post request. This is most commly used when a file is being posted 
	 * to the sharepoint server.
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
	 * @name ims.sharepoint.redirectToLoggedInUser 
	 * @description
	 */
	redirectToLoggedInUser: function(err, success){
		$.ajax({
	    url: ims.sharepoint.base + '_api/Web/CurrentUser/Email',
	    success: function(userXml) {
	      var email = $(userXml).text();
	      email = email.indexOf('@') > -1 ? email.split('@')[0] : email;
	      var file = ims.sharepoint.getXmlByEmail(email);
	      if (!file){
	      	err();
	      }
	      else{
	      	success(email);
	      }
	    }
	  });
	},
	/**
	 * @name ims.sharepoint.getLoggedInUserEmail 
	 * @description
	 */
	getLoggedInUserEmail: function(callback){
		if (!window._loggedUser){
			$.ajax({
		    url: ims.sharepoint.base + '_api/Web/CurrentUser/Email',
		    success: function(userXml) {
		      var email = $(userXml).text();
		      email = email.indexOf('@') > -1 ? email.split('@')[0] : email;
		      window._loggedUser = email;
		      callback(email);
		    }
		  });
		}
		callback(window._loggedUser);
	},
	/**
	 * @name ims.sharepoint.getSurveyConfig
	 * @description Get the survey configuration file. This file houses all the configurations for the surveys.
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
	 * @name ims.sharepoint.postCurrentFile
	 * @description Posts the current user xml file.
	 */
	postCurrentFile: function(){
		function str2ab(str) {
			// new TextDecoder(encoding).decode(uint8array);
		  return new TextEncoder('utf8').encode(str);
		}

		var u = User.getCurrent();
		var buffer = str2ab((new XMLSerializer()).serializeToString(_baseUserXml));

		var fileName = u.getEmail() + '.xml';
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
	 * @name ims.sharepoint.postFile 
	 * @description
	 */
	postFile: function(u){
		function str2ab(str) {
			// new TextDecoder(encoding).decode(uint8array);
		  return new TextEncoder('utf8').encode(str);
		}
		
		var buffer = str2ab((new XMLSerializer()).serializeToString(_baseUserXml));

		var fileName = User.getCurrent().getEmail() + '.xml';
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
		    })
		});
	},
	/**
	 * @name ims.sharepoint.markAsReviewed
	 * @description Marks a certain users survey as reviewed.
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

			var buffer = str2ab($(doc).parents('semesters')[0].outerHTML);

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

			var buffer = str2ab($(doc).parents('semesters')[0].outerHTML);

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
	 * @name ims.sharepoint.getXmlByEmail
	 * @description Get a XML file for a given user by email address.
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
	}
};
