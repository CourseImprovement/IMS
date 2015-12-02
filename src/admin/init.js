//  GROUP IMS
/**
 * IMS Object
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
 * Sharepoint rest api calls
 * @type {Object}
 */
var Sharepoint = {
	/**
	 * Retrieves file from sharepoint
	 * @param  {String}   url      Location of the file in sharepoint
	 * @param  {Function} callback Callback the file
	 * @param  {Object}   err      Notifies of an error
	 */
	getFile: function(url, callback, err){
		$.get(url, function(map){
			callback(map);
		}).fail(function(a, b, c){
			if (err) err(a, b, c);
		})
	},
	/**
	 * Posts a file to sharepoint
	 * @param  {String}   str      The file in string form
	 * @param  {String}   path     Destination of the file
	 * @param  {String}   fileName Name of the file
	 * @param  {Function} callback Successful or unsuccessful post
	 */
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
	current: 0,
	query: function(txt){
		$.ajax({
		    url: ims.url.api + "contextinfo",
		    header: {
		        "accept": "application/json; odata=verbose",
		        "content-type": "application/json;odata=verbose"
		    },
		    type: "POST",
		    contentType: "application/json;charset=utf-8"
		}).done(function(d){
			var url = 'https://webmailbyui.sharepoint.com/sites/onlineinstructionreporting/onlineinstructionreportingdev/_vti_bin/client.svc/ProcessQuery';
			var xml = $('<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="Javascript Library"><Actions><StaticMethod TypeId="{de2db963-8bab-4fb4-8a58-611aebc5254b}" Name="ClientPeoplePickerSearchUser" Id="0"><Parameters><Parameter TypeId="{ac9358c6-e9b1-4514-bf6e-106acbfb19ce}"><Property Name="AllowEmailAddresses" Type="Boolean">false</Property><Property Name="AllowMultipleEntities" Type="Boolean">true</Property><Property Name="AllowOnlyEmailAddresses" Type="Boolean">false</Property><Property Name="AllUrlZones" Type="Boolean">false</Property><Property Name="EnabledClaimProviders" Type="Null" /><Property Name="ForceClaims" Type="Boolean">false</Property><Property Name="MaximumEntitySuggestions" Type="Number">30</Property><Property Name="PrincipalSource" Type="Number">15</Property><Property Name="PrincipalType" Type="Number">5</Property><Property Name="QueryString" Type="String">sher</Property><Property Name="Required" Type="Boolean">true</Property><Property Name="SharePointGroupID" Type="Number">0</Property><Property Name="UrlZone" Type="Number">0</Property><Property Name="UrlZoneSpecified" Type="Boolean">false</Property><Property Name="Web" Type="Null" /><Property Name="WebApplicationID" Type="String">{00000000-0000-0000-0000-000000000000}</Property></Parameter></Parameters></StaticMethod></Actions><ObjectPaths /></Request>');
			$(xml).find('Property[name=QueryString]').text(txt);
			var buffer = (new XMLSerializer()).serializeToString($(xml)[0]);
			$.ajax({
				url: url,
        type: "POST",
        data: buffer,
        headers: {
            "accept": "*/*",
            "X-RequestDigest": $(d).find('d\\:FormDigestValue, FormDigestValue').text(),
            "X-Requested-With": 'XMLHttpRequest',
            "Content-Type": 'text/xml'
        },
        success: function(data){
        	console.log(data);
        },
        error: function(){
        	alert("Error saving");
        }
			})
		});
	}
}

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
	 * Get the file items, used in permissions
	 * @param  {[type]}   fileName [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	getFileItems: function(fileName, callback){
		var allItemFiles = ims.url._base + 	"_api/Web/GetFileByServerRelativeUrl('" + ims.url.relativeBase + "Instructor%20Reporting/Master/" + fileName + ".xml')/ListItemAllFields";
		$.get(allItemFiles, callback);
	},
	/**
	 * Get the site users, used in permissions
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	getSiteUsers: function(callback){
		$.get(ims.url._base + '_api/Web/siteUsers', callback);
	},
	/**
	 * Get the role ids
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	getRoles: function(callback){
		$.get(ims.url._base + '_api/Web/roledefinitions', function(xml){
			var result = {};
			$(xml).find('properties Name, m\\:properties d\\:Name').each(function(){
				result[$(this).text()] = $(this).prev().text();
			})

			callback(result);
		});
	},
	/**
	 * Posts the current user xml file.
	 * @return {null} Nothing is returned
	 * @function
	 * @memberOf ims.sharepoint
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
		    });
		});
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
	getPermissionsXml: function(){
		var url = ims.sharepoint.base + 'Instructor%20Reporting/config/permissions.xml';
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
		var url = ims.sharepoint.base + 'Instructor%20Reporting/Master/' + email + '.xml';
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

Array.prototype.sum = function(){
	if (this == undefined) return false;
	var sum = 0;
	for (var i = 0; i < this.length; i++){
		if (Number.isFloat(this[i])){
			sum += this[i];
		}
	}
	return sum;
}

Number.isInt = function(n){
    return Number(n) === n && n % 1 === 0;
}

Number.isFloat = function(n){
    return n === Number(n) && n % 1 !== 0;
}



function changeAll(){
	var master = ims.sharepoint.getXmlByEmail('master');

	$(master).find('person[highestrole=aim]').each(function(){
		var people = $(this).find('roles > role[type=aim] > stewardship > people > person');
		$(this).find('roles > role[type=tgl] > stewardship').remove();
		$(this).find('roles > role[type=tgl]').append('<stewardship><people></people></stewardship>');
		for (var i = 0; i < people.length; i++){
			var person = people[i];
			$(this).find('roles > role[type=tgl] > stewardship > people')
				.append('<person first="' + $(person).attr('first') + '" last="' + $(person).attr('last') + '" email="' + $(person).attr('email') + '" type="instructor"></person>');
		}
	})

	$(master).find('semester > people > person').each(function(){
		var xml;
		try{
			xml = ims.sharepoint.getXmlByEmail($(this).attr('email'));
		}
		catch(e){

		}
		if (!xml){
			xml = $('<semesters><semester code="FA15"><people><person></person></people></semester></semesters>');
		}
		$(xml).find('semester > people > person').remove();
		$(xml).find('semester > people').append($(this).clone());


		$(xml).find('semester > people > person > roles > role > stewardship > people > person').each(function(){
			var type = $(this).attr('type');
			var underXml = $(master).find('semester > people > person[email=' + $(this).attr('email') + ']').clone();
			$(underXml).attr('type', type).removeAttr('highestrole');
			$(underXml).find('role:not([type=' + type + '])').remove();
			var email = $(this).attr('email');
			var p = $(this).parent();
			p.find('person[email=' + email + ']').remove();
			p.append(underXml);
		});


		Sharepoint.postFile($(xml)[0], 'Master/', $(this).attr('email') + '.xml', function(){});
	})
	Sharepoint.postFile($(master)[0], 'Master/', 'master.xml', function(){});
}
