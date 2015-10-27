window.ims = {}

/** 
 * Get the params found in the url
 * @param  {Object} ){                 var map [description]
 * @return {[type]}     [description]
 */
ims.params = (function(){
    var map = {};
    var loc = window.location.href;
    if (loc.indexOf('#') > -1){
      loc = loc.split('#')[0];
    }
    var hashes = loc.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        map[hash[0]] = hash[1];
    }
    return map;
})();

function error(){
    window.location.href = window.location.href.split('?v=')[0] + '?r=1';
}

/**
 * Global encryption library
 * @memberOf ims
 * @namespace ims.aes
 * @type {Object}
 */
ims.aes = {
    /**
     * Encryption Key
     * @memberOf ims.aes
     * @type {String}
     */
    key: '00420059005500490023',
    /**
     * Encrypt a string
     * @param  {String} str 
     * @param  {String} key   generally will always be ims.aes.key
     * @return {String}       Encrypted string
     * @function
     * @memberOf ims.aes
     */
    encrypt: function(str, key){
        var encrypted = CryptoJS['AES']['encrypt'](str, key);
        return encrypted.toString();
    },
    /**
     * Decrypt a string
     * @param  {String} code  Encrypted code 
     * @param  {String} key   generally will always be ims.aes.key
     * @return {String}       Encrypted string
     * @function
     * @memberOf ims.aes
     */
    decrypt: function(code, key){
        var decrypted = CryptoJS['AES']['decrypt'](code, key).toString(CryptoJS['enc']['Utf8']);
        return decrypted;
    },
    /**
     * The global encrypted value
     * @type {Object}
     * @memberOf ims.aes
     */
    value: {},
    raw: ''
}

/**
     * Initial decrypt
     * @function
     * @memberOf ims.aes
     */
ims.aes.initDecrypt = (function(){
    var obj = ims.aes.decrypt(ims.params['v'], ims.aes.key.hexDecode());
    ims.aes.raw = obj;
    try{
        ims.aes.value = JSON.parse(ims.aes.raw);
    }
    catch (e){
        error();
    }
})();
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

function Course(xml){
	this._name = $(xml).text();
	this._credits = parseInt($(xml).attr('credit'));
	this._sections = $(xml).attr('section').indexOf(' ') > -1 ? $(xml).attr('section').split(' ') : [$(xml).attr('section')];
	this._pilot = $(xml).attr('pilot') == 'True';
}

/**
 * Get the name of the course
 * @return {[type]} [description]
 */
Course.prototype.getName = function(){return this._name;}

/** 
 * Get the sections for the course in an Array
 * @return {[type]} [description]
 */
Course.prototype.getSections = function(){return this._sections;}

/**
 * Get the credits for the course
 * @return {[type]} [description]
 */
Course.prototype.getCredits = function(){return this._credits;}

/**
 * Checks if the course is piloting
 * @return {Boolean} [description]
 */
Course.prototype.isPilot = function(){return this._pilot;}

/**
 * Get the href for the course
 * @return {[type]} [description]
 */
Course.prototype.getHref = function(){
	var loc = window.location.href;
	if (loc.indexOf('&c=') > -1){
		window.location.href = loc.split('&c=')[0] + '&c=' + this.getName();
	}
	else{
		window.location.href = loc + '&c=' + this.getName();
	} 
}
/**
 * ary = [
 * 		{
 * 			value: 'FA15',
 * 			href: 'laskjdflskf.aspx'
 * 		}
 * ]
 * @param {[type]} obj [description]
 */
function Menu(ary){
	if (!ary || ary.length == 0) return;
	this._items = [];
	this._setItems(ary);
}

Menu.prototype._setItems = function(ary){
	for (var i = 0; i < ary.length; i++){
		this._items.push(new MenuItem(ary[i]));
	}
}

/**
 * Event for the menu being clicked
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Menu.prototype.click = function(callback){

}

/**
 * Gets a specific item at an index
 * @param  {[type]} idx [description]
 * @return {[type]}     [description]
 */
Menu.prototype.getItem = function(idx){
	
}

/**
 * A specific item in the menu
 * @param {[type]} obj [description]
 */
function MenuItem(obj){
	this.href = obj.href;
	this.name = obj.value;
}

/**
 * Event for the clicking of a specific menu item
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
MenuItem.prototype.click = function(callback){

}
function Question(xml){

}

/**
 * Get the text of the survey
 * @return {[type]} [description]
 */
Question.prototype.getText = function(){

}

/**
 * Get the answer for the question
 * @return {[type]} [description]
 */
Question.prototype.getAnswer = function(){
	
}

/**
 * Checks for an answer
 * @return {Boolean} [description]
 */
Question.prototype.hasAnswer = function(){

}

/**
 * Internal function to clean the answer based on the configurations
 * @return {[type]} [description]
 */
Question.prototype.cleanAnswer = function(){

}

/**
 * Get the column the question appears from the CSV
 * @return {[type]} [description]
 */
Question.prototype.getCol = function(){

}
function Semester(obj){
	if (typeof obj == 'string'){
		this._code = obj;
	}
	else{
		// xml
	}
}

/**
 * Get the semester code
 * @return {[type]} [description]
 */
Semester.prototype.getCode = function(){return this._code;}

/**
 * Get the href for the menu item
 * @return {[type]} [description]
 */
Semester.prototype.getHref = function(){
	var loc = window.location.href;
	if (loc.indexOf('&sem=') > -1){
		window.location.href = loc.split('&sem=')[0] + '&sem=' + this.getCode();
	}
	else{
		window.location.href = loc + '&sem=' + this.getName();
	}
}

function Semesters(){
	this._xml = ims.sharepoint.getSemesterConfig();
	this._current = null;
}

Semesters.prototype.getCurrent = function(){
	if (!this._current){
		this._current = new Semester($(this._xml).find('[current=true]').attr('name'));
	}
	return this._current;
}

Semesters.prototype.getCurrentCode = function(){
	return this.getCurrent().getCode();
}

ims.semesters = (function(){
	return new Semesters();
})()
function Survey(xml){
	this._course = $(xml).attr('course');
}

/**
 * Get the name of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getName = function(){

}

/**
 * Get the week of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getWeek = function(){
	
}

/**
 * Get the answers of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getAnswers = function(){

}

/**
 * Check if the survey is completed or empty
 * @return {Boolean} [description]
 */
Survey.prototype.isComplete = function(){

}

/**
 * Checks the placement of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getPlacement = function(){

}

/**
 * Gets the course the survey was taken. If the course
 * is not validated, it will return null (good for debugging)
 * @return {[type]} [description]
 */
Survey.prototype.getCourse = function(){
	var isValidCourse = this._course.match(/[a-zA-Z]* ([0-9]{3}[a-zA-Z]|[0-9]{3})/g);
	isValidCourse = isValidCourse && isValidCourse.length > 0;
	if (!isValidCourse) return null;
	return this._course;
}

/**
 * Get the questions from the survey
 * @return {[type]} [description]
 */
Survey.prototype.getQuestions = function(){

}
window._currentUser = null;

function User(obj){
	if (!obj) throw "Invalid User Object";

	if (obj['email']){
		this._email = obj['email'];
		this._xml = ims.sharepoint.getXmlByEmail(this._email);
	}
	if (obj['xml']){
		this._setXmlData(xml);
	}

	this._first = null;
	this._last = null;
	this._courses = [];
	this._courses = this.getCourses();
	this._surveys = [];
	this._setSurveys();
	this._semesters = [];
	this._isCurrent = obj.current;
}

/**
 * Get the current user (the current dashboard user)
 * @return {[type]} [description]
 */
User.getCurrent = function(){
	if (!window._currentUser)
		window._currentUser = new User({email: ims.aes.value.ce, current = true});
	return window._currentUser;
}

/**
 * Internal function to populate the users surveys into the _surveys
 * array
 */
User.prototype._setSurveys = function(){
	var sem = ims.semesters.getCurrentCode(); 
	var _this = this;
	$(this._xml).find('semester[code=' + sem + '] survey').each(function(){
		_this._surveys.push(new Survey(this));
	})
}

/**
 * Get the first name of the user
 * @return {[type]} [description]
 */
User.prototype.getFirst = function(){
	if (this._first == null){
		var sem = ims.semesters.getCurrentCode(); 
		this._first = $(this._xml).find('semester[code=' + sem + ']').children().first().attr('first');
	}
	return this._first;
}

/**
 * Get the last name of the user
 * @return {[type]} [description]
 */
User.prototype.getLast = function(){
	if (this._last == null){
		var sem = ims.semesters.getCurrentCode(); 
		this._last = $(this._xml).find('semester[code=' + sem + ']').children().first().attr('last');
	}
	return this._last;
}

/**
 * Get the email of the user
 * @return {[type]} [description]
 */
User.prototype.getEmail = function(){
	return this._email;
}

/**
 * Get the email of the user including the @byui.edu
 * @return {[type]} [description]
 */
User.prototype.getEmailFull = function(){
	return this._email + '@byui.edu';
}

/**
 * Get the user answers by surveyId and questionId
 * @param  {[type]} sid [description]
 * @param  {[type]} qid [description]
 * @return {[type]}     [description]
 */
User.prototype.getAnswer = function(sid, qid){
	var sem = ims.semesters.getCurrentCode(); 
	return $(this._xml).find('semester[code=' + sem + '] survey[id=' + sid + '] answer[qid=' + qid + ']').text();
}

/**
 * Get the full name of the user with a space between the first
 * and last name, and a capital first letter of each name.
 * @return {[type]} [description]
 */
User.prototype.getFullName = function(){
	return this._first + ' ' + this._last;
}

/**
 * Get a specific survey from the user
 * @param  {[type]} sid [description]
 * @return {[type]}     [description]
 */
User.prototype.getSurvey = function(sid){

}

/**
 * Add a survey to the user
 * @param {[type]} sid [description]
 */
User.prototype.addSurvey = function(sid){

}

// GROUP: Roles
/**
 * Get the users role relative to the current user and their role
 * @return {[type]} [description]
 */
User.prototype.getRole = function(){

}

/**
 * validates that the getRole == AIM
 * @return {Boolean} [description]
 */
User.prototype.isAim = function(){

}

/**
 * validates that the getRole == TGL
 * @return {Boolean} [description]
 */
User.prototype.isTgl = function(){

}

/**
 * validates that the getRole == INSTRUCTOR
 * @return {Boolean} [description]
 */
User.prototype.isInstructor = function(){

}

/**
 * Set the role of the user
 */
User.prototype.setRole = function(){

}
// END GROUP: Roles

/**
 * Get the leader TGL
 * @return {[type]} [description]
 */
User.prototype.getLeaderTgl = function(){

}

/**
 * Get the leader AIM
 * @return {[type]} [description]
 */
User.prototype.getLeaderAim = function(){

}

/**
 * Get the Instructors under this user
 * @return {[type]} [description]
 */
User.prototype.getInstructors = function(){

}

/**
 * Validate a survey has been taken by id
 * @param  {[type]}  sid [description]
 * @return {Boolean}     [description]
 */
User.prototype.hasTakenSurvey = function(sid){

}

/**
 * Get a lower user by their email address
 * @param  {[type]} email [description]
 * @return {[type]}       [description]
 */
User.prototype.getUserByEmail = function(email){
	
}

/**
 * Get the TGLs below this person. Note this has
 * to be either an AIM or an IM
 * @return {[type]} [description]
 */
User.prototype.getTgls = function(){

}

/**
 * Validates if the instructor is a new instructor
 * or not.
 * @return {Boolean} [description]
 */
User.prototype.isNew = function(){

}

/**
 * Returns an array of SMART goals if taken
 * @return {[type]} [description]
 */
User.prototype.getSmartGoals = function(){

}

/**
 * Gets a standard by name if taken any
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
User.prototype.getStandard = function(name){

}

/**
 * Gets the rollup for a standard by name for the group.
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
User.prototype.getStandardForGroup = function(name){
	
}

/**
 * Gets a rollup for a standard for all instructors
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
User.prototype.getStandardForAll = function(name){
	
}

/**
 * Get the completed instructor tasks
 * @return {[type]} [description]
 */
User.prototype.getCompletedTasks = function(){

}

/**
 * Get a list of all those below the user
 * @return {[type]} [description]
 */
User.prototype.getRoster = function(){
	if (this.isInstructor()) return null;

}

/**
 * Get the hours as a TGL
 * @return {[type]} [description]
 */
User.prototype.getHoursAsTgl = function(){

}

/**
 * Get the hours as an AIM
 * @return {[type]} [description]
 */
User.prototype.getHoursAsAim = function(){

}

/**
 * Get the target hours for this user.
 * @return {[type]} [description]
 */
User.prototype.getTargetHours = function(){

}

/**
 * Get an array of the weekly reflections
 * @return {[type]} [description]
 */
User.prototype.getWeeklyReflections = function(){

}

/**
 * Redirect the url to a specific place
 * @return {[type]} [description]
 */
User.prototype.redirectTo = function(){

}

/**
 * All graph related functions are grouped for convinence
 * @type {Object}
 */
User.prototype.graph = {
	/**
	 * Instructor standards graph as an Instructor
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	instructorStandard: function(name){

	},
	/**
	 * Instructor hours graph as an Instructor
	 * @return {[type]} [description]
	 */
	instructorHours: function(){

	},
	/**
	 * Instructor hours as TGL
	 * @return {[type]} [description]
	 */
	instructorHoursAsTgl: function(){

	},
	/**
	 * Instructor standards as TGL
	 * @return {[type]} [description]
	 */
	instructorStandardAsTgl: function(){

	},
	/**
	 * Instructor hours as AIM
	 * @return {[type]} [description]
	 */
	instructorHoursAsAim: function(){

	}
}

/**
 * Get an array of Course objects
 * @return {Array} [description]
 */
User.prototype.getCourses = function(){
	if (this._courses.length == 0){
		var _this = this;
		var sem = ims.semesters.getCurrentCode();
		$(this._xml).find('semester [code=' + sem + '] course').each(function(){
			_this._courses.push(new Course(this));
		})
	}
	return this._courses;
}

/**
 * Get the total Credits this user is taking
 * @return {[type]} [description]
 */
User.prototype.getTotalCredits = function(){
	var total = 0;
	for (var i = 0; i < this._courses.length; i++){
		var course = this._courses[i];
		total += course.getCredits();
	}
	return total;
}

/**
 * Get a list of available semesters for this user
 * @return {[type]} [description]
 */
User.prototype.getSemesters = function(){
	if (this._semesters.length == 0){
		var _this = this;
		$(this._xml).find('semester').each(function(){
			_this._semesters.push(new Semester($(this).attr('code')));
		});	
	}
	return this._semesters;		
}

//GROUP: Menu
/**
 * Gets the semester Menu
 * @return {[type]} [description]
 */
User.prototype.getSemesterMenu = function(){
	var semesters = this.getSemesters();
	var prepare = [];
	for (var i = 0; i < semesters.length; i++){
		prepare.push({
			value: semesters[i].getCode(),
			href: semesters[i].getHref()
		})
	}
	return new Menu(prepare);
}

/**
 * Gets the role menu
 * @return {[type]} [description]
 */
User.prototype.getRoleMenu = function(){

}

/**
 * Gets the courses menu, if no courses needed, return null
 * @return {[type]} [description]
 */
User.prototype.getCoursesMenu = function(){
	var courses = this.getCourses();
	var prepare = [];
	for (var i = 0; i < courses.length; i++){
		prepare.push({
			value: course[i].getName(),
			href: course[i].getHref()
		});
	}
	return new Menu(prepare);
}
// END GROUP: Menu