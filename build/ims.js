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
	postFileTestTest: function(){
		for (var i = 0; i < 1500; i++){
			ims.sharepoint.postFileTest(i + '-test.txt');
		}
	},
	postFileTest: function(fileName){
		function str2ab(str) {
			// new TextDecoder(encoding).decode(uint8array);
		  return new TextEncoder('utf8').encode(str);
		}
		
		var buffer = str2ab(User.getCurrent()._xml.firstChild.outerHTML);
		var url = ims.sharepoint.base + "_api/Web/GetFolderByServerRelativeUrl('" + ims.sharepoint.relativeBase + "Instructor%20Reporting/Test')/Files/add(url='" + fileName + "')";
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
	this._sections = $(xml).attr('section').indexOf(' ') > -1 ? $(xml).attr('section').split(' ') : [$(xml).attr('section')];
	this._credits = parseInt($(xml).attr('credit'));
	this._pilot = $(xml).attr('pilot') == 'true';
	this._id = $(xml).attr('id');
}

Course.prototype.getId = function(){return this._id;}

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
		return loc.split('&c=')[0] + '&c=' + this.getName();
	}
	else{
		return loc + '&c=' + this.getName();
	} 
}

Course.getCurrent = function(){
	if (ims.params.c){
		var course = decodeURI(ims.params.c);
		return User.getCurrent().getCourse(course);
	}
	return null;
}
var app = angular.module('ims', ['highcharts-ng']);

if (!ims.error){
	app.controller('view', ['$scope', 'highchartsNG', function($scope, highchartsNG){
		var currentUser = User.getCurrent();

		// MENU
		$scope.redirectHome = User.redirectHome;
		$scope.user = currentUser;
		$scope.semester = ims.semesters;
		$scope.searchOpened = false;
		$scope.roleMenu = currentUser.getRole().getRolesMenu().getItems();
		$scope.showRoleMenu = false;
		$scope.cols = currentUser.getRole().getTiles();
		$scope.selectedRole = window._selectedRole;
		$scope.backButton = currentUser.backButton();

		$scope.back = function(){
			User.redirectBack();
		}

		$scope.openRoleMenu = function(){
			var right = '71px';
			if ($('.back-btn').length > 0){
				right = '71px';
			}
			else{
				right = '39px';
			}
			$('.semester-popup-dropdown').css({right: right, top: '39px'});
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.showRoleMenu = true;
				})
			}, 2);
		}

		$scope.toggleSubMenu = function(e){
			$(e.target).find('ul').slideToggle();
		}

		$scope.openCourseMenu = function(e){
			var right = '71px';
			if ($('.back-btn').length > 0){
				right = '71px';
			}	
			else{
				right = '10px';
			}		
			$('.semester-popup-dropdown3').css({right: right, top: '39px'});
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.showCourseMenu = true;
				})
			}, 2);
		}

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

		$scope.appendChart = function(tile){
			setTimeout(function(){
				$('#' + tile.config).highcharts(tile.data);
			}, 10);
		}

		$scope.redirect = function(href){
			window.location.href = href;
		}

		$scope.changelimit = function(person){
			if (person.oldLimit > -1){
				person.limit = person.oldLimit;
				person.oldLimit = -1;
			}	
			else{
				person.oldLimit = person.limit;
				person.limit = 90;
			}
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

		$(document).keyup(function(e){
			if (e.keyCode == 27){
				$scope.$apply(function(){
					$scope.closeOverlay();
					$scope.toggleMenu();
				})
			}
		});

		// GLOBAL
		$scope.toggleMenu = function(){
			$scope.closeSearch();
			$scope.showRoleMenu = false;
			$scope.showCourseMenu = false;
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

		$scope.closeOverlay = function(e){
			$('.rawDataOverlay').fadeOut('fast');
			$('.background-cover').fadeOut('fast');
			$(document.body).css({overflow: 'auto'});
		}

		$('.background-cover').click(function(){
			$scope.$apply(function(){
				$scope.closeOverlay();
			})
		})

		$scope.openSurveyData = function(survey){
			$scope.selectedSurvey = survey;
			if ($(window).width() <= 1100){
				$('.rawDataOverlay').css({left: '10px', top: '10px', right: '10px', bottom: '10px'});
			}
			$('.rawDataOverlay').fadeIn();
			$('.background-cover').fadeIn();
			$(document.body).css({overflow: 'hidden'});
		}

		$scope.searching = function(q, e){
			if (e.keyCode == 27){
				$scope.closeSearch();
			}
			else{
				setTimeout(function(){
					var q = $(e.target).val();
					$scope.$apply(function(){
						$scope.suggestions = currentUser.getSuggested(q);
					})
				}, 10);
			}
		}

		$scope.toggleReviewed = function(survey){
			// little hack
			setTimeout(function(){
				survey.toggleReviewed();
				$scope.$apply();
			}, 10);
		}

		$scope.toggleMobileMenu = function(e){
			$('.mobile-menu-side').toggleClass('show-menu');
			if ($('.mobile-menu-side').hasClass('show-menu')){
				$('body').css({overflow: 'hidden'});
			}
			else{
				$('body').css({overflow: 'auto'});
			}
		}

		$scope.computer = new Computer();

		$(window).resize(function(){
			OneCol();
		})
		OneCol();

		function OneCol(){
			var w = $(window).width();
			if (w <= 1100){
				$('.menu').addClass('hidden');
				$('.menu-mobile').removeClass('hidden');
			}
			else{
				$('.menu').removeClass('hidden');
				$('.menu-mobile').addClass('hidden');
			}
		}

	}]);
	
	/**
	 * Revers the items in an ng-repeat
	 */
	app.filter('reverse', function() {
	  return function(items) {
	    if (items) return items.slice().reverse();
	  };
	});
    
    /**
     * @name angular.filter.reverseByWeek
     * @description Reverses the items in an ng-repeat by id
     * @todo
     *  - Filter by week (Grant)
     */
    app.filter('reverseByWeek', function() {
      return function(items){
          if (items){
              var items = [];
              
          }
      } 
    });

	/**
	 * Remove the duplates from the suggestions ng-repeat
	 */
	app.filter('noDuplicates', function(){
		return function(items){
			var result = [];
			var found = {};
			for (var i = 0; i < items.length; i++){
				var first = items[i].user.getRole().getRoleName().toUpperCase().slice(0, 4);
				var last = items[i].user.getFullName();
				if (!found[first + ' - ' + last]){
					result.push(items[i]);
					found[first + ' - ' + last] = true;
				}
			}
			return result;
		}
	})
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

			setTimeout(function(){
				User.redirectToLoggedInUser(function(){
						$('#searchScreen, #enterEmail').fadeIn();
				});
			}, 10);
			$scope.search = function(e, val){
				if (e.keyCode == 13){
					User.redirectToDashboard(val);
				}
			}
	  	
		}]);
	}
}
function Computer(){
	var _this = this;

	ims.sharepoint.getLoggedInUserEmail(function(email){
		var nVer = navigator.appVersion;
		var nAgt = navigator.userAgent;
		var browserName  = navigator.appName;
		var fullVersion  = ''+parseFloat(navigator.appVersion); 
		var majorVersion = parseInt(navigator.appVersion,10);
		var nameOffset,verOffset,ix;

		// In Opera, the true version is after "Opera" or after "Version"
		if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
		 browserName = "Opera";
		 fullVersion = nAgt.substring(verOffset+6);
		 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
		   fullVersion = nAgt.substring(verOffset+8);
		}
		// In MSIE, the true version is after "MSIE" in userAgent
		else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
		 browserName = "Microsoft Internet Explorer";
		 fullVersion = nAgt.substring(verOffset+5);
		}
		// In Chrome, the true version is after "Chrome" 
		else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
		 browserName = "Chrome";
		 fullVersion = nAgt.substring(verOffset+7);
		}
		// In Safari, the true version is after "Safari" or after "Version" 
		else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
		 browserName = "Safari";
		 fullVersion = nAgt.substring(verOffset+7);
		 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
		   fullVersion = nAgt.substring(verOffset+8);
		}
		// In Firefox, the true version is after "Firefox" 
		else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
		 browserName = "Firefox";
		 fullVersion = nAgt.substring(verOffset+8);
		}
		// In most other browsers, "name/version" is at the end of userAgent 
		else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
		          (verOffset=nAgt.lastIndexOf('/')) ) 
		{
		 browserName = nAgt.substring(nameOffset,verOffset);
		 fullVersion = nAgt.substring(verOffset+1);
		 if (browserName.toLowerCase()==browserName.toUpperCase()) {
		  browserName = navigator.appName;
		 }
		}
		// trim the fullVersion string at semicolon/space if present
		if ((ix=fullVersion.indexOf(";"))!=-1)
		   fullVersion=fullVersion.substring(0,ix);
		if ((ix=fullVersion.indexOf(" "))!=-1)
		   fullVersion=fullVersion.substring(0,ix);

		majorVersion = parseInt(''+fullVersion,10);
		if (isNaN(majorVersion)) {
		 fullVersion  = ''+parseFloat(navigator.appVersion); 
		 majorVersion = parseInt(navigator.appVersion,10);
		}
		var OSName="Unknown OS";
		if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
		if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
		if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
		if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

		_this.browser = browserName + ':' + fullVersion,
		_this.os = OSName,
		_this.email = email,
		_this.href = window.location.href.split('?v=')[1]
	})
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
	this._items = [];
	if (ary && ary.length > 0){
		this._setItems(ary);
	}
}

/**
 * Set the items
 * @param {[type]} ary [description]
 */
Menu.prototype._setItems = function(ary){
	for (var i = 0; i < ary.length; i++){
		this._items.push(new MenuItem(ary[i]));
	}
}

/**
 * Get all items
 * @return {[type]} [description]
 */
Menu.prototype.getItems = function(){
	return this._items;
}

/**
 * A specific item in the menu
 * @param {[type]} obj [description]
 */
function MenuItem(obj){
	this.href = obj.href;
	this.name = obj.value;
	this.type = obj.type;
	this.selected = obj.selected;
}
function Question(xml, survey){
	this._answer = $(xml).text();
	this._survey = survey;
	this._xml = xml;
	this._id = $(xml).attr('id');
	this._surveyId = survey.id;
	this._qconfig = $(Survey.getConfig()).find('survey[id=' + this._surveyId + '] question[id=' + this._id + ']')[0];
	this._text = $(this._qconfig).text();
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
 * Get the smart goal title
 * @return {[type]} [description]
 */
Question.prototype.getSmartName = function(){
	return this._text.split('SMART Goal')[1];
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
	this._answer = this._answer.replace(/\\/g, '\n');
	var rwhat = $(this._qconfig).attr('replacewhat');
	var rwith = $(this._qconfig).attr('replacewith');
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
function Role(role, user, dontSetOrg){
	this._role = role;
	this._user = user;

	if (role == null || role.toLowerCase() == 'instructor'){
		this._org = null;
	}
	else{
		if (!dontSetOrg) this._org = this._setOrg();
	}
	this.aim = false;
}

/**
 * Get the tiles based on role
 * @return {[type]} [description]
 */
Role.prototype.getTiles = function(){
	return Tile.getAll(this);
}

Role.prototype.getSingleInstructorStandard = function(name){
	var standards = [];
	var data = this.getQuestionForGroup(this._user.getLeader(), name).getData();
	var all = this.getQuestionForAll(name).getData();
	var group = [];
	var allAry = [];
	for (var j = 0; j < all.length; j++){
        var val = parseFloat(all[j]);
        val = Math.floor(val * 10) / 10;
        allAry.push(val);

		var val = parseFloat(data[j]);
		val = Math.floor(val * 10) / 10;
		group.push(val);
	}
	var single = this._user.getStandard(name);
	return {
            title: {
                text: '',
                x: -20 //center
            },
            subtitle: {
                text: '',
                x: -20
            },
            xAxis: {
                categories: ['Intro', '1', '2'],
                title: {
                    text: 'Week'
                }
            },
            yAxis: {
                title: {
                    text: ' '
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: '#808080'
                }, {
                    width: 2,
                    dashStyle: 'shortdash',
                    value: 4,
                    color: '#000000',
                    label: {
                        text: 'Meets Standard'
                    }
                }],
                min: 1,
                max: 7
            },
            options: {
                tooltip: {
                    shared: true,
                    useHTML: true,
                    headerFormat: '<small> Week {point.key}</small><table>',
                    pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                        '<td><b>{point.y:.1f}</b></td></tr>',
                    footerFormat: '</table>',
                    valueDecimals: 0
                }
            },
            series: [{
                type: 'line',
                name: this._user._first,
                selected: false,
                data: single,
                color: '#1561AB',
                marker: {
                    radus: 4,
                    symbol: 'circle'
                }
            },
            {
                type: 'line',
                name: 'Teaching Group Average',
                data: group,
                color: 'rgba(67, 67, 72, 0.35)',
                marker: {
                    radus: 4,
                    symbol: 'circle'
                }
            },
            {
                type: 'line',
                name: 'All Online Instructors Average',
                color: 'rgba(97,186,94,0.35)',
                data: allAry,
                marker: {
                    radus: 4,
                    symbol: 'circle'
                }
            }]
        }
}

Role.prototype.getSingleInstructorHours = function(){
	var data = this._user.getHoursRaw();
	return {
            title: {
                text: '',
                x: -20 //center
            },
            subtitle: {
                text: '',
                x: -20
            },
            xAxis: {
                categories: ['Intro', '1', '2'],
                title: {
                    text: 'Week'
                }
            },
            yAxis: {
                title: {
                    text: 'Total Hours'
                },
                plotLines: 0,
                min: 0
            },
            options: {
                tooltip: {
                    shared: true,
                    useHTML: true,
                    headerFormat: '<small> Week {point.key}</small><table>',
                    pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                        '<td><b>{point.y:.1f}</b> hours</td></tr>',
                    footerFormat: '</table>',
                    valueDecimals: 0
                }
            },
            series: [{
                type: 'line',
                name: this._user._first,
                selected: false,
                data: data,
                color: '#008E5C',
                marker: {
                    radus: 4,
                    symbol: 'circle'
                }
            }]
        }
}

Role.prototype.getInstructorHours = function(){
	var hours = [];
	for (var i = 0; i < this._org.length; i++){
		var u = this._org[i].user;
		var data = u.getHours();
		hours.push({
      'type': 'line',
      'name': u.getFullName(),
      'data': data,
      'marker': {
          'radus': 4,
          'symbol': 'circle'
      }
  	});
	}
	return {
            title: {
                text: '',
                x: -20 //center
            },
            subtitle: {
                text: '',
                x: -20
            },
            xAxis: {
                categories: ['Intro', '1', '2'],
                title: {
                    text: 'Week'
                }
            },
            yAxis: {
                title: {
                    text: 'Average Hours/Credit'
                },
                plotLines: [{
                    width: 2,
                    dashStyle: 'shortdash',
                    value: 3,
                    color: '#000000',
                    label: {
                        text: 'Target'
                    }
                }]
            },
            options: {
                tooltip: {
                    shared: true,
                    useHTML: true,
                    headerFormat: '<small> Week {point.key}</small><table>',
                    pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                        '<td><b>{point.y:.1f}</b></td></tr>',
                    footerFormat: '</table>',
                    valueDecimals: 0
                }
            },
            series: hours
        }
}

Role.prototype.getInstructorStandardsDrillDown = function(e){
    var name = e.currentTarget.name;
    var chart = e.currentTarget.chart;
    chart.destroy();
    $('#TGLInstructorStandards').highcharts(this.getInstructorStandardsByName(name));
    $('#TGLInstructorStandards').before('<div class="backBtnStandards link" id="drillup" onclick="backStandard()">Back</div>');
}

function backStandard(){
    var u = User.getCurrent();
    u._role.setInstructorStandardsDrillUp();
    $('#drillup').remove();
}

Role.prototype.setInstructorStandardsDrillUp = function(){
    $('#TGLInstructorStandards').highcharts().destroy();
    $('#TGLInstructorStandards').highcharts(this.getInstructorStandards());
}

Role.prototype.getInstructorStandardsByName = function(name){
    var series = [];
    var lower = this.getLower();
    for (var i = 0; i < lower.length; i++){
        var data = lower[i].getStandard(name);
        series.push({
            type: 'line',
            name: lower[i].getFullName(),
            selected: false,
            data: data,
            marker: {
                radus: 4,
                symbol: 'circle'
            }
        })
    }
    return {
            title: {
                text: name,
                x: -20 //center
            },
            subtitle: {
                text: '',
                x: -20
            },
            xAxis: {
                categories: ['Intro', '1', '2']
            },
            yAxis: {
                title: {
                    text: ' '
                },
                min: 1,
                max: 8,
                tickInterval: 1,
                plotLines: [{
                    width: 2,
                    dashStyle: 'shortdash',
                    value: 4,
                    color: '#000000',
                    label: {
                        text: 'Meets Standard'
                    }
                }]
            },
            options: {
                tooltip: {
                    shared: true,
                    useHTML: true,
                    headerFormat: '<small> Week {point.key}</small><table>',
                    pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                        '<td><b>{point.y:.1f}</b></td></tr>',
                    footerFormat: '</table>',
                    valueDecimals: 0,
                    positioner: function(boxWidth, boxHeight, point) {
                        return {
                            x: 80,
                            y: 165
                        };
                    }
                }
            },
            series: series
        }
}

Role.prototype.getInstructorStandards = function(){
	var standards = [];
	var standardsAry = ['Building Faith', 'Develop Relationships', 'Inspire a Love', 'Embrace University', 'Seek Development Opportunities'];
	for (var i = 0; i < standardsAry.length; i++){
		var stn = standardsAry[i];
		var seriesData = [];
		var data = this.getQuestionForGroup(this._user.getEmail(), stn).getData();
		var seriesData = [];
		for (var j = 0; j < data.length; j++){
			var val = parseFloat(data[j]);
			val = Math.floor(val * 10) / 10;
			seriesData.push(val);
		}
		standards.push(seriesData);
	}
    var _this = this;
	return {
            title: {
                text: '',
                x: -20 //center
            },
            subtitle: {
                text: '',
                x: -20
            },
            xAxis: {
                categories: ['Intro', '1', '2']
            },
            yAxis: {
                title: {
                    text: ' '
                },
                min: 1,
                max: 7,
                tickInterval: 1,
                plotLines: [{
                    width: 2,
                    dashStyle: 'shortdash',
                    value: 4,
                    color: '#000000',
                    label: {
                        text: 'Meets Standard'
                    }
                }]
            },
            options: {
                tooltip: {
                    shared: true,
                    useHTML: true,
                    headerFormat: '<small> Week {point.key}</small><table>',
                    pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                        '<td><b>{point.y:.1f}</b></td></tr>',
                    footerFormat: '</table>',
                    valueDecimals: 0,
                    positioner: function(boxWidth, boxHeight, point) {
                        return {
                            x: 80,
                            y: 165
                        };
                    }
                }
            },
            series: [{
                type: 'line',
                name: 'Building Faith in Jesus Christ',
                selected: false,
                data: standards[0],
                marker: {
                    radus: 4,
                    symbol: 'circle',
                    fillColor: '#434348'
                },
                color: '#434348',
                events: {
                    click: function(e){
                        _this.getInstructorStandardsDrillDown(e);
                    }
                }
            },
            {
                type: 'line',
                name: 'Develop Relationships with and among students',
                data: standards[1],
                marker: {
                    radus: 4,
                    symbol: 'circle',
                    fillColor: '#F7A35C'
                },
                color: '#F7A35C',
                events: {
                    click: function(e){
                        _this.getInstructorStandardsDrillDown(e);
                    }
                }
            },
            {
                type: 'line',
                name: 'Inspire a Love for Learning',
                data: standards[2],
                marker: {
                    radus: 4,
                    symbol: 'circle',
                    fillColor: '#7CB5EC'
                },
                color: '#7CB5EC',
                events: {
                    click: function(e){
                        _this.getInstructorStandardsDrillDown(e);
                    }
                }
            },
            {
                type: 'line',
                name: 'Embrace University Citizenship',
                data: standards[3],
                marker: {
                    radus: 4,
                    symbol: 'circle',
                    fillColor: '#8085E9'
                },
                color: '#8085E9',
                events: {
                    click: function(e){
                        _this.getInstructorStandardsDrillDown(e);
                    }
                }
            },
            {
                type: 'line',
                name: 'Seek Development Opportunities',
                data: standards[4],
                marker: {
                    radus: 4,
                    symbol: 'circle',
                    fillColor: '#90ED7D'
                },
                color: '#90ED7D',
                events: {
                    click: function(e){
                        _this.getInstructorStandardsDrillDown(e);
                    }
                }
            }]
        }
}

Role.prototype.getAvgInstructorHoursByGroup = function(){
	var hours = [];
	for (var i = 0; i < this._org.length; i++){
		var u = this._org[i].user;
		var r = u.getRole();
		var data = r.getQuestionForGroup(u.getEmail(), "Hours").getData();
		var seriesData = [];
		for (var j = 0; j < data.length; j++){
			var val = parseFloat(data[j]);
			val = Math.floor(val * 10) / 10;
			seriesData.push(val);
		}
		hours.push({
      'type': 'line',
      'name': u.getFullName(),
      'data': seriesData,
      'marker': {
          'radus': 4,
          'symbol': 'circle'
      }
  	});
	}
	return {
            title: {
                text: '',
                x: -20 //center
            },
            subtitle: {
                text: '',
                x: -20
            },
            xAxis: {
                categories: ['Intro', '1', '2'],
                title: {
                    text: 'Week'
                }
            },
            yAxis: {
                title: {
                    text: 'Average Hours/Credit'
                },
                min: 1,
                max: 4.5,
            },
            options: {
                tooltip: {
                    shared: true,
                    useHTML: true,
                    headerFormat: '<small> Week {point.key}</small><table>',
                    pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                        '<td><b>{point.y:.1f}</b></td></tr>',
                    footerFormat: '</table>',
                    valueDecimals: 0
                }
            },
            series: hours
        };
}

/**
 * Get the tasks to review
 * @return {[type]} [description]
 */
Role.prototype.getTasksToReview = function(withCourse){
	var tasks = [];
	var lowerRole = this.getLowerRole();
	if (this.getRoleName().toLowerCase() == 'atgl'){
		lowerRole = 'instructor';
	}
	for (var i = 0; i < this._org.length; i++){
		var u = this._org[i].user;
		var o = {
			user: u,
			surveys: [],
			limit: 3,
			showAllText: 'Show All'
		}
		for (var j = 0; j < u._surveys.length; j++){
			var s = u._surveys[j];
			if (s.isEvaluation() == false && s.getPlacement().toLowerCase() == lowerRole){
				s.withCourse = withCourse;
				o.surveys.push(s);
			}
		}
		tasks.push(o);
	}
	return tasks;
}

/**
 * @name Role.getIncompleteTasks
 * @description Get the incomplete tasks of the lower
 * @todo
 *  - Get all lower person surveys
 *  - Get all survey ids from the above task
 *  - see who doesn't have that Id
 */
Role.prototype.getIncompleteTasks = function(){
	var surveyList = [];
	for (var i = 0; i < this._org.length; i++){
		var user = this._org[i].user;
		var surveys = user.getSurveysByPlacement(this.getLowerRole());
		surveyList.push(surveys);
	}
	var ids = {};
	for (var i = 0; i < surveyList.length; i++){
		for (var j = 0; j < surveyList[i].length; j++){
			ids[surveyList[i][j].id] = true;
		}
	}
	var keys = Object.keys(ids);
	var result = [];
	for (var i = 0; i < surveyList.length; i++){
		var existing = [];
		for (var j = 0; j < surveyList[i].length; j++){
			existing.push(surveyList[i][j].id);
		}
		var differences = [];
		$.grep(keys, function(el){
			if ($.inArray(el, existing) == -1) differences.push(Survey.getNameById(el));
		});
		if (differences.length > 0){
			result.push({
				user: surveyList[i][0]._user,
				differences: differences
			});
		}
	}
	return result;
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

Role.prototype.isRoleDownFromCurrentUser = function(user){
	var lower = this._nextLower(ims.aes.value.cr.toLowerCase());
	return lower == user.getRole().getRoleName().toLowerCase();
}

/**
 * creates the users organization
 * @return {Object} Current users organization
 */
Role.prototype._setOrg = function(){
	return this._recursiveChildren(this._user._xml);
}

/**
 * Recursivly get the org
 * @param  {[type]} topRole [description]
 * @param  {[type]} lower   [description]
 * @return {[type]}         [description]
 */
Role.prototype._recursiveChildren = function(xml){
    var org = [];
    var _this = this;
    var people = $(xml).find('> stewardship > people > person');
    if (people.length == 0) people = $(xml).find('person');
    if (people.length == 0) return [];
    for (var i = 0; i < people.length; i++){
        var person = people[i];
        var role = $(person).attr('type');
        if (!role) role = $(person).attr('highestrole');
        if (role == ims.aes.value.cr.toLowerCase()){
            role = $(person).find('role').attr('type');
        }
        if ($(person).attr('email') == this._user.getEmail()) continue;
        var user = new User({email: $(person).attr('email'), role: role, isBase: false, xml: person});
        org.push({
            user: user,
            lower: _this._recursiveChildren($(person).find('> roles > role[type=' + $(person).attr('type') + ']'))
        });
        if (user._role._org != null && user._role._org.length != org[org.length - 1].lower.length){
            org[org.length - 1].lower = user._role._org; 
        }
    }
    return org;
}

/**
 * Get the next lower role
 * @param  {[type]} role [description]
 * @return {[type]}      [description]
 */
Role.prototype._nextLower = function(role){
	switch (role){
		case 'im': return 'aim';
		case 'aim': return 'tgl';
		case 'tgl': return 'instructor';

		case 'atgl': return 'tgl';

		case 'ocr': return 'instructor';
		case 'ocrm': return 'ocr';
		default: {
			return null;
		}
	}
	return null;
}

Role.prototype._nextHigher = function(role){
    switch (role){
        case 'aim': return 'im';
        case 'tgl': return 'aim';

        case 'atgl': return 'aim';

        case 'ocr': return 'ocrm';
        case 'ocrm': return 'aim';
        case 'instructor': return 'tgl';
        default: {
            return null;
        }
    }
    return null;
}

/**
 * Get the next lower role for the menu
 * @param  {[type]} role [description]
 * @return {[type]}      [description]
 */
Role.prototype._nextLowerForMenu = function(role){
	switch (role){
		case 'im': return 'aim';
		case 'aim': return 'tgl';
		case 'tgl': return 'instructor';

		case 'atgl': return 'instructor';

		case 'ocr': return 'instructor';
		case 'ocrm': return 'ocr';
		default: {
			return null;
		}
	}
	return null;
}

/**
 * API call for _nextLowerRole()
 * @return {[type]} [description]
 */
Role.prototype.getLowerRole = function(){
	return this._nextLower(this.getRoleName().toLowerCase());
}

/**
 * API call for _nextHigherRole()
 * @return {[type]} [description]
 */
Role.prototype.getHigherRole = function(){
    return this._nextHigher(this.getRoleName().toLowerCase());
}

/**
 * Init function for lower role
 * @return {[type]} [description]
 */
Role.prototype.getLowerRoleInit = function(){
	if (this._user.isCurrent())
		return this._nextLower(this.getRoleName().toLowerCase());
	return false;
}

/**
 * returns collection of average standards by week for a group
 * @param  {String} name name of a standard
 * @return {Array}      average value for standard in group by week
 */
Role.prototype.getQuestionForGroup = function(email, name){
    var role = this.getRoleName().toLowerCase();
    if (this._user.isCurrent() && role == 'tgl' && this._user.getHighestRole().toLowerCase() == 'aim') role = 'tgl';
    else if (role == 'instructor') role = 'tgl';
	return new Rollup({level: role, email: email, question: name});
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
 * @name  Role.getRoster
 * @description returns a list of the various people in the users group
 * @todo
 *  + Include performance report link
 */
Role.prototype.getRoster = function(){
	if (this._role == 'instructor') return null;
	var roster = [];
	for (var i = 0; i < this._org.length; i++){
		roster.push(this._org[i].user);
	}
	return roster;
}

/**
 * return supervisor
 * @return {[type]} [description]
 */
Role.prototype.getLeader = function(){
    return this._user.getLeader();
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
    return this.getLower();
}

/**
 * return collection of completed tasks for current user
 * @return {[type]} [description]
 */
Role.prototype.getCompletedTasks = function(){
	var result = [];
	var surveys = this._user.getSurveys();
	for (var i = 0; i < surveys.length; i++){
		if (surveys[i].isEvaluation() == false && surveys[i].getPlacement().toLowerCase() == this.getRoleName().toLowerCase() || this.getRoleName().toLowerCase() == 'atgl' && surveys[i].getPlacement().toLowerCase() == 'tgl'){
			result.push(surveys[i]);
		}
	}
	return result;
}

/**
 * return collection of evaluations for current user
 * @return {[type]} [description]
 */
Role.prototype.getEvaluations = function(){
    var result = [];
    var surveys = this._user.getSurveys();
    for (var i = 0; i < surveys.length; i++){
        if (surveys[i].isEvaluation() == true && surveys[i].getPlacement().toLowerCase() == this.getRoleName().toLowerCase() || this.getRoleName().toLowerCase() == 'atgl' && surveys[i].getPlacement().toLowerCase() == 'tgl'){
            result.push(surveys[i]);
        }
    }
    return result;
}

/**
 * Get the completed tasks by course
 * @return {[type]} [description]
 */
Role.prototype.getCompletedTasksByCourse = function(){
    var surveyList = {};
    var surveys = this._user.getSurveys();
    for (var i = 0; i < surveys.length; i++){
        if (surveys[i].isEvaluation() == false && surveys[i].getPlacement().toLowerCase() == this.getRoleName().toLowerCase() || this.getRoleName().toLowerCase() == 'atgl' && surveys[i].getPlacement().toLowerCase() == 'tgl'){
            if (!surveyList[surveys[i].getCourse().getName()]){
                surveyList[surveys[i].getCourse().getName()] = [];
            }
            surveyList[surveys[i].getCourse().getName()].push(surveys[i]);
        }
    }
    var keys = Object.keys(surveyList);
    var result = [];
    for (var i = 0; i < keys.length; i++){
        var course = this._user.getCourse(keys[i]);
        if (Course.getCurrent()){
            var c = Course.getCurrent();
            if (c.getName() != course.getName()) continue;
        }
        result.push({
            course: course,
            surveys: surveyList[keys[i]]
        });
    }
    return result;
}

/**
 * Get the href for that given role
 * @return {[type]} [description]
 */
Role.prototype.getHref = function(){
	var val = JSON.parse(JSON.stringify(ims.aes.value));
    val.pe = val.ce;
    val.pr = val.cr;
    val.ce = this._user.getEmail();
    val.cr = this.getRoleName().toUpperCase();
    // if (this.getRoleName().toLowerCase() == 'tgl' && this.aim){
    // 	val.cr = 'a' + this.getRoleName();
    // }
    var str = JSON.stringify(val);
    var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
    var href = window.location.href;
    if (href.indexOf('v=') > -1){
    	return href.split('v=')[0] + 'v=' + en;
    }
    return;
}

/**
 * Get the different hats for the role menu
 * @return {[type]} [description]
 */
Role.prototype._getHats = function(){
	var role = this.getRoleName().toLowerCase();
	var hats = [];
	if (role == 'instructor') return hats;

	if (this._user.isCurrent()){
		hats.push({
			value: 'My Views',
			href: '#',
			type: 'title',
			selected: false
		});
	}
	else{
		hats.push({
			value: this._user._first + '\'s Views',
			href: '#',
			type: 'title',
			selected: false
		});
	}

    var roles = this._user.getAllRoles();
    for (var i = 0; i < roles.length; i++){
        var userRole = this._user.getRoleAs(roles[i]);
        var name = roles[i];
        if (name == 'aim' || name == 'tgl' || name == 'im') name = name.toUpperCase();
        else name = name.charAt(0).toUpperCase() + name.slice(1);
        var isSelected = this.getRoleName().toUpperCase() == name.toUpperCase();
        if (isSelected) window._selectedRole = name;
        hats.push({
            value: name,
            href: userRole.getHref(),
            selected: isSelected
        });
    }
 	return hats;
}

Role.prototype.getSuggested = function(q){
    q = q.toLowerCase();
    var result = [];
    for (var i = 0; i < this._org.length; i++){
        var topUser = this._org[i];
        if (topUser.user.getEmail().toLowerCase().indexOf(q) > -1 ||
            topUser.user.getFullName().toLowerCase().indexOf(q) > -1){
            result.push(this._org[i]);
        }
        for (var j = 0; j < topUser.lower.length; j++){
            var lower = this._org[i].lower[j];
            if (lower.user.getEmail().toLowerCase().indexOf(q) > -1 ||
                lower.user.getFullName().toLowerCase().indexOf(q) > -1){
                result.push(lower);
            }
            for (var k = 0; k < lower.lower.length; k++){
                var lowest = this._org[i].lower[j].lower[k];
                if (lowest.user.getEmail().toLowerCase().indexOf(q) > -1 ||
                    lowest.user.getFullName().toLowerCase().indexOf(q) > -1){
                    result.push(lowest);
                }
            }
        }
    }
    return result;
}

/**
 * @description Gets the roles menu, if instructor return null
 * @todo 
 *  + Rename 'INSTRUCTOR' to 'Instructor'
 */
Role.prototype.getRolesMenu = function(){
	if (this._role.toLowerCase() == 'instructor') return new Menu();
	var org = this._org;
	var people = [];
	var lowerRole = this._nextLowerForMenu(this.getRoleName().toLowerCase());
	if (this._user.isCurrent()){
		people.push({
			value: 'My ' + (lowerRole != 'instructor' ? lowerRole.toUpperCase() : 'Instructor') + "s",
			href: '#',
			type: 'title',
			selected: false
		});
	}
	else{
		people.push({
			value: this._user._first + '\'s ' + (lowerRole != 'instructor' ? lowerRole.toUpperCase() : 'Instructor') + "s",
			href: '#',
			type: 'title',
			selected: false
		});
	}

	for (var i = 0; i < org.length; i++){
		if (this._user.getFullName() == org[i].user.getFullName()) continue;
		var r = org[i].user.getRole();
		if (ims.aes.value.cr.toLowerCase() == 'atgl') r = org[i].user.getRoleAs('instructor');
		people.push({
			value: org[i].user.getFullName(),
			href: r.getHref(),
			selected: false
		});
	}

	var hats = this._getHats();
	for (var i = 0; i < hats.length; i++){
		people.push(hats[i]);
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
		this._xml = ims.sharepoint.getXmlByEmail('rollup');
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
	if (level == '*'){
		$(this._xml).find('semester[code=' + sem + '] > questions question[name*="' + this._question + '"] survey').sort(function(a, b){
			var week = $(Survey.getConfig()).find('semester[code=' + sem + '] survey[id=' + $(a).attr('id') + ']').attr('week');
			if (week.toLowerCase().indexOf('intro') > -1 || week.toLowerCase().indexOf('conclusion') > -1) return false;

			var aweek = parseInt(week);
			var bname = $(Survey.getConfig()).find('semester[code=' + sem + '] survey[id=' + $(b).attr('id') + ']').attr('week');
			var bweek = parseInt(bname);
			return parseInt(aweek > bweek);

		}).each(function(){
			_this._data.push($(this).attr('value'));
		});
	}
	else{
		$(this._xml).find('semester[code=' + sem + '] person[email=' + this._email + '][type=' + level + '] question[name*="' + this._question + '"] survey').sort(function(a, b){
			var week = $(Survey.getConfig()).find('semester[code=' + sem + '] survey[id=' + $(a).attr('id') + ']').attr('week');
			if (week.toLowerCase().indexOf('intro') > -1 || week.toLowerCase().indexOf('conclusion') > -1) return false;

			var aweek = parseInt(week);
			var bname = $(Survey.getConfig()).find('semester[code=' + sem + '] survey[id=' + $(b).attr('id') + ']').attr('week');
			var bweek = parseInt(bname);
			return parseInt(aweek > bweek);

		}).each(function(){
			_this._data.push($(this).attr('value'));
		});
	}
}
function Semester(obj){
	if (typeof obj == 'string'){
		this._code = obj;
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
	this._current = null;
}

Semesters.prototype.getCurrent = function(){
	if (!this._current){
		this._current = new Semester($(Survey.getConfig()).find('semester[current=true]').attr('code'));
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
function Survey(xml, user){
	this._course = user.getCourseById($(xml).attr('courseid'));
	this._xml = xml;
	this._user = user;
	this.id = $(xml).attr('id');
	this._config = $(Survey.getConfig()).find('survey[id=' + this.id + ']');
	this._name = $(this._config).attr('name');
	this._placement = $(this._config).attr('placement');
	this._week = $(this._config).attr('week');
	this._answers = [];
	this._setAnswers();
	this._reviewed = $(this._xml).attr('reviewed') == 'true';
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

/**
 * @name  Survey.getNameById
 * @todo
 *  - Get the survey name by an id
 */
Survey.getNameById = function(id){
	var config = Survey.getConfig();
	var survey = $(config).find('semester[current=true] survey[id=' + id + ']');
	return $(survey).attr('name') + ': ' + $(survey).attr('week');
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
	if (this.withCourse && this._user.getCourses().length > 1){
		return this._name + ': ' + this._week + ' - ' + this.getCourse().getName();
	}
	return this._name + ': ' + this._week;
}

/**
 * Verifiy if the survey is reviewed
 * @return {Boolean} [description]
 */
Survey.prototype.isReviewed = function(){
	return this._reviewed;
}

/**
 * Get the week of the survey
 * @return {[type]} [description]
 */
Survey.prototype.getWeek = function(){
	return this._week;
}

Survey.prototype.isEvaluation = function(){
	return $(this._config).attr('iseval') == 'true';
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

/**
 * Toggle if the survey has been reviewed or not
 * @return {[type]} [description]
 */
Survey.prototype.toggleReviewed = function(){
	var _this = this;
	User.getLoggedInUserEmail(function(email){
		if (!email || ims.aes.value.ce.toLowerCase() != email.toLowerCase()) return;
		var reviewed = _this.isReviewed();
		_this._reviewed = !reviewed;
		reviewed = _this._reviewed ? 'true' : 'false';
		var id = _this.id;
		$(_this._user._xml).find('> surveys survey[id=' + id + ']').attr('reviewed', reviewed);
		_this._user.save();
	})
}

/**
 * Search for all questions containing text
 * @param  {[type]} txt [description]
 * @return {[type]}     [description]
 */
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
	return this._course;
}

/**
 * Get the questions from the survey, alias for getAnswers()
 * @return {[type]} [description]
 */
Survey.prototype.getQuestions = function(){
	return this.getAnswers();
}
/**
 * @name Tile 
 * @description
 * @todo 
 *  + Rename roster to resources
 *  + Link to performance report under resources
 *  - Course vists
 */
function Tile(config) {
  if (!config) throw "Invalid config of tile";
  this.title = config.title;
  this.helpText = config.helpText;
  this.type = config.type;
  this.data = config.data;
  this.hidden = config.hidden;
  this.config = config.config;
}

Tile.getAll = function(role) {
  var name = role.getRoleName().toLowerCase();
  if (name == 'aim' || name == 'im') {
    return [
      [
        new Tile({
          title: 'Tasks To Review',
          helpText: 'This tile displays tasks that your ' + role._nextLower(name).toUpperCase() + 's have completed and that as an ' + name.toUpperCase() + ' you need to review.',
          type: 'task-list',
          data: role.getTasksToReview(false),
          hidden: ''
        }),
        new Tile({
          title: 'Completed ' + name.toUpperCase() + ' Tasks',
          helpText: 'This tile displays ' + name.toUpperCase() + ' tasks that you have completed.',
          type: 'survey-list',
          data: role.getCompletedTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Instructor Standards',
          helpText: 'This tile displays the average score for each instructor standard. Click on a standard\'s line in the graph to view individual instructor scores for that standard',
          type: 'graph',
          data: role.getInstructorStandards(),
          hidden: '',
          config: 'TGLInstructorStandards'
        })
      ],
      [
        new Tile({
          title: 'Incomplete ' + role._nextLower(name).toUpperCase() + ' Tasks',
          helpText: 'This tile displays overdue tasks for ' + role._nextLower(name).toUpperCase() + 's in your area.',
          type: 'review-list',
          data: role.getIncompleteTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Resources',
          //helpText: '<h2>Performance Report</h2>A performance report should be filled out if you have noticed an instructor falling below instructor standards for more than one or two weeks and have already re-emphasized standards and expectations with the instructor through performance discussions.  You should not have more than two performance discussions with an instructor without simultaneously submitting a performance report (PR).  Follow Online Instruction’s three-tiered approach for communicating with the instructor about PRs.<br><h2>',
          helpText: 'This tile provides access to submit and view performance reports.  It also displays ' + tmpPretty(role._nextLower(name).toUpperCase()) + 's in your group.',
          type: 'roster',
          data: role.getRoster(),
          hidden: ''
        }),
        new Tile({
          title: 'Evaluations',
          helpText: 'This tile displays evaluations others have completed about you in your name as an ' + (name.toLowerCase() == 'aim' ? 'Assistant Instructor Manager' : 'Instructor Manager') + '.',
          type: 'survey-list',
          data: role.getEvaluations(),
          hidden: ''
        })
      ],
      [
        new Tile({
          title: 'Average Instructor Hours by Group',
          helpText: 'This tile displays the average instructor weekly hours/credit for each teaching group.',
          type: 'graph',
          data: role.getAvgInstructorHoursByGroup(),
          hidden: '',
          config: 'AIMInstructorHours'
        })
      ]
    ]
  } else if (name == 'tgl' || name == 'atgl') {
    return [
      [
        new Tile({
          title: 'Completed TGL Tasks',
          helpText: 'This tile displays TGL tasks that you have completed.',
          type: 'survey-list',
          data: role.getCompletedTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Incomplete Instructor Tasks',
          helpText: 'This tile displays overdue tasks for TGLs in your area.',
          type: 'review-list',
          data: role.getIncompleteTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Evaluations',
          helpText: 'This tile displays evaluations on you as a ' + name.toUpperCase() + '.',
          type: 'survey-list',
          data: role.getEvaluations(),
          hidden: ''
        }),
        new Tile({
          title: 'Resources',
          helpText: 'This tile provides access to submit and view performance reports.  It also displays ' + tmpPretty(role._nextLower(name).toUpperCase()) + 's in your group.',
          type: 'roster',
          data: role.getRoster(),
          hidden: ''
        })
      ],
      [
        new Tile({
          title: 'Tasks To Review',
          helpText: 'This tile displays tasks that your TGLs have completed and that as an AIM you need to review.',
          type: 'task-list',
          data: role.getTasksToReview(true),
          hidden: ''
        })
      ],
      [
        new Tile({
          title: 'Instructor Standards',
          helpText: 'This tile displays the average score for each instructor standard. Click on a standard\'s line in the graph to view individual instructor scores for that standard',
          type: 'graph',
          data: role.getInstructorStandards(),
          hidden: '',
          config: 'TGLInstructorStandards'
        }),
        new Tile({
          title: 'Instructor Hours',
          helpText: 'This tile displays the average instructor hours/credit for each instructor.',
          type: 'graph',
          data: role.getInstructorHours(),
          hidden: '',
          config: 'TGLInstructorHours'
        })
      ]
    ]
  } else if (name == 'instructor') {
    return [
      [
        role._user.showCourseMenu() ?
        new Tile({
          title: 'Completed Instructor Tasks',
          helpText: 'These are the tasks that you completed. The link opens the results.',
          type: 'course-survey-list',
          data: role.getCompletedTasksByCourse(),
          hidden: ''
        }) :

        new Tile({
          title: 'Completed Instructor Tasks',
          helpText: 'These are the tasks that you completed. The link opens the results.',
          type: 'survey-list',
          data: role.getCompletedTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Hours Spent',
          helpText: 'The total number of hours recorded over the weeks',
          type: 'graph',
          data: role.getSingleInstructorHours(),
          hidden: '',
          config: 'InstructorInstructorHours'
        }),
        new Tile({
          title: 'Inspire a Love for Learning',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Inspire a Love'),
          hidden: '',
          config: 'InstructorInstructorStandard1'
        })
      ],
      [
        new Tile({
          title: 'SMART Goals',
          helpText: 'The SMART goals set by the instructor during the Week 2 Weekly Reflection.',
          type: 'smart',
          data: role._user.getSmartGoals(),
          hidden: ''
        }),
        new Tile({
          title: 'Building Faith in Jesus Christ',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Building Faith'),
          hidden: '',
          config: 'InstructorInstructorStandard2'
        }),
        new Tile({
          title: 'Seek Development Opportunities',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Seek Development'),
          hidden: '',
          config: 'InstructorInstructorStandard3'
        })
      ],
      [
        new Tile({
          title: 'Develop Relationships with and Among Students',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Develop Relationships'),
          hidden: '',
          config: 'InstructorInstructorStandard4'
        }),
        new Tile({
          title: 'Embrace University Citizenship',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Embrace University'),
          hidden: '',
          config: 'InstructorInstructorStandard5'
        }),
        new Tile({
          title: 'Evaluations',
          helpText: 'This tile displays evaluations on you as an Instructor.',
          type: 'survey-list',
          data: role.getEvaluations(),
          hidden: ''
        })
      ]
    ];
  }
}

function tmpPretty(txt){
  if (txt == 'INSTRUCTOR') return 'Instructor';
  return txt;
}
window._currentUser = null;
if (ims.aes.value.ce){
	window._baseUserXml = ims.sharepoint.getXmlByEmail(ims.aes.value.ce);
}

function User(obj){
	if (!obj) throw "Invalid User Object";
	if (!obj.email) throw 'Invalid email';

	this._email = obj.email;
	this._first = null;
	this._last = null;
	this._baseRole = obj.role.toLowerCase();
	this._setPersonalInfo(obj.isBase, obj.xml);
	this._courses = [];
	this._setCourses();
	this._surveys = [];
	this._setSurveys();
	this._semesters = [];
	this._isCurrent = obj.isBase == true;
	this._new = false;
	this._role = new Role(this._baseRole, this);
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
		window._currentUser = new User({email: ims.aes.value.ce, role: ims.aes.value.cr, isBase: true});
	}
	return window._currentUser;
}

/**
 * Get the email and redirect to the logged in user
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
User.redirectToLoggedInUser = function(err){
	ims.sharepoint.redirectToLoggedInUser(err, function(email){
		User.redirectToDashboard(email);
	});
}

User.getLoggedInUserEmail = function(callback){
	ims.sharepoint.getLoggedInUserEmail(callback);
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
  var sem = ims.semesters.getCurrentCode();
  var role = $(doc).find('semester[code=' + sem + '] > people > person').attr('highestrole').toUpperCase();

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
 * Get the suggested list
 * @param  {[type]} q [description]
 * @return {[type]}   [description]
 */
User.prototype.getSuggested = function(q){
	return this._role.getSuggested(q);
}

/**
 * Get all the roles associated with the user
 * @return {[type]} [description]
 */
User.prototype.getAllRoles = function(){	
	var roles = $(this._xml).parent().find('> role');
	var result = [];
	for (var i = 0; i < roles.length; i++){
		result.push($(roles[i]).attr('type'));
	}
	return result;
}

/**
 * TODO:
 * 	call this._role.canSearch();
 * @return {[type]} [description]
 */
User.prototype.canSearch = function(){
	var roleName = this.getRole().getRoleName().toLowerCase();
	return roleName == 'aim' || roleName == 'im';
}

/**
 * TODO:
 * 	call this._role.isLeader();
 * @return {Boolean} [description]
 */
User.prototype.isLeader = function(){
	var r = this.getRole().getRoleName().toLowerCase();
	return r == 'aim' || r == 'tgl' || r == 'atgl' || r == 'im';
}

User.prototype.isCurrent = function(){
	if (ims.aes.value.e != ims.aes.value.ce) return false;
	return this._isCurrent;
}

/**
 * Internal function to populate the users surveys into the _surveys
 * array
 */
User.prototype._setSurveys = function(){ 
	var _this = this;
	$(this._xml).find('> surveys survey').each(function(){
		_this._surveys.push(new Survey(this, _this));
	})
}

/**
 * Set the basic personal information
 */
User.prototype._setPersonalInfo = function(isBase, userXml){
	var sem = ims.semesters.getCurrentCode();
 	var spot = null;
 	if (isBase){
 		spot = $(window._baseUserXml).find('semester[code=' + sem + '] > people > person');
 	}
 	else{
 		spot = $(userXml);
 	}
	this._first = $(spot).attr('first');
	this._last = $(spot).attr('last');
	this._email = $(spot).attr('email');
	this._new = $(spot).attr('new') != 'false';
	this._xml = $(spot).find('> roles > role[type=' + this._baseRole + ']');
	if (this._xml.length == 0){
		this._xml = spot;
	}
	this._personXml = spot;
}

/**
 * Show the course menu for an instructor
 * @return {[type]} [description]
 */
User.prototype.showCourseMenu = function(){
	var role = this.getRole().getRoleName().toUpperCase();
	return role == 'INSTRUCTOR' && this.getCourses().length > 1;
}

/**
 * Returns the selected course if the user is an instructor
 * @return {[type]} [description]
 */
User.prototype.selectedCourse = function(){
	if (ims.params.c && !this._selectedCourse){
		var course = decodeURI(ims.params.c);
		this._selectedCourse = this.getCourse(course);
	}
	else{
		return ims.params.c ? this._selectedCourse : null;
	}
}

/**
 * Set the courses
 */
User.prototype._setCourses = function(){
	var _this = this;
	$(this._xml).find('course').each(function(){
		_this._courses.push(new Course(this));
	})
}

/**
 * Get the first name of the user
 * @return {[type]} [description]
 */
User.prototype.getFirst = function(){
	return this._first;
}

/**
 * Get the last name of the user
 * @return {[type]} [description]
 */
User.prototype.getLast = function(){
	return this._last;
}

User.prototype.getHighestRole = function(){
	return $(this._xml).parent().parent().attr('highestrole');
}

/**
 * Only used for instructors
 * @type {[type]}
 */
User.prototype.getLeader = function(){
	var type = '';
	if (this._baseRole == 'tgl') type = 'aim';
	else if (this._baseRole == 'instructor') type = 'tgl';
	var result = $(this._xml).find('> leadership person[type=' + type + ']').attr('email');
	if (!result){
		result = $(this._xml).parents('semester').find('role:not([type=' + this._baseRole + '])');
		type = $(result).attr('type');
		if (type == 'tgl') type = 'aim';
		result = $(result).find('leadership person[type=' + type + ']').attr('email');
	}	
	return result;
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
User.prototype.getFullEmail = function(){
	return this._email + '@byui.edu';
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
 * Save the xml to the server
 * @return {[type]} [description]
 */
User.prototype.save = function(){
	ims.sharepoint.postFile(this);
}

/**
 * Get an Array of the surveys
 * @return {[type]} [description]
 */
User.prototype.getSurveys = function(){
	return this._surveys;
}

/**
 * Get the survey by placement
 * @param  {[type]} placement [description]
 * @return {[type]}           [description]
 */
User.prototype.getSurveysByPlacement = function(placement){
	var surveys = [];
	for (var i = 0; i < this._surveys.length; i++){
		if (this._surveys[i].getPlacement().toLowerCase() == placement.toLowerCase()){
			surveys.push(this._surveys[i]);
		}
	}
	return surveys;
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
 * Get the role as with a hat
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
User.prototype.getRoleAs = function(type){
	return new Role(type, this, true);
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
	if (this._email == 'davismel'){
		var a = 10;
	}
	var val = JSON.parse(JSON.stringify(ims.aes.value));
  val.ce = this.getEmail();
  val.cr = this.getRole().getRoleName().toUpperCase();
  val.pe = val.e;
  val.pr = val.i;
  var str = JSON.stringify(val);
  var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
  var href = window.location.href;
  if (href.indexOf('v=') > -1){
  	return href.split('v=')[0] + 'v=' + en;
  }
  return;
}

/**
 * Returns an array of SMART goals if taken
 * @return {[type]} [description]
 */
User.prototype.getSmartGoals = function(){
	var weeklyReflections = this.getWeeklyReflections();
	var goals = [];
	for (var i = 0; i < weeklyReflections.length; i++){
		if (weeklyReflections[i].getWeek() == '2'){
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

User.prototype.backButton = function(){
	return ims.aes.value.ce != ims.aes.value.e;
}

/**
 * Get the weekly hours averaged out by course
 * @return {[type]} [description]
 */
User.prototype.getHours = function(){
	var wr = this.getWeeklyReflections();
	var hours = [];
	var courses = this.getCourses();
	var hrsByCourse = {};
	var stub = courses[0].getName();
	var credits = this.getTotalCredits();
	for (var i = 0; i < courses.length; i++){
		hrsByCourse[courses[i].getName()] = [];
	}
	if (courses.length > 1){
		for (var i = 0; i < wr.length; i++){
			var hr = wr[i].getQuestionsContainingText("weekly hours");
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hrsByCourse[wr[i].getCourse().getName()].push(val);
			}
			else{
				hrsByCourse[wr[i].getCourse().getName()].push(0);
			}
		}
		for (var i = 0; i < hrsByCourse[stub].length; i++){
			var total = 0;
			for (var j = 0; j < courses.length; j++){
				total += hrsByCourse[courses[j].getName()][i];
			}
			if (credits == 1){
				hours.push(total / 1.5);
			}
			else if (credits == 2){
				hours.push(total / 2.25);
			}
			else if (credits >= 3){
				hours.push(total / credits);
			}
		}
	}
	else{
		for (var i = 0; i < wr.length; i++){
			var hr = wr[i].getQuestionsContainingText("weekly hours");
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				if (credits == 1){
					hours.push(val / 1.5);
				}
				else if (credits == 2){
					hours.push(val / 2.25);
				}
				else if (credits >= 3){
					hours.push(val / credits);
				}
			}
			else{
				hours.push(0);
			}
		}
	}
	for (var i = 0; i < hours.length; i++){
		hours[i] = Math.floor(hours[i] * 10) / 10;
	}
	return hours;
}

/**
 * Get the weekly hours averaged out by course
 * @return {[type]} [description]
 */
User.prototype.getHoursRaw = function(){
	var wr = this.getWeeklyReflections();
	var hours = [];
	var courses = this.getCourses();
	var hrsByCourse = {};
	var stub = Course.getCurrent() ? Course.getCurrent().getName() : courses[0].getName();
	var credits = this.getTotalCredits();
	for (var i = 0; i < courses.length; i++){
		if (Course.getCurrent() && Course.getCurrent().getName() != courses[i].getName()) continue;
		hrsByCourse[courses[i].getName()] = [];
	}
	if (courses.length > 1){
		for (var i = 0; i < wr.length; i++){
			if (Course.getCurrent() && Course.getCurrent().getName() != wr[i].getCourse().getName()) continue;
			var hr = wr[i].getQuestionsContainingText("weekly hours");
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hrsByCourse[wr[i].getCourse().getName()].push(val);
			}
			else{
				hrsByCourse[wr[i].getCourse().getName()].push(0);
			}
		}
		for (var i = 0; i < hrsByCourse[stub].length; i++){
			var total = 0;
			for (var j = 0; j < courses.length; j++){
				if (Course.getCurrent() && Course.getCurrent().getName() != courses[j].getName()) continue;
				total += hrsByCourse[courses[j].getName()][i];
			}
			hours.push(total);
		}
	}
	else{
		for (var i = 0; i < wr.length; i++){
			var hr = wr[i].getQuestionsContainingText("weekly hours");
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hours.push(val);
			}
			else{
				hours.push(0);
			}
		}
	}
	return hours;
}

User.prototype.getStandard = function(name){
	var wr = this.getWeeklyReflections();
	var hours = [];
	var courses = this.getCourses();
	var hrsByCourse = {};
	var stub = Course.getCurrent() ? Course.getCurrent().getName() : courses[0].getName();
	for (var i = 0; i < courses.length; i++){
		if (Course.getCurrent() && Course.getCurrent().getName() != courses[i].getName()) continue;
		hrsByCourse[courses[i].getName()] = [];
	}
	if (courses.length > 1){
		for (var i = 0; i < wr.length; i++){
			if (Course.getCurrent() && Course.getCurrent().getName() != wr[i].getCourse().getName()) continue;
			var hr = wr[i].getQuestionsContainingText(name.toLowerCase());
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hrsByCourse[wr[i].getCourse().getName()].push(val);
			}
			else{
				hrsByCourse[wr[i].getCourse().getName()].push(0);
			}
		}
		for (var i = 0; i < hrsByCourse[stub].length; i++){
			var total = 0;
			var totalCourses = 0;
			for (var j = 0; j < courses.length; j++){
				if (Course.getCurrent() && Course.getCurrent().getName() != courses[j].getName()) continue;
				totalCourses++;
				total += hrsByCourse[courses[j].getName()][i];
			}
			hours.push(total / totalCourses);
		}
	}
	else{
		for (var i = 0; i < wr.length; i++){
			var hr = wr[i].getQuestionsContainingText(name.toLowerCase());
			if (hr[0].hasAnswer()){
				var h = hr[0].getAnswer();
				var val = parseFloat(h);
				val = Math.floor(val * 10) / 10;
				hours.push(val);
			}
			else{
				hours.push(0);
			}
		}
	}
	return hours;
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
	$(weeklyReflections).sort(function(a, b){
		if (a.getWeek() == 'Intro') return false;
		return parseInt(a.getWeek()) > parseInt(b.getWeek());
	});
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
  var en = ims.aes.encrypt(str, ims.aes.key.hexDecode());
  window.location.href = window.location.href.split('?v=')[0] + '?v=' + en;
}

/**
 * Get an array of Course objects
 * @return {Array} [description]
 */
User.prototype.getCourses = function(){
	if (this._courses.length == 0){
		var _this = this;
		$(this._personXml).find('> courses course').each(function(){
			_this._courses.push(new Course(this));
		})
	}
	return this._courses;
}

/**
 * Get a course by name
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
User.prototype.getCourse = function(name){
	var result = null;
	var courses = this.getCourses();
	if (courses.length > 0){
		for (var i = 0; i < courses.length; i++){
			if (courses[i].getName().toUpperCase() == name.toUpperCase()) return courses[i];
		}
	}
	return result;
}

/**
 * Get a course by id
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
User.prototype.getCourseById = function(id){
	var result = null;
	var courses = this.getCourses();
	if (courses.length > 0){
		for (var i = 0; i < courses.length; i++){
			if (courses[i].getId() == id) return courses[i];
		}
	}
	return result;
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