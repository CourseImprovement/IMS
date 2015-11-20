//  GROUP IMS
/**
 * IMS Object
 */
window.ims = {};
ims.url = {};
ims.url._base = window.location.protocol + '//' + window.location.hostname + '/sites/onlineinstructionreporting/onlineinstructionreportingdev/';
ims.url.relativeBase = '/sites/onlineinstructionreporting/onlineinstructionreportingdev/';
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

/**
 * Get the master file
 * @param {Boolean} isMap [description]
 */
function Master(isMap){
	this._xml = ims.sharepoint.getXmlByEmail('master');
	this.init();
}

/**
 * Initialize the master file by creating all of the people and organization
 * @return {[type]} [description]
 */
Master.prototype.init = function(){
	var sem = window.config.getCurrentSemester();
	this.people = [];
	this.graph = {};
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
 * Master person, person was too polluted
 * @param {[type]} xml    [description]
 * @param {[type]} master [description]
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
	$(xml).find('role').each(function(){
		_this.roles.push($(this).attr('type'));
	});
	this.leaders = {}; // organized
	this.uppers = []; // unorganized
	this.lowers = []; // unorganized
	this.master = master;
}

/**
 * Provide the uppers and the lowers
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
// GROUP ANSWER
/**
 * Answer object
 * @param {Object} obj Contains a question and answer.
 */
function Answer(obj){
	this._question = obj.question;
	this._answer = obj.answer;
	this.clean();
}

/**
 * Replaces text in answers and encodes certain characters to xml
 */
Answer.prototype.clean = function(){
	if (this._answer == undefined) return;
	for (var i = 0; i < this._question.replaceWhat.length; i++){
		var replaceWhat = new RegExp(this._question.replaceWhat[i], 'g');
		var replaceWith = new RegExp(this._question.replaceWith[i], 'g');
		this._answer = this._answer.replace(replaceWhat, replaceWith);
	}
	this._answer.encodeXML();
}

/**
 * Converts the components of the answer into xml
 * @return {Object} Answer in xml form
 */
Answer.prototype.toXml = function(){
	var xml = $('<answer></answer>');
	xml.attr('id', this._question.id);
	xml.text(this._answer);
	return xml; 
}

/**
 * Collects survey data from a csv row
 * @param  {Object} survey Contains information on the survey
 * @param  {Array}  row    A person's row from the csv file, which contains their information and answers
 * @return {Array}         The person's answers with the questions
 */
Answer.collect = function(survey, row){
	var result = [];
	for (var i = 0; i < survey.questions.length; i++){
		var answer = row[survey.questions[i].col];
		result.push(new Answer({
			question: survey.questions[i], 
			answer: answer
		}));
	}
	return result;
}
// GROUP ANSWER END



// GROUP CONFIG
/**
 * Config Object
 */
function Config(){
	this.surveys = [];
	this._initSetup();
	this._xml;
	this.semesters = ims.sharepoint.getSemesterConfig();
	this.selectedSurvey = null;
	this.otherPeople = {};
}

/**
 * Add a survey to the list of surveys
 * @param  {Object} survey Survey to be copied
 */
Config.prototype.addSurvey = function(survey){
	this.surveys.push(survey);
	$(this._xml).find('semester[code=' + this.getCurrentSemester() + '] surveys').append(survey._xml);
}

/**
 * Gets the current semester from the semester xml file
 * @return {String} The semester name. e.g. FA15, WI16
 */
Config.prototype.getCurrentSemester = function(){
	if (!this._currentSemester) this._currentSemester = $(this.semesters).find('[current=true]').attr('name');
	return this._currentSemester;
}

/**
 * Get all the serveys
 * @return {[type]} [description]
 */
Config.prototype.getSurveys = function(){
	return this.surveys;
}

/**
 * Returns the survey using the id
 * @param  {Integer} id Numerical id for the survey
 * @return {Object}    Xml of the survey with id of 'id'
 */
Config.prototype.getSurveyById = function(id){
	for (var i = 0; i < this.surveys.length; i++){
		if (this.surveys[i].id == parseInt(id)) return this.surveys[i];
	}
	return null;
}

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
}

/** 
 * Inital setup. Create the survey objects
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
 * Find a survey based on the criteria in an object
 * @param  {Object} obj Contains information for a survey
 * @return {Object}     Survey that contains information of param obj
 */
Config.prototype.findSurvey = function(obj){
	var found = null;
	$(this.surveys).each(function(){
		if (this.hasAttrs(obj)) found = this;
	});
	return found;
}

/**
 * Create a survey based on a passed through object.
 * TODO:
 * 	figure out what the object is and add it to the survey object.
 * @param  {Object} obj Contains all information for a survey
 * @return {Object}     The new survey object that was just created
 */
Config.prototype.createSurvey = function(obj){
	var spot = this.surveys.length;
	this.surveys.push(new Survey(obj, false));	
	return this.surveys[spot];
}

/**
 * Get the next highest survey id
 * @return {Integer} Highest id for a survey
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
 * Get a person from first the survey, then from global
 * @param  {String} email Email of a person to find
 * @return {Object}       The object of a person with attribute 'email'
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
 * Add person to global list
 * @param {Object} person Contains all information regarding a person
 */
Config.prototype.addPerson = function(email, person){
	this.otherPeople[email] = person;
}

/**
 * Get the master file
 * @return {Object} Master xml file from sharepoint
 */
Config.prototype.getMaster = function(){
	if (!this._master){
		this._master = ims.sharepoint.getXmlByEmail('master');
	}
	return this._master;
}

/**
 * get the map file
 * @return {Object} The map xml
 */
Config.prototype.getMap = function(){
	if (!this._map){
		this._map = ims.sharepoint.getXmlByEmail('map');
	}
	return this._map;
}

/**
 * Get the next up leader as string
 * @param  {String} p  A role
 * @return {String}    That role's immediate leader
 */
Config.prototype._getSurveyColumns = function(surveyId){
	var survey = $(this._xml).find('semester[code=FA15] > surveys > survey[id="' + surveyId + '"]');
	var columns = {
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
 * [surveyModify description]
 * @param  {[type]} name      [description]
 * @param  {[type]} emailCol  [description]
 * @param  {[type]} weekCol   [description]
 * @param  {[type]} typeCol   [description]
 * @param  {[type]} placement [description]
 * @param  {[type]} courseCol [description]
 * @param  {[type]} questions [description]
 * @param  {[type]} surveyId  [description]
 * @return {[type]}           [description]
 */
Config.prototype.surveyModify = function(name, emailCol, weekCol, typeCol, placement, courseCol, questions, surveyId){
	var survey = window.config.getSurveyById(surveyId);
	survey.modify('week', weekCol);
	survey.modify('placement', placement);
	survey.modify('type', typeCol);
	survey.modify('email', emailCol);
	survey.modify('name', name);
	survey.modify('course', courseCol);
	survey.updateQuestions(questions);
	survey.save();
}

/**
 * [surveyRegister description]
 * @param  {[type]} name      [description]
 * @param  {[type]} emailCol  [description]
 * @param  {[type]} weekCol   [description]
 * @param  {[type]} typeCol   [description]
 * @param  {[type]} placement [description]
 * @param  {[type]} courseCol [description]
 * @param  {[type]} questions [description]
 * @return {[type]}           [description]
 */
Config.prototype.surveyRegister = function(name, emailCol, weekCol, typeCol, placement, courseCol, questions){
	var questionSet = [];

	for (var i = 0; i < questions.length; i++){
		questions[i]['id'] = i + 1;
		console.log(questions[i].col);
		questions[i].col = Config.columnNumberToLetter(questions[i].col); 
		questionSet.push(new Question(questions[i], false));
	}

	var survey = {
		id: this.getHighestSurveyId() + 1,
		placement: placement,
		type: typeCol,
		email: emailCol,
		name: name,
		questions: questionSet
	}

	if (weekCol) survey['week'] = weekCol;
	if (courseCol) survey['course'] = courseCol;

	var newSurvey = new Survey(survey, false);
	newSurvey.save();
	this.surveys.push(newSurvey);
}

/**
 * [getLeader description]
 * @param  {[type]} p [description]
 * @return {[type]}   [description]
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
 * Convert a column letter to number
 * @param  {String} letter  Letter combination referencing an excel column
 * @return {Integer}        Numerical value of the excel column
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
 * TODO:
 * 		- Change AZ as the highest to BZ
 * @param  {Integer} num Numerical value that is associated with an excel column
 * @return {String}         Column as a string
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
// GROUP CONFIG END



/**
 * Only one survey instance can be initalized at one time
 * @type {Config}
 */
window.config = new Config();



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



/**
 * @namespace angular
 * @typedef {Object} Xml_Document An xml document which contians organizational data and personnel data 
 */
var app = angular.module('admin', []);
app.controller('adminCtrl', ["$scope", function($scope){

	var sem = window.config.getCurrentSemester();

	// GROUP - MENU TOGGLE
	/**
	 * Reset all variables
	 */
	function reset(){
		$scope.surveyName = '';
		$scope.surveyWeek = '';
		$scope.Placement = '';
		//$scope.questions = [];
		$scope.csv = [];
		$scope.file = null;
		$scope.evaluations = {};
		$scope.isFile = false;
		surveyId = null;
		editingQuestion = {};
	}
	
	/**
	 * Toggle page views. Default is the 'home' page
	 * @memberOf angular
	 * @type {String}
	 */
	$scope.mode = 'home';
	/**
	 * Changes $scope.mode
	 * @param  {string} mode Type of view
	 * @memberOf angular
	 * @function
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
	// GROUP - MENU TOGGLE END
	


	// GROUP - PERMISSIONS
	/**
	 * Check permissions 
	 * @see {@link ims.permissions#needsChanges}
	 * @memberOf angular
	 * @function
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
	 * Alerts the user to the percentage completed
	 * @function
	 * @memberOf angular
	 */
	$scope.permissions = function(){
		if (!permissionsGlobal) permissionsGlobal = new Permissions();
	}
	// GROUP - PERMISSIONS END



	// GROUP - LEADERSHIP EVALUATION
	/**
	 * [evalAdded description]
	 * @type {Boolean}
	 */
	$scope.evalAdded = false;
	/**
	 * [evaluations description]
	 * @type {Object}
	 */
	$scope.evaluations = {};
	/**
	 * [arrayOfColumns description]
	 * @param  {[type]} columns [description]
	 * @return {[type]}         [description]
	 */
	function arrayOfColumns(columns){
		if (columns.indexOf('-') > -1){
			var sets = columns.split(';');
			for (var i = 0; i < sets.length; i++){
				if (sets[i].indexOf('-') > -1){
					var start = Config.columnLetterToNumber(sets[i].split('-')[0]);
					var end = Config.columnLetterToNumber(sets[i].split('-')[1]);
					sets.splice(i, 1);
					if (start > end) throw "columns need to be read from left to right";
					for (var j = start; j <= end; j++){
						sets.splice(i, 0, Config.columnNumberToLetter(j));
					}
				}
			}
			return sets.sort();
		}
		else{
			return columns.split(';');
		}
	}
	/**
	 * Adds the evaluation to the evaluations array
	 * @param {String} role      The role of the ones being evaluated
	 * @param {String} email     Column that contains the email
	 * @param {String} columns   Column where the data is located
	 * @param {String} questions The Text for the data column
	 * @param {String} logics    How to display the data (Percentage or Value)
	 * @memberOf angular
	 * @function
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
		
		var cs = arrayOfColumns(columns);
		var qs = questions.split(';');
		var ls = logics.split(';');

		var eval = [];

		for (var i = 0; i < cs.length; i++){
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
	 * Resets the current evaluation
	 */
	$scope.clearEvaluation = function(){
		$scope.evaluations = {};
		$scope.evalAdded = false;
		$scope.isFile = false;
	}
	/**
	 * Create a new evaluation and parses the evaluations previously gathered
	 * @memberOf angular
	 * @function
	 */
	$scope.CreateEvaluationCSV = function(){
		var e = new Evaluations($scope.evaluations, $scope.file);
		e.parseCSV();
		$scope.mode = 'home';
	}
	// GROUP - LEADERSHIP EVALUATION END



	// GROUP - SEMESTER SETUP
	/**
	 * Creates all semester files based on provided org file 
	 * @see {@link ims.surveys#readAsCsv2}
	 * @memberOf angular
	 * @function
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
	 * Updates all semester files based on provided org file 
	 * @see {@link ims.surveys#readAsCsv2}
	 * @memberOf angular
	 * @function
	 */
	$scope.semesterUpdate = function(){
		var s = new SemesterSetup();
		s.semesterUpdate();
	}
	// GROUP - SEMESTER SETUP END
	


	// GROUP - SELECT FILE
	/**
	 * Contains the current file
	 * @type {[type]}
	 */
	$scope.file = null;
	$scope.isFile = false;
	/**
	 * Select a file
	 * @function
	 * @memberOf angular
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
	// GROUP - SELECT FILE END
	


	// GROUP - PROCESS SURVEY
	/**
	 * Begin processing the survey
	 * @param  {string} survey Current survey being processed
	 * @function
	 * @memberOf angular
	 */
	$scope.processSurvey = function(id){
		var survey = window.config.getSurveyById(id);
		window.config.selectedSurvey = survey;
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
	// GROUP - PROCESS SURVEY END
	


	// GROUP - SURVEY SETUP
	/**
	 * List of all surveys
	 * @memberOf angular
	 * @type {Array}
	 */
	$scope.surveys = [];
	/**
	 * The name of the survey
	 * @type {String}
	 * @memberOf angular
	 */
	$scope.surveyName = '';
	/**
	 * Week of the survey
	 * @type {String}
	 * @memberOf angular
	 */
	$scope.surveyWeek = '';
	/**
	 * Placement of survey
	 * @type {String}
	 * @memberOf angular
	 */
	$scope.Placement = '';
	/**
	 * Holds the questions for a specific survey
	 * @type {Array}
	 * @memberOf angular
	 */
	$scope.questions = [];
	/**
	 * [csv description]
	 * @type {Array}
	 */
	$scope.csv = [];
	/**
	 * Identifier for the survey
	 * @type {null}
	 */
	var surveyId = null;
	/**
	 * Contains all the questions to change
	 * @type {Object}
	 * @memberOf angular
	 */
	var editingQuestion = {};
	/**
	 * [surveyModifications description]
	 * @return {[type]} [description]
	 */
	$scope.surveyModifications = function(type, id){
		surveyId = id;
		var survey = window.config.getSurveyById(id);
		window.config.selectedSurvey = survey;
		if (type == 'register'){ // REGISTER NEW SURVEY - PERFORM IN CTRL
			var csv = new CSV();
			csv.readFile($scope.file, function(file){
				$scope.csv = file.data[1];
			});
			$scope.mode = 'RegisterStart';
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
	 * Updates a surveys data comlumns
	 * @param  {String} id Id of the survey to be modified
	 * @function
	 * @memberOf angular
	 */
	$scope.modifySurvey = function(id){
		if (!id || id.length < 1) return;

		var survey = window.config.getSurveyById(id);
		window.config.selectedSurvey = survey;

		$scope.Placement = survey.placement
		$scope.surveyWeek = survey.getWeekNumber();
		$scope.surveyName = survey.getName();
		$scope.questions = survey.questions;
		$scope.surveyEmailCol = survey.email;
		$scope.surveyTypeCol = survey.type;
		$scope.surveyWeekCol = survey.week;
		$scope.surveyCourseCol = survey.course;
	}
	/**
	 * Submits a newly created survey and saves it to the config file
	 * @param  {String} name      Name of the survey
	 * @param  {String} week      When the survey was taken
	 * @param  {String} placement Who the survey is for
	 * @param  {String} e         Email column
	 * @param  {String} t         Type column
	 * @param  {String} w         Week column
	 * @function
	 * @memberOf angular
	 */
	$scope.submitSurvey = function(name, week, placement, e, t, w, c){
		if (!name && !week && !placement){
			name = $('#surveyName').val();
			week = $('#surveyWeek').val();
			placement = $('#Placement').val();
		}
		name += ': Week ' + week;
		if (placement.toLowerCase() == 'aim'){
			placement = 'AIM';
		}
		else if (placement.toLowerCase() == 'tgl'){
			placement = 'TGL';
		}
		else if (placement.toLowerCase() == 'instructor'){
			placement = 'Instructor';
		}
		else{
			alert('Invalid Placement');
			return;
		}

		var emailCol = null;
		var typeCol = null;
		var weekCol = null;
		var courseCol = null;
		if ($scope.file == null){
			emailCol = e;
			typeCol = t;
			weekCol = w;
			courseCol = c;
			window.config.surveyModify(name, emailCol, weekCol, typeCol, placement, courseCol, $scope.questions, surveyId);
		}
		else{
			emailCol = $('#eCol').val();
			typeCol = $('#tCol').val();
			weekCol = $('#wCol').val();
			courseCol = $('#cCol').val();
			window.config.surveyRegister(name, emailCol, weekCol, typeCol, placement, courseCol, $scope.questions);
		}

		$scope.mode = 'home';
	}
	/**
	 * Add a question to a survey
	 * @function
	 * @memberOf angular
	 */
	$scope.addBlankQuestion = function(){
		$scope.showDialog = true;
		$scope.arow = "";
		$scope.atext = "";
		$scope.awhat = "";
		$scope.awith = "";
		$scope.arow2 = "";
	}
	/**
	 * Add aquestion to a survey
	 * @param {String} row   Data row in CSV file
	 * @param {String} text  Question text
	 * @param {String} what  What to change in text
	 * @param {String} awith Change the text with this
	 * @function
	 * @memberOf angular
	 */
	$scope.addQuestion = function(row, text, what, awith){
		setTimeout(function(){
			$scope.$apply(function(){
				if ($scope.file == null){
					row = $('#arow2').val();
				}
				else{
					row = $('#arow').val();
				}

				if (isNaN(row)){
					row = Config.columnLetterToNumber(row);
				}

				$scope.questions.push({col: parseInt(row), text: text, replaceWhat: what, replaceWith: awith});
				$scope.showDialog = false;
			});
		}, 10);
	}
	/**
	 * Edit the question
	 * @param  {Object} q Data to change
	 * @function
	 * @memberOf angular
	 */
	$scope.editQuestion = function(q){
		if ($scope.file != null){
			$scope.arow = Config.columnNumberToLetter(q.col);
			$('#arow').val($scope.arow);
		}
		else{
			$scope.arow2 = Config.columnNumberToLetter(q.col);
			$('#arow2').val($scope.arow);
		}
		$scope.atext = q.text;
		$scope.awhat = q.replaceWhat;
		$scope.awith = q.replaceWith;
		$scope.showDialog = true;
		editingQuestion.idx = $scope.questions.indexOf(q);
		editingQuestion.q = q;
		$scope.questions.splice($scope.questions.indexOf(q), 1);
	}
	/**
	 * Remove a question
	 * @param  {Object} q Question to be removed
	 * @function
	 * @memberOf angular
	 */
	$scope.removeQuestion = function(q){
		$scope.questions.splice($scope.questions.indexOf(q), 1);
	}
	/**
	 * Close the dialog
	 * @function
	 * @memberOf angular
	 */
	$scope.closeDialog = function(){
		$scope.showDialog = false;
		$scope.arow = "";
		$scope.arow2 = "";
		$scope.atext = "";
		$scope.awhat = "";
		$scope.awith = "";
		if (editingQuestion.idx > -1){
			$scope.questions.splice(editingQuestion.idx, 0, editingQuestion.q);
			editingQuestion = {};
		}
	}
	/**
	 * Column Letter will always be upper case
	 * @param  {Event} e Event
	 * @function
	 * @memberOf angular
	 */
	$scope.upper = function(e){
		return $(e.target).val().toUpperCase();
	}
	// GROUP - SURVEY SETUP END
}]);



// GROUP EVALUATIONS
/**
 * Evaluations
 * @param {Array} array all data necessary for evaluations
 */
function Evaluations(array, file){
	this._evaluations = array;
	this._file = file;
}

/**
 * Finds the location of answer, question, and display logic
 * @param  {Array} array contains the instructions for an evaluations data series
 * @return {Array}       new array containing the proper column locations (in nmeric form)
 */
Evaluations.prototype.getColumnLocations = function(array){
	var newArray = [];

	for (var i = 0; i < array.length; i++){
		newArray.push({
			col: Config.columnLetterToNumber(array[i].col),
			question: array[i].question,
			logic: array[i].logic
		});
	}

	return newArray;
}

/**
 * Searches for an email in the email column, returns the index
 * @param  {String} email    email to be found
 * @param  {Array} rows     contains the entire csv seperated by rows in an array
 * @param  {Integer} emailCol index of the email col
 * @return {Integer}          index of the email
 */
Evaluations.prototype.getRowIndex = function(email, rows, emailCol){
	for (var i = 0; i < rows.length; i++){
		if (rows[i][emailCol] != undefined && rows[i][emailCol].split('@')[0] == email){
			return i;
		}
	}

	return null;
}

/**
 * Converts the evaluaiton data into csv form and saves it to your computer
 * @param  {Object} obj contains all the evaluation data
 * @param  {Array} top contains all the titles for the top of the csv
 */
Evaluations.prototype.sendToCSV = function(obj, top){
	var csv = "";
	/*ADD THE TITLES TO THE CSV*/
	for (var j = 0; j < top.length; j++){
		csv += top[j].replace(/( )|(,)/g, "%20") + ",";
	}
	csv += "%0A";
	/*ADD THE PEOPLE AND THEIR DATA TO THE CSV*/
	var people = Object.keys(obj);
	for (var i = 0; i < people.length; i++){
		var evals = obj[people[i]];
		if (evals.length != 0){
			csv += people[i] + ",";
			for (var j = 0; j < evals.length; j++){
				var answer = null;
				if (isNaN(evals[j].a)){
					if (evals[j].a != undefined){
						answer = evals[j].a.replace(/( )|(\/\/\/)|(,)/g, "%20");
						answer = answer.replace(/(\\\\)/g, "");
					}
					else{
						answer = "";
					}
				}
				else{
					answer = evals[j].a.toPrecision(4);
				}
				csv += answer + ",";
			} 
			csv += "%0A";
		}
	}
	/*SAVE THE NEWLY CREATED STRING AS A CSV FILE*/
	var a         = document.createElement('a');
	a.href        = 'data:attachment/csv,' + csv;
	a.target      = '_blank';
	a.download    = 'myFile.csv';

	document.body.appendChild(a);
	a.click();
}

/**
 * Removes html form a string 
 * @param  {String} str a string
 * @return {String}     new clean string
 */
Evaluations.prototype.cleanseString = function(str){
	if(str == undefined || str.length == 0) return str;

	if (str.indexOf('<span style="font-size:16px;">') != -1){
		str = str.replace('<span style="font-size:16px;">', '');
	}

	if (str.indexOf('<span style="font-family:arial,helvetica,sans-serif;">') != -1){
		str = str.replace('<span style="font-family:arial,helvetica,sans-serif;">', '');
	}

	if (str.indexOf('</span></span>') != -1){
		str = str.replace('</span></span>', '');
	}

	if (str.indexOf('<span style="color:#B22222;">') != -1){
		str = str.replace('<span style="color:#B22222;">', '');
	}

	if (str.indexOf('</span>') != -1){
		str = str.replace('</span>', '');
	}

	return str;
}

/**
 * Looks for th elocation of the question in an array of questions and answers
 * @param  {String} q     question text
 * @param  {Array} qAnda array containing all questions and answers
 * @return {Integer}       index of the question location, or -1 if not there
 */
Evaluations.prototype.qIndex = function(q, qAnda){
	if (qAnda.length == 0) return -1;

	for (var i = 0; i < qAnda.length; i++){
		if (q == qAnda[i].q){
			return i;
		}
	}

	return -1;
}

/**
 * Creates an object from the csv, with the people getting evaluated and what their underlings said 
 * @return {Object} people object containing all the Evaluation data
 */
Evaluations.prototype.parseCSV = function(){
	_this = this;
	Sharepoint.getFile(ims.url.base + 'master/map.xml', function(mapXml){
		var csv = new CSV();
		csv.readFile(_this._file, function(csv){
			var count = {};
			var people = {};
			var numEvals = _this._evaluations.length;
			/*LOOP THROUGH EACH GROUP BEING EVALUATED E.G. OCR, TGL, AIM*/
			for (var e = 0; e < numEvals; e++){
				var evaluatees = $(mapXml).find('semester[code=FA15] ' + _this._evaluations[e].fRole.toLowerCase());
				var emailCol = Config.columnLetterToNumber(_this._evaluations[e].emailCol);
				var locations = _this.getColumnLocations(_this._evaluations[e].dataSeries);
				var rows = csv.data;
				/*COLLECT THE ROLES FROM THE MAP FILE*/
				for (var s = 0; s < evaluatees.length; s++){
					var sEmail = $(evaluatees[s]).attr('email');
					count[sEmail] = 0;
					people[sEmail] = [];
					var lowers = $(evaluatees[s]).children();
					/*COLLECT ALL THE UNDERLINGS FROM THE MAIN ROLE*/
					for (var l = 0; l < lowers.length; l++){
						var lEmail = $(lowers[l]).attr('email');
						if (lEmail != sEmail){
							var row = _this.getRowIndex(lEmail, rows, emailCol);
							/*MAKE SURE THE EVALUATOR EXISTS*/
							if (row != null){
								count[sEmail]++;
								for (var loc = 0; loc < locations.length; loc++){
									var quest = locations[loc].question;
									var ans = rows[row][locations[loc].col];
									var index = _this.qIndex(quest, people[sEmail]);
									/*PORTRAY THE DATA BY THE GIVEN VALUE*/
									if (locations[loc].logic == 'v'){
										if (index == -1){
											people[sEmail].push({
												q: quest,
												a: _this.cleanseString(ans)
											});
										}
										else{
											people[sEmail][index].a += (ans != "" ? '///' : "") + _this.cleanseString(ans);
										}
									}		
									/*PORTAY THE DATA BY THE PERCENTAGE DONE*/
									else if (locations[loc].logic == 'p'){
										if (index == -1){
											if (ans != "")
												ans = parseFloat(1);
											else
												ans = parseFloat(0);

											people[sEmail].push({
												q: quest,
												a: ans
											});
										}
										else{
											if (ans != "")
												people[sEmail][index].a += parseFloat(1);
											else
												people[sEmail][index].a += parseFloat(0);
										}
									}
								}
							}
						}
					}
				}
			}
			/*PERFORM THE PERCENTAGE AND COLLECT THE QUESTIONS*/
			var top = ['email'];
			var done = false;
			for (var person in people){
				for (var i = 0; i < people[person].length; i++){
					if (!isNaN(people[person][i].a)){
						people[person][i].a = people[person][i].a * 100 / count[person];
					}

					if (!done && people[person][i].q != undefined){
						top.push(people[person][i].q);
					}
				}
				done = true;
			}

			_this.sendToCSV(people, top);
		});
	});
}
// GROUP EVALUATIONS END
// GROUP PERMISSIONS
/**
 * Permissions Object
 * NOTE:
 * 	If the users are not found in the SharePoint site somewhere (anywhere),
 * 	they will need to be added manually to the SharePoint site using some 
 * 	sort of groups. An API was attempted to be made to automate this, 
 * 	however, it has become difficult.
 */
function Permissions(){
	console.log('new Permissions object created');
	this._xml = this.getPermissionsXml();
	//this.map = window.config.getMaster();
	this.map = new Master();
	this.init();
	this.changes = [];
	this.status = {inProgress: 0, completed: 0};
}

/**
 * Initalize and create all the necessary items to setup for permission
 * @return {[type]} [description]
 */
Permissions.prototype.init = function(){
	this.graph = {};
	this.people = [];
	var _this = this;
	$(this._xml).find('file').each(function(){
		var p = new PermissionsPerson(this, _this);
		_this.people.push(p);
		_this.graph[p.email] = p;
	});
	// get the site users
	ims.sharepoint.getSiteUsers(function(users){
		_this.siteUsers = {xml: users, add: [], remove: []};
	})
	// Get the sharepoint site roles
	ims.sharepoint.getRoles(function(roles){
		_this.roles = roles;
	})
}

Permissions._xml = null;

/**
 * Get the permissions xml file. If it was already pulled, it will grab the 
 * global version
 * @return {[type]} [description]
 */
Permissions.prototype.getPermissionsXml = function(){
	if (!Permissions._xml){
		Permissions._xml = ims.sharepoint.getPermissionsXml();
	}
	return Permissions._xml;
}

/**
 * CHECK IF THERE ARE ANY CHANGES TO DO
 */
Permissions.prototype.check = function(){
	console.log('Checking if permissions need changing');
	var actions = [];
	for (var i = 0; i < this.people.length; i++){
		var r = this.people[i].check(this.map.graph[this.people[i].email]);
		if (r) actions.push(r);
	}
	this.changes = actions;
	return actions.length > 0;
}

/**
 * UPDATE THE PERMISSIONS ON VARIOUS FILES
 */
Permissions.prototype.update = function(){
	console.log('updating the permissions');
	if (this.check()){
		for (var i = 0; i < this.people.length; i++){
			this.people[i].change();
		}
	}
}

Permissions.prototype.checkForCompletion = function(){
	var _this = this;
	this.status.completed++;
	if (--this.status.inProgress == 0){
		for (var i = 0; i < this.siteUsers.remove.length; i++){
			var p = this.siteUsers.remove[i];
			$(this._xml).find('file[email=' + p.file + '] user[email=' + p.user + ']').remove();
		}
		for (var i = 0; i < this.siteUsers.add.length; i++){
			var p = this.siteUsers.add[i];
			$(this._xml).find('file[email=' + p.file + ']').append('<user email="' + p.user + '" />');
		}
		Sharepoint.postFile(this._xml, 'config/', 'permissions.xml', function(){
			console.log(_this.siteUsers);
			alert('Updated ' + this.status.completed + ' permissions');
		});
	}
}
// GROUP PERMISSIONS END
// GROUP PermissionsPerson
/**
 * create a new permissions file person
 * @param {[type]} xml         [description]
 * @param {[type]} permissions [description]
 */
function PermissionsPerson(xml, permissions){
	this.email = $(xml).attr('email');
	this.people = [];
	this.graph = {};
	this.permissions = permissions;
	if ($(xml).prop('nodeName') == 'file'){
		var _this = this;
		this.email = $(xml).attr('name');
		$(xml).find('user').each(function(){
			var p = new PermissionsPerson(this, permissions);
			_this.people.push(p);
			_this.graph[p.email] = p;
		})
	}
}

/**
 * Check the permsisions based on the current master file
 * @param  {Map} mapPerson [description]
 * @return {[type]}           [description]
 */
PermissionsPerson.prototype.check = function(mapPerson){
	if (!mapPerson) return null;
	var results = {
		email: this.email,
		add: [],
		remove: []
	};
	for (var i = 0; i < mapPerson.uppers.length; i++){
		var person = mapPerson.uppers[i].person;
		if (!this.graph[person.email]){
			results.add.push(person.email);
		}
		else{
			this.graph[person.email].exists = true;
		}
	}
	for (var i = 0; i < this.people.length; i++){
		if (!this.people[i].exists){
			results.remove.push(this.people[i].email);
		}
	}
	this.results = results;
	if (results.add.length > 0 || results.remove.length > 0) return results;
	return null;
}

/**
 * Change the permissions from the objects collected during check
 * @return {[type]} [description]
 */
PermissionsPerson.prototype.change = function(){
	if (this.results.add.length > 0) this.addUsers();
	if (this.results.remove.length > 0) thos.removeUsers();
}

/**
 * Remove the users from the files, SharePoint API calls are made here
 * @return {[type]} [description]
 */
PermissionsPerson.prototype.removeUsers = function(){
	this.api(this.results.remove, false);
}

/**
 * Add users to the files, SharePoint calls are used here
 */
PermissionsPerson.prototype.addUsers = function(){
	this.api(this.results.add, true);
}

/** 
 * The API call for the permissions api
 */
PermissionsPerson.prototype.api = function(ary, isAdd){
	var err = [];
	var _this = this;
	ims.sharepoint.getFileItems(this.email, function(listItemsXml){
		for (var i = 0; i < ary.length; i++){
			var file = ary[i];
			var user = $(_this.permissions.siteUsers.xml).find('d\\:Email:contains(' + file + '), Email:contains(' + file + ')');
			var id = $(user).parent().find('d\\:Id, Id').text();
			if (id){
				var begin = $(listItemsXml).find('[title=RoleAssignments]').attr('href');
				var raHref = (isAdd ? '/addroleassignment' : '/removeroleassignment') + '(principalid=' + id + ',roledefid=' + _this.roles.Edit + ')';
							
				_this.status.inProgress++;
				ims.sharepoint.makePostRequest('_api/' + begin + raHref, function(){
					_this.checkForCompletion();
				}, function(){
					err.push(u);
				});	
			}
			else{
				if (isAdd){
					_this.permissions.siteUsers.add.push({file: _this.email, user: file});
				}
				else{
					_this.permissions.siteUsers.remove.push({file: _this.email, user: file});
				}
			}
		}
	});
}
// GROUP PermissionsPerson END



// GROUP PERSON
/**
 * Person Object
 * @param {[type]}  obj   obj containing a persons data
 * @param {Boolean} isXml Is the obj param actually xml
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

Person.cleanEmail = function(email){
	if (!email) throw 'Invalid Email';
	if (email.indexOf('@') > -1){
		email = email.split('@')[0];
	}
	return email;
}

Person.prototype.cleanEmailInternal = function(){
	try{
		this._email = Person.cleanEmail(this._email);
	}
	catch(e){
		this._valid = false;
	}
}

/**
 * Save this person's xml to their sharepoint file
 */
Person.prototype.save = function(){
	Sharepoint.postFile(this._xml, 'master/', this._email + '.xml', function(){});
}

/**
 * Checks to see if the person object is valid
 * @return {Boolean} Is the person's information valid
 */
Person.prototype.isValid = function(){
	return !!(this._email && this._row && this._placement && this._answers.length > 0) && this._valid;
}

/**
 * [getXml description]
 */
Person.prototype.getXml = function(){
	if (!this._xml){
		this._xml = ims.sharepoint.getXmlByEmail(this._email);
	}
}

/**
 * Retrieves a person's leader
 */
Person.prototype.getLeader = function(){
	var email = $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > leadership > person[type=' + Config.getLeader(this._placement) + ']').attr('email');
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
 * Process a person's survey data
 */
Person.prototype.process = function(){
	this.getXml();
	this.getLeader();
	this._leader._placement = Config.getLeader(this._placement);
	this._master = window.config.getMaster();
	var xml = this.toXml();
	var id = window.config.selectedSurvey.id;
	if (!!this.course){
		$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + '][courseid='+ this.course + ']').remove();
	}
	else{
		$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
		$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys survey[id=' + id + ']').remove();
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys survey[id=' + id + ']').remove();
	}
	$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + this._email + '] > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
	$(this._leader._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._leader._placement + '] > stewardship > people > person[email=' + this._email + '] surveys').append(xml.clone());
	$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=' + this._placement + '] > surveys').append(xml.clone());
}

/**
 * End of semester fix: remove if statement
 * @param  {String} name Name of the course the survey was taken for
 * @return {String}      The id of 'name'
 */
Person.prototype.getCourseIdByName = function(name){
	if (name.indexOf('PATH') > -1){
		name = name.split(' ')[0];
	}
	return $(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > courses course:contains(' + name + ')').attr('id');
}

/**
 * Puts all the survey components into xml form 
 * @return {Object} Survey in xml form
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
// GROUP PERSON END



// GROUP QUESTION
/**
 * Question Object
 * @param {Object}  question Information for a question
 * @param {Boolean} isXml    Is the question param xml
 */
function Question(question, isXml){
	if (isXml){
		this.id = parseInt($(question).attr('id'));
		this.text = $(question).find('text').text();
		this.col = Config.columnLetterToNumber($(question).attr('col'));
		this.replaceWhat = $(question).find('replace').attr('what');
		this.replaceWith = $(question).find('replace').attr('with');
		if (this.replaceWith && this.replaceWith.indexOf(';') > -1){
			this.replaceWith = this.replaceWith.split(';');
		}
		if (this.replaceWhat && this.replaceWhat.indexOf(';') > -1){
			this.replaceWhat = this.replaceWhat.split(';');
		}
		this._xml = question;
	}
	else{
		this.id = parseInt(question.id);
		this.text = question.text;
		this.col = Config.columnNumberToLetter(question.col);
		this.replaceWhat = question.replaceWhat;
		this.replaceWith = question.replaceWith;
		if (this.replaceWith && this.replaceWith.indexOf(';') > -1){
			this.replaceWith = this.replaceWith.split(';');
		}
		if (this.replaceWhat && this.replaceWhat.indexOf(';') > -1){
			this.replaceWhat = this.replaceWhat.split(';');
		}
		this._xml = this.toXml();
	}
}

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
 * Modify a variable in the object. This does not, however, 
 * save the object, that can only be done at the survey level.
 * @param  {[type]} prop [description]
 * @param  {[type]} val  [description]
 * @return {[type]}      [description]
 */
Question.prototype.modify = function(prop, val){
	this[prop] = val;
}

/**
 * Create the question XML node and append the other nodes
 * <question id name>
 * 	<text></text>
 * 	<replace with what/>
 * </question>
 * @return {Object} Question in xml form
 */
Question.prototype.toXml = function(){
	var xml = $('<question><text></text><replace /></question>');
	$(xml).attr('id', this.id).attr('col', this.col);
	$(xml).find('text').text(this.text);
	if (this.replaceWith && this.replaceWhat && this.replaceWith.indexOf(';') > -1 && this.replaceWhat.indexOf(';') > -1){
		this.replaceWith = this.replaceWith.join(';');
		this.replaceWhat = this.replaceWhat.join(';');
	}
	$(xml).find('replace').attr('with', this.replaceWith).attr('what', this.replaceWhat);
	return xml;
}
// GROUP QUESTION END

window._rollup;

// GROUP ROLLUP
/**
 * Rollup Object
 */
function Rollup(){
	this._xml = ims.sharepoint.getXmlByEmail('rollup');
	this._surveyId = window.config.selectedSurvey.id;
	this._week = window.config.selectedSurvey.getWeekNumber();
	this._questions = [];
	this._master = window.config.getMaster();
}

Rollup.avg = function(sum, count){
	return Math.floor((sum / count) * 10) / 10;
}

/**
 * [update description]
 * @return {[type]} [description]
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
			if ($(this).find('text:contains("' + questions[i] + '")').length > 0){
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
					var tmpCredits = parseInt($(this).parents('roles').parent().find("course[id=" + courseid + ']').attr('credit'));
					var sections = $(this).parents('roles').parent().find("course[id=" + courseid + ']').attr('section').split(/ /g).length;

					credits += (tmpCredits * sections);
					sum += parseFloat($(this).text());
				});
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
	}
}
// GROUP ROLLUP END



// GROUP SEMESTER SETUP
/**
 * Semester Setup Object
 * @param {Array} csv Contains the rows from the csv file
 */
function SemesterSetup(csv){
	this._csv = csv;
	this._org = {};
	this._rollup = null;
	this._master = null;
	this._individualFiles = null;
	this._sem = null; 
}

/**
 * Person object for setup
 * @param {Object} obj person object
 */
function OSMPerson(obj){
	console.log(obj);
	this.first = obj.first;
	this.last = obj.last;
	this.email = obj.email;
	this.isNew = obj.isNew;
	this.roles = [];
	this.roles.push(obj.role);
	this.courses = [];
	if (obj.course != null){
		this.courses.push(new Course(obj.course));
	}
	this.stewardship = [];
	if (this.roles[0] != 'instructor'){
		this.stewardship.push(new OSMPerson(obj.stewardship));
	}
}

/**
 * Add a course or section to a person
 * @param {Object} course course object
 */
OSMPerson.prototype.addCourse = function(course){
	for (var i = 0; i < this.courses.length; i++){
		if (this.courses[i].name == course.name){
			if (course.section != ""){
				this.courses[i].section += ' ' + course.section;
			}
			else{
				this.courses[i].pwsection += ' ' + course.section;
			}
			return;
		}
	}
	this.courses.push(new Course(course));
}

/**
 * [addRole description]
 * @param {[type]} role [description]
 */
OSMPerson.prototype.addRole = function(role){
	for (var i = 0; i < this.roles.length; i++){
		if (this.roles[i] == role){
			return;
		}
	}
	this.roles.push(role);
}

/**
 * Course Object
 * @param {Object} obj course object
 */
function Course(obj){
	this.name = obj.name; 
	this.section = obj.section; 
	this.credits = obj.credits; 
	this.isPilot = obj.isPilot; 
	this.pwsection = obj.pwsection;
}

/**
 * PERFORMS A COMPLETE SEMESTER SETUP
 */
SemesterSetup.prototype.semesterSetup = function(){
	this._createOrg();
	this._createMaster();
	this._createIndividualFiles();
	this._createRollup();
}

/**
 * CREATES A NEW ORG FROM THE CSV
 */
SemesterSetup.prototype._createOrg = function(){
	this._org['IM'] = [];
	this._org['OCRM'] = [];

	var start = 0;
	while (this._csv[start][2] != 'email'){
		start++;
	}

	for (var rows = ++start; rows < this._csv.length; rows++){
		if (this._csv[rows].length == 1) continue;
		// INSTRUCTOR OBJECT
		var inst = {
			first: this._csv[rows][0],
			last: this._csv[rows][1],
			email: this._csv[rows][2],
			isNew: this._csv[rows][16],
			role: 'instructor',
			course: {
				name: this._csv[rows][3],
				credits: this._csv[rows][4],
				isPilot: this._csv[rows][17]
			},
			stewardship: null
		};

		if (this._csv[rows][19] == 'TRUE'){
			inst.course['pwsection'] = this._csv[rows][5];
			inst.course['section'] = '';
		}
		else{
			inst.course['section'] = this._csv[rows][5];
			inst.course['pwsection'] = '';
		}

		// TGL OBJECT
		var tgl = {
			first: this._csv[rows][7].split(' ')[0],
			last: this._csv[rows][7].split(' ')[1],
			email: this._csv[rows][6],
			isNew: null,
			role: 'tgl',
			course: null,
			stewardship: inst
		};
		
		// AIM OBJECT
		var aim = {
			first: this._csv[rows][9].split(' ')[0],
			last: this._csv[rows][9].split(' ')[1],
			email: this._csv[rows][8],
			isNew: null,
			role: 'aim',
			course: null,
			stewardship: tgl
		};

		// IM OBJECT
		var im = {
			first: this._csv[rows][11].split(' ')[0],
			last: this._csv[rows][11].split(' ')[1],
			email: this._csv[rows][10],
			isNew: null,
			role: 'im',
			course: null,
			stewardship: aim
		};

		// OCR OBJECT
		var ocr = {
			first: this._csv[rows][13].split(' ')[0],
			last: this._csv[rows][13].split(' ')[1],
			email: this._csv[rows][12],
			isNew: null,
			role: 'ocr',
			course: null,
			stewardship: inst
		};

		// OCRM OBJECT
		var ocrm = {
			first: this._csv[rows][14].split(' ')[0],
			last: this._csv[rows][14].split(' ')[1],
			email: this._csv[rows][15],
			isNew: null,
			role: 'ocrm',
			course: null,
			stewardship: ocr
		};

		this.addImToOrg(im);
		if (ocrm.email != "" && ocr.email != ""){
			this.addOcrmToOrg(ocrm);
		}
	}
}

/**
 * Adds a person and their subordinates into the organization
 * @param {Object} im person object that contains stewards
 */
SemesterSetup.prototype.addImToOrg = function(im){
	if (this._org.IM.length == 0){
		this._org.IM.push(new OSMPerson(im));
	}
	else{
		for (var i = 0; i < this._org.IM.length; i++){ // IM LEVEL
			if (this._org.IM[i].email == im.email){ // DOES THE IM ALREADY EXIST
				for (var a = 0; a < this._org.IM[i].stewardship.length; a++){ // AIM LEVEL
					if (this._org.IM[i].stewardship[a].email == im.stewardship.email){ // DOES THE AIM ALREADY EXIST
						for (var t = 0; t < this._org.IM[i].stewardship[a].stewardship.length; t++){ // TGL LEVEL
							if (this._org.IM[i].stewardship[a].stewardship[t].email == im.stewardship.stewardship.email){ // DOES THE TGL ALREADY EXIST
								for (var l = 0; l < this._org.IM[i].stewardship[a].stewardship[t].stewardship.length; l++){ // INSTRUCTOR LEVEL
									if (this._org.IM[i].stewardship[a].stewardship[t].stewardship[l].email == im.stewardship.stewardship.stewardship.email){ // DOES THE INSTRUCTOR ALREADY EXIST
										this._org.IM[i].stewardship[a].stewardship[t].stewardship[l].addCourse(im.stewardship.stewardship.stewardship.course); // ADD COURSE OR SECTION TO INSTRUCTOR
										return;
									}
								}
								this._org.IM[i].stewardship[a].stewardship[t].stewardship.push(new OSMPerson(im.stewardship.stewardship.stewardship)); // ADD INST
								return;
							}
						}
						this._org.IM[i].stewardship[a].stewardship.push(new OSMPerson(im.stewardship.stewardship)); // ADD TGL
						return;
					}
				}
				this._org.IM[i].stewardship.push(new OSMPerson(im.stewardship[0])); // ADD AIM
				return;
			}
		}
		this._org.IM.push(new OSMPerson(im)); // ADD IM
	}
}

/**
 * Adds a person with their subordinates to the organization
 * @param {Object} ocrm Person object with subordinates
 */
SemesterSetup.prototype.addOcrmToOrg = function(ocrm){
	if (this._org.OCRM.length == 0){
		this._org.OCRM.push(new OSMPerson(ocrm));
	}
	else{
		for (var m = 0; m < this._org.OCRM.length; m++){ // OCRM LEVEL
			if (this._org.OCRM[m].email == ocrm.email){
				for (var o = 0; o < this._org.OCRM[m].stewardship.length; o++){ // OCR LEVEL
					if (this._org.OCRM[m].stewardship[o].email == ocrm.stewardship.email){
						for (var i = 0; i < this._org.OCRM[m].stewardship[o].stewardship.length; i++){ // INST LEVEL
							if (this._org.OCRM[m].stewardship[o].stewardship[i].email == ocrm.stewardship.stewardship.email){
								return;
							}
						}
						this._org.OCRM[m].stewardship[o].stewardship.push(new OSMPerson(ocrm.stewardship.stewardship)); // ADD INST
						return;
					}
				}
				this._org.OCRM[m].stewardship.push(new OSMPerson(ocrm.stewardship)); // ADD OCR
				return;
			}
		}
		this._org.OCRM.push(new OSMPerson(ocrm)); // ADD OCRM
	}
}

/**
 * CREATES A NEW SEMESTER ROLLUP SECTION IN THE ROLLUP FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createRollup = function(){
	console.log('rollup is being created');
}

/**
 * CREATES A NEW SEMESTER MASTER SECTION IN THE MASTER FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createMaster = function(){
	console.log('master is being created');
}

/**
 * CREATES A NEW SEMESTER SECTIONS IN ALL OF THE PEOPLES FILES FROM THE MAP FILE
 * @return {[type]} [description]
 */
SemesterSetup.prototype._createIndividualFiles = function(){
	console.log('individual files are being created');
}

/**
 * CHECKS IF THE MAP HAS CHANGED
 * @return {Boolean} [description]
 */
SemesterSetup.prototype._isDifferent = function(){
	console.log('are the semesters already the same');
}

/**
 * CHECKS FOR ROLLUP CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateRollup = function(){
console.log('rollup is being updated');
}

/**
 * CHECKS FOR MASTER CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateMaster = function(){
	console.log('master is being updated');
}

/**
 * CHECKS FOR INDIVIDUAL FILE CHANGES AND CHANGES TO BE THE MOST CURRENT
 * @return {[type]} [description]
 */
SemesterSetup.prototype._updateIndividualFiles = function(){
	console.log('individual files are being updated');
}
// GROUP SEMESTER SETUP END
// 



// GROUP SURVEY
/**
 * Survey Object
 * @param {Object}  survey A surveys information
 * @param {Boolean} isXml  Is the survey in xml form
 */
function Survey(survey, isXml){
	if (isXml){
		this.id = parseInt($(survey).attr('id'));
		if ($(survey).attr('week')){
			this.week = $(survey).attr('week');
		}
		this.placement = $(survey).attr('placement');
		this.type = $(survey).attr('type');
		this.email = $(survey).attr('email');
		this.name = $(survey).attr('name');
		if ($(survey).attr('course')){
			this.course = $(survey).attr('course');
		}
		this._xml = survey;
		this.questions = [];
		this._setXmlQuestions();
		this.people = [];
	}
	else{
		this.id = parseInt(survey.id);
		if (survey.week != undefined){
			this.week = survey.week;
		}
		this.placement = survey.placement;
		this.type = survey.type;
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
 * [getPerson description]
 * @param  {String} email A person's email
 * @return {Object}       Person with the email of 'email'
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
 * Set the questions questions by passing in the question node from
 * the XML
 */
Survey.prototype._setXmlQuestions = function(){
	var _this = this;
	$(this._xml).find('question').each(function(){
		_this.questions.push(new Question(this, true));
	})
}

Survey.prototype.getName = function(){
	if (this.name.indexOf(':') > -1){
		return this.name.split(':')[0];
	}
	return this.name;
}

/**
 * Use the objects member variables to create the survey node
 * @return {Object} Survey in xml form
 */
Survey.prototype.toXml = function(){
	var survey = $('<survey><questions></questions></survey>');
	survey.attr('id', this.id)
		.attr('placement', this.placement)
		.attr('type', this.type)
		.attr('name', this.name)
		.attr('email', this.email);

	if (this.week){
		survey.attr('week', this.week);
	}
	if (this.course){
		survey.attr('course', this.course);
	}

	return survey;
}

/**
 * Create the xml from the given objects. Remove the survey from the
 * config file. Add the newly created xml to the config file. 
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
	});
}

/**
 * Remove the survey from the xml of the config
 */
Survey.prototype.remove = function(){
	$(this._xml).remove();
}

/**
 * Modifiy a certain aspect of object, if save is necessary, its there.
 * @param  {String} prop   [description]
 * @param  {String} value  [description]
 * @param  {Boolean} save  [description]
 */
Survey.prototype.modify = function(prop, value){
	if (value == undefined) return;

	if (this[prop] != value){
		this[prop] = value;
	}
}

/**
 * Clone and rename survey to append (Copy) and increment the id
 * @return {Object} New survey object
 */
Survey.prototype.copy = function(){
	var cloned = $(this._xml).clone();
	$(cloned).attr('name', $(cloned).attr('name') + ' (Copy)');
	$(cloned).attr('id', window.config.getHighestSurveyId() + 1);
	return new Survey(cloned, true);
}

/**
 * Collects the questions, people, and the peoples answers
 * @param  {Array]} rows Rows from the csv
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
				_this.people[j].save();
			}

			for (var email in window.config.otherPeople){
				window.config.otherPeople[email].save();
			}
			
			Sharepoint.postFile(window.rollup._xml, 'master/', 'rollup.xml', function(){});
			Sharepoint.postFile(window.config.getMaster(), 'master/', 'master.xml', function(){});
			
			ims.loading.reset();
			alert('Complete');
			return;
		} 
		// clean answers  and then add them to their respective individual
		if (rows[i][eCol] != undefined){
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
		}
		i++;
		setTimeout(function(){
			ims.loading.set((i / rows.length) * 100);
			processItems();
		}, 10);
	}

	processItems();
}

Survey.cleanCourse = function(str){
	var found = str.match(/([a-zA-Z]{1,}[0-9]{3})/g);
	if (found && found.length > 0){
		str = str.split(/([a-zA-Z]{1,})/g).join(' ');
	}
	return str.trim().toUpperCase();
}

/**
 * Get the question by Id
 * @param  {Integer} id The id of a question within the survey
 * @return {Object}     A question with id of 'id'
 */
Survey.prototype.getQuestionById = function(id){
	for (var i = 0; i < this.questions.length; i++){
		if (this.questions[i].id == id) return this.questions[i];
	}
	return false;
}

/**
 * If the survey has the attributes of the parameter object
 * @param  {Object}  obj Survey information
 * @return {Boolean}     Has the same attributes
 */
Survey.prototype.hasAttrs = function(obj){
	var keys = Object.keys(obj);
	for (var i = 0; i < keys.length; i++){
		if (this[keys[i]] != obj[keys[i]]) return false;
	}
	return true;
}

Survey.prototype.updateQuestions = function(qs){
	for (var j = 0; j < this.questions.length; j++){
		for (var i = 0; i < qs.length; i++){
			if (Question.areSame(qs[i], this.questions[j])){
				qs[i]['id'] = this.questions[j].id;
				theSame = true
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
// GROUP SURVEY END