/**
 * @name ims 
 * @description
 */
window.ims = {}

if (window.location.href.indexOf('?r=1') > 0){
    ims.error = true;
    ims.search = false;
}

/** 
 * @name ims.params
 * @description Get the params found in the url
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

/**
 * @name redirectError 
 * @description
 */
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
 * @name ims.aes
 * @description Global encryption library
 */
ims.aes = {
    /**
     * Encryption Key
     */
    key: '00420059005500490023',
    /**
     * @name ims.aes.encrypt
     * @description Encrypt a string
     */
    encrypt: function(str, key){
        var encrypted = CryptoJS['AES']['encrypt'](str, key);
        return encrypted.toString();
    },
    /**
     * @name ims.aes.decrypt
     * @description Decrypt a string
     */
    decrypt: function(code, key){
        var decrypted = CryptoJS['AES']['decrypt'](code, key).toString(CryptoJS['enc']['Utf8']);
        return decrypted;
    },
    /**
     * @name ims.aes.value
     * @description The global encrypted value
     */
    value: {},
    raw: ''
}


/**
 * @name hexEncode
 * @description Encode the string in hex
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
 * @name hexDecode
 * @description Dencode the string in hex
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
 * @name ims.aes.initDecrypt
 * @description Initial decrypt
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
 * @name ims.tooltip
 * @description Show a tooltip
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
		    });
		});
	},
	/**
	 * @name ims.sharepoint.postFileTestTest 
	 * @description
	 */
	postFileTestTest: function(){
		for (var i = 0; i < 1500; i++){
			ims.sharepoint.postFileTest(i + '-test.txt');
		}
	},
	/**
	 * @name ims.sharepoint.postFileTest 
	 * @description
	 */
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

function Course(xml){
	this._name = $(xml).text();
	this._sections = $(xml).attr('section').indexOf(' ') > -1 ? $(xml).attr('section').split(' ') : [$(xml).attr('section')];
	this._credits = parseInt($(xml).attr('credit'));
	this._pilot = $(xml).attr('pilot') == 'true';
	this._id = $(xml).attr('id');
}

Course.prototype.getId = function(){return this._id;}

/**
 * @name Course.getName
 * @description Get the name of the course
 */
Course.prototype.getName = function(){return this._name;}

/** 
 * @name Course.getSections
 * @description Get the sections for the course in an Array
 */
Course.prototype.getSections = function(){return this._sections;}

/**
 * @name Course.getCredits
 * @description Get the credits for the course
 */
Course.prototype.getCredits = function(){return this._credits;}

/**
 * @name Course.isPilot
 * @description Checks if the course is piloting
 */
Course.prototype.isPilot = function(){return this._pilot;}

/**
 * @name getHref
 * @description Get the href for the course
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

/**
 * @name Course.getCurrent 
 * @description Returns the course that is currently being viewed
 */
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
		$scope.semesters = currentUser.getSemesterMenu();
		$scope.searchOpened = false;
		$scope.roleMenu = currentUser.getRole().getRolesMenu().getItems();
		$scope.showRoleMenu = false;
		$scope.showSemesterMenu = false;
		$scope.cols = currentUser.getRole().getTiles();
		$scope.selectedRole = window._selectedRole;
		$scope.backButton = currentUser.backButton();
		$scope.ims = ims;

		/**
		 * @name back 
		 * @description Go back to the previous webpage
		 */
		$scope.back = function(){
			User.redirectBack();
		}

		/**
		 * @name openRoleMenu 
		 * @description Show a list of roles that the user has
		 */
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

		/**
		 * @name toggleSubMenu 
		 * @description Toggle the views of the sub menu
		 */
		$scope.toggleSubMenu = function(e){
			$(e.target).find('ul').slideToggle();
		}

		/**
		 * @name openCourseMenu 
		 * @description
		 */
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

		/**
		 * @name  openSemesterMenu
		 * @todo
		 *  + Set the drop down for the semester
		 */
		$scope.openSemesterMenu = function(e){
			var right = '71px';
			if ($('.back-btn').length > 0){
				right = '71px';
			}	
			else{
				right = '82px';
			}		
			$('.semester-popup-dropdown2').css({right: right, top: '39px'});
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.showSemesterMenu = true;
				})
			}, 2);
		}

		/**
		 * @name openSearch 
		 * @description
		 */
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

		/**
		 * @name appendChart 
		 * @description
		 */
		$scope.appendChart = function(tile){
			setTimeout(function(){
				$('#' + tile.config).highcharts(tile.data);
			}, 10);
		}

		/**
		 * @name redirect 
		 * @description
		 */
		$scope.redirect = function(href){
			window.location.href = href;
		}

		/**
		 * @name changelimit 
		 * @description     
		 */
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

		/**
		 * @name closeSearch 
		 * @description
		 */
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
		/**
		 * @name toggleMenu 
		 * @description
		 */
		$scope.toggleMenu = function(){
			$scope.closeSearch();
			$scope.showRoleMenu = false;
			$scope.showCourseMenu = false;
			$scope.showSemesterMenu = false;
		}

		/**
		 * @name questionClick 
		 * @description
		 */
		$scope.questionClick = function(e){
			//$(e.target).parent().find('.hidden').slideToggle();
			var div = $(e.target.nodeName == 'I' ? e.target.parentNode : e.target);
			var pos = div.attr('data-position');
			msg = div.attr('data-title');
			if (msg && msg.length > 0){
				ims.tooltip(e, msg, pos);
			}
		}

		/**
		 * @name questionClickOut 
		 * @description
		 */
		$scope.questionClickOut = function(e){
			$('#tooltip, #tooltip-left').remove();
		}

		/**
		 * @name closeOverlay 
		 * @description
		 */
		$scope.closeOverlay = function(e){
			$('.rawDataOverlay').fadeOut('fast');
			$('.background-cover').fadeOut('fast');
			$(document.body).css({overflow: 'auto'});
		}

		/**
		 * @name background-cover
		 * @description
		 */
		$('.background-cover').click(function(){
			$scope.$apply(function(){
				$scope.closeOverlay();
			})
		})

		/**
		 * @name openSurveyData 
		 * @description
		 */
		$scope.openSurveyData = function(survey){
			$scope.selectedSurvey = survey;
			if ($(window).width() <= 1100){
				$('.rawDataOverlay').css({left: '10px', top: '10px', right: '10px', bottom: '10px'});
			}
			$('.rawDataOverlay').fadeIn();
			$('.background-cover').fadeIn();
			$(document.body).css({overflow: 'hidden'});
		}

		/**
		 * @name searching 
		 * @description
		 */
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

		/**
		 * @name toggleReviewed 
		 * @description
		 */
		$scope.toggleReviewed = function(survey){
			// little hack
			setTimeout(function(){
				survey.toggleReviewed();
				$scope.$apply();
			}, 10);
		}

		/**
		 * @name toggleMobileMenu 
		 * @description
		 */
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

		/**
		 * @name OneCol 
		 * @description
		 */
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
		if (item['_week'] ==  undefined) {
			list.splice(list.length, 0, item);
			return list;
		}
		var week = item._week;
		if (list.length == 0) {
			list.push(item);
			return list;
		} else if (week == "") {
			list.splice(list.length, 0, item);
			return list;
		} else if (week.toLowerCase() == "conclusion") {
			list.splice(0, 0, item);
			return list;
		}else {
			for (var i = 0; i < list.length; i++) {
				if (toInt(week) >= toInt(list[i]._week)) {
					list.splice(i, 0, item);
					return list;
				}
			}
		}
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
	 * @name reverse
	 * @description Reverse the items in an ng-repeat
	 */
	app.filter('reverse', function() {
	  return function(items) {
	    if (items) return items.slice().reverse();
	  };
	});

	/**
	 * @name noDuplicates
	 * @description Remove the duplates from the suggestions ng-repeat
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
/**
 * @name Computer 
 * @description
 */
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
 * @name Menu
 * @description
 *  ary = [{
 * 		value: 'FA15',
 * 		href: 'laskjdflskf.aspx'
 *  }]
 */
function Menu(ary){
	this._items = [];
	if (ary && ary.length > 0){
		this._setItems(ary);
	}
}

/**
 * @name _setItems
 * @description Set the items
 */
Menu.prototype._setItems = function(ary){
	for (var i = 0; i < ary.length; i++){
		this._items.push(new MenuItem(ary[i]));
	}
}

/**
 * @name getItems
 * @description Get all items
 */
Menu.prototype.getItems = function(){
	return this._items;
}

/**
 * @name MenuItems
 * @description A specific item in the menu
 */
function MenuItem(obj){
	this.href = obj.href;
	this.name = obj.value;
	this.type = obj.type;
	this.selected = obj.selected;
}
/**
 * @name Question 
 * @description
 */
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
 * @name Question.getText
 * @description Get the text of the survey
 */
Question.prototype.getText = function(){
	return this._text;
}

/**
 * @name Question.getAnswer
 * @description Get the answer for the question
 */
Question.prototype.getAnswer = function(){
	return this._answer;
}

/**
 * @name Question.getSmartName
 * @description Get the smart goal title
 */
Question.prototype.getSmartName = function(){
	return this._text.split('SMART Goal')[1];
}

/**
 * @name Question.hasAnswer
 * @description Checks for an answer
 */
Question.prototype.hasAnswer = function(){
	return this.getText() && this.getText().length > 0;
}

/**
 * @name Question._cleanAnswer
 * @description Internal function to clean the answer based on the configurations
 */
Question.prototype._cleanAnswer = function(){
	this._answer = this._answer.replace(/[^\x00-\x7F]/g, '');
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
/**
 * @name Role 
 * @description
 */
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
 * @name Role.getTitles
 * @description Get the tiles based on role
 */
Role.prototype.getTiles = function(){
	return Tile.getAll(this);
}

/**
 * @name Role.getSingleInstructorStandard 
 * @description
 */
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

/**
 * @name Role.getSingleInstructorHours 
 * @description
 */
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

/**
 * @name Role.getInstructorHours 
 * @description
 */
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

/**
 * @name Role.getInstructorStandardsDrillDown 
 * @description
 */
Role.prototype.getInstructorStandardsDrillDown = function(e){
    var name = e.currentTarget.name;
    var chart = e.currentTarget.chart;
    chart.destroy();
    $('#TGLInstructorStandards').highcharts(this.getInstructorStandardsByName(name));
    $('#TGLInstructorStandards').before('<div class="backBtnStandards link" id="drillup" onclick="backStandard()">Back</div>');
}

/**
 * @name Role.backStandard 
 * @description
 */
function backStandard(){
    var u = User.getCurrent();
    u._role.setInstructorStandardsDrillUp();
    $('#drillup').remove();
}

/**
 * @name Role.setInstructorStandardsDrillUp 
 * @description
 */
Role.prototype.setInstructorStandardsDrillUp = function(){
    $('#TGLInstructorStandards').highcharts().destroy();
    $('#TGLInstructorStandards').highcharts(this.getInstructorStandards());
}

/**
 * @name Role.getInstructorStandardsByName 
 * @description
 */
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

/**
 * @name Role.getInstructorStandards 
 * @description
 */
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

/**
 * @name Role.getAvgInstructorHoursByGroup 
 * @description
 */
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
 * @name Role.getTasksToReview
 * @description Get the tasks to review
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
 *  + Get all lower person surveys
 *  + Get all survey ids from the above task
 *  + see who doesn't have that Id
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
 * @name Role.getRoleName
 * @description return the name of the current role
 */
Role.prototype.getRoleName = function(){
	return this._role;
}

/**
 * @name Role.getOrg
 * @description return the lowers in an object
 */
Role.prototype.getOrg = function(){
	return this._org;
}

/**
 * @name Role.isRoleDownFromCurrentUser 
 * @description
 */
Role.prototype.isRoleDownFromCurrentUser = function(user){
	var lower = this._nextLower(ims.aes.value.cr.toLowerCase());
	return lower == user.getRole().getRoleName().toLowerCase();
}

/**
 * @name Role._setOrg
 * @description creates the users organization
 */
Role.prototype._setOrg = function(){
	return this._recursiveChildren(this._user._xml);
}

/**
 * @name Role._recursiveChildren
 * @description Recursivly get the org
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
 * @name Role._nextLower
 * @description Get the next lower role
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

/**
 * @name Role._nextHigher 
 * @description
 */
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
 * @name Role._nextLowerForMenu
 * @description Get the next lower role for the menu
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
 * @name Role.getLowerRole
 * @description API call for _nextLowerRole()
 */
Role.prototype.getLowerRole = function(){
	return this._nextLower(this.getRoleName().toLowerCase());
}

/**
 * @name Role.getHigherRole
 * @description API call for _nextHigherRole()
 */
Role.prototype.getHigherRole = function(){
    return this._nextHigher(this.getRoleName().toLowerCase());
}

/**
 * @name Role.getLowerRoleInit
 * @description Init function for lower role
 */
Role.prototype.getLowerRoleInit = function(){
	if (this._user.isCurrent())
		return this._nextLower(this.getRoleName().toLowerCase());
	return false;
}

/**
 * @name Role.getQuestionForGroup
 * @description returns collection of average standards by week for a group
 */
Role.prototype.getQuestionForGroup = function(email, name){
    var role = this.getRoleName().toLowerCase();
    if (this._user.isCurrent() && role == 'tgl' && this._user.getHighestRole().toLowerCase() == 'aim') role = 'tgl';
    else if (role == 'instructor') role = 'tgl';
	return new Rollup({level: role, email: email, question: name});
}

/**
 * @name Role.getQuestionForAll
 * @description returns collection of average standards by week for everyone
 */
Role.prototype.getQuestionForAll = function(name){
	return new Rollup({level: '*', email: '', question: name});
}

/**
 * @name Role.getRoster
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
 * @name Role.getLeader 
 * @description
 */
Role.prototype.getLeader = function(){
    return this._user.getLeader();
}

/**
 * @name Role.getLower
 * @description return collection of underlings
 */
Role.prototype.getLower = function(){
	var result = [];
	$(this._org).each(function(){
		result.push(this.user);
	})
	return result;
}

/**
 * @name Role.getLowerTasks
 * @description return collection of completed and incompleted tasks by underlings
 */
Role.prototype.getLowerTasks = function(){
    return this.getLower();
}

/**
 * @name Role.getCompletedTasks
 * @description return collection of completed tasks for current user
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
 * @name Role.getEvaluations
 * @description return collection of evaluations for current user
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
 * @name Role.getCompletedTasksByCourse
 * @description Get the completed tasks by course
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
 * @name Role.getHref
 * @description Get the href for that given role
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
 * @name Role._getHats
 * @description Get the different hats for the role menu
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

/**
 * @name Role.getSuggested 
 * @description
 */
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
 * @name Role.getRolesMenu
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

/**
 * @name Rollup 
 * @description
 */
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
 * @name Rollup._initalXmlLoad
 * @description loads the xml file if the file is not already loaded
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

/**
 * @name Rollup.getData 
 * @description
 */
Rollup.prototype.getData = function(){
	return this._data;
}

/**
 * @name Rollup._getData
 * @description returns a list of the data topics 
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
/**
 * @name Semester 
 * @description
 */
function Semester(obj){
	if (typeof obj == 'string'){
		this._code = obj;
	}
}

/**
 * @name Semester.getCode
 * @description Get the semester code
 */
Semester.prototype.getCode = function(){return this._code;}

/**
 * @name Semester.getHref
 * @description Get the href for the menu item
 */
Semester.prototype.getHref = function(){
	var loc = window.location.href;
	if (loc.indexOf('&sem=') > -1){
		return loc.split('&sem=')[0] + '&sem=' + this.getCode();
	}
	else{
		return loc + '&sem=' + this.getName();
	}
}

/**
 * @name  Semester.getName
 * @todo
 *  + Get the name of the semester
 */
Semester.prototype.getName = function(){
	return this._code.toUpperCase();
}

/**
 * @name Semesters
 * @description
 */
function Semesters(){
	this._current = null;
}

/**
 * @name Semesters.getCurrent 
 * @description
 */
Semesters.prototype.getCurrent = function(){
	if (!this._current){
		this._current = new Semester($(Survey.getConfig()).find('semester[current=true]').attr('code'));
	}
	return this._current;
}

/**
 * @name Semesters.getCurrentCode 
 * @description
 */
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

/**
 * ims.semesters
 * @description
 */
ims.semesters = (function(){
	return new Semesters();
})()
/**
 * @name Survey 
 * @description
 */
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
 * @name Survey.getConfig
 * @description Get the basic survey config file
 */
Survey.getConfig = function(){
	if (!ims._config){
		ims._config = ims.sharepoint.getSurveyConfig();
	}
	return ims._config;
}

/**
 * @name Survey.getNameById
 * @description 
 * @todo
 *  + Get the survey name by an id
 */
Survey.getNameById = function(id){
	var config = Survey.getConfig();
	var survey = $(config).find('semester[current=true] survey[id=' + id + ']');
	return $(survey).attr('name') + ': ' + $(survey).attr('week');
}

/**
 * @name Survey._setAnswers 
 * @description
 */
Survey.prototype._setAnswers = function(){
	var _this = this;
	$(this._xml).find('answer').each(function(){
		_this._answers.push(new Question(this, _this));
	});
}

/**
 * @name Survey.getName
 * @description Get the name of the survey
 */
Survey.prototype.getName = function(){
	if (this.withCourse && this._user.getCourses().length > 1){
		return this._name + ': ' + this._week + ' - ' + this.getCourse().getName();
	}
	return this._name + ': ' + this._week;
}

/**
 * @name Survey.isReviewed
 * @description Verifiy if the survey is reviewed
 */
Survey.prototype.isReviewed = function(){
	return this._reviewed;
}

/**
 * @name Survey.getWeek
 * @description Get the week of the survey
 */
Survey.prototype.getWeek = function(){
	return this._week;
}

/**
 * @name Survey.isEvaluation 
 * @description
 */
Survey.prototype.isEvaluation = function(){
	return $(this._config).attr('iseval') == 'true';
}

/**
 * @name Survey.getAnswers
 * @description Get the answers of the survey
 */
Survey.prototype.getAnswers = function(){
	return this._answers;
}

/**
 * @name Survey.isComplete
 * @description Check if the survey is completed or empty
 */
Survey.prototype.isComplete = function(){
	return this._answers.length > 0;
}

/**
 * @name Survey.getPlacement
 * @description Checks the placement of the survey
 */
Survey.prototype.getPlacement = function(){
	return this._placement;
}

/**
 * @name Survey.toggleReviewed
 * @description Toggle if the survey has been reviewed or not
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
 * @name Survey.getQuestionsContainingText
 * @description Search for all questions containing text
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
 * @name Survey.getCourse
 * @description Gets the course the survey was taken. If the course
 * is not validated, it will return null (good for debugging)
 */
Survey.prototype.getCourse = function(){
	return this._course;
}

/**
 * @name Survey.getQuestions
 * @description Get the questions from the survey, alias for getAnswers()
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

/**
 * @name Tile.getAll 
 * @description
 */
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

/**
 * @name Tile.tmpPretty 
 * @description
 */
function tmpPretty(txt){
  if (txt == 'INSTRUCTOR') return 'Instructor';
  return txt;
}
window._currentUser = null;
if (ims.aes.value.ce){
	window._baseUserXml = ims.sharepoint.getXmlByEmail(ims.aes.value.ce);
}

/**
 * @name User 
 * @description
 */
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
 * @name User.HoursStandard
 * @description The standard for instructor hours per credit
 */
User.HoursStandard = 3.5;

/**
 * @name User.getCurrent
 * @description Get the current user (the current dashboard user)
 */
User.getCurrent = function(){
	if (!window._currentUser){
		window._currentUser = new User({email: ims.aes.value.ce, role: ims.aes.value.cr, isBase: true});
	}
	return window._currentUser;
}

/**
 * @name User.redirectToLoggedInUser
 * @description Get the email and redirect to the logged in user
 */
User.redirectToLoggedInUser = function(err){
	ims.sharepoint.redirectToLoggedInUser(err, function(email){
		User.redirectToDashboard(email);
	});
}

/**
 * @name User.getLoggedInUserEmail 
 * @description
 */
User.getLoggedInUserEmail = function(callback){
	ims.sharepoint.getLoggedInUserEmail(callback);
}

/**
 * @name User.redirectToDashboard
 * @description The inital search for person
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
 * @name User.getSuggested
 * @description Get the suggested list
 */
User.prototype.getSuggested = function(q){
	return this._role.getSuggested(q);
}

/**
 * @name User.getAllRoles
 * @description Get all the roles associated with the user
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
 * @name User.canSearch
 * @description
 * @todo 
 * 	+ call this._role.canSearch();
 */
User.prototype.canSearch = function(){
	var roleName = this.getRole().getRoleName().toLowerCase();
	return roleName == 'aim' || roleName == 'im';
}

/**
 * @name User.isLeader
 * @todo
 * 	+ call this._role.isLeader();
 */
User.prototype.isLeader = function(){
	var r = this.getRole().getRoleName().toLowerCase();
	return r == 'aim' || r == 'tgl' || r == 'atgl' || r == 'im';
}

/**
 * @name User.isCurrent 
 * @description
 */
User.prototype.isCurrent = function(){
	if (ims.aes.value.e != ims.aes.value.ce) return false;
	return this._isCurrent;
}

/**
 * @name User._setSurveys
 * @description Internal function to populate the users surveys into the _surveys
 * array
 */
User.prototype._setSurveys = function(){ 
	var _this = this;
	$(this._xml).find('> surveys survey').each(function(){
		_this._surveys.push(new Survey(this, _this));
	})
}

/**
 * @name User._setPersonalInfo
 * @description Set the basic personal information
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
 * @name User.showCourseMenu
 * @description Show the course menu for an instructor
 */
User.prototype.showCourseMenu = function(){
	var role = this.getRole().getRoleName().toUpperCase();
	return role == 'INSTRUCTOR' && this.getCourses().length > 1;
}

/**
 * @name User.selectedCourse
 * @description Returns the selected course if the user is an instructor
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
 * @name User._setCourses
 * @description Set the courses
 */
User.prototype._setCourses = function(){
	var _this = this;
	$(this._xml).find('course').each(function(){
		_this._courses.push(new Course(this));
	})
}

/**
 * @name User.getFirst
 * @description Get the first name of the user
 */
User.prototype.getFirst = function(){
	return this._first;
}

/**
 * @name User.getLast
 * @description Get the last name of the user
 */
User.prototype.getLast = function(){
	return this._last;
}

/**
 * @name User.getHighestRole 
 * @description
 */
User.prototype.getHighestRole = function(){
	return $(this._xml).parent().parent().attr('highestrole');
}

/**
 * @name User.getLeader
 * @description Only used for instructors
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
 * @name User.getEmail
 * @description Get the email of the user
 */
User.prototype.getEmail = function(){
	return this._email;
}

/**
 * @name User.getFullEmail
 * @description Get the email of the user including the @byui.edu
 */
User.prototype.getFullEmail = function(){
	return this._email + '@byui.edu';
}

/**
 * @name User.getFullName
 * @description Get the full name of the user with a space between the first
 * and last name, and a capital first letter of each name.
 */
User.prototype.getFullName = function(){
	return this._first + ' ' + this._last;
}

/**
 * @name User.getSurvey
 * @description Get a specific survey from the user
 */
User.prototype.getSurvey = function(sid){
	var surveys = this.getSurveys();
	for (var i = 0; i < surveys.length; i++){
		if (surveys[i].id.toLowerCase() == sid.toLowerCase()) return surveys[i];
	}
}

/**
 * @name User.save
 * @description Save the xml to the server
 */
User.prototype.save = function(){
	ims.sharepoint.postFile(this);
}

/**
 * @name User.getSurveys
 * @description Get an Array of the surveys
 */
User.prototype.getSurveys = function(){
	return this._surveys;
}

/**
 * @name USer.getSurveysByPlacement
 * @description Get the survey by placement
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
 * @name User.getRole
 * @description Get the users role relative to the current user and their role
 */
User.prototype.getRole = function(){
	return this._role;
}

/**
 * @name User.getRoleAs
 * @description Get the role as with a hat
 */
User.prototype.getRoleAs = function(type){
	return new Role(type, this, true);
}

/**
 * @name User.isNew
 * @description Validates if the instructor is a new instructor
 * or not.
 */
User.prototype.isNew = function(){
	return this._new;
}

/**
 * @name User.getHref
 * @description Get the href for the user
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
 * @name User.getSmartGoals
 * @description Returns an array of SMART goals if taken
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
 * @name User.getTargetHours
 * @description Get the target hours for this user.
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
 * @name User.backButton 
 * @description
 */
User.prototype.backButton = function(){
	return ims.aes.value.ce != ims.aes.value.e;
}

/**
 * @name User.getHours
 * @description Get the weekly hours averaged out by course
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
 * @name User.getHoursRaw
 * @description Get the weekly hours averaged out by course
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

/**
 * @name User.getStandard 
 * @description
 */
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
 * @name User.getWeeklyReflections
 * @description Get an array of the weekly reflections
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
 * @name User.redirectTo
 * @description Redirect the url to a specific place
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
 * @name User.redirectHome
 * @description Redirect to the base dashboard
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
 * @name User.redirectBack
 * @description Redirects back to the previous page
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
 * @name User.getCourses
 * @description Get an array of Course objects
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
 * @name User.getCourse
 * @description Get a course by name
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
 * @name User.getCourseById
 * @description Get a course by id
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
 * @name User.getTotalCredits
 * @description Get the total Credits this user is taking
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
 * @name User.getSemesters
 * @description Get a list of available semesters for this user
 */
User.prototype.getSemesters = function(){
	if (this._semesters.length == 0){
		var _this = this;
		$(window._baseUserXml).find('semester').each(function(){
			_this._semesters.push(new Semester($(this).attr('code')));
		});	
	}
	return this._semesters;		
}

//GROUP: Menu
/**
 * @name User.getSemesterMenu
 * @description Gets the semester Menu
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
 * @name User.getCoursesMenu
 * @description Gets the courses menu, if no courses needed, return null
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