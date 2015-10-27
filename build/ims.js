window.ims = {}

if (window.location.href.indexOf('?r=1') > 0){
    ims.error = true;
    ims.search = false;
}

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

function redirectError(){
    if (window.location.href.indexOf('?r=1') > -1) return;
    if (window.location.href.indexOf('?v=') > 0){
        window.location.href = window.location.href.split('?v=')[0] + '?r=1';
    }
    else{
        window.location.href += '?r=1';
    }
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
 * Encode the string in hex
 * @return {string} String of hex
 * @memberOf String
 */
String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

/**
 * Dencode the string in hex
 * @return {string} String
 * @memberOf String
 */
String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

/**
     * Initial decrypt
     * @function
     * @memberOf ims.aes
     */
ims.aes.initDecrypt = (function(){
    if (window.location.href.indexOf('?') == -1){
        ims.error = true;
        ims.search = true;
    }
    else{
        try{
            var obj = ims.aes.decrypt(ims.params['v'], ims.aes.key.hexDecode());
            ims.aes.raw = obj;
            ims.aes.value = JSON.parse(ims.aes.raw);
        }
        catch (e){
            redirectError();
        }
    }
})();

/**
 * Show a tooltip
 * @param  {MouseEvent} e The mouse event
 * @param  {string} msg A String to display the message
 * @param  {string} pos left or right
 * @memberOf ims
 */
ims.tooltip = function(e, msg, pos){
    if (pos && pos == 'left'){
        $('body').append('<div id="tooltip-left"></div>');
        var tooltip = $('#tooltip-left');
        tooltip.html(msg);
        tooltip.css({left: ((e.clientX - tooltip.width()) - 65) + 'px', top: (e.clientY - tooltip.height() - 15) + 'px'});
    }
    else{
        $('body').append('<div id="tooltip"></div>');
        var tooltip = $('#tooltip');
        tooltip.html(msg);
        tooltip.css({left: (e.clientX + 35) + 'px', top: (e.clientY - tooltip.height() - 15) + 'px'});
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
var app = angular.module('ims', ['highcharts-ng']);

if (!ims.error){
	app.controller('view', ['$scope', function($scope){
		var currentUser = User.getCurrent();

		$scope.cols = [
			[
				new Tile({
					title: 'Tasks To Review',
					helpText: 'This tile displays tasks that your TGLs have completed and that as an AIM you need to review.',
					type: 'task-list',
					data: [],
					hidden: ''
				})
			]
		];

		// MENU
		$scope.redirectHome = User.redirectHome;
		$scope.user = currentUser;
		$scope.semester = ims.semesters;
		$scope.searchOpened = false;
		$scope.openSearch = function(){
			setTimeout(function(){
				$scope.$apply(function(){
					$('#search').addClass('search-open');
					setTimeout(function(){
						$('.searchInput').focus();
					}, 10);
					$scope.searchOpened = true;
				})
			}, 20);
		}

		$scope.closeSearch = function(){
			$('#search').removeClass('search-open');
			$scope.searchOpened = false;
			$scope.suggestions = [];
		}

		if (!ims.aes.value.ce){
			$('#searchScreen').fadeIn();
		}
		else{
			$('#fade').fadeIn();
		}

		// GLOBAL
		$scope.toggleMenu = function(){
			$scope.closeSearch();
		}

		$scope.questionClick = function(e){
			//$(e.target).parent().find('.hidden').slideToggle();
			var div = $(e.target.nodeName == 'I' ? e.target.parentNode : e.target);
			var pos = div.attr('data-position');
			msg = div.attr('data-title');
			if (msg && msg.length > 0){
				ims.tooltip(e, msg, pos);
			}
		}

		$scope.questionClickOut = function(e){
			$('#tooltip, #tooltip-left').remove();
		}

	}]);
}
else{
	if (!ims.search){
		app.controller('view', ['$scope', function($scope){

			$('#errMsg').html('Invalid person or Inadequate Access');
	  	$('#error').fadeIn();
	  	
		}]);
	}
	else{
		app.controller('view', ['$scope', function($scope){

			$('#searchScreen, #enterEmail').fadeIn();
			$scope.search = function(e, val){
				if (e.keyCode == 13){
					User.redirectToDashboard(val);
				}
			}
	  	
		}]);
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
function Question(xml, survey){
	this._answer = $(xml).text();
	this._survey = survey;
	this._xml = xml;
	this._id = $(xml).attr('qid');
	this._qconfig = $(Survey.getConfig()).find('survey[id=' + this._surveyId + '] question[id=' + this._id + ']')[0];
	this._surveyId = survey.id;
	this._text = $(this._qconfig).find('text').text();
	this._cleanAnswer();
}

/**
 * Get the text of the survey
 * @return {[type]} [description]
 */
Question.prototype.getText = function(){
	return this._text;
}

/**
 * Get the answer for the question
 * @return {[type]} [description]
 */
Question.prototype.getAnswer = function(){
	return this._answer;
}

/**
 * Checks for an answer
 * @return {Boolean} [description]
 */
Question.prototype.hasAnswer = function(){
	return this.getText() && this.getText().length > 0;
}

/**
 * Internal function to clean the answer based on the configurations
 * @return {[type]} [description]
 */
Question.prototype._cleanAnswer = function(){
	var replace = $(this._qconfig).find('replace');
	var rwhat = replace.attr('what');
	var rwith = replace.attr('with');
	if (rwhat && rwhat.length > 0){
		rwhat = rwhat.split(';');
	}
	if (rwith && rwith.length > 0){
		rwith = rwith.split(';');
	}
	if (!rwith || !rwhat) return;
	if (rwith.length != rwhat.length) return;
	for (var i = 0; i < rwhat.length; i++){
		var r = new RegExp(rwhat[i], 'g');
		this._answer = this._answer.replace(r, rwith[i]);
	}
}
function Role(role, user){
	this._role = role;
	this._user = user;

	if (role.toLowerCase() == 'instructor'){
		this._org = null;
	}
	else{
		this._org = this._setOrg();
	}
}

Role.prototype.getTiles = function(){

}

/**
 * return the name of the current role
 * @return {String} instructor, aim, or tgl
 */
Role.prototype.getRoleName = function(){
	return this._role;
}

/**
 * return the lowers in an object
 * @return {Object} Current users organization
 */
Role.prototype.getOrg = function(){
	return this._org;
}

/**
 * creates the users organization
 * @return {Object} Current users organization
 */
Role.prototype._setOrg = function(){
	var org = [];
	var sem = ims.semesters.getCurrentCode();
	var topRole = $(this._user._xml).find('semester[code=' + sem + ']').children().first()[0].nodeName.toLowerCase();
	var lowerRole = this._nextLower(topRole);
	return this._recursiveChildren(topRole, lowerRole);
}

Role.prototype._nextLower = function(role){
	switch (role){
		case 'im': return 'aim';
		case 'aim': return 'tgl';
		case 'tgl': return 'instructor';

		case 'atgl': return 'tgl';

		case 'iaim': return 'aim';
		case 'itgl': return 'tgl';

		case 'ocr': return 'instructor';
		case 'ocrm': return 'ocr';
		default: {
			return null;
		}
	}
}

Role.prototype._recursiveChildren = function(topRole, lower){
	var org = [];
	var lowerRole = this._nextLower(lower);
	if (lowerRole == null) return org;
	var sem = ims.semesters.getCurrentCode();
	var loopies = $(this._user._xml).find('semester[code=' + sem + '] ' + topRole + ' ' + lower);
	for (var i = 0; i < loopies.length; i++){
		var underlings = this._recursiveChildren(lower, lowerRole);
		var o = {
			user: new User({xml: loopies[i], role: lower, dontCreateRoles: true}),
			lower: underlings
		};
		org.push(o);
	}
	return org;
}

/**
 * returns collection of average standards by week for a group
 * @param  {String} name name of a standard
 * @return {Array}      average value for standard in group by week
 */
Role.prototype.getQuestionForGroup = function(name){

}

/**
 * returns collection of average standards by week for everyone
 * @param  {String} name name of a standard
 * @return {Array}      average value for standard in entire org by week
 */
Role.prototype.getQuestionForAll = function(name){
	return new Rollup({level: '*', email: '', question: name});
}

/**
 * returns a list of the various people in the users group
 * @return {Object} object contains all underlings
 */
Role.prototype.getRoster = function(){
	if (this._role == 'instructor') return null;

	return this._org;
}

/**
 * return supervisor
 * @return {[type]} [description]
 */
Role.prototype.getLeader = function(){

}

/**
 * return collection of underlings
 * @return {[type]} [description]
 */
Role.prototype.getLower = function(){
	var result = [];
	$(this._org).each(function(){
		result.push(this.user);
	})
	return result;
}

/**
 * return collection of completed and incompleted tasks by underlings
 * @return {[type]} [description]
 */
Role.prototype.getLowerTasks = function(){
	var underlings = this.getLower();
	var users = [];
	for (var i = 0; i < underlings.length; i++){
		users.push(new User({email: underlings[i].getEmail()}));
	}
	return users;
}

/**
 * return collection of completed tasks for current user
 * @return {[type]} [description]
 */
Role.prototype.getCompletedTasks = function(){

}

/**
 * Gets the roles menu, if instructor return null
 * @return {[type]} [description]
 */
Role.prototype.getRolesMenu = function(){
	if (this._role == 'instructor') return null;
	var org = this._org;
	var people = [];
	for (var i = 0; i < org.length; i++){
		people.push({
			value: org[i].user.getFullName(),
			href: org[i].user.getHref()
		});
	}
	return new Menu(people);
}
// END GROUP: Menu
window._rollupXml = null;

function Rollup(obj){
	this._level = obj.level;
	this._email = obj.email;
	this._question = obj.question;
	this._xml = null;
	this._initalXmlLoad();
	this._data = [];
	this._getData();
}

/**
 * loads the xml file if the file is not already loaded
 */
Rollup.prototype._initalXmlLoad = function(){
	if (window._rollupXml){
		this._xml = window._rollupXml;
	}
	else{
		this._xml = this.getXml();
		window._rollupXml = this._xml;
	}
}


Rollup.prototype.getData = function(){
	return this._data;
}

/**
 * returns a list of the data topics
 * @return {Array} list of data topics 
 */
Rollup.prototype._getData = function(){
	var _this = this;
	var sem = ims.semesters.getCurrentCode();
	var level = this._level.toLowerCase();
	if (level == 'aim' || level == 'tgl') {
		$(this._xml).find('semester[code=' + sem + '] ' + level + '[email=' + this._email + '] > rollup[question*="' + this._question + '"] week').sort(function(a, b){
			if ($(a).attr('week') == 'Intro') return false;
			return parseInt($(a).attr('week')) > parseInt($(b).attr('week'));
		}).each(function(){
			_this._data.push($(this).text());
		});
	}
	else{
		$(this._xml).find('semester[code=' + sem + '] > rollup[question*="' + this._question + '"] week').sort(function(a, b){
			if ($(a).attr('week') == 'Intro') return false;
			return parseInt($(a).attr('week')) > parseInt($(b).attr('week'));
		}).each(function(){
			_this._dataTopics.push($(this).text());
		});
	}	
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
	var loc = window.location.href;
	if (loc.indexOf('&sem=') > -1){
		var sem = loc.split('&sem=')[1];
		if (sem.indexOf('&') > -1){
			sem = sem.split('&')[0];
		}
		return sem; 
	}
	return this.getCurrent().getCode();
}

ims.semesters = (function(){
	return new Semesters();
})()
function Survey(xml){
	this._course = $(xml).attr('course');
	this._xml = xml;
	this.id = $(xml).attr('id');
	this._config = $(Survey.getConfig()).find('survey[id=' + this.id + ']');
	this._name = $(this._config).attr('name');
	this._placement = $(this._config).attr('placement');
	this._week = this.getName().split(': ')[1];
	this._answers = [];
	this._setAnswers();
}

/**
 * Get the basic survey config file
 * @return {[type]} [description]
 */
Survey.getConfig = function(){
	if (!ims._config){
		ims._config = ims.sharepoint.getSurveyConfig();
	}
	return ims._config;
}

Survey.prototype._setAnswers = function(){
	var _this = this;
	$(this._xml).find('answer').each(function(){
		_this._answers.push(new Question(this, _this));
	});
}

/**
 * Get the name of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getName = function(){
	return this._name;
}

/**
 * Get the week of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getWeek = function(){
	return this._week;
}

/**
 * Get the answers of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getAnswers = function(){
	return this._answers;
}

/**
 * Check if the survey is completed or empty
 * @return {Boolean} [description]
 */
Survey.prototype.isComplete = function(){
	return this._answers.length > 0;
}

/**
 * Checks the placement of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getPlacement = function(){
	return this._placement;
}

Survey.prototype.getQuestionsContainingText = function(txt){
	var answers = this.getAnswers();
	var result = [];
	for (var i = 0; i < answers.length; i++){
		var answer = answers[i];
		if (answer.getText().toLowerCase().indexOf(txt) > -1) result.push(answer);
	}
	return result;
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
 * Get the questions from the survey, alias for getAnswers()
 * @return {[type]} [description]
 */
Survey.prototype.getQuestions = function(){
	return this.getAnswers();
}
function Tile(config){
	if (!config) throw "Invalid config of tile";
	this.title = config.title;
	this.helpText = config.helpText;
	this.type = config.type;
	this.data = config.data;
	this.hidden = config.hidden;
}
window._currentUser = null;
window._userXml = {};

function User(obj){
	if (!obj) throw "Invalid User Object";

	if (obj['email']){
		this._email = obj['email'];
		if (_userXml[this._email]){
			this._xml = _userXml[this._email]
		}
		else{
			this._xml = ims.sharepoint.getXmlByEmail(this._email);
			_userXml[this._email] = this._xml;
		}

		this._first = null;
		this._last = null;
		this._setPersonalInfo();
		this._courses = [];
		this._setCourses();
		this._surveys = [];
		this._setSurveys();
		this._semesters = [];
		this._isCurrent = obj.current == true;
		this._new = false;

	}
	if (obj['xml']){
		this._xml = obj['xml'];
		this._first = null;
		this._last = null;
		this._setPersonalInfo(true);
		this._courses = [];
		this._surveys = [];
		this._semesters = [];
		this._isCurrent = obj.current == true;
		this._new = false;
	}
	if (this._isCurrent){
		this._role = new Role(ims.aes.value.cr, this);
	}
	else if (!obj.dontCreateRoles){
		var u = User.getCurrent();
		this._role = new Role(obj.role, this);
	}
}

/**
 * The standard for instructor hours per credit
 * @type {Number}
 */
User.HoursStandard = 3.5;

/**
 * Get the current user (the current dashboard user)
 * @return {[type]} [description]
 */
User.getCurrent = function(){
	if (!window._currentUser){
		window._currentUser = new User({email: ims.aes.value.ce, current: true});
	}
	return window._currentUser;
}

/**
 * The inital search for person
 * @param  {[type]} email [description]
 * @return {[type]}       [description]
 */
User.redirectToDashboard = function(email){
	if (email.indexOf('@')) email = email.split('@')[0];
    var doc = ims.sharepoint.getXmlByEmail(email);
    if (doc == null) {
      redirectError();
    }
    var role = '';
    var sem = ims.semesters.getCurrentCode();
    var inst = $(doc).find('semester[code=' + sem + '] > instructor');
    var tgl = $(doc).find('semester[code=' + sem + '] > tgl');
    var aim = $(doc).find('semester[code=' + sem + '] > aim');
    if (inst.length > 0){
      role = 'INSTRUCTOR';
    }
    else if (tgl.length > 0){
      role = 'TGL';
    }
    else if (aim.length > 0){
      role = 'AIM';
    }

    var obj = {
      ce: email,
      cr: role,
      i: role,
      e: email
    };
    var aes = ims.aes.encrypt(JSON.stringify(obj), ims.aes.key.hexDecode());
    window.location.href = window.location.href.split('aspx')[0] + 'aspx?v=' + aes;
}

/**
 * TODO:
 * 	call this._role.canSearch();
 * @return {[type]} [description]
 */
User.prototype.canSearch = function(){
	return true;
}

/**
 * TODO:
 * 	call this._role.isLeader();
 * @return {Boolean} [description]
 */
User.prototype.isLeader = function(){
	return true;
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
 * Set the basic personal information
 */
User.prototype._setPersonalInfo = function(noSpot){
	var sem = ims.semesters.getCurrentCode();
	var spot;
	if (noSpot){
		spot = this._xml;
	}
	else{
		spot = $(this._xml).find('semester[code=' + sem + ']').children().first();
	}
	this._first = $(spot).attr('first');
	this._last = $(spot).attr('last');
	this._email = $(spot).attr('email');
	this._new = $(spot).attr('new') != 'False';
}

/**
 * Set the courses
 */
User.prototype._setCourses = function(){
	var _this = this;
	var sem = ims.semesters.getCurrentCode();
	$(this._xml).find('semester[code=' + sem + '] course').each(function(){
		_this._courses.push(new Course(this));
	})
}

User.prototype.getTasksToReview = function(){

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
	var surveys = this.getSurveys();
	for (var i = 0; i < surveys.length; i++){
		if (surveys[i].id.toLowerCase() == sid.toLowerCase()) return surveys[i];
	}
}

/**
 * Get an Array of the surveys
 * @return {[type]} [description]
 */
User.prototype.getSurveys = function(){
	return this._surveys;
}

// GROUP: Roles
/**
 * Get the users role relative to the current user and their role
 * @return {[type]} [description]
 */
User.prototype.getRole = function(){
	return this._role;
}

/**
 * Validates if the instructor is a new instructor
 * or not.
 * @return {Boolean} [description]
 */
User.prototype.isNew = function(){
	return this._new;
}

/**
 * Get the href for the user
 * @return {[type]} [description]
 */
User.prototype.getHref = function(){

}

/**
 * Returns an array of SMART goals if taken
 * @return {[type]} [description]
 */
User.prototype.getSmartGoals = function(){
	var weeklyReflections = this.getWeeklyReflections();
	var goals = [];
	for (var i = 0; i < weeklyReflections.length; i++){
		if (weeklyReflections[i].getName().toLowerCase().indexOf('week 2') > -1){
			goals = weeklyReflections[i].getQuestionsContainingText('smart');
		}
	}
	return goals;
}

/**
 * Get the target hours for this user.
 * @return {[type]} [description]
 */
User.prototype.getTargetHours = function(){
	var credits = this.getTotalCredits();
	if (credits == 1){
		return 1.5 * User.HoursStandard;
	}
	else if (credits == 2){
		return 2.25 * User.HoursStandard;
	}
	else if (credits >= 3){
		return credits * User.HoursStandard;
	}
	else{
		return 0;
	}
}

/**
 * Get an array of the weekly reflections
 * @return {[type]} [description]
 */
User.prototype.getWeeklyReflections = function(){
	var surveys = this.getSurveys();
	var weeklyReflections = [];
	for (var i = 0; i < surveys.length; i++){
		if (surveys[i].getName().toLowerCase().indexOf('weekly reflection') > -1){
			weeklyReflections.push(surveys[i]);
		}
	}
	return weeklyReflections;
}

/**
 * Redirect the url to a specific place
 * @return {[type]} [description]
 */
User.prototype.redirectTo = function(){
  var email = this._email;
  var val = JSON.parse(JSON.stringify(ims.aes.value));
  val.ce = email;
  val.cr = this._role.getName().toUpperCase();
  val.pe = val.e;
  val.pr = val.i;
  var str = JSON.stringify(val);
  var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
  window.location.href = window.location.href.split('?v=')[0] + '?v=' + en;
}

/**
 * Redirect to the base dashboard
 * @return {[type]} [description]
 */
User.redirectHome = function(){
	var val = JSON.parse(JSON.stringify(ims.aes.value));
  val.ce = val.e;
  val.cr = val.i;
  val.pe = val.e;
  val.pr = val.i;
  var str = JSON.stringify(val);
  var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
  window.location.href = window.location.href.split('?v=')[0] + '?v=' + en;
}

/**
 * Redirects back to the previous page
 * @return {[type]} [description]
 */
User.redirectBack = function(){
	var val = JSON.parse(JSON.stringify(ims.aes.value));
  if (val.pe){
    val.ce = val.pe;
    val.cr = val.pr;
    val.pe = val.e;
    val.pr = val.i;
  }
  var str = JSON.stringify(val);
  return ims.aes.encrypt(str, ims.aes.key.hexDecode());
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
	var courses = this.getCourses();
	for (var i = 0; i < courses.length; i++){
		var course = courses[i]; 
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