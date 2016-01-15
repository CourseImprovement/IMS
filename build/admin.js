/**
 * @start IMS
 */
/**
 * IMS Object
 */
window.ims = {};
ims.url = {};
if (window.location.href.indexOf('onlineinstructionreportingdev') > -1){
	ims.url._base = window.location.protocol + '//' + window.location.hostname + '/sites/onlineinstructionreporting/onlineinstructionreportingdev/';
	ims.url.relativeBase = '/sites/onlineinstructionreporting/onlineinstructionreportingdev/';
}
else{
	ims.url._base = window.location.protocol + '//' + window.location.hostname + '/sites/onlineinstructionreporting/';
	ims.url.relativeBase = '/sites/onlineinstructionreporting/';
}
ims.url.base = ims.url._base + 'instructor%20Reporting/';
ims.url.api = ims.url._base + '_api/';
ims.url.site = ims.url._base; 
/**
 * UI loading class
 */
ims.loading = {
	/**
	 * @name set
	 * @description Set the percentage of loading bar
	 * @assign Chase
	 * @todo
	 *  + Change the width of the progress bar
	 */
	set: function(percent){
		$('.bar').css({width: percent + '%'});
	},
	/**
	 * @name reset
	 * @description Resets the loading bar
	 * @assign Chase
	 * @todo
	 *  + Change the width of the progress bar to 0
	 */
	reset: function(){
		$('.bar').css({width: 0});
	}
}
/**
 * @end
 */



/**
 * @start Sharepoint
 */
/**
 * Sharepoint rest api calls
 */
var Sharepoint = {
	/**
	 * @name getFile
	 * @description Retrieves file from sharepoint
	 * @assign Chase
	 * @todo
	 *  + Callback a file from sharepoint
	 */
	getFile: function(url, callback, err){
		$.get(url, function(map){
			callback(map);
		}).fail(function(a, b, c){
			if (err) err(a, b, c);
		})
	},
	/**
	 * @name postFile
	 * @description Posts a file to sharepoint
	 * @assign Chase
	 * @todo 
	 *  + Take a file and post it to sharepoint
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
	/**
	 * @name query 
	 * @description Search for users
	 * @assign Chase
	 * @todo 
	 *  + add description
	 *  + add todos
	 */
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
 */
ims.sharepoint = {
	/**
	 * The base url for the api calls
	 */
	base: '../',
	/**
	 * The relative base for the api calls
	 */
	relativeBase: window.location.pathname.split('Shared%20Documents/index.aspx')[0],
	/**
	 * @name makePostRequest
	 * @description Make a Sharepoint post request. This is most commly used when a file is being posted to the sharepoint server.
	 * @assign Chase
	 * @todo 
	 *  + Create new sharepoint request executer
	 *  + Set the information for the call
	 *  + Execute async
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
	 * @name getFileItems
	 * @description Get the file items, used in permissions
	 * @assign Chase
	 * @todo 
	 *  + Get the items relative to a file
	 */
	getFileItems: function(fileName, callback){
		var allItemFiles = ims.url._base + 	"_api/Web/GetFileByServerRelativeUrl('" + ims.url.relativeBase + "Instructor%20Reporting/Master/" + fileName + ".xml')/ListItemAllFields";
		$.get(allItemFiles, callback);
	},
	/**
	 * @name getSiteUsers
	 * @description Get the site users, used in permissions
	 * @assign Chase
	 * @todo 
	 *  + Get all the site users
	 */
	getSiteUsers: function(callback){
		$.get(ims.url._base + '_api/Web/siteUsers', callback);
	},
	/**
	 * @name getRoles
	 * @description Get the role ids
	 * @assign Chase
	 * @todo 
	 *  + Return the current roles for people
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
	 * @name postFile
	 * @description Posts the current user xml file.
	 * @assign Chase
	 * @todo 
	 *  + Stringify the doc
	 *  + Post file to Sharepoint 
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
	 * @name getSemesterConfig
	 * @description Get the semester configuration file. This file allows for us to see which semester is the current semester.
	 *              <pre><code>
	 *               var currentSemester = $(ims.sharepoint.getSemesterConfiguration()).find('[current=true]').attr('name');
	 *              </code></pre>
	 * @assign Chase
	 * @todo 
	 *  + possibly remove this function
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
	 * @name getPermissionsXml 
	 * @description Get the permissions xml file. This file is used to prevent the overusage of API calls to the SharePoint server
	 * @assign Chase
	 * @todo
	 *  + Add a description
	 *  + Get the permissions file sharepoint url
	 *  + Get the permissions file
	 *  + Return the file
	 */
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
	 * @name getXmlByEmail
	 * @description Get a XML file for a given user by email address.
	 * @assign Chase
	 * @todo 
	 *  + Get the sharepoint url
	 *  + Get the file
	 *  + Return the file
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
/**
 * @end
 */


/**
 * @name encodeXML
 * @description Replace xml characters with encoded xml characters
 * @assign Chase
 * @todo
 *  + Check that the strin gis not undefined
 *  + Return the newly encoded string
 */
String.prototype.encodeXML = function(){
	if (this == undefined) return "";
	return this.replace(/&/g, '&amp;')
       		   .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
}
/**
 * @name sum 
 * @description Adds all the values in an array
 * @assign Chase
 * @todo 
 *  + Add all the values in the array
 */
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
/**
 * @name isInt 
 * @description Checks if value is an integer 
 * @assign Chase
 * @todo 
 *  + Check that the value is a number
 *  + return a bool
 */
Number.isInt = function(n){
    return Number(n) === n && n % 1 === 0;
}
/**
 * @name isFloat 
 * @description Checks if the value is a float 
 * @assign Chase
 * @todo 
 *  + Check that the value is a float
 *  + return a bool
 */
Number.isFloat = function(n){
    return n === Number(n) && n % 1 !== 0;
}

$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

/**
 * @name changeAll 
 * @description
 * @assign Chase
 * @todo 
 *  - Add description
 *  - Add todos
 */
function changeAll(){
	var sem = $(window.config._xml).find('semesters semester[current=true]').attr('code');
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
			xml = $('<semesters><semester code="' + sem + '"><people><person></person></people></semester></semesters>');
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
/**
 * @start master
 */
/**
 * @name Master
 * @description Get the master file
 */
function Master(isMap){
	this._xml = ims.sharepoint.getXmlByEmail('master');
	this.people = [];
	this.graph = {};
	this.init();
}
/**
 * @name init
 * @description Initialize the master file by creating all of the people and organization
 * @assign Chase
 * @todo 
 *  + Get the current semester
 *  + Get each person
 *   + Add them to the graph
 *  + Add the persons uppers and lowers
 */
Master.prototype.init = function(){
	var sem = window.config.getCurrentSemester();
	var _this = this;
	$(this._xml).find('semester[code=' + sem + '] > people > person').each(function(){
		var mp = new MasterPerson(this, _this);
		_this.people.push(mp);
		_this.graph[mp.email] = mp;
	});	
	for (var i = 0; i < this.people.length; i++){
		this.people[i].addUpperAndLowers();
	}
}
/**
 * @name masterPerson
 * @description Master person, person was too polluted
 */
function MasterPerson(xml, master){
	this.email = $(xml).attr('email');
	this.first = $(xml).attr('first');
	this.last = $(xml).attr('last');
	this.highestRole = $(xml).attr('highestrole');
	this.isNew = $(xml).attr('new') == 'true';
	this._xml = xml;
	this.roles = [];
	var _this = this;
	$(xml).find('> roles > role').each(function(){
		_this.roles.push($(this).attr('type'));
	});
	this.leaders = {}; // organized
	this.uppers = []; // unorganized
	this.lowers = []; // unorganized
	this.master = master;
}
/**
 * @name addUpperAndLowers
 * @description Provide the uppers and the lowers
 * @assign Chase
 * @todo
 *  + Go through each person in the master
 *   + Get their stewardship and add to graph
 *   + Get their leadership and add to graph
 */
MasterPerson.prototype.addUpperAndLowers = function(){
	var _this = this;
	$(this._xml).find('> roles > role > stewardship > people > person').each(function(){
		var person = _this.master.graph[$(this).attr('email')];
		_this.lowers.push({
			role: $(this).attr('type'),
			person: person
		});
	});
	$(this._xml).find('> roles > role > leadership person').each(function(){
		var person = _this.master.graph[$(this).attr('email')];
		_this.leaders[$(this).attr('type')] = person;
		_this.uppers.push({
			role: $(this).attr('type'),
			person: person
		});
	});
}
/**
 * @end
 */
/**
 * @start Group Answer
 */
/**
 * @name  Answer
 * @description Answer object
 * @assign Chase
 */
function Answer(obj) {
	this._question = obj.question;
	this._answer = obj.answer;
	this.clean();
}
/**
 * @name clean
 * @description Replaces text in answers and encodes certain characters to xml
 * @assign Chase
 * @todo 
 *  + Make sure the answer is not undefined
 *  + Remove unnecessary characters
 *  + Replace the Whats with the Withs
 */
Answer.prototype.clean = function() {
	if (this._answer == undefined) return;
	var ans = byui(this._answer);
	for (var i = 0; i < this._question.replaceWhat.length; i++) {
		if (this._question.replaceWhat[i] == '') continue;
		ans.replace(this._question.replaceWhat[i], this._question.replaceWith[i]);
	}
	ans.encodeXml();
	this._answer = ans.val();
}
/**
 * @name toXml
 * @description Converts the components of the answer into xml
 * @assign Chase
 * @todo 
 *  + Create the start of the answer xml
 *  + Create the id attribute for the answer
 *  + Add the answer text
 *  + return the xml
 */
Answer.prototype.toXml = function() {
	var xml = $('<answer></answer>');
	xml.attr('id', this._question.id);
	xml.text(this._answer);
	return xml; 
}
/**
 * @name collect
 * @description Collects survey data from a csv row
 * @assign Chase
 * @todo 
 *  + Go through each survey question
 *   + Get the answer for each question from the rows
 *   + Append the answer to the result array
 *  + Return result  
 */
Answer.collect = function(survey, row) {
	var result = [];
	for (var i = 0; i < survey.questions.length; i++) {
		var answer = row[Config.columnLetterToNumber(survey.questions[i].col)];
		result.push(new Answer({
			question: survey.questions[i], 
			answer: answer
		}));
	}
	return result;
}
/**
 * @end
 */



/**
 * @start Config
 */
/**
 * @name Config
 * @description Config Object
 * @assign Chase and Grant
 * @todo
 *  + Create update script for the dev and live config.xml file to add isEval='false' to all survey nodes. (Grant)
 *  + Add isEval to Survey object (Grant)
 *  + Add isEval to admin.aspx (Grant)
 *  + Add isEval to ctrl.js (Grant)
 *  + Update the dashboard to filter the evaluations from the completed tasks tiles (Chase)
 */
function Config(){
	this.surveys = [];
	this._xml = null;
	this._initSetup();
	this.selectedSurvey = null;
	this.otherPeople = {};
}
/**
 * @name addSurvey
 * @description Add a survey to the list of surveys
 * @assign Chase and Grant
 * @todo 
 *  + Add the survey to config object surveys
 *  + Add the survey xml to the config file
 */
Config.prototype.addSurvey = function(survey){
	this.surveys.push(survey);
	$(this._xml).find('semester[code=' + this.getCurrentSemester() + '] surveys').append(survey._xml);
	this.save();
}
/**
 * @name newSurvey
 * @description Creates a new survey and returns it
 * @assign Chase and Grant
 * @todo 
 *  + Create a new survey
 *  + Add new survey to config object's surveys
 *  + Return new survey
 */
Config.prototype.newSurvey = function(){
	var survey = new Survey({
		iseval: false,
		id: this.getHighestSurveyId() + 1,
		questions: []
	}, false);
	this.surveys.push(survey);
	return survey;
}
/**
 * @name getCurrentSemester
 * @description Gets the current semester from the semester xml file
 * @assign Chase and Grant
 * @todo 
 *  + If the current semester is unkown 
 *   + Get the current semester
 *  + return the current semester 
 */
Config.prototype.getCurrentSemester = function(){
	if (!this._currentSemester) this._currentSemester = $(this._xml).find('[current=true]').attr('code');
	return this._currentSemester;
}
/**
 * @name getSurveys
 * @description Get all the serveys
 * @assign Chase and Grant
 * @todo 
 *  + return the config objects surveys
 */
Config.prototype.getSurveys = function(){
	return this.surveys;
}
/**
 * @name getSurveyById
 * @description Returns the survey using the id
 * @assign Chase and Grant
 * @todo 
 *  + Loop through all the config objects surveys
 *   + If the current survey equals the id passed in return the survey
 *  + If not found return null
 */
Config.prototype.getSurveyById = function(id){
	for (var i = 0; i < this.surveys.length; i++){
		if (this.surveys[i].id == parseInt(id)) return this.surveys[i];
	}
	return null;
}
/**
 * @name remove
 * @description Remove a survey from the config by id
 * @assign Chase and Grant
 * @todo 
 *  + Loop through all the config objects surveys
 *   + If the survey's id equals the id passed in remove it
 *  + Reset the surveys with the new list
 *  + Save the config file
 */
Config.prototype.remove = function(id){
	var newSurveys = [];
	for (var i = 0; i < this.surveys.length; i++){
		if (this.surveys[i].id != parseInt(id)) 
			newSurveys.push(this.surveys[i]);
		else{
			$(this._xml).find('semester[code=' + this.getCurrentSemester() + '] survey[id="' + id + '"]').remove();
		}
	}
	this.surveys = newSurveys;
	this.save();
}
/** 
 * @name _initSetup
 * @description Create the survey objects
 * @assign Chase and Grant
 * @todo 
 *  + Get the config file from sharepoint
 *  + Set this config object's xml with the data callbacked
 *  + Collect the different surveys from the config file to add to the config object
 */
Config.prototype._initSetup = function(){
	var _this = this;
	Sharepoint.getFile(ims.url.base + 'config/config.xml', function(data){
		_this._xml = $(data)[0];
		console.log('getting all the surveys');
		$(_this._xml).find('semester[code=' + _this.getCurrentSemester() + '] survey').each(function(){
			_this.surveys.push(new Survey($(this), true));
		});
	});
}
/**
 * @name findSurvey
 * @description Find a survey based on the criteria in an object
 * @assign Chase and Grant
 * @todo
 *  + Go through each survey in the config object
 *  + Return the survey or null if not there
 */
Config.prototype.findSurvey = function(obj){
	var found = null;
	$(this.surveys).each(function(){
		if (this.hasAttrs(obj)) found = this;
	});
	return found;
}
/**
 * @name createSurvey
 * @description Create a survey based on a passed through object.
 * @assign Chase and Grant
 * @todo
 *  + Add the survey object passed in to the config's surveys.
 *  + Return the created survey
 */
Config.prototype.createSurvey = function(obj){
	var spot = this.surveys.length;
	this.surveys.push(new Survey(obj, false));	
	return this.surveys[spot];
}
/**
 * @name getHighestSurveyId
 * @description Get the next highest survey id
 * @assign Chase and Grant
 * @todo 
 *  + Loop through the config object's surveys
 *   + Check for the highest id
 *    - Well done Chase, you found it!
 *  + return the highest id
 */
Config.prototype.getHighestSurveyId = function(){
	var id = 0;
	$(this.surveys).each(function(){
		if (id < this.id){
			id = this.id;
		}
	});
	return parseInt(id);
}
/**
 * @name getPerson
 * @description Get a person from first the survey, then from global
 * @assign Chase and Grant
 * @todo 
 *  + Remove the @ and everything right of it
 *  + Get the person
 *  + Return the person
 */
Config.prototype.getPerson = function(email){
	try{
		email = Person.cleanEmail(email);
	}
	catch(e){
		console.log(email);
		throw e;
	}
	var person = this.selectedSurvey.getPerson(email);
	if (!person){
		person = this.otherPeople[email];
	}
	return person;
}
/**
 * @name addPerson
 * @description Add person to global list
 * @assign Chase and Grant
 * @todo 
 *  + Add a person to the other people list
 */
Config.prototype.addPerson = function(email, person){
	this.otherPeople[email] = person;
}
/**
 * @name getMaster
 * @description Get the master file
 * @assign Chase and Grant
 * @todo 
 *  + If the master is not there get the master from Sharepoint
 *  + Return the master
 */
Config.prototype.getMaster = function(){
	if (!this._master){
		this._master = ims.sharepoint.getXmlByEmail('master');
	}
	return this._master;
}
/**
 * @name getMap
 * @description get the map file
 * @assign Chase and Grant
 * @todo 
 *  + If the map is not there get the map from Sharepoint
 *  + Return the map
 *  + Possibly remove this function
 */
Config.prototype.getMap = function(){
	if (!this._map){
		this._map = ims.sharepoint.getXmlByEmail('map');
	}
	return this._map;
}
/**
 * @name _getSurveyColumns
 * @description Get the next up leader as string
 * @assign Chase and Grant
 * @todo 
 *  + Get the survey by the id
 *  + Add all the survey column data to the columns object
 *  + possibly add week
 *  + possibly add course
 *  + Go through the questions
 *   + Add them to the columns object
 *  + return columns
 */
Config.prototype._getSurveyColumns = function(surveyId){
	var survey = $(this._xml).find('semester[code="' + $(this._xml).find('semesters semester[current=true]').attr('code') + '"] > surveys > survey[id="' + surveyId + '"]');
	var columns = {
		iseval: survey.attr('iseval'),
		id: surveyId,
		email: Config.getCol(survey.attr('email')),
		placement: survey.attr('placement'),
		type: Config.getCol(survey.attr('type')),
		name: survey.attr('name'),
		questions: {}
	};

	if (survey.attr('week') != undefined){
		columns['week'] = Config.getCol(survey.attr('week'));
	}
	if (survey.attr('course') != undefined){
		columns['course'] = Config.getCol(survey.attr('course'));
	}
	
	

	$(survey).find('questions question').each(function(){
		columns.questions[Config.getCol($(this).attr('col'))] = {
			question: $(this).find('text').text(),
			id: $(this).attr('id'),
			replace: {
				what: $(this).find('answer replace').attr('what'),
				with: $(this).find('answer replace').attr('with')
			}
		};
	});

	return columns;
}
/**
 * @name surveyModify
 * @description
 * @assign Chase and Grant
 * @todo 
 *  + Get a survey by its id
 *  + Change its week, placement, type, email, name, and course
 *  + Update the questions
 *  + Save the survey
 */
Config.prototype.surveyModify = function(name, emailCol, weekCol, typeCol, placement, courseCol, questions, surveyId, iseval){
	var survey = window.config.getSurveyById(surveyId);
	survey.modify('week', weekCol);
	survey.modify('placement', placement);
	survey.modify('type', typeCol);
	survey.modify('email', emailCol);
	survey.modify('name', name);
	survey.modify('course', courseCol);
	survey.modify('iseval', iseval);
	survey.updateQuestions(questions);
	survey.save();
}
/**
 * @name surveyRegister 
 * @description
 * @assign Chase and Grant
 * @todo
 *  + Save the survey
 *  + Add the survey to the config objects surveys
 */
Config.prototype.surveyRegister = function(survey){
	survey.save();
	this.surveys.push(survey);
}
/**
 * @name save 
 * @description
 * @assign Chase and Grant
 * @todo 
 *  + Save the config xml to sharepoint
 */
Config.prototype.save = function(){
	Sharepoint.postFile(this._xml, 'config/', 'config.xml', function(){
		alert('Survey change was successful!');
		window.location.reload();
	});
}
/**
 * @name getLeader 
 * @description
 * @assign Chase and Grant
 * @todo 
 *  + return the leader of the passed in placement
 */
Config.getLeader = function(p){
	switch (p){
		case 'instructor': return 'tgl';
		case 'tgl': return 'aim';
		case 'aim': return 'im';
		default: throw 'Invalid ' + p;
	}
}
/**
 * @name columnLetterToNumber
 * @description Convert a column letter to number
 * @assign Chase and Grant
 * @todo 
 *  + Check if the letter is already a number
 *  + Return the numeric value of the letters
 */
Config.columnLetterToNumber = function(letter){
	if(!isNaN(letter)) return letter;

	if (letter.length == 1){
		return letter.charCodeAt(0) - 65;
	}
	else{
		if (letter[1] == 'A') return 26;
		return (letter.charCodeAt(1) - 65) + 26;
	}
}
/**
 * @name columnNumberToLetter
 * @description
 * @assign Chase and Grant
 * @todo
 *  + Change AZ as the highest to BZ
 *  + Check if the num is already a letter
 *  + Return letter combination
 */
Config.columnNumberToLetter = function(num){
	if(isNaN(num)) return num;

	if (num < 26){
		return String.fromCharCode(num + 65);
	}
	else{
		return String.fromCharCode(Math.floor(num / 26) + 64) + String.fromCharCode(num % 26 + 65);
	}
}
/**
 * @end
 */



/**
 * Only one survey instance can be initalized at one time
 */
window.config = new Config();



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
 *  + Check that the proper characters have been encoded
 *  + Save the file
 */
CSV.downloadCSV = function(csvString){
	console.log('CSV downloaded')
}
/**
 * @end
 */



/**
 * @start angular
 */
var app = angular.module('admin', []);
app.controller('adminCtrl', ["$scope", function($scope){
	/**
	 * Current semester
	 */
	var sem = window.config.getCurrentSemester();

	/**
	 * @start menu toggle
	 */
	/**
	 * @name reset
	 * @description Reset all variables
	 * @assign Chase and Grant
	 * @todo 
	 *  + surveyName, surveyWeek, and Placement to empty strings
	 *  + file and surveyId to null
	 *  + evalustions and editingQuestion to an empty object
	 *  + isFile to false
	 */
	function reset(){
		$scope.surveyName = '';
		$scope.surveyWeek = '';
		$scope.Placement = '';
		$scope.csv = [];
		$scope.file = null;
		$scope.evaluations = {};
		$scope.isFile = false;
		$scope.useCourse = null;
		surveyId = null;
		editingQuestion = {};
	}
	/**
	 * Used to toggle page views. Default is the 'home' page
	 */
	$scope.mode = 'home';
	/**
	 * @name changeMode
	 * @description Changes the webpages
	 * @assign Chase and Grant
	 * @todo 
	 *  + Assign the mode a value to change the web page
	 *   + if Register or Process reset the surveys
	 *   + if home reset all variables
	 */
	$scope.changeMode = function(mode){
		if (mode == 'Register' || mode == 'Process'){
			$scope.surveys = window.config.surveys;
		}

		if ($scope.mode == 'home'){
			reset();
		}
		
		$scope.mode = mode;
	}
	/**
	 * @end
	 */
	
	 /**
	  * @name UseTool 
	  * @description
	  */
	$scope.UseTool = function(left, right, useCourse){
		var t = new Tool(this.file, left, right, useCourse);
		t.parse();
	}
	
	/**
	 * @start permissions
	 */
	/**
	 * @name  checkPermissions
	 * @description Check permissions
	 * @assign Chase and Grant
	 */
	var permissionsGlobal;
	$scope.checkPermissions = function(){
		if (!permissionsGlobal) permissionsGlobal = new Permissions();
		var checked = permissionsGlobal.check();
		if (checked){
			alert('Permissions needs changes');
		}
		else{
			alert('No permission changes needed');
		}
	}
	/**
	 * @name permissions
	 * @description Alerts the user to the percentage completed
	 * @assign Chase and Grant
	 */
	$scope.permissions = function(){
		if (!permissionsGlobal) permissionsGlobal = new Permissions();
		permissionsGlobal.start();
	}
	/**
	 * @end
	 */



	/**
	 * @start Leadership Evaluation
	 */
	/**
	 * Has an evaluation been added yet
	 */
	$scope.evalAdded = false;
	/**
	 * Holds all the evaluations
	 */
	$scope.evaluations = {};
	/**
	 * @name arrayOfColumns
	 * @description Gets the columns in forms A;B;C;D or A-D or A-D;E
	 * @assign Grant
	 * @todo 
	 *  + Check if there is more than one column
	 *  + Split the string on the ';'
	 *  + Start adding letters to new array
	 *   + if the letter contains a '-' then get and add all letters in between 
	 */
	function arrayOfColumns(columns){
		if (columns.indexOf('-') > -1){
			var sets = columns.split(';');
			for (var i = 0; i < sets.length; i++){
				if (sets[i].indexOf('-') > -1){
					var start = Config.columnLetterToNumber(sets[i].split('-')[0]);
					var end = Config.columnLetterToNumber(sets[i].split('-')[1]);
					sets.splice(i, 1);
					if (start > end) {
						alert("columns need to be read from left to right (A-Z)");
						throw "columns need to be read from left to right (A-Z)";
					}
					for (var j = start; j <= end; j++){
						sets.splice(sets.length, 0, Config.columnNumberToLetter(j));
					}
				} else {
					if (sets[i].length > 2) {
						alert("The columns that can be reached are A-ZZ");
						throw "The columns that can be reached are A-ZZ";
					}
				}
			}
			return sets;
		}
		else{
			return columns.split(';');
		}
	}
	/**
	 * @name  addEvaluation
	 * @description Adds the evaluation to the evaluations array
	 * @assign Grant
	 * @todo
	 *  + check that the variables are strings and arrays
	 *  + create evals by questions
	 *  + add evaluations to evals 
	 *  + error handling
	 */
	$scope.addEvaluation = function(bRole, fRole, email, columns, questions, logics){
		if (bRole == fRole){
			alert("The evaluations can not be done at the same level. e.g. by: INSTRUCTOR for: INSTRUCTOR");
			return;
		}

		if (bRole == null || fRole == null || email == null || columns == null || questions == null || logics == null){
			alert("Some information was left out!");
			return;
		}

		if (bRole == '' || fRole == '' || email == '' || columns == '' || questions == '' || logics == ''){
			alert("Some information was left out!");
			return;
		}

		if (columns.indexOf(';') == -1 && columns.indexOf('-') == -1 && columns.length > 2){
			alert("Please seperate each column with a ';' (no spaces needed)");
			return;
		}
		
		var cs = arrayOfColumns(columns);
		var qs = questions.split(';');
		var ls = logics.split(';');

		if (cs.length != qs.length || qs.length != ls.length){
			alert('The number of columns, questions, and logic selections do not match.\n' + 
				'Be sure they are all the same length and check that you have seperated\n' + 
				'them with semicolons');
			return;
		}

		for (var i = 0; i < cs.length; i++){
			if (cs[i] == ""){
				alert('One of the columns is blank.');
				return;
			} else if (qs[i] == ""){
				alert('One of the question texts is blank.');
				return;
			} else if (ls[i] == ""){
				alert('One of the logic options is blank.');
				return;
			}
		}

		var eval = [];

		for (var i = 0; i < cs.length; i++){

			if (ls[i] != 'p' && ls[i] != 'v'){
				alert("Use either a single 'p' (percentage) or 'v' (value) for specifying logic");
				return;
			}

			eval.push({
				col: cs[i],
				question: qs[i],
				logic: ls[i]
			});	
		}

		$scope.evaluations = {
			eBy: bRole,
			eFor: fRole,
			emailCol: email,
			dataSeries: eval
		};

		$scope.evalAdded = true;
	}
	/**
	 * @name clearEvaluation
	 * @description Resets the current evaluation
	 * @assign Grant
	 * @todo 
	 *  + Clear the evaluations
	 *  + Change evalAdded to false
	 *  + Change isFile to false 
	 */
	$scope.clearEvaluation = function(){
		$scope.evaluations = {};
		$scope.evalAdded = false;
		$scope.isFile = false;
	}
	/**
	 * @name CreateEvaluationCSV
	 * @description Create a new evaluation and parses the evaluations previously gathered
	 * @assign Grant
	 * @todo 
	 *  + Make sure their are evaluations to do
	 *  + Create an Evaluations object
	 *  + Begin the parsing process
	 *  + Return to the home page
	 */
	$scope.CreateEvaluationCSV = function(){
		if ($scope.evaluations == {}){
			alert('Add an evaluation before you start the process.');
			return;
		}

		var e = new Evaluations($scope.evaluations, $scope.file);
		e.parse();
		$scope.mode = 'home';
		$scope.clearEvaluation();
	}
	/**
	 * @end
	 */



	/**
	 * @start Semester Setup
	 */
	/**
	 * @name  semesterSetup
	 * @description Creates all semester files based on provided org file 
	 * @assign Chase and Grant
	 * @todo
	 *  + Create a new CSV object
	 *  + Read the file
	 *  + Create a SemesterSetup object
	 *  + Start the semesterSetup 
	 */
	$scope.semesterSetup = function(){
		var csv = new CSV();
		csv.readFile($scope.file, function(file){
			setTimeout(function(){
				var s = new SemesterSetup(file.data);
				s.semesterSetup();
			}, 10);
		});
	}
	/**
	 * @name semesterUpdate
	 * @description Updates all semester files based on provided org file 
	 * @assign Chase and Grant
	 */
	$scope.semesterUpdate = function(){
		var s = new SemesterSetup();
		s.semesterUpdate();
	}
	/**
	 * @end
	 */
	


	/**
	 * @start Select File
	 */
	/**
	 * Contains the current file
	 */
	$scope.file = null;
	/**
	 * Has a file been chosen
	 */
	$scope.isFile = false;
	/**
	 * @name  chooseFile
	 * @description Select a file
	 * @assign Chase and Grant
	 * @todo
	 *  + Create a file input in the html using jquery
	 *  + Click to add file
	 *  + isFile is true
	 *  + file is now the selected file 
	 */
	$scope.chooseFile = function(){
		setTimeout(function(){
			$('body').append('<input type="file" id="surveyFile">');
			$('#surveyFile').change(function(){
				$scope.$apply(function(){
					$scope.isFile = true;
				});
				$scope.file = this.files[0];
				$(this).remove();
			}).click();
		}, 100);
	}
	/**
	 * @end
	 */
	


	/**
	 * @start Process Survey
	 */
	/**
	 * @name processSurvey
	 * @description Begin processing the survey
	 * @assign Chase
	 * @todo 
	 *  + Find the survey settings from the config
	 *  + This survey is now the selected survey
	 *  + Error handling
	 *  + Create a new CSV object
	 *  + Read the file
	 *  + Start the survey processing 
	 */
	$scope.processSurvey = function(id){
		var survey = window.config.getSurveyById(id);
		window.config.selectedSurvey = survey;
		$scope.selectedSurvey = survey;
		if (!survey){
			alert('Invalid Survey');
			return;
		}
		var csv = new CSV();
		csv.readFile($scope.file, function(file){
			setTimeout(function(){
				survey.process(file.data);
			}, 10);
		});
	}
	/**
	 * @end
	 */
	


	/**
	 * @start Survey Setup
	 */
	/**
	 * List of all surveys
	 */
	$scope.surveys = [];
	/**
	 * The name of the survey
	 */
	$scope.surveyName = '';
	/**
	 * Week of the survey
	 */
	$scope.surveyWeek = '';
	/**
	 * Placement of survey
	 */
	$scope.Placement = '';
	/**
	 * Holds the questions for a specific survey
	 */
	$scope.questions = [];
	/**
	 * CSV Data
	 */
	$scope.csv = [];
	/**
	 * Identifier for the survey
	 */
	var surveyId = null;
	/**
	 * Contains all the questions to change
	 */
	var editingQuestion = {};
	/**
	 * @name surveyModifications
	 * @description All survey modification go through here
	 * @assign Chase and Grant
	 * @todo
	 *  + Get the survey settings from the config
	 *  + This survey is now the selected survey
	 *  + if register a survey
	 *   + Create a new CSv object
	 *   + Read file
	 *   + Change webpages
	 *   + Start to modify a new survey
	 *  + if delete a survey
	 *   + Remove the survey from the config
	 *  + if copy a survey
	 *   + Copy the survey and increment its id 
	 *  + if modify a survey
	 *   + Change to modify a survey webpage  
	 *  + Error handling
	 */
	$scope.surveyModifications = function(type, id){
		surveyId = id;
		var survey = window.config.getSurveyById(id);
		$scope.selectedSurvey = survey;
		window.config.selectedSurvey = survey;
		if (type == 'register'){ // REGISTER NEW SURVEY - PERFORM IN CTRL
			var csv = new CSV();
			csv.readFile($scope.file, function(file){
				$scope.csv = file.data[1];
			});
			$scope.mode = 'RegisterStart';
			$scope.modifySurvey();
		}
		else if (type == 'delete'){ // DELETE SURVEY
			window.config.remove(id);
			$scope.mode = 'home';
		}
		else if (type == 'copy'){ // COPY SURVEY
			var copy = survey.copy();
			window.config.addSurvey(copy);
			$scope.mode = 'home';
		}
		else if (type == 'modify'){ // MODIFY SURVEY - PERFORM IN CTRL
			$scope.mode = 'RegisterStart';
			$scope.modifySurvey(id);
		}
		else{
			throw 'Invalid $scope.mode';
		}
	}
	/**
	 * @name modifySurvey
	 * @description Updates a surveys data comlumns
	 * @assign Chase
	 * @todo
	 *  + Get the survey to be modified
	 *  + Set the selectedSurvey
	 *  + Set the questions
	 */
	$scope.modifySurvey = function(id){
		var survey = null;
		if (!id || id.length < 1) {
			survey = window.config.newSurvey();
		}
		else{
			survey = window.config.getSurveyById(id);
		}
		window.config.selectedSurvey = survey;
		$scope.selectedSurvey = survey;
		$scope.questions = survey.questions;
	}
	/**
	 * @name  submitSurvey
	 * @description Submits a newly created survey and saves it to the config file
	 * @assign Chase
	 * @todo 
	 *  + Assign the questions to the selected survey's questions
	 *  + Save the selected survey
	 *  + Change the view to the home page
	 */
	$scope.submitSurvey = function(){
		$scope.selectedSurvey.questions = $scope.questions;
		$scope.selectedSurvey.save();
		$scope.mode = 'home';
	}
	/**
	 * @name addBlankQuestion
	 * @description Add a question to a survey
	 * @assign Chase
	 * @todo
	 *  + Show the add question dialog
	 *  + Create a new question with the id incremented
	 *  + Assign the new question to the selected question
	 */
	$scope.addBlankQuestion = function(){
		$scope.showDialog = true;
		var q = new Question({
			id: $scope.selectedSurvey.getHighestQuestionId() + 1
		}, false);

		$scope.selectedQuestion = q;
	}
	/**
	 * @name  addQuestion
	 * @description Add aquestion to a survey
	 * @assign Chase
	 * @todo 
	 *  + Remove question dialog 
	 *  + Assign the selected question to the selected survey
	 */
	$scope.addQuestion = function(){
		$scope.showDialog = false;
		$scope.selectedSurvey.addQuestion($scope.selectedQuestion);
	}
	/**
	 * @name  editQuestion
	 * @description Edit the question
	 * @assign Chase
	 * @todo 
	 *  + Assign the question as the selected question
	 *  + Show the edit question dialog
	 */
	$scope.editQuestion = function(q){
		$scope.selectedQuestion = q;
		$scope.showDialog = true;
	}
	/**
	 * @name columnNumberToLetter
	 * @description Convert a number to a letter(excel column)
	 * @assign Chase
	 * @todo
	 *  + Call the column number to letter function in config
	 *  + return value
	 */
	$scope.columnNumberToLetter = function(col){
		return Config.columnNumberToLetter(col);	
	}
	/**
	 * @name columnLetterToNumber
	 * @description Convert a letter(excel column) to a number 
	 * @assign Chase
	 * @todo
	 *  + Call the column letter to number function in config
	 *  + return value
	 */
	$scope.columnLetterToNumber = function(col){
		return Config.columnLetterToNumber(col);
	}
	/**
	 * @name removeQuestion
	 * @description Remove a question
	 * @assign Chase
	 * @todo 
	 *  + Remove the question from questions
	 */
	$scope.removeQuestion = function(q){
		$scope.questions.splice($scope.questions.indexOf(q), 1);
	}
	/**
	 * @name closeDialog
	 * @description Close the dialog
	 * @assign Chase
	 * @todo 
	 *  + Change showDialog to false 
	 */
	$scope.closeDialog = function(){
		$scope.showDialog = false;
	}
	/**
	 * @name upper
	 * @description Column Letter will always be upper case
	 * @assign Chase
	 * @todo 
	 *  + Convert the string to uppercase
	 *  + Return string
	 */
	$scope.upper = function(e){
		return $(e.target).val().toUpperCase();
	}
	/**
	 * @end
	 */
}]);

/**
 * @name toInt 
 * @description Converts a str to a num and handles it if it is a range of numbers by choosing the first number
 * @todo 
 *  + Check that the str is not intro week
	 *  + Check for a dash
 *  + Convert the string to an int
 */
function toInt(str) {
	if (str == "") return -1;
	if (str.toLowerCase().indexOf('intro') > -1) return 0;
	if (str.toLowerCase().indexOf('conclusion') > -1) return 100;

	var num = 0;

	if (str.indexOf('-') == -1) {
		num = parseInt(str);
	} else {
		num = parseInt(str.substring(0, str.indexOf('-')));
	}

	return num;
}

/**
 * @name addItemReverseOrder 
 * @description Adds a single item to the given array based on the value of the week
 * @todo 
 *  + If the week is empty then it is added to the end
 *  + Add item based on items in list
 *  + Return list 
 */
function addItemReverseOrder(list, item) {
	if (item['week'] ==  undefined) {
		list.splice(list.length, 0, item);
		return list;
	}
	var week = item.week;
	if (list.length == 0) list.push(item);
	else if (!week || week.length == 0 || week.toLowerCase() == "intro") list.splice(list.length, 0, item);
	else if (week.toLowerCase() == "conclusion") list.splice(0, 0, item); 
	else {
		for (var i = 0; i < list.length; i++) {
			if (toInt(week) >= toInt(list[i].week)) {
				list.splice(i, 0, item);
				return list;
			}
		}
	}
	return list;
}

/**
 * @name angular.filter.reverseByWeek
 * @description Reverses the items in an ng-repeat by id
 * @todo
 *  + Filter by week (Grant)
 */
app.filter('reverseByWeek', function() {
  	return function(items){
      	if (items){
      		var finalSet = [];
      		var surveyTypes = {};

      		for (var i = 0; i < items.length; i++){
      			if (surveyTypes[items[i].name] == undefined) surveyTypes[items[i].name] = [];
          		surveyTypes[items[i].name].push(items[i]);
          	}

          	for (var s in surveyTypes){
          		var set = [];
          		for (var i = 0; i < surveyTypes[s].length; i++){
	          		set = addItemReverseOrder(set, surveyTypes[s][i]);
	          	}
	          	finalSet = finalSet.concat(set);
          	}
          	
          	return finalSet;
      	}
  	} 
});
/**
 * @end
 */
/**
 * @start evaluations
 */
/**
 * @name  Evaluations
 * @assign Grant
 * @description object used to assign data from the evaluator to the evaluatee
 * @todo
 *  + set the evaluations object
 *  + set the csv file location
 */
function Evaluations(obj, file) {
	this._evaluations = obj;
	this._file = file;
	this.people = {};
	this._sem = window.config.getCurrentSemester();
}

/**
 * @name  Evaluations.getColumnLocations
 * @assign Grant
 * @description Finds the location of answer, question, and display logic
 * @todo
 *  + loop through the different data series
 *   + convert the col letter to a number
 */
Evaluations.prototype.getColumnLocations = function() {
	var newArray = [];

	for (var i = 0; i < this._evaluations.dataSeries.length; i++) {
		newArray.push({
			col: Config.columnLetterToNumber(this._evaluations.dataSeries[i].col),
			question: this._evaluations.dataSeries[i].question,
			logic: this._evaluations.dataSeries[i].logic
		});
	}

	return newArray;
}

/**
 * @name  Evaluations.cleanseString
 * @assign Grant
 * @description
 * @todo
 *  + check that the string is not null or empty
 *  + replace unwanted html
 *  + error handling
 */
Evaluations.prototype.cleanseString = function(str) {
	if(str == undefined || str.length == 0) return str;
	return str.replace(/<[^>]*>/g, '');
}

/**
 * @name Evaluations.setAnswers
 * @assign Grant
 * @description
 * @todo
 *  + add evaluatee to Evaluations' people
 *   + add one to number of evaluators
 *  + go through the row for responses
 *   + get the question and answer
 *    + logic for value
 *    + logic for percentage
 *   + add response data for evaluatee
 *  + error handling
 */
Evaluations.prototype.setAnswers = function(evaluatee, row, locations) {
	if (this.people[evaluatee] == undefined) {
		this.people[evaluatee] = {
			count: 1
		};
	} else {
		this.people[evaluatee].count++;
	}

	for (var loc = 0; loc < locations.length; loc++) {
		var quest = locations[loc].question;
		var ans = row[locations[loc].col];
		if (locations[loc].logic == 'v' && ans != "") { /*VALUE*/
			if (this.people[evaluatee][quest] == undefined) {
				this.people[evaluatee][quest] = _this.cleanseString(ans);
			} else {
				this.people[evaluatee][quest] += '\\\\' + _this.cleanseString(ans);
			}
		} else if (locations[loc].logic == 'p') { /*PERCENTAGE*/
			if (this.people[evaluatee][quest] == undefined) {
				this.people[evaluatee][quest] = (ans != "" ? parseFloat(1) : parseFloat(0));
			} else {
				this.people[evaluatee][quest] += (ans != "" ? parseFloat(1) : parseFloat(0));
			}
		}
	}
}

/**
 * @name Evaluations.calculatePercentages
 * @assign Grant
 * @description
 * @todo
 *  + go through each person
 *   + go through each evaluation
 *    + check if the logic type is percentage (p)
 *    + perform percentage math
 *    + replace answer with new percentage 
 *  + error handling
 */
Evaluations.prototype.calculatePercentages = function() {
	for (var person in this.people) {
		for (var j = 0; j < this._evaluations.dataSeries.length; j++) {
			var eval = this._evaluations.dataSeries[j];
			if (eval.logic == 'p') {
				this.people[person][eval.question] = (this.people[person][eval.question] * 100 / this.people[person].count).toPrecision(3) + '%';
			}
		}
	}
}

/**
 * @name Evaluations.sendToCSV
 * @assign Grant
 * @description
 * @todo
 *  + add questions to the top of csv
 *  + go through each person
 *   + go through each question
 *    + add answer to string
 *    + encode all spaces, commas, new lines, and slashes
 *  + download string as csv
 *  + error handling
 */
Evaluations.prototype.sendToCSV = function() {
	var csv = "###,###,###,email,";

	/*ADD THE TITLES TO THE CSV*/
	for (var j = 0; j < this._evaluations.dataSeries.length; j++) {
		csv += this._evaluations.dataSeries[j].question.replace(/( )|(,)/g, "%20").replace(/’/g, "%27") + ",";
	}

	csv += "%0A"; // NEW LINE

	/*ADD THE PEOPLE AND THEIR DATA TO THE CSV*/
	for (var person in this.people) {
		csv += "###,###,100.100.100," + person + ",";
		for (var q in this.people[person]) {
			if (q != 'count'){
				if (isNaN(this.people[person][q])) {
					csv += this.people[person][q].replace(/( )|(\/\/\/)|(,)/g, "%20").replace(/’/g, "%27") + ",";
				} else {
					csv += this.people[person][q] + ",";
				}
			}
		}
		csv += "%0A";
	}

	/*SAVE THE NEWLY CREATED STRING AS A CSV FILE*/
	var a         = document.createElement('a');
	a.href        = 'data:attachment/csv,' + csv;
	a.target      = '_blank';
	a.download    = 'Evaluation.csv';

	document.body.appendChild(a);
	a.click();
}

/**
 * @name  Evaluations.parse
 * @assign Grant
 * @description Collect the evaluation information from a CSV.
 * @todo 
 *  + get the master
 *  + convert csv to array
 *  + go through each evaluation
 *   + get the email of evaluator
 *   + get evaluatee
 *   + collect evaluation results for evaluatee
 *  + calculate the percentage
 *  + error handling
 */
Evaluations.prototype.parse = function() {
	_this = this;
	Sharepoint.getFile(ims.url.base + 'Master/master.xml', function(master) {
		var csv = new CSV();
		csv.readFile(_this._file, function(csv) {
			var rows = csv.data;
			var emailCol = Config.columnLetterToNumber(_this._evaluations.emailCol);
			var locations = _this.getColumnLocations();
			var questions = [];

			if (rows.length < 3) {
				alert('CSV does not have the right number of rows');
				throw 'CSV does not have the right number of rows';
			}

			var start = 0;
			for (var i = 0; i < rows.length; i++) {
				if (rows[i][2].match(/\./g) && rows[i][2].match(/\./g).length >= 2) {
					start = i;
					break;
				}
			}

			if (start == 0) {
				alert('CSV must be wrong or in an unfamiliar format');
				throw 'CSV must be wrong or in an unfamiliar format';
			}

			for (var i = start; i < rows.length; i++) {
				if (rows[i][emailCol] != undefined) {
					var xPath = 'semester[code=' + _this._sem +'] > people > person > roles > role[type=' + _this._evaluations.eFor.toLowerCase() + ']';
					var evaluator = rows[i][emailCol].split('@')[0];
					var evaluatee = null;
					if ($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]').length > 0) {
						if ($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]').length > 1) {
							if (evaluator == $($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]')[0]).parents('person').attr('email')) {
								evaluatee = $($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]')[1]).parents('person').attr('email');
							} else {
								evaluatee = $($(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]')[0]).parents('person').attr('email');
							}
						} else {
							evaluatee = $(master).find(xPath).has('stewardship > people > person[email="' + evaluator + '"][type="' + _this._evaluations.eBy.toLowerCase() + '"]').parents('person').attr('email');
						}
						if (evaluatee != null) {
							_this.setAnswers(evaluatee, rows[i], locations);
						}
					}
				}
			}

			_this.calculatePercentages();
			_this.sendToCSV();
		});
	});
};
/**
 * @end
 */
/**
 * Steps
 *  1. get sharepoint siteusers, roles, permissions, and master
 */
function Permissions(){
	this.master = new Master();
	this.rolesXml = null;
	this.permissionsXml = null;
	this.siteUsersXml = null;
	window._permissions = this;
	this.roles = {};
	this.permissionsXmlFiles = {
		graph: {},
		ary: []
	};
	this.permissionPersons = {
		graph: {},
		ary: []
	};
	this.changes = {
		graph: {},
		ary: []
	};
}

Permissions.prototype.start = function(){
	var _this = this;

	// this needs to be ugly to refresh the UI loading screen...
	ims.loading.reset();
	this.stepOne(function(){
		setTimeout(function(){
			ims.loading.set(5);
			_this.stepTwo();
			setTimeout(function(){
				ims.loading.set(15);
				setTimeout(function(){
					_this.stepThree(function(){
						ims.loading.set(20);
						setTimeout(function(){
							_this.stepFour(function(){
								setTimeout(function(){
									ims.loading.set(60);
									_this.stepFive(function(){
										setTimeout(function(){
											ims.loading.set(70);
											_this.stepSix();
											setTimeout(function(){
												ims.loading.set(100);
											}, 10);
										}, 10);
									})
								}, 10);
							})
						}, 10)
					})
				}, 10)
			}, 10)
		}, 10)
	})
}

Permissions.prototype.getSiteUserIdByEmail = function(email){
	var id = $(this.siteUsersXml).find('d\\:Email:contains(' + email + '), Email:contains(' + email + ')').parent().find('d\\:Id, Id').text();
	return id;
}

Permissions.prototype.stepSix = function(){
	for (var i = 0; i < this.permissionPersons.ary.length; i++){
		$(this.permissionsXml).find('file[name=' + this.permissionPersons.ary[i].email + ']').remove();
		var spot = $(this.permissionsXml).find('permissions').append('<file broken="true" name="' + this.permissionPersons.ary[i].email + '"></file>')
			.find('file[name=' + this.permissionPersons.ary[i].email + ']');
		var keys = Object.keys(this.permissionPersons.ary[i].org);
		for (var j = 0; j < keys.length; j++){
			var role = keys[j];
			var email = this.permissionPersons.ary[i].org[role];
			$(spot).append('<user email="' + email + '" role="' + role + '" />');
		}
	}
	Sharepoint.postFile(this.permissionsXml, 'config/', 'permissions.xml', function(){
		alert('Completed');
		window.location.reload();
	});
}

Permissions.prototype.stepFive = function(callback){
	console.log('Step 5');

	var USER_SIZE = 50;
	var digest;

	$.ajax({
	  	url: ims.sharepoint.base + '_api/contextinfo',
	  	header: {
	  		'accept': 'application/json; odata=verbose',
	  		'content-type': 'application/json;odata=verbose'
	  	},
	  	type: 'post',
	  	contentType: 'application/json;charset=utf-8'
	  }).done(function(d){
  	digest = $(d).find('d\\:FormDigestValue, FormDigestValue').text();
  	nextWave(0);
  })

	function nextWave(spot){
		var calls = [];
  	for (var i = spot; i < USER_SIZE + spot; i++){
  		if (!_permissions.permissionPersons.ary[i]) {
  			callback();
  			break;
  		}
  		else{
  			var urls = _permissions.permissionPersons.ary[i].getUrls();
	  		for (var j = 0; j < urls.length; j++){
	  			calls.push({
						name: _permissions.permissionPersons.ary[i].email,
						url: ims.url.relativeBase + urls[j],
						headers: {
							"accept": "application/json;odata=verbose",
		          "X-RequestDigest": digest
						},
						method: 'POST'
					});	
	  		}  		
  		}
  	}

  	byui.ajaxPool({
  		calls: calls,
  		done: function(err, succ){
  			console.log(err);
  			nextWave(spot + USER_SIZE - 1);
  		}
  	})
	}
}

Permissions.prototype.stepFour = function(callback){
	console.log('Step 4');
  $.ajax({
  	url: ims.sharepoint.base + '_api/contextinfo',
  	header: {
  		'accept': 'application/json; odata=verbose',
  		'content-type': 'application/json;odata=verbose'
  	},
  	type: 'post',
  	contentType: 'application/json;charset=utf-8'
  }).done(function(d){
  	var digest = $(d).find('d\\:FormDigestValue, FormDigestValue').text();
  	var calls = [];
  	for (var i = 0; i < _permissions.permissionPersons.ary.length; i++){
  		if (_permissions.permissionPersons.ary[i].broken) continue;
  		calls.push({
				name: _permissions.permissionPersons.ary[i].email,
				url: ims.url.relativeBase + _permissions.permissionPersons.ary[i].breakUrl,
				headers: {
					"accept": "application/json;odata=verbose",
          "X-RequestDigest": digest
				},
				method: 'POST'
			});	
  	}
  	callback();
  	byui.ajaxPool({
  		calls: calls,
  		done: function(err, succ){
  			console.log(err);
  			callback();
  		}
  	})
  })
}

Permissions.prototype.stepThree = function(callback){
	console.log('Step 3');
	var firstUrl = ims.url._base + 	"_api/Web/GetFileByServerRelativeUrl('" + ims.url.relativeBase + "Instructor%20Reporting/Master/";
	var secondUrl = ".xml')/ListItemAllFields";
	var calls = [];
	for (var i = 0; i < this.permissionPersons.ary.length; i++){
		if (this.permissionPersons.ary[i].hasChanges()){
			calls.push({
				name: this.permissionPersons.ary[i].email,
				url: firstUrl + this.permissionPersons.ary[i].email + secondUrl
			})
		}
	}
	var _this = this;
	byui.ajaxPool({
		done: function(err, success){
			console.log(err);
			var keys = Object.keys(success);
			for (var i = 0; i < keys.length; i++){
				var begin = $(success[keys[i]]).find('[title=RoleAssignments]').attr('href');
				var breakUrl = '_api/' + begin.replace('RoleAssignments', 'breakroleinheritance(copyRoleAssignments=true, clearSubscopes=true)');
				var baseUrl = '_api/' + begin;
				_this.permissionPersons.graph[keys[i]].breakUrl = breakUrl;
				_this.permissionPersons.graph[keys[i]].baseUrl = baseUrl;
			}
			callback();
		},
		calls: calls
	})
}

Permissions.prototype.stepTwo = function(callback){
	console.log('Step 2');
	var _this = this;
	$(this.permissionsXml).find('file').each(function(){
		var p = new PermissionFile(this);

		_this.permissionsXmlFiles.ary.push(p);
		_this.permissionsXmlFiles.graph[p.name] = p;
	});

	for (var i = 0; i < this.master.people.length; i++){
		var mp = this.master.people[i];
		var p = PermissionPerson.fromMasterPerson(mp);
		this.permissionPersons.ary.push(p);
		this.permissionPersons.graph[p.email] = p;
		p.compareWithPermissionsXml(this.permissionsXmlFiles.graph[p.email]);
	}

	$(this.rolesXml).find('properties Name, m\\:properties d\\:Name').each(function(){
		_this.roles[$(this).text()] = $(this).prev().text();
	})
}

Permissions.prototype.stepOne = function(callback){
	console.log('Step 1');
	var _this = this;
	byui.ajaxPool({
		done: function(err, success){
			if (err && err.length > 0) console.log(err);
			_this.rolesXml = success.siteRoles;
			_this.siteUsersXml = success.siteUsers;
			_this.permissionsXml = success.permissionsXml;
			callback();
		},
		calls: [
		 	{
		 		name: 'siteUsers',
		 		url: ims.url._base + '_api/Web/siteUsers'
		 	},
		 	{
		 		name: 'siteRoles',
		 		url: ims.url._base + '_api/Web/roledefinitions'
		 	},
		 	{
		 		name: 'permissionsXml',
		 		url: ims.sharepoint.base + 'Instructor%20Reporting/config/permissions.xml'
		 	}
		]
	})
}

function PermissionFile(xml){
	var obj = byui(xml).obj();
	var keys = Object.keys(obj.file);
	for (var i = 0; i < keys.length; i++){
		this[keys[i]] = obj.file[keys[i]];
	}
	this._rawXml = xml;
}

// End Result
function PermissionPerson(email, org){
	this.email = email;
	this.org = org;
	this.changes = {
		add: new Set(),
		remove: new Set()
	}
	this.breakUrl = null;
	this.baseUrl = null;
	this.broken = false;
}

PermissionPerson.fromMasterPerson = function(mp){
	var org = {};
	for (var i = 0; i < mp.uppers.length; i++){
		org[mp.uppers[i].role] = mp.uppers[i].person.email;
	}
	var pp = new PermissionPerson(mp.email, org);
	return pp;
}

PermissionPerson.prototype.hasChanges = function(){
	return this.changes.add.size > 0 || this.changes.remove.size > 0;
}

PermissionPerson.prototype.getUrls = function(){
	var result = [];

	var adds = this.changes.add.values();
	if (adds && this.changes.add.size > 0){
		var next = adds.next();
		while (!next.done){
			var email = next.value;
			var id = _permissions.getSiteUserIdByEmail(email);
			if (!id){
				console.log('Add ' + email + ' user to site');
			}
			else{
				result.push(this.baseUrl + '/addroleassignment(principalid=' + id + ',roledefid=' + _permissions.roles.Edit + ')');
			}
			next = adds.next();
		}
	}

	var removes = this.changes.remove.values();
	if (removes && this.changes.remove.size > 0){
		var next = removes.next();
		while (!next.done){
			var email = next.value;
			var id = _permissions.getSiteUserIdByEmail(email);
			if (!id){
				console.log('Add ' + email + ' user to site');
			}
			else{
				result.push(this.baseUrl + '/removeroleassignment(principalid=' + id + ',roledefid=' + _permissions.roles.Edit + ')');
			}
			next = removes.next();
		}
	}

	return result;
}

PermissionPerson.prototype.compareWithPermissionsXml = function(permissionsXmlFile){
	if (!permissionsXmlFile){ // create file
		var keys = Object.keys(this.org);
		for (var i = 0; i < keys.length; i++){
			this.changes.add.add(this.org[keys[i]]);
		}
	}
	else{
		this.broken = permissionsXmlFile.broken == 'true';
		for (var i = 0; i < permissionsXmlFile.children.length; i++){
			var role = permissionsXmlFile.children[i].user.role;
			var email = permissionsXmlFile.children[i].user.email;
			if (!this.org[role]){
				this.changes.remove.add(email)
			}
			else if (this.org[role] != email){
				this.changes.remove.add(email);
				this.changes.add.add(this.org[role]);
			}
			else {} // do nothing
		}
	}

	if (!this.org.self){
		this.changes.add.add(this.email);
	}
}



/**
 * @start Person
 */
/**
 * @name Person
 * @description Person Object
 */
function Person(obj, isXml, downloadXml){
	if (isXml){
		this._tmpXml = $(obj).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person');
		this._placement = $(this._tmpXml).attr('highestrole');
		this._email = $(this._tmpXml).attr('email');
		this.cleanEmailInternal();
		if (downloadXml){
			this.getXml();
		}
		else{
			this._xml = obj;
		}
	}
	else{
		this._email = obj.email;
		this.cleanEmailInternal();
		this._row = obj.row;
		this._placement = obj.placement.toLowerCase();
		this._leader = null;
		this._answers = obj.answers;
		this.course = obj.course;
	}
	if (downloadXml){
		this.getXml();
	}
	else{
		this._xml = obj;
	}
	this._valid = true;
}
/**
 * @name cleanEmail 
 * @description Remove the '@' symbol and everything after
 * @assign Chase
 * @todo 
 *  + Check that the email is not undefined
 *  + Search for the '@' character
 *  + Remove everything from the '@' to the end
 */
Person.cleanEmail = function(email){
	if (!email) throw 'Invalid Email';
	if (email.indexOf('@') > -1){
		email = email.split('@')[0];
	}
	return email;
}
/**
 * @name cleanEmailInternal 
 * @description Clean the person object's email
 * @assign Chase
 * @todo
 *  + Try to clean a person's email
 */
Person.prototype.cleanEmailInternal = function(){
	try{
		this._email = Person.cleanEmail(this._email);
	}
	catch(e){
		this._valid = false;
	}
}
/**
 * @name save
 * @description Save this person's xml to their sharepoint file
 * @assign Chase
 * @todo 
 *  + Post the person's xml file
 */
Person.prototype.save = function(callback){
	if ($(this._xml)[0] && this._email){
		Sharepoint.postFile($(this._xml)[0], 'master/', this._email + '.xml', callback);
	}
}
/**
 * @name isValid
 * @description Checks to see if the person object is valid
 * @assign Chase
 * @todo
 *  + Return if the email, row, placement, and answers and not undefined
 */
Person.prototype.isValid = function(){
	return !!(this._email && this._row && this._placement && this._answers.length > 0) && this._valid;
}
/**
 * @name getXml 
 * @description Get the person's xml from sharepoint
 * @assign Chase
 * @todo 
 *  + If the person's xml has not been retrieved yet, get it.
 */
Person.prototype.getXml = function(){
	if (!this._xml){
		this._xml = ims.sharepoint.getXmlByEmail(this._email);
	}
}
/**
 * @name getLeader
 * @description Retrieves a person's leader
 * @assign Chase
 * @todo
 *  + Get the email of the person's leader
 *  + Get the person from config
 *  + Create a new person
 *  + Add the person to the leader of person
 */
Person.prototype.getLeader = function(){
	var email = $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > leadership > people > person[type=' + Config.getLeader(this._placement) + ']').attr('email');
	var person = null;
	try {
		person = window.config.getPerson(email);;
	}
	catch (e){
		console.log(e);
		console.log('Lookup email: ' + email + ' - person email: ' + this._email);
	}
	if (!person){
		person = new Person({email: email, placement: Config.getLeader(this._placement)}, false, true);
		window.config.addPerson(email, person);
		
	}
	this._leader = person;
}
/**
 * @name process
 * @description Process a person's survey data
 * @assign Chase
 * @todo 
 *  + Get the person's xml
 *  + Get the person's leaders
 *  + Add data to xml in the: master, leaders, person's files
 */
Person.prototype.process = function(){
	this.getXml();
	if (!window.config.selectedSurvey.iseval){
		this.getLeader();
		this._leader._placement = Config.getLeader(this._placement);
	}
	this._master = window.config.getMaster();
	var xml = this.toXml();
	var id = window.config.selectedSurvey.id;
	if (!!this.course){
		$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		if (!window.config.selectedSurvey.iseval){
			$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		}
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
	}
	else{
		$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
		if (!window.config.selectedSurvey.iseval){
			$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + ']').remove();
		}
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
	}
	$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
	if (!window.config.selectedSurvey.iseval){
		$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys').append(xml.clone());
	}
	$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
}
/**
 * @name getCourseIdByName
 * @description End of semester fix: remove if statement
 * @assign Chase
 * @todo 
 *  + Check if course is pathway
 *  + Find the course in the person's xml
 *  + return the id
 */
Person.prototype.getCourseIdByName = function(name){
	if (name.indexOf('PATH') > -1){
		name = name.split(' ')[0];
	}
	return $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > courses course:contains(' + name + ')').attr('id');
}
/**
 * @name toXml
 * @description Puts all the survey components into xml form 
 * @assign Chase
 * @todo 
 *  + Create the base survey xml
 *  + Add the id
 *  + Add course id if there is one
 *  + Add the answers
 *  + return the xml
 */
Person.prototype.toXml = function(){
	var xml = $('<survey reviewed="false"></survey>');
	var id = window.config.selectedSurvey.id;
	xml.attr('id', id);
	if(!!this.course){
		this.course = this.getCourseIdByName(this.course);
		xml.attr('courseid', this.course);
	}
	for (var i = 0; i < this._answers.length; i++){
		xml.append(this._answers[i].toXml());
	}
	return xml;
}
/**
 * @end
 */



/**
 * @start Question
 */
/**
 * Question Object
 */
function Question(question, isXml){
	if (isXml){
		this.id = parseInt($(question).attr('id'));
		this.text = $(question).text();
		this.col = $(question).attr('col');
		this.replaceWhat = $(question).attr('replacewhat');
		this.replaceWith = $(question).attr('replacewith');
		this._xml = question;
	}
	else{
		this.id = parseInt(question.id);
		this.text = question.text;
		this.col = Config.columnNumberToLetter(question.col);
		this.replaceWhat = question.replaceWhat;
		this.replaceWith = question.replaceWith;
		this._xml = this.toXml();
	}
}
/**
 * @name areSame 
 * @description Checks to see if the two questions passed in are the same
 * @assign Chase
 * @todo 
 *  + Are the texts, cols, replacewiths, and replacewhats the same
 *  + return a bool
 */
Question.areSame = function(newQ, oldQ){
	if (newQ.text != oldQ.text || 
		newQ.col != oldQ.col ||
		newQ.replaceWith != oldQ.replaceWith || 
		newQ.replaceWhat != oldQ.replaceWhat){
		return false;
	}
	else{
		return true;
	}
}
/**
 * @name modify
 * @description Modify a variable in the object. This does not, however, save the object, that can only be done at the survey level.
 * @assign Chase
 * @todo 
 *  + Assign a new property and value to the question object
 */
Question.prototype.modify = function(prop, val){
	this[prop] = val;
}
/**
 * @name toXml
 * @description Create the question XML node and append the other nodes
 *              <question id name>
 * 	             <text></text>
 * 	             <replace with what/>
 *              </question>
 * @assign Chase
 * @todo 
 *  + Create the base question xml
 *  + Update the id
 *  + Add the text to the question
 *  + Add the replacewhats and the replacewiths
 *  + Return the new xml
 */
Question.prototype.toXml = function(){
	var xml = $('<question></question>');
	$(xml).attr('id', this.id).attr('col', this.col);
	$(xml).text(this.text);
	$(xml).attr('replacewith', this.replaceWith).attr('replacewhat', this.replaceWhat);
	return xml;
}
/**
 * @end
 */

window._rollup;

/**
 * @start ROLLUP
 */
/**
 * @name Rollup
 * @todo 
 *  + Fix rollup on im and aim
 */
function Rollup(){
	this._xml = ims.sharepoint.getXmlByEmail('rollup');
	this._surveyId = window.config.selectedSurvey.id;
	this._week = window.config.selectedSurvey.getWeekNumber();
	this._questions = [];
	this._master = window.config.getMaster();
}
/**
 * @name avg 
 * @description Given the sum and number of items summed it calculates the average
 * @assign Chase
 * @todo 
 *  + Divide the sum by the count
 *  + Multiply answer by 10
 *  + Floor that value and divide by 10
 *  + Return average
 */
Rollup.avg = function(sum, count){
	return Math.floor((sum / count) * 10) / 10;
}

Rollup._calcSections = function(str){
	var m = str.match(/[a-zA-Z0-9]{1,}\b/g);
	if (m == undefined) return 0;
	return m.length;
}

/**
 * @name update 
 * @description Updates the rollup with the totals for each leaders stewardship
 * @assign Chase
 * @todo 
 *  + Get the current master
 *  + Create a map to find questions based on ids and their index in an array
 *  + Add each question to an object
 *  + Go through each person in the master
 *   + Go through all instructors
 *    + Weekly hours are averaged by credit
 *   + Go through all tgls
 *    + Weekly hours are averaged by credit
 *   + Go through all aims
 *    + Weekly hours are averaged by credit
 *   + Go through all ims 
 *    + Weekly hours are averaged by credit
 *  + Add all the data collected to the rollup file
 */
Rollup.prototype.update = function(){
	var master = window.config.getMaster();
	var _this = this;
	var questions = [
		'Seek Development Opportunities',
		'Inspire a Love for Learning',
		'Develop Relationships with and among Students',
		'Embrace University Citizenship',
		'Building Faith in Jesus Christ',
		'Weekly Hours'
	]
	// GETS THE SURVEY CURRENTLY TAKEN AND FINDS THE IDS FOR EACH INSTRUCTOR STANDARD
	$(window.config._xml).find('semester[code=' + window.config.getCurrentSemester() + '] survey[id=' + this._surveyId + '] question').each(function(){
		for (var i = 0; i < questions.length; i++){
			if ($(this).text().indexOf(questions[i]) > -1){
				_this._questions.push({
					id: $(this).attr('id'),
					spot: i
				});
			}
		}
	});

	var result = {}
	for (var i = 0; i < this._questions.length; i++){
		result[this._questions[i].spot] = {};
	}

	var hours = {total: 0, credits: 0}

	$(master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=instructor]').each(function(){
		var leader = $(this).find('leadership person[type=tgl]').attr('email');
		console.log(leader + ' - ' + $(this).parents('person').attr('email'));
		for (var i = 0; i < _this._questions.length; i++){
			if (questions[_this._questions[i].spot] == 'Weekly Hours'){
				var sum = 0;
				var credits = 0;
				$(this).find('survey[id=' + _this._surveyId + '] answer[id=' + _this._questions[i].id + ']').each(function(){
					if ($(this).text().length == 0) return;
					var courseid = $(this).parents('survey').attr('courseid');
					var tmpCredits = parseInt($(this).parents('roles').parent().find("course[id=" + courseid + ']').attr('credits'));
					var sections = Rollup._calcSections($(this).parents('roles').parent().find("course[id=" + courseid + ']').attr('section'));
					sections += Rollup._calcSections($(this).parents('roles').parent().find("course[id=" + courseid + ']').attr('pwsection'));
					credits += (tmpCredits * sections);
					sum += parseFloat($(this).text());
				});
				console.log($(this).parents('person').attr('email') + ': ' + sum + ' : ' + credits);
				if (isNaN(sum) || isNaN(credits) || sum == 0 || credits == 0){
					console.log($(this).parents('person').attr('email') + ' - 0 credits');
					continue;
				}
				if (credits == 1){
					credits = 1.5;
				}
				else if (credits == 2){
					credits = 2.25;
				}
				else if (credits >= 3){
					credits = credits;
				}
				if (!result[_this._questions[i].spot][leader]) result[_this._questions[i].spot][leader] = [];
				result[_this._questions[i].spot][leader].push({credits: credits, sum: sum});
			}
			else{
				var sums = 0;
				var totals = 0;
				$(this).find('survey[id=' + _this._surveyId + '] answer[id=' + _this._questions[i].id + ']').each(function(){
					if ($(this).text().length == 0) return;
					sums += parseFloat($(this).text());
					totals++;
				})
				if (isNaN(sums) || isNaN(totals) || sums == 0 || totals == 0){
					console.log('No data for: ' + $(this).parents('person').attr('email'));
					continue;
				}
				var avg = Rollup.avg(sums, totals);
				if (!result[_this._questions[i].spot][leader]) result[_this._questions[i].spot][leader] = [];
				result[_this._questions[i].spot][leader].push(avg);
			}
		}
	});

	var top = {};
	var aims = {};

	for (var q in result){
		top[q] = {total: 0, sum: 0, credits: 0}
		for (var tgl in result[q]){
			var ary = result[q][tgl];
			var isAim = $(master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + tgl + ']').attr('highestrole') == 'aim';
			if (isAim){
				if (!aims[q]) aims[q] = {};
				if (!aims[q][tgl]) aims[q][tgl] = [];
				aims[q][tgl] = aims[q][tgl].concat(result[q][tgl]);
			}
			var count = ary.length;
			var credits = 0;
			top[q].total += count;
			var sum = 0;
			for (var i = 0; i < count; i++){
				if (questions[q] == 'Weekly Hours'){
					top[q].sum += ary[i].sum;
					top[q].credits += ary[i].credits;
					sum += ary[i].sum;
					credits += ary[i].credits;
				}
				else{
					sum += ary[i];
					top[q].sum += ary[i];
				}
			}
			if (questions[q] == 'Weekly Hours'){
				count = credits;
			}
			var avg = Rollup.avg(sum, count);
			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + tgl + '][type=tgl] question[name="' + questions[q] + '"] survey[id=' + this._surveyId + ']').remove();
			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + tgl + '][type=tgl] question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
		}
		for (var aim in aims[q]){
			var avg = 0;
			if (questions[q] == 'Weekly Hours'){
				var ary = aims[q][aim];
				var count = ary.length;
				var sum = 0;
				var credits = 0;
				for (var i = 0; i < count; i++){
					sum += ary[i].sum;
					credits += ary[i].credits;
				}
				avg = Rollup.avg(sum, credits);
			}
			else{
				var ary = aims[q][aim];
				var count = ary.length;
				var sum = ary.sum();
				avg = Rollup.avg(sum, count);
			}
			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + aim + '][type=aim] question[name="' + questions[q] + '"] survey[id=' + this._surveyId + ']').remove();
			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + aim + '][type=aim] question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
		}
		// organize aims under ims
		// concat aim underling responses
		// calculate everything
		var rollupValue = 0;
		if (questions[q] == 'Weekly Hours'){
			rollupValue = Rollup.avg(top[q].sum, top[q].credits);
		}
		else{
			rollupValue = Rollup.avg(top[q].sum, top[q].total);
		}
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > questions > question[name="' + questions[q] + '"] > survey[id=' + this._surveyId + ']').remove();
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > questions > question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + rollupValue + '" />');
	
		var org = {};

		$(master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=im]').each(function(){
			var imEmail = $(this).parents('person').attr('email');
			org[imEmail] = {
				list: [],
				aims: {}
			};
			$(this).find('> stewardship > people > person[type=aim]').each(function(){
				var aimEmail = $(this).attr('email');
				org[imEmail].aims[aimEmail] = {
					list: []
				}
				$(this).find('roles role[type=aim] > stewardship > people > person[type=tgl]').each(function(){
					var tglEmail = $(this).attr('email');
					var info = result[q][tglEmail];
					org[imEmail].list = org[imEmail].list.concat(info);
					org[imEmail].aims[aimEmail].list = org[imEmail].aims[aimEmail].list.concat(info);
				});
			});
		});

		for (var _im in org) {
			var iValue = 0;
			var list = org[_im].list;
			var sum = 0;
			var count = 0;
			if (questions[q] == 'Weekly Hours') {
				for (var i = 0; i < list.length; i++) {
					if (list[i] != undefined) {
						sum += list[i].sum;
						count += list[i].credits;
					}
				}
			} else {
				count = list.length;
				for (var i = 0; i < list.length; i++) {
					if (list[i] != undefined) {
						sum += list[i];
					}
				}
			}
			iValue = Rollup.avg(sum, count);
			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + _im + '][type=im] > questions > question[name="' + questions[q] + '"] > survey[id=' + this._surveyId + ']').remove();
			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + _im + '][type=im] > questions > question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + iValue + '" />');
			for (var _aim in org[_im].aims) {
				var aValue = 0;
				var aList = org[_im].aims[_aim].list;
				var aSum = 0;
				var aCount = 0;
				if (questions[q] == 'Weekly Hours') {
					for (var i = 0; i < aList.length; i++) {
						if (aList[i] != undefined) {
							aSum += aList[i].sum;
							aCount += aList[i].credits;
						}
					}
				} else {
					aCount = aList.length;
					for (var i = 0; i < aList.length; i++) {
						if (aList[i] != undefined) {
							aSum += aList[i];
						}
					}
				}
				aValue = Rollup.avg(aSum, aCount);
				$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + _aim + '][type=aim] > questions > question[name="' + questions[q] + '"] > survey[id=' + this._surveyId + ']').remove();
				$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + _aim + '][type=aim] > questions > question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + aValue + '" />');
			}
		}
	}
}
/**
 * @end
 */
/**
 * @start Semester Setup
 */
/**
 * Semester Setup Object
 */
function SemesterSetup(csv) {
	this._csv = csv;
	this._org = {};
	this._rollup = ims.sharepoint.getXmlByEmail('rollup');
	this._master = ims.sharepoint.getXmlByEmail('master');
}
/**
 * @name isGreater 
 * @description determines which of the two roles is greater
 * @assign Grant
 * @todo 
 *  + Compare the first role with im, aim, tgl, ocrm, ocr, and instructor
 *  + Return a bool  
 */
function isGreater(role1, role2) {
	if (role1 == 'im') {
		return true;
	} else if (role1 == 'aim') {
		if (role2 == 'im') {
			return false;
		} else {
			return true;
		}
	} else if (role1 == 'tgl') {
		if (role2 == 'aim' || role2 == 'im') {
			return false;
		} else {
			return true;
		}
	} else if (role1 == 'ocrm') {
		return true;
	} else if (role1 == 'ocr') {
		if (role1 == 'ocrm') {
			return false;
		} else {
			return true;
		}
	} else if (role1 == 'instructor') {
		if (role2 == 'instructor') {
			return true;
		} else {
			return false;
		}
	}
}
/**
 * @name semestersetup
 * @description Performs a complete semester setup
 * @assign Grant
 * @todo 
 *  + Call function to create org
 *  + Call function to create master
 *  + Call function to create individual files
 *  + Call function to create rollup
 */
SemesterSetup.prototype.semesterSetup = function() {
	var _this = this;
	function processItems(i) {		
		switch (i) {
			case 0: _this._createOrg(); break;
			case 1: _this._createMaster(); break;
			case 2: _this._createIndividualFiles(); break;
			case 3: _this._createRollup(); break;
			case 4: _this._createConfig(); break;
			default: return;
		}

		setTimeout(function(){
			++i
			ims.loading.set((20 * i));
			if (i == 5) return;
			processItems(i);
		}, 10);
	}
	
	setTimeout(function(){
		ims.loading.reset();
		ims.loading.set(10);
		processItems(0);
	}, 10)
}
/**
 * @name formalize 
 * @description capitalizes the first letter and lowercases the rest
 * @assign Grant
 * @todo 
 *  + Make sure the string is not undefined, null, or empty
 *  + Return the string where the first letter is capitalized and the rest are lowercased
 */
String.prototype.formalize = function() {
	if (this == undefined || this == null || this.length == 0) return;
	var a = this.replace('*', '');
	return a.charAt(0).toUpperCase() + a.slice(1).toLowerCase();
}

SemesterSetup.prototype._isSameSem = function() {
	var code = $(window.config._xml).find('semesters semester[current=true]').attr('code');
	return code == this._org.semester.code;
}

/**
 * @name _createConfig
 * @description
 */
SemesterSetup.prototype._createConfig = function() {
	var config = $(window.config._xml).find('semesters semester[current=true]').clone();
	$(config).attr('code', this._org.semester.code);

	if (this._isSameSem()) {
		$(window.config._xml).find('semesters semester[current=true]').remove();
	}
	
	$(window.config._xml).find('semesters semester[current=true]').attr('current', 'false');
	$(window.config._xml).find('semesters').append(config);
	//console.log(window.config._xml);
	Sharepoint.postFile(window.config._xml, 'config/', 'config.xml', function(){});
}

/**
 * @name _createOrg
 * @description Creates a new org from the csv
 * @assign Grant
 * @todo 
 *  + Get the new semester code
 *  + Go through each row of OSM report
 *   + Create instructor object
 *    + Add course
 *   + Create tgl object
 *    + Add stewardship: instructor object
 *    + Add leadership: aim object
 *   + Create aim object
 *    + Add stewardship: tgl object
 *    + Add leadership: im object
 *   + Create im object
 *    + Add stewardship: aim object
 *   + Create ocr object
 *    + Add stewardship: instructor object
 *    + Add leadership: ocrm object
 *   + create ocrm object 
 *    + Add stewardship: ocr object
 *  + Add aim, im, and ocrm full stewardship
 */
SemesterSetup.prototype._createOrg = function() {
	this._org['semester'] = {
		code: ''
	}
	this._org.semester['people'] = {};
	this._org.semester.people['person'] = [];

	var start = 0;
	while (this._csv[start][2] != 'email'){
		start++;
	}

	var sem = this._csv[++start][20].toUpperCase();
	this._org.semester.code = sem[0] + sem[1] + sem[sem.length - 2] + sem[sem.length - 1];

	for (var rows = start; rows < this._csv.length; rows++){
		if (this._csv[rows].length == 1) continue;
		// INSTRUCTOR OBJECT
		var inst = {
			first: this._csv[rows][0].formalize(),
			last: this._csv[rows][1].formalize(),
			email: this._csv[rows][2].toLowerCase().split('@')[0],
			highestrole: 'instructor',
			new: this._csv[rows][16].toLowerCase(),
			roles: {
				role: [{
					type: 'instructor',
					surveys: {},
					stewardship: {},
					leadership: {
						people: {
							person: [{
								first: this._csv[rows][11].split(' ')[0].formalize(),
								last: this._csv[rows][11].split(' ')[1].formalize(),
								email: this._csv[rows][10].toLowerCase().split('@')[0],
								type: 'im'
							},{
								first: this._csv[rows][9].split(' ')[0].formalize(),
								last: this._csv[rows][9].split(' ')[1].formalize(),
								email: this._csv[rows][8].toLowerCase().split('@')[0],
								type: 'aim'
							},{
								first: this._csv[rows][7].split(' ')[0].formalize(),
								last: this._csv[rows][7].split(' ')[1].formalize(),
								email: this._csv[rows][6].toLowerCase().split('@')[0],
								type: 'tgl'
							}]
						}
					}	
				}]
			},
			courses: {
				course: this.addCourse(this._csv[rows][2].toLowerCase().split('@')[0])
			}
		};

		// TGL OBJECT
		var tgl = {
			first: this._csv[rows][7].split(' ')[0].formalize(),
			last: this._csv[rows][7].split(' ')[1].formalize(),
			email: this._csv[rows][6].toLowerCase().split('@')[0],
			highestrole: 'tgl',
			new: false,
			roles: {
				role: [{
					type: 'tgl',
					surveys: {},
					stewardship: {
						people: {
							person: [{
								first: this._csv[rows][0].formalize(),
								last: this._csv[rows][1].formalize(),
								email: this._csv[rows][2].toLowerCase().split('@')[0],
								type: 'instructor',
								roles: {
									role: [{
										type: 'instructor',
										surveys: {},
										stewardship: {},
										leadership: {
											people: {
												person: [{
													first: this._csv[rows][7].split(' ')[0].formalize(),
													last: this._csv[rows][7].split(' ')[1].formalize(),
													email: this._csv[rows][6].toLowerCase().split('@')[0],
													type: 'tgl'
												},{
													first: this._csv[rows][9].split(' ')[0].formalize(),
													last: this._csv[rows][9].split(' ')[1].formalize(),
													email: this._csv[rows][8].toLowerCase().split('@')[0],
													type: 'aim'
												},{
													first: this._csv[rows][11].split(' ')[0].formalize(),
													last: this._csv[rows][11].split(' ')[1].formalize(),
													email: this._csv[rows][10].toLowerCase().split('@')[0],
													type: 'im'
												}]
											}
										}	
									}]
								},
								courses: {
									course: this.addCourse(this._csv[rows][2].toLowerCase().split('@')[0])
								}
							}]
						}
					},
					leadership: {
						people: {
							person: [{
								first: this._csv[rows][11].split(' ')[0].formalize(),
								last: this._csv[rows][11].split(' ')[1].formalize(),
								email: this._csv[rows][10].toLowerCase().split('@')[0],
								type: 'im'
							},{
								first: this._csv[rows][9].split(' ')[0].formalize(),
								last: this._csv[rows][9].split(' ')[1].formalize(),
								email: this._csv[rows][8].toLowerCase().split('@')[0],
								type: 'aim'
							}]
						}  
					}
				},{
					type: 'instructor',
					surveys: {},
					stewardship: {},
					leadership: {
						people: {
							person: [{
								first: this._csv[rows][9].split(' ')[0].formalize(),
								last: this._csv[rows][9].split(' ')[1].formalize(),
								email: this._csv[rows][8].toLowerCase().split('@')[0],
								type: 'tgl'
							},{
								first: this._csv[rows][11].split(' ')[0].formalize(),
								last: this._csv[rows][11].split(' ')[1].formalize(),
								email: this._csv[rows][10].toLowerCase().split('@')[0],
								type: 'aim'
							}]
						}  
					}
				}]
			},
			courses: {
				course: this.addCourse(this._csv[rows][6].toLowerCase().split('@')[0])
			}
		};
		
		// AIM OBJECT
		var aim = {
			first: this._csv[rows][9].split(' ')[0].formalize(),
			last: this._csv[rows][9].split(' ')[1].formalize(),
			email: this._csv[rows][8].toLowerCase().split('@')[0],
			highestrole: 'aim',
			new: false,
			roles: {
				role: [{
					type: 'aim',
					surveys: {},
					stewardship: {
						people: {
							person: [{
								first: this._csv[rows][7].split(' ')[0].formalize(),
								last: this._csv[rows][7].split(' ')[1].formalize(),
								email: this._csv[rows][6].toLowerCase().split('@')[0],
								type: 'tgl',
								courses: {
									course: this.addCourse(this._csv[rows][6].toLowerCase().split('@')[0])
								},
								roles: {
									role:[{
										type: 'tgl',
										surveys: {},
										stewardship: {
											people:{
												person: []
											}
										},
										leadership: {
											people: {
												person: [{
													first: this._csv[rows][9].split(' ')[0].formalize(),
													last: this._csv[rows][9].split(' ')[1].formalize(),
													email: this._csv[rows][8].toLowerCase().split('@')[0],
													type: 'aim'
												},{
													first: this._csv[rows][11].split(' ')[0].formalize(),
													last: this._csv[rows][11].split(' ')[1].formalize(),
													email: this._csv[rows][10].toLowerCase().split('@')[0],
													type: 'im'
												}]
											}
										}
									}]
								}
							}]
						}
					},
					leadership: {
						people: {
							person: [{
								first: this._csv[rows][11].split(' ')[0].formalize(),
								last: this._csv[rows][11].split(' ')[1].formalize(),
								email: this._csv[rows][10].toLowerCase().split('@')[0],
								type: 'im'
							}]
						}
					}
				},{
					type: 'tgl',
					surveys: {},
					stewardship: {
						people: {
							person: [{
								first: this._csv[rows][7].split(' ')[0].formalize(),
								last: this._csv[rows][7].split(' ')[1].formalize(),
								email: this._csv[rows][6].toLowerCase().split('@')[0],
								type: 'instructor',
								courses: {
									course: this.addCourse(this._csv[rows][6].toLowerCase().split('@')[0])
								},
								roles: {
									role:[{
										type: 'instructor',
										surveys: {},
										stewardship: {
											people:{
												person: []
											}
										},
										leadership: {
											people: {
												person: [{
													first: this._csv[rows][9].split(' ')[0].formalize(),
													last: this._csv[rows][9].split(' ')[1].formalize(),
													email: this._csv[rows][8].toLowerCase().split('@')[0],
													type: 'tgl'
												},{
													first: this._csv[rows][11].split(' ')[0].formalize(),
													last: this._csv[rows][11].split(' ')[1].formalize(),
													email: this._csv[rows][10].toLowerCase().split('@')[0],
													type: 'aim'
												}]
											}
										}
									}]
								}
							}]
						}
					},
					leadership: {
						people: {
							person: [{
								first: this._csv[rows][11].split(' ')[0].formalize(),
								last: this._csv[rows][11].split(' ')[1].formalize(),
								email: this._csv[rows][10].toLowerCase().split('@')[0],
								type: 'aim'
							}]
						}
					}
				}]
			},
			courses: {
				course: this.addCourse(this._csv[rows][8].toLowerCase().split('@')[0])
			}
		};

		// IM OBJECT
		var im = {
			first: this._csv[rows][11].split(' ')[0].formalize(),
			last: this._csv[rows][11].split(' ')[1].formalize(),
			email: this._csv[rows][10].toLowerCase().split('@')[0],
			highestrole: 'im',
			new: false,
			roles: {
				role: [{
					type: 'im',
					surveys: {},
					stewardship: {
						people: {
							person: [{
								first: this._csv[rows][9].split(' ')[0].formalize(),
								last: this._csv[rows][9].split(' ')[1].formalize(),
								email: this._csv[rows][8].toLowerCase().split('@')[0],
								type: 'aim',
								courses: {
									course: this.addCourse(this._csv[rows][8].toLowerCase().split('@')[0])
								},
								roles: {
									role: [{
										type: 'aim',
										surveys: {},
										stewardship: {
											people:{
												person: []
											}
										},
										leadership: {
											people: {
												person: [{
													first: this._csv[rows][11].split(' ')[0].formalize(),
													last: this._csv[rows][11].split(' ')[1].formalize(),
													email: this._csv[rows][10].toLowerCase().split('@')[0],
													type: 'im'
												}]
											}
										}
									}]
								}
							}]
						}
					},
					leadership: {}
				}]
			},
			courses: {
				course: this.addCourse(this._csv[rows][10].toLowerCase().split('@')[0])
			}
		};

		var ocr = null;
		var ocrm = null;

		if (this._csv[rows][13] != ""){
			// OCR OBJECT
			ocr = {
				first: this._csv[rows][13].split(' ')[0].formalize(),
				last: this._csv[rows][13].split(' ')[1].formalize(),
				email: this._csv[rows][12].toLowerCase().split('@')[0],
				highestrole: 'ocr',
				new: false,
				roles: {
					role: [{
						type: 'ocr',
						surveys: {},
						stewardship: {
							people: {
								person: [{
									first: this._csv[rows][0].formalize(),
									last: this._csv[rows][1].formalize(),
									email: this._csv[rows][2].toLowerCase().split('@')[0],
									type: 'instructor',
									roles: {
										role: [{
											type: 'instructor',
											surveys: {},
											stewardship: {
												people: {
													person: []
												}
											},
											leadership: {
												people: {
													person: [{
														first: this._csv[rows][13].split(' ')[0].formalize(),
														last: this._csv[rows][13].split(' ')[1].formalize(),
														email: this._csv[rows][12].toLowerCase().split('@')[0],
														type: 'ocr'
													}]
												}
											}
										}]
									},
									courses: {
										course: this.addCourse(this._csv[rows][2].toLowerCase().split('@')[0])
									}
								}]
							}
						},
						leadership: {
							people: {
								person: []
							}
						}
					}]
				},
				courses: {
					course: this.addCourse(this._csv[rows][12].toLowerCase().split('@')[0])
				}
			};

			// OCRM OBJECT
			ocrm = {
				first: this._csv[rows][15].split(' ')[0].formalize(),
				last: this._csv[rows][15].split(' ')[1].formalize(),
				email: this._csv[rows][14].toLowerCase().split('@')[0],
				highestrole: 'ocrm',
				new: false,
				roles: {
					role: [{
						type: 'ocrm',
						surveys: {},
						stewardship: {
							people: {
								person: [{
									first: this._csv[rows][13].split(' ')[0].formalize(),
									last: this._csv[rows][13].split(' ')[1].formalize(),
									email: this._csv[rows][12].toLowerCase().split('@')[0],
									type: 'ocr'
								}]
							}
						},
						leadership: {}
					}]
				},
				courses: {
					course: this.addCourse(this._csv[rows][14].toLowerCase().split('@')[0])
				}
			};
		}

		if (ocr != null){
			inst.roles.role[0].leadership.people.person.push({
				first: this._csv[rows][14].split(' ')[0].formalize(),
				last: this._csv[rows][14].split(' ')[1].formalize(),
				email: this._csv[rows][15].toLowerCase().split('@')[0],
				type: 'ocrm'
			},{
				first: this._csv[rows][13].split(' ')[0].formalize(),
				last: this._csv[rows][13].split(' ')[1].formalize(),
				email: this._csv[rows][12].toLowerCase().split('@')[0],
				type: 'ocr'
			});

			// OCR LEADERSHIP
			ocr.roles.role[0].leadership.people.person = [{
				first: this._csv[rows][14].split(' ')[0].formalize(),
				last: this._csv[rows][14].split(' ')[1].formalize(),
				email: this._csv[rows][15].toLowerCase().split('@')[0],
				type: 'ocrm'
			}]
		}

		this.addToOrg(im);
		this.addToOrg(aim);
		this.addToOrg(tgl);
		this.addToOrg(inst);
		if (ocr != null){
			this.addToOrg(ocr);
			this.addToOrg(ocrm);
		}
	}

	// ADD AIM AND OCRM STEWARDSHIP OF STEWARDSHIP
	for (var i = 0; i < this._org.semester.people.person.length; i++) {
		if (this._org.semester.people.person[i].highestrole == 'aim') {
			for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
				if (this._org.semester.people.person[i].roles.role[r].type == 'aim'){
					for (var t = 0; t < this._org.semester.people.person[i].roles.role[r].stewardship.people.person.length; t++) {
						var role = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].type;
						var email = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].email;
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].roles.role[0].stewardship['people'] = {};
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].roles.role[0].stewardship.people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}

		if (this._org.semester.people.person[i].highestrole == 'ocrm') {
			for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
				if (this._org.semester.people.person[i].roles.role[r].type == 'ocrm') {
					for (var t = 0; t < this._org.semester.people.person[i].roles.role[r].stewardship.people.person.length; t++) {
						var role = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].type;
						var email = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].email;
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t]['people'] = {};
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[t].people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}
	}

	// ADD IM STEWARDSHIP OF STEWARDSHIP
	for (var i = 0; i < this._org.semester.people.person.length; i++) {
		if (this._org.semester.people.person[i].highestrole == 'im') {
			for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
				if (this._org.semester.people.person[i].roles.role[r].type == 'im') {
					for (var a = 0; a < this._org.semester.people.person[i].roles.role[r].stewardship.people.person.length; a++) {
						var role = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[a].type;
						var email = this._org.semester.people.person[i].roles.role[r].stewardship.people.person[a].email;
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[a].roles.role[0].stewardship['people'] = {};
						this._org.semester.people.person[i].roles.role[r].stewardship.people.person[a].roles.role[0].stewardship.people['person'] = this.addStewardship(email, role);
					}
				}
			}
		}
	}
}
/**
 * @name addCourse 
 * @description
 */
SemesterSetup.prototype.addCourse = function(email) {
	var course = [];
	var start = 0;
	var idx = 0;
	while (this._csv[start][2] != 'email') {
		start++;
	}

	for (var i = start; i < this._csv.length; i++) {
		if (this._csv[i][2] == email) {
			var pos = 0;
			var duplicate = false;
			
			for (var c = 0; c < course.length; c++) {
				if (course[c].$text == this._csv[i][3]) {
					duplicate = true;
					pos = c;
				}
			}

			if (duplicate) {
				if (this._csv[i][19] == 'TRUE') {
					if (course[pos].pwsection == '') {
						course[pos].pwsection = this._csv[i][5];
					} else {
						course[pos].pwsection += ' ' + this._csv[i][5];
					}
				} else {
					if (course[pos].section == '') {
						course[pos].section = this._csv[i][5];
					} else {
						course[pos].section += ' ' + this._csv[i][5];
					}
				}
			} else {
				course.push({
					id: 1,
					$text: this._csv[i][3],
					credits: this._csv[i][4],
					pilot: this._csv[i][17].toLowerCase(),
					ocr: this._csv[i][18].toLowerCase()
				});

				if (this._csv[i][19] == 'TRUE') {
					course[idx]['pwsection'] = this._csv[i][5];
					course[idx]['section'] = '';
				} else {
					course[idx]['section'] = this._csv[i][5];
					course[idx]['pwsection'] = '';
				}

				idx++;
			}
		}
	}

	return course;
}
/**
 * @name addStewardship 
 * @description
 * @assign Grant
 * @todo 
 *  + Loop through each person in org
 *   + Add stewardship to the person
 */
SemesterSetup.prototype.addStewardship = function(email, role) {
	for (var i = 0; i < this._org.semester.people.person.length; i++) {
		if (this._org.semester.people.person[i].email == email) {
			for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
				if (this._org.semester.people.person[i].roles.role[r].type == role) {
					return this._org.semester.people.person[i].roles.role[r].stewardship.people.person;
				}
			}
		}
	}
}
/**
 * @name addToOrg 
 * @description
 * @assign Grant
 * @todo
 *  + Check if the person is already in org
 *   + If in org already check role, course, and section
 */
SemesterSetup.prototype.addToOrg = function(person) {
	if (this._org.semester.people.person.length == 0) {
		this._org.semester.people.person.push(person);
	}
	else {
		for (var i = 0; i < this._org.semester.people.person.length; i++) {
			if (this._org.semester.people.person[i].email == person.email) { // THE PERSON IS ALREADY IN THE ORG
				// CHECK ROLE
				if (this._org.semester.people.person[i].highestrole != person.highestrole) {
					// CHOOSE HIGHEST ROLE
					if (!isGreater(this._org.semester.people.person[i].highestrole, person.highestrole)) {
						this._org.semester.people.person[i].highestrole = person.highestrole;
					}
					// ADD ROLE
					var uniqueRole = true; 
					for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
						if (this._org.semester.people.person[i].roles.role[r].type == person.roles.role[0].type) {
							uniqueRole = false;
						}
					}

					if (uniqueRole) {
						this._org.semester.people.person[i].roles.role.push(person.roles.role[0]);
					}
				} else {
					for (var r = 0; r < this._org.semester.people.person[i].roles.role.length; r++) {
						// FIND THE ROLE THAT IS SHARED
						if (person.roles.role[r] != undefined && this._org.semester.people.person[i].roles.role[r].type == person.roles.role[r].type) {
							var setSteward = true;
							var setLeader = true;
							if (this._org.semester.people.person[i].roles.role[r].stewardship.people != undefined) {
								for (var s = 0; s < this._org.semester.people.person[i].roles.role[r].stewardship.people.person.length; s++) {
									if (this._org.semester.people.person[i].roles.role[r].stewardship.people.person[s].email == person.roles.role[0].stewardship.people.person[0].email) {
										setSteward = false;
									}
								}

								if (setSteward) {
									this._org.semester.people.person[i].roles.role[r].stewardship.people.person.push(person.roles.role[r].stewardship.people.person[0]);
								}
							}
							if (this._org.semester.people.person[i].roles.role[r].leadership.people != undefined) {
								for (var l = 0; l < this._org.semester.people.person[i].roles.role[r].leadership.people.person.length; l++) {
									if (this._org.semester.people.person[i].roles.role[r].leadership.people.person[l].email == person.roles.role[0].leadership.people.person[0].email) {
										setLeader = false;
									}
								}
								
								if (setLeader) {
									this._org.semester.people.person[i].roles.role[r].leadership.people.person.push(person.roles.role[0].leadership.people.person[0]);
								}
							}
						}
					}
				}
				return;
			}
		}
		this._org.semester.people.person.push(person);
	}
}
/**
 * @name _createRollup
 * @description Creates a new semester rollup section in the rollup file
 * @assign Grant
 */
SemesterSetup.prototype._createRollup = function() {
	console.log('rollup is being created');
	var code = this._org.semester.code;
	var people = this._org.semester.people.person;
	var semester = $('<semesters><semester code="' + code + '"><people></people></semester></semesters>');
	for (var p = 0; p < people.length; p++) {
		for (var r = 0; r < people[p].roles.role.length; r++) {
			var role = people[p].roles.role[r].type;
			if (role != 'instructor' && role != 'ocr' && role != 'ocrm') {
				var person = {
					email: people[p].email,
					type: role,
					questions: {
						question: [{
							name: 'Seek Development Opportunities'
						},{
							name: 'Inspire a Love for Learning'
						},{
							name: 'Develop Relationships with and among Students'
						},{
							name: 'Embrace University Citizenship'
						},{
							name: 'Building Faith in Jesus Christ'
						},{
							name: 'Weekly Hours'
						}]
					}
				}
				semester.find('semester > people').append(byui.createNode('person', person));
			}
		}
	}
	var questions = {
		question: [{
			name: 'Seek Development Opportunities'
		},{
			name: 'Inspire a Love for Learning'
		},{
			name: 'Develop Relationships with and among Students'
		},{
			name: 'Embrace University Citizenship'
		},{
			name: 'Building Faith in Jesus Christ'
		},{
			name: 'Weekly Hours'
		}]
	};
	semester.find('semester').append(byui.createNode('questions', questions));
	
	if (this._isSameSem()) {
		$(this._rollup).find('semesters semester[code="' + code + '"]').remove();
	}

	$(this._rollup).find('semesters').append($(semester).find('semester').clone());
	
	//console.log(this._rollup);
	Sharepoint.postFile(this._rollup, 'master/', 'rollup.xml', function(){});
}
/**
 * @name _createMaster
 * @description Creates a new semester master section in the master file
 * @assign Grant
 */
SemesterSetup.prototype._createMaster = function() {
	console.log('master is being created');
	var newMaster = byui.createNode('semesters', this._org);
	if (this._isSameSem()) {
		$(this._master).find('semesters semester[code="' + this._org.semester.code + '"]').remove();
	}
	$(this._master).find('semesters').append($(newMaster).find('semester').clone());
	//console.log(this._master);
	Sharepoint.postFile(this._master, 'master/', 'master.xml', function(){});
}
/**
 * @name _createIndividualFiles
 * @description Creates a new semester sections in all of the peoples files from the map file
 * @assign Grant
 */
SemesterSetup.prototype._createIndividualFiles = function() {
	console.log('individual files are being created');
	var code = this._org.semester.code;
	var people = this._org.semester.people.person;
	for (var p = 0; p < people.length; p++) {
		var semester = $('<semesters><semester code="' + code + '"><people></people></semester></semesters>');
		var person = byui.createNode('person', people[p]);
		semester.find('semester > people').append(person);
		var xml = ims.sharepoint.getXmlByEmail(people[p].email);
		if (xml != null) {
			if (this._isSameSem()) {
				$(xml).find('semesters semester[code="' + code + '"]').remove();
			}
			$(xml).find('semesters').append($(semester).find('semester').clone());
		} else {
			xml = $.parseXML((new XMLSerializer()).serializeToString(semester[0]));
		}
		//console.log(xml);
		Sharepoint.postFile(xml, 'master/', people[p].email + '.xml', function(){});
	}
}
/**
 * @name _isDifferent
 * @description Checks if the map has changed
 * @assign Grant
 */
SemesterSetup.prototype._isDifferent = function(){
	console.log('are the semesters already the same');
}
/**
 * @name _updateRollup
 * @description Checks for rollup changes and changes to be the most current
 * @assign Grant
 */
SemesterSetup.prototype._updateRollup = function(){
console.log('rollup is being updated');
}
/**
 * @name _updateMaster
 * @description Checks for master changes and changes to be the most current
 * @assign Grant
 */
SemesterSetup.prototype._updateMaster = function(){
	console.log('master is being updated');
}
/**
 * @name _updateIndividualFiles
 * @description Checks for individual file changes and changes to be the most current
 * @assign Grant
 */
SemesterSetup.prototype._updateIndividualFiles = function(){
	console.log('individual files are being updated');
}
/**
 * @end
 */
/**
 * @start SURVEY
 */
/**
 * @name Survey
 * @description Survey Object
 * @todo 
 *  + Remove iseval from all surveys
 */
function Survey(survey, isXml){
	if (isXml){
		this.iseval = $(survey).attr('iseval') && $(survey).attr('iseval') == 'true';
		this.id = parseInt($(survey).attr('id'));
		if ($(survey).attr('week')){
			this.week = $(survey).attr('week');
		}
		this.placement = $(survey).attr('placement');
		this.email = $(survey).attr('email');
		this.name = $(survey).attr('name');
		if ($(survey).attr('course')){
			this.course = $(survey).attr('course');
		}
		this._xml = survey;
		this.questions = [];
		this._setXmlQuestions();
		this.people = [];
	} else {
		this.iseval = survey.iseval && survey.iseval == 'true';
		this.id = parseInt(survey.id);
		if (survey.week != undefined){
			this.week = survey.week;
		}
		this.placement = survey.placement;
		this.email = survey.email;
		this.name = survey.name;
		if (survey.course){
			this.course = survey.course;
		}
		this.questions = survey.questions;
		this._xml = this.toXml();
		this.people = [];
	}
	this.processed = 0;
}
/**
 * @name getPerson 
 * @description
 * @assign Chase
 * @todo 
 *  + Try the email to be sure its someones
 *  + Go through all the people and and return the one based on their email
 */
Survey.prototype.getPerson = function(email){
	try{
		email = Person.cleanEmail(email);
	}
	catch(e){
		console.log(email);
		throw e;
	}
	for (var i = 0; i < this.people.length; i++){
		if (this.people[i]._email == email) return this.people[i];
	}
	return false;
}
/**
 * @name _setXmlQuestions
 * @description Set the questions questions by passing in the question node from the XML
 * @assign Chase
 * @todo 
 *  + Go through each question in xml and add to the survey questions
 */
Survey.prototype._setXmlQuestions = function(){
	var _this = this;
	$(this._xml).find('question').each(function(){
		_this.questions.push(new Question(this, true));
	})
}
/**
 * @name getName 
 * @description
 * @assign Chase
 * @todo 
 *  + Return the name of the survey
 */
Survey.prototype.getName = function(){
	return this.name + ': Week ' + this.week;
}
/**
 * @name toXml
 * @description Use the objects member variables to create the survey node
 * @assign Chase
 * @todo 
 *  + Create the base survey xml
 *  + Add the id, placement, type, name, email
 *  + Add week and course if necessary
 *  + Return the xml survey
 */
Survey.prototype.toXml = function(){
	var survey = $('<survey><questions></questions></survey>');
	survey.attr('id', this.id)
		.attr('placement', this.placement)
		.attr('type', this.type)
		.attr('name', this.name)
		.attr('email', this.email)
		.attr('iseval', this.iseval);

	if (this.week){
		survey.attr('week', this.week);
	}
	if (this.course){
		survey.attr('course', this.course);
	}

	return survey;
}
/**
 * @name save
 * @description Create the xml from the given objects. Remove the survey from the config file. Add the newly created xml to the config file.
 * @assign Chase 
 * @todo
 *  + Convert the current survey to xml
 *  + Convert the questions to xml
 *  + Add questions to survey
 *  + Add survey to Config
 *  + Post config
 */
Survey.prototype.save = function(){
	var survey = this.toXml();
	
	for (var i = 0; i < this.questions.length; i++){
		var q = this.questions[i];
		var xml = q.toXml();
		$(survey).find('questions').append(xml);
	}

	var parent = $(this._xml).parent();
	if (parent.length != 0){ // modified survey
		this.remove();
		parent.append(survey);
	}
	else{ // registered survey
		$(window.config._xml).find('semester[code="' + window.config.getCurrentSemester() + '"] surveys').append(survey);
	}
	

	Sharepoint.postFile(window.config._xml, 'config/', 'config.xml', function(){
		alert('Survey change was successful!');
		window.location.reload();
	});
}
/**
 * @name remove
 * @description Remove the survey from the xml of the config
 * @assign Chase
 * @todo 
 *  + Remove the survey from the xml
 *  + Set the xml to null
 */
Survey.prototype.remove = function(){
	$(this._xml).remove();
	this._xml = null;
}
/**
 * @name modify
 * @description Modifiy a certain aspect of object, if save is necessary, its there.
 * @assign Chase
 * @todo 
 *  + Check that the value is not undefined
 *  + If the current property does not equal the value, reset the value with the new one
 */
Survey.prototype.modify = function(prop, value){
	if (value == undefined) return;

	if (this[prop] != value){
		this[prop] = value;
	}
}
/**
 * @name copy
 * @description Clone and rename survey to append (Copy) and increment the id
 * @assign Chase
 * @todo
 *  + Copy the survey
 *  + Include copy in the name
 *  + Change the id to the highest id plus 1
 *  + Return new survey
 */
Survey.prototype.copy = function(){
	var cloned = $(this._xml).clone();
	$(cloned).attr('name', $(cloned).attr('name') + ' (Copy)');
	$(cloned).attr('id', window.config.getHighestSurveyId() + 1);
	return new Survey(cloned, true);
}
/**
 * @name process
 * @description Collects the questions, people, and the peoples answers
 * @assign Chase
 * @todo 
 *  + Go through each row and add people
 */
Survey.prototype.process = function(rows){
	// go through each row and add people
	var eCol = Config.columnLetterToNumber(this.email);
	var cCol = -1;
	if (this.course){
		cCol = Config.columnLetterToNumber(this.course);
	}
	var spot = 0;
	for (var i = 0; i < rows.length; i++){
		if (rows[i][2].match(/\./g) && rows[i][2].match(/\./g).length >= 2){
			spot = i;
			break;
		}
	}
	var i = spot;
	var _this = this;

	var stats = {
		total: 0,
		spot: 0
	};
	/**
	 * @name processItems 
	 * @description process all the survey data collected
	 * @assign Chase
	 * @todo 
	 *  + Clean answers and then add them to their respective individual
	 */
	function processItems(){
		if (i >= rows.length){
			window.rollup = new Rollup();
			window.rollup.update();
			for (var email in window.config.otherPeople){
				var person = window.config.otherPeople[email];
				if (person.isValid()){
					person.process();
					_this.processed++
				}
			}

			for (var j = 0; j < _this.people.length; j++){
				stats.total++;
				_this.people[j].save(function(){
					if (++stats.spot == stats.total){
						setTimeout(function(){
							alert('Completed | Please reload the page');
							ims.loading.reset();
						}, 1000)
					}
				});
			}

			for (var email in window.config.otherPeople){
				stats.total++;
				window.config.otherPeople[email].save(function(){
					if (++stats.spot == stats.total){
						setTimeout(function(){
							alert('Completed | Please reload the page');
							ims.loading.reset();
						}, 1000)
					}
				});
			}
			stats.total++;
			Sharepoint.postFile(window.rollup._xml, 'master/', 'rollup.xml', function(){
				if (++stats.spot == stats.total){
					setTimeout(function(){
						alert('Completed | Please reload the page');
						ims.loading.reset();
					}, 1000)
				}
			});
			stats.total++;
			Sharepoint.postFile(window.config.getMaster(), 'master/', 'master.xml', function(){
				if (++stats.spot == stats.total){
					setTimeout(function(){
						alert('Completed | Please reload the page');
						ims.loading.reset();
					}, 1000)
				}
			});
		} 
		// clean answers  and then add them to their respective individual
		if (i < rows.length && rows[i][eCol] != undefined){
			var person = null;
			try{
				person = window.config.getPerson(rows[i][eCol]);
			}
			catch (e){
				console.log(e);
				console.log('(Survey.prototype.process) ' + rows[i]);
				i++;
				processItems();
			}
			var again = false;
			var oldPlacement;
			if (!person){
				person = new Person({
					email: rows[i][eCol],
					row: rows[i],
					placement: _this.placement,
					answers: Answer.collect(_this, rows[i])
				}, false, true);
				oldPlacement = person._placement.toLowerCase();
			}
			else{
				person._answers = Answer.collect(_this, rows[i]);
				person._row = rows[i];
				again = true;
				oldPlacement = person._placement.toLowerCase();
				person._placement = _this.placement.toLowerCase();
			}
			if (cCol != -1){
				person.course = Survey.cleanCourse(rows[i][cCol]);
			}
			if (person.isValid()){
				if (!again) _this.people.push(person);
				person.process();
				_this.processed++;
				person._placement = oldPlacement.toLowerCase();
			}
			else{
				console.log('(Survey.prototype.process) Invalid person: ' + rows[i][eCol]);
			}
			i++;
			setTimeout(function(){
				ims.loading.set((i / rows.length) * 100);
				processItems();
			}, 10);
		}
		else if (rows[i] != undefined && rows[i][eCol] == undefined){
			i++;
			if (i == rows.length){
				ims.loading.set((i / rows.length) * 100);
				processItems();
			}
		}
	}

	processItems();
}
/**
 * @name cleanCourse 
 * @description
 * @assign Chase
 * @todo
 *  + Check if the string matches the course name form
 *   + If so, split and rejoin to ensure the proper spacing
 *  + Return trimmed string 
 */
Survey.cleanCourse = function(str){
	var found = str.match(/([a-zA-Z]{1,}[0-9]{3})/g);
	if (found && found.length > 0){
		str = str.split(/([a-zA-Z]{1,})/g).join(' ');
	}
	return str.trim().toUpperCase();
}
/**
 * @name getQuestionById
 * @description Get the question by Id
 * @assign Chase
 * @todo
 *  + Go through each question
 *   + Check if the id matches the question id passed in 
 *    + return question
 *  + Not found, return false
 */
Survey.prototype.getQuestionById = function(id){
	for (var i = 0; i < this.questions.length; i++){
		if (this.questions[i].id == id) return this.questions[i];
	}
	return false;
}
/**
 * @name hasAttrs
 * @description If the survey has the attributes of the parameter object
 * @assign Chase
 * @todo 
 *  + Get the passed in objects keys
 *  + Go through and check if the keys are the same as surveys attributes
 *  + Return a bool
 */
Survey.prototype.hasAttrs = function(obj){
	var keys = Object.keys(obj);
	for (var i = 0; i < keys.length; i++){
		if (this[keys[i]] != obj[keys[i]]) return false;
	}
	return true;
}
/**
 * @name updateQuestions 
 * @description
 * @assign Chase
 * @todo
 *  + Go through each question
 *   + As you go through the passed in questions check if they are the same
 *    + Assign the id of the old to the new
 *  + Re-id all the questions that dont have an id
 *  + Add these questions to the survey object
 */
Survey.prototype.updateQuestions = function(qs){
	for (var j = 0; j < this.questions.length; j++){
		for (var i = 0; i < qs.length; i++){
			if (Question.areSame(qs[i], this.questions[j])){
				qs[i]['id'] = this.questions[j].id;
			}
		}	
	}

	var questions = this.idQuestions(qs);
	this.questions = [];
	for (var i = 0; i < questions.length; i++){
		questions[i].col = Config.columnNumberToLetter(questions[i].col);
		this.questions.push(new Question(questions[i], false));
	}
}
/**
 * @name idQuestions 
 * @description
 * @assign Chase
 * @todo 
 *  + Go through each question and keep track of the ids
 *  + Add question ids for questions without id
 *  + Return the list of questions
 */
Survey.prototype.idQuestions = function(questions){
	var topId = 0;
	for (var i = 0; i < questions.length; i++){
		if (questions[i].id && questions[i].id > topId){
			topId = questions[i].id;
		}
	}

	for (var i = 0; i < questions.length; i++){
		if (questions[i].id == undefined){
			questions[i]['id'] = ++topId;
		}
	}

	return questions;
}
/**
 * @name getWeekNumber 
 * @description
 * @assign Chase
 * @todo 
 *  + All names have a colon, check the indexof ':'
 *  + It should be a number unless it is intro
 *  + Return intro or the number
 */
Survey.prototype.getWeekNumber = function(){
	if (this.name.indexOf(':') > -1){
		if (this.name.indexOf('Intro') > -1){
			return 'Intro';
		}
		else{
			var num = this.name.split(': Week ')[1];
			return parseInt(num);
		}
	}	
	return null;
}
/**
 * @name addQuestion 
 * @description
 * @assign Chase
 * @todo 
 *  + Make sure that the question is not already in the survey
 *  + If the question is not in the survey, add it
 */
Survey.prototype.addQuestion = function(q){
	var found = false;
	for (var i = 0; i < this.questions.length; i++){
		if (q.id == this.questions[i].id){
			found = true;
			break;
		}
	}
	if (!found){
		this.questions.push(q);
	}
}
/**
 * @name getHighestQuestionId 
 * @description Get the highest question id in the survey
 * @assign Chase
 * @todo 
 *  + Go through each question and retain the highest id
 *  + Return the highest id
 */
Survey.prototype.getHighestQuestionId = function(){
	var id = 0;
	$(this.questions).each(function(){
		if (id < this.id){
			id = this.id;
		}
	});
	return parseInt(id);
}
/**
 * @end
 */
/**
 * @name Tool 
 * @description This tool is meant to parse the OSM semester setup report
 * 
 * @param {[type]} file   [description]
 * @param {[type]} left   [description]
 * @param {[type]} right  [description]
 * @param {[type]} course [description]
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
 * @name contains 
 * @description
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
 * @description
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

	if (this.course != null) {
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
 * @description
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