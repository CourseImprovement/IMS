/**
 * Steps:
 *  	√. Change the config
 *  		√. Change all the survey ids to be numerical
 *  		√. Change all question ids to be numerical and reset
 *  		√. Add a semester node around the survey configurations
 *  		√. Map all old ids with the new ids
 *  	√. Change the individual files
 *  		√. Change the first node after semester to person
 *  			√. add the highestrole attribute
 *  		√. Create roles and role nodes
 *  			√. add type to each role node
 *  		√. Sort surveys according to the proper role node
 *  		√. Create the stewardship node area
 *  		√. Create the leadership node area
 *  		e. Go to IM
 */

/**
 * Live Version
 * 		1. Merge the A-file with the actual aim, same with tgl
 * 		2. Remove duplicate semesters, if necessary
 */

function postFile(xml, fileName, isConfig){
	function str2ab(str) {
	// new TextDecoder(encoding).decode(uint8array);
	  return new TextEncoder('utf8').encode(str);
	}

	var buffer = str2ab((new XMLSerializer()).serializeToString(xml[0]));
	var url = '';
	if (isConfig){
		url = ims.sharepoint.base + "_api/Web/GetFolderByServerRelativeUrl('" + ims.sharepoint.relativeBase + "Instructor%20Reporting/Config')/Files/add(overwrite=true, url='" + fileName + ".xml')";
	}
	else{
		url = ims.sharepoint.base + "_api/Web/GetFolderByServerRelativeUrl('" + ims.sharepoint.relativeBase + "Instructor%20Reporting/Master')/Files/add(overwrite=true, url='" + fileName + ".xml')";
	}
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
}

// // SURVEY CONFIG SECTION
// // STEP 1
var config = $(Survey.getConfig()); // config doc
// var config  = ims.globals.config;
// var idMap = {
// 	surveys: {},
// 	questions: {}
// }
// $(config).find('survey').each(function(idx){
// 	var old = $(this).attr('id');
// 	idMap.surveys[old] = idx + 1;
// 	$(this).attr('id', idx + 1);
// 	$(this).find('question').each(function(idx2){
// 		var old = $(this).attr('id');
// 		idMap.questions[old] = idx2 + 1;
// 		$(this).attr('id', idx2 + 1);
// 	});
// });
// var surveysNode = $(config).find('surveys');
// $(config).find('config').append('<semesters><semester code="FA15"></semester></semesters>').find('semester').append(surveysNode);



// // CHANGE THE INDIVIDUAL FILES
// // STEP 2
// var individualXml = {};
var alreadygot = {};
function getXmlFile(email){
	if (!alreadygot[email]){
		alreadygot[email] = ims.sharepoint.getXmlByEmail(email);
		return alreadygot[email];
	}
	return null;
}

// function createStructure(oldXml){
// 	return $('<semesters><semester code="FA15"><people><person first="" last="" email="" new="" highestrole=""><roles></roles></person></people></semester></semesters>');
// }

// function cleanSurveys(surveys, courses){
// 	var result = {};
// 	$(surveys).each(function(){
// 		$(this).attr('id', idMap.surveys[$(this).attr('id')]);
// 		var placement = $(config).find('survey[id=' + $(this).attr('id') + ']').attr('placement').toLowerCase();
// 		// Change course id
// 		var courseId = $(courses).find('course:contains("' + $(this).attr('course') + '")').attr('id');
// 		$(this).removeAttr('course');
// 		$(this).attr('courseid', courseId);
// 		if (!courseId && $(courses).find('course').length == 1){
// 			$(this).attr('courseid', $(courses).find('course').first().attr('id'));
// 		}

// 		$(this).find('answer').each(function(){
// 			var qid = $(this).attr('qid');
// 			$(this).removeAttr('qid');
// 			$(this).attr('id', idMap.questions[qid]);
// 		});

// 		if (!result[placement]) result[placement] = [];
// 		result[placement].push(this);
// 	});

// 	return result;
// }

// function cleanCourses(courses){
// 	$(courses).find('course').each(function(idx){
// 		$(this).attr('pilot', $(this).attr('pilot').toLowerCase());
// 		$(this).attr('id', idx + 1);
// 	});
// 	return courses;
// }

// function createStewardship(oldXml){
// 	var xml = $('<stewardship><people></people></stewardship>');
// 	var highestrole = $(oldXml).find('semester').children().first().prop('nodeName').toLowerCase();
// 	if (highestrole == 'aim'){
// 		$(oldXml).find('tgls tgl').each(function(){
// 			$(xml).children().first().append('<person id="tmp"></person>').find('person[id=tmp]').removeAttr('id')
// 				.attr('first', $(this).attr('first'))
// 				.attr('last', $(this).attr('last'))
// 				.attr('email', $(this).attr('email'))
// 				.attr('type', 'tgl');

// 			var email = $(this).attr('email');
// 			$(xml).children().first().find('> person[email=' + email + ']').append('<people></people>');

// 			$(this).find('instructor').each(function(){
// 				var instEmail = $(this).attr('email');

// 				$(xml).children().first().find('> person[email=' + email + '][type=tgl]').find('> people')
// 					.append('<person email="' + instEmail + '" id="tmp"></person>').find('person[id=tmp]').removeAttr('id')
// 					.attr('first', $(this).attr('first'))
// 					.attr('last', $(this).attr('last'))
// 					.attr('type', 'instructor');
// 			});
// 		});
// 	}
// 	else if (highestrole == 'tgl'){
// 		$(oldXml).find('instructors instructor').each(function(){
// 			$(xml).find('people').append('<person id="tmp"></person>').find('person[id=tmp]').removeAttr('id')
// 				.attr('first', $(this).attr('first'))
// 				.attr('last', $(this).attr('last'))
// 				.attr('email', $(this).attr('email'))
// 				.attr('type', 'instructor');
// 		});
// 	}

// 	return xml;
// }

// function createLeadership(oldXml){
// 	var xml = $('<leadership></leadership>');
// 	var firstNode = $(oldXml).find('semester').children().first();
// 	var highestrole = $(firstNode).prop('nodeName').toLowerCase();
// 	if (highestrole == 'aim'){}
// 	else if (highestrole == 'tgl'){
// 		$(xml).append('<person></person>').find('person')
// 			.attr('type', 'aim')
// 			.attr('first', $(firstNode).attr('aim_first'))
// 			.attr('last', $(firstNode).attr('aim_last'))
// 			.attr('email', $(firstNode).attr('aim_email'))
// 	}
// 	else{
// 		$(xml).append('<person></person>').find('person')
// 			.attr('type', 'aim')
// 			.attr('first', $(firstNode).attr('aim_first'))
// 			.attr('last', $(firstNode).attr('aim_last'))
// 			.attr('email', $(firstNode).attr('aim_email'))
// 		$(xml).append('<person id="tmp"></person>').find('person[id=tmp]').removeAttr('id')
// 			.attr('type', 'tgl')
// 			.attr('first', $(firstNode).attr('tgl_first'))
// 			.attr('last', $(firstNode).attr('tgl_last'))
// 			.attr('email', $(firstNode).attr('tgl_email'))
// 	}
// 	return xml;
// }

// function mergeExisting(oldXml, newXml){
// 	var firstNode = $(oldXml).find('semester').children().first();
// 	var highestrole = $(firstNode).prop('nodeName').toLowerCase();
// 	var courses = $(oldXml).find('courses');
// 	courses = cleanCourses(courses);
// 	var surveys = $(oldXml).find('survey');
// 	surveys = cleanSurveys(surveys, courses);
// 	var isNew = $(firstNode).attr("new");
// 	if (isNew == 'True') isNew = 'true';
// 	else isNew = 'false';

// 	stewardship = createStewardship(oldXml);
// 	leadership = createLeadership(oldXml);

// 	$(newXml).find('semester > people > person')
// 		.attr("highestrole", highestrole).attr('first', $(firstNode)
// 		.attr('first')).attr('last', $(firstNode).attr('last'))
// 		.attr('email', $(firstNode).attr('email'))
// 		.attr('new', isNew)
// 		.append(courses).find('roles')
// 		.append('<role></role>').find('role').attr('type', highestrole)
// 		.append('<surveys></surveys>').find('surveys')
// 		.append(surveys[highestrole]);
// 	$(newXml).find('role')
// 		.append(stewardship)
// 		.append(leadership);

// 	var keys = Object.keys(surveys);
// 	if (keys.length > 1){
// 		for (var i = 0; i < keys.length; i++){
// 			var nextRole = keys[i];
// 			if (nextRole == highestrole) continue;
// 			$(newXml).find('roles')
// 				.append('<role type="' + nextRole + '"></role>').find('role[type=' + nextRole + ']')
// 				.append('<surveys></surveys>').find('surveys')
// 				.append(surveys[nextRole]).parent()
// 				.append('<stewardship></stewardship><leadership></leadership>');
// 		}
// 	}

// 	return newXml;
// }

// var masterXml = $('<semesters><semester code="FA15"><people></people></semester></semesters>');
// function createMasterXml(){
// 	var keys = Object.keys(individualXml);
// 	var spot = $(masterXml).find('semester people');
// 	for (var i = 0; i < keys.length; i++){
// 		var xml = $(individualXml[keys[i]]);
// 		$(spot).append($(xml).find('semester > people > person').clone());
// 	}
// }

// var aimFiles = {};
// function createAimFiles(){
// 	$(map).find('aim').each(function(){
// 		var aimFile = $('<semesters><semester code="FA15"><people></people></semester></semesters>');
// 		var spot = $(aimFile).find('semester people');
// 		$(this).children().each(function(){
// 			var xml = $(individualXml[$(this).attr('email')]);
// 			var raw = $(xml).find('semester > people > person').clone();
// 			$(spot).append(raw);
// 		})

// 		aimFiles[$(this).attr('email')] = aimFile;
// 	})
// }

// var tglFiles = {};
// function createTglFiles(){
// 	$(map).find('tgl').each(function(){
// 		var tglFile = $('<semesters><semester code="FA15"><people></people></semester></semesters>');
// 		var spot = $(tglFile).find('semester people');
// 		$(this).children().each(function(){
// 			var xml = $(individualXml[$(this).attr('email')]);
// 			var raw = $(xml).find('semester > people > person').clone();
// 			$(spot).append(raw);
// 		})

// 	 	tglFiles[$(this).attr('email')] = tglFile;
// 	})
// }

// function setAllStewardshipsAim(obj){
// 	for (var email in obj){
// 		var xml = obj[email];
// 		$(xml).find('role[type=tgl] > stewardship').html('').append('<people></people>');
// 		$(xml).find('role[type=aim] > stewardship > people > person').each(function(){
// 			var personEmail = $(this).attr('email');
// 			var personXml = individualXml[personEmail];
// 			var tglXml = $(personXml).find('semester > people > person > roles').clone();
// 			var instXml = $(personXml).find('semester > people > person').clone();

// 			$(tglXml).find('role:not([type=tgl])').remove();
// 			$(instXml).find('role:not([type=instructor])').remove();

// 			$(this).html('');
// 			$(this).append(tglXml);

// 			$(xml).find('semester > people > person > roles > role[type=tgl] > stewardship > people').append(instXml);
// 		})
// 	}
// }

// function setAllStewardshipsTgl(obj){
// 	for (var email in obj){
// 		var xml = obj[email];
// 		$(xml).find('role[type=tgl] > stewardship > people > person').each(function(){
// 			var personEmail = $(this).attr('email');
// 			var personXml = individualXml[personEmail];
// 			var instXml = $(personXml).find('semester > people > person > roles').clone();

// 			$(instXml).find('role:not([type=instructor])').remove();

// 			$(this).html('');
// 			$(this).append(instXml);
// 		})
// 	}
// }

var questions = [
	'Seek Development Opportunities',
	'Inspire a Love for Learning',
	'Develop Relationships with and among Students',
	'Embrace University Citizenship',
	'Building Faith in Jesus Christ',
	'Weekly Hours'
]

function createRollup(){
	_top = $('<semesters><semester code="FA15"></semester></semesters>');
	var start = $(_top).find('semester');
	var instructors = $(masterXml).find('semester > people > person:has(role[type=instructor])');

	var wrs = $(config).find('survey[name*="Weekly Reflection"]');

	$(wrs).sort(function(a, b){
		if ($(a).attr('name').split(': ')[1] == 'Intro') return false;
		return parseInt(parseInt($(a).attr('name').split(': ')[1])) > parseInt(parseInt($(b).attr('name').split(': ')[1]));
	});

	var result = {};
	$(questions).each(function(){
		result[this] = {};
	})

	$(instructors).each(function(){
		var tgl = $(this).find('roles > role[type=instructor] > leadership > person[type=tgl]').attr('email');
		var aim = $(this).find('roles > role[type=instructor] > leadership > person[type=aim]').attr('email');
		var isTgl = false;
		if ($(this).attr('highestrole') == 'tgl'){
			isTgl = true;
			aim = $(this).find('roles > role[type=tgl] > leadership > person[type=aim]').attr('email');
		}
		var inst = this;

		$(questions).each(function(){
			var q = this;
			$(wrs).find('text:contains("' + q + '")').each(function(idx){
				var qid = $(this).parent().attr('id');
				var sid = $(this).closest('survey').attr('id');


				var total = 0;
				var length = 0;
				var credits = 0;
				$(inst).find('survey[id=' + sid + '] answer[id=' + qid + ']').each(function(){
					var txt = $(this).text();
					if (txt.length > 0){
						length++;
						total += parseInt(txt);
						credits += parseInt($(inst).find('course[id=' + $(this).parent().attr('courseid') + ']').attr('credit'));
					}
				});
				var endTotal = -1;
				if (length > 0){
					endTotal = total / length;
					if (q == 'Weekly Hours'){
						endTotal = total;
					}
				}

				if (endTotal > -1){
					if (!result[q][aim]) result[q][aim] = {group: [], tgls: {}};
					if (isTgl){
						if (!result[q][aim].group[idx]) result[q][aim].group[idx] = {total: 0, len: 0, credits: 0};
						result[q][aim].group[idx].total += endTotal;
						result[q][aim].group[idx].len++;
						result[q][aim].group[idx].credits += credits;
					}
					else{
						if (!result[q][aim].tgls[tgl]) result[q][aim].tgls[tgl] = [];
						if (!result[q][aim].tgls[tgl][idx]) result[q][aim].tgls[tgl][idx] = {total: 0, len: 0, credits: 0};			
						result[q][aim].tgls[tgl][idx].total += endTotal;
						result[q][aim].tgls[tgl][idx].len++;
						result[q][aim].tgls[tgl][idx].credits += credits;
					}
				}
			});
		})

	});

	for (var q in result){
		var total = [];
		var len = [];
		var cred = [];
		for (var aim in result[q]){
			$(result[q][aim].group).each(function(idx){
				var top = null;
				if ($(start).find('aim[email=' + aim + ']').length == 0) $(start).append('<aim email="' + aim + '"></aim>');
				top = $(start).find('aim[email=' + aim + ']');
				if ($(top).find('rollup[question="' + q + '"]').length == 0) $(top).append('<rollup question="' + q + '"></rollup>'); 
				if (!total[idx]){
					total[idx] = 0;
					len[idx] = 0;
					cred[idx] = 0;
				}
				total[idx] += this.total;
				len[idx] += this.len;
				cred[idx] += this.credits;
				var val = this.total / this.len;
				val = Math.floor(val * 10) / 10;
				if (idx == 0) idx = 'Intro';

				if (q == 'Weekly Hours'){
					val = this.total / this.credits;
					val = Math.floor(val * 10) / 10;
				}

				$(top).find('rollup[question="' + q + '"]').append('<week week="' + idx + '">' + val + '</week>');
			});

			for (var tgl in result[q][aim].tgls){
				$(result[q][aim].tgls[tgl]).each(function(idx){
					var t = this;
					var top = $(start).find('aim[email=' + aim + ']');
					if ($(top).find('tgl[email=' + tgl + ']').length == 0) $(top).append('<tgl email="' + tgl + '"></tgl>');
					top = $(top).find("tgl[email=" + tgl + ']');
					if ($(top).find('rollup[question="' + q + '"]').length == 0) $(top).append('<rollup question="' + q + '"></rollup>'); 
					var val = t.total / t.len;
					val = Math.floor(val * 10) / 10;
					if (!total[idx]){
						total[idx] = 0;
						len[idx] = 0;
						cred[idx] = 0;
					}
					total[idx] += t.total;
					len[idx] += t.len;
					cred[idx] += t.credits;
					if (idx == 0) idx = 'Intro';
					if (q == 'Weekly Hours'){
						val = this.total / this.credits;
						val = Math.floor(val * 10) / 10;
					}
					$(top).find('rollup[question="' + q + '"]').append('<week week="' + idx + '">' + val + '</week>');
				})
			}

		}
		$(total).each(function(idx){
			if ($(start).find('> rollup[question="' + q + '"]').length == 0) $(start).append('<rollup question="' + q + '"></rollup>');
			var top = $(start).find('> rollup[question="' + q + '"]');

			var val = total[idx] / len[idx];
			val = Math.floor(val * 10) / 10;

			if (q == 'Weekly Hours'){
				val = total[idx] / cred[idx];
				val = Math.floor(val * 10) / 10;
			}

			if (idx == 0) idx = 'Intro';
			$(top).append('<week week="' + idx + '">' + val + '</week>');
		})
	}

	console.log(start[0]);

}

// var _top;

// postFile(ims.globals.config, 'config', true);

// var map = getXmlFile('map');

// var aimsTmp = {}
// var tglsTmp = {}

// $(map).find('[email]').each(function(){
// 	var email = $(this).attr('email');
// 	if ($(this).prop('nodeName') == 'ocr') return;
// 	var oldXml = getXmlFile(email);
// 	if (!oldXml) return;
// 	var newXml = createStructure(oldXml);
// 	newXml = mergeExisting(oldXml, newXml);
// 	individualXml[email] = newXml;
// 	if ($(this).prop('nodeName') == 'aim') aimsTmp[email] = newXml;
// 	if ($(this).prop('nodeName') == 'tgl') tglsTmp[email] = newXml;
// });

// createMasterXml();

// setAllStewardshipsAim(aimsTmp);
// setAllStewardshipsTgl(tglsTmp);
// createRollup();

// postFile($(_top), 'rollup', false);
// postFile($(config), 'config', true);
// postFile($(masterXml), 'master', false);
// for (var email in individualXml){
// 	postFile(individualXml[email], email, false);
// }


var masterXml = getXmlFile('master');
// var individualXml = {};
// var tgls = $(masterXml).find('semester > people > person[highestrole=tgl]');
// for (var i = 0; i < tgls.length; i++){
// 	var tgl = tgls[i];
// 	var email = $(tgl).attr('email');
// 	individualXml[email] = getXmlFile(email);
// 	$(individualXml[email]).find('role[type=tgl] > stewardship > people > person').each(function(){
// 		var email = $(this).attr('email');
// 		var courses = $(masterXml).find('semester > people > person[email=' + email + ']').find('courses');
// 		$(this).append(courses);
// 	})
// 	postFile($(individualXml[email]), email, false);
// }

createRollup();