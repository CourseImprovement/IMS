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

// SURVEY CONFIG SECTION
// STEP 1
var config = $(Survey.getConfig()); // config doc
var idMap = {
	surveys: {},
	questions: {}
}
$(config).find('survey').each(function(idx){
	var old = $(this).attr('id');
	idMap.surveys[old] = idx + 1;
	$(this).attr('id', idx + 1);
	$(this).find('question').each(function(idx2){
		var old = $(this).attr('id');
		idMap.questions[old] = idx2 + 1;
		$(this).attr('id', idx2 + 1);
	});
});
var surveysNode = $(config).find('surveys');
$(config).find('config').append('<semester code="FA15"></semester>').find('semester').append(surveysNode);



// CHANGE THE INDIVIDUAL FILES
// STEP 2
var individualXml = {};
var alreadygot = {};
function getXmlFile(email){
	if (!alreadygot[email]){
		alreadygot[email] = ims.sharepoint.getXmlByEmail(email);
		return alreadygot[email];
	}
	return null;
}

function createStructure(oldXml){
	return $('<semesters><semester code="FA15"><people><person first="" last="" email="" highestrole=""><roles></roles></person></people></semester></semesters>');
}

function cleanSurveys(surveys, courses){
	var result = {};
	$(surveys).each(function(){
		$(this).attr('id', idMap.surveys[$(this).attr('id')]);
		var placement = $(config).find('survey[id=' + $(this).attr('id') + ']').attr('placement').toLowerCase();
		// Change course id
		var courseId = $(courses).find('course:contains("' + $(this).attr('course') + '")').attr('id');
		$(this).removeAttr('course');
		$(this).attr('courseid', courseId);
		if (!courseId && $(courses).find('course').length == 1){
			$(this).attr('courseid', $(courses).find('course').first().attr('id'));
		}

		$(this).find('answer').each(function(){
			var qid = $(this).attr('qid');
			$(this).removeAttr('qid');
			$(this).attr('id', idMap.questions[qid]);
		});

		if (!result[placement]) result[placement] = [];
		result[placement].push(this);
	});

	return result;
}

function cleanCourses(courses){
	$(courses).find('course').each(function(idx){
		$(this).attr('pilot', $(this).attr('pilot').toLowerCase());
		$(this).attr('id', idx + 1);
	});
	return courses;
}

function createStewardship(oldXml){
	var xml = $('<stewardship><people></people></stewardship>');
	var highestrole = $(oldXml).find('semester').children().first().prop('nodeName').toLowerCase();
	if (highestrole == 'aim'){
		$(oldXml).find('tgls tgl').each(function(){
			$(xml).children().first().append('<person id="tmp"></person>').find('person[id=tmp]').removeAttr('id')
				.attr('first', $(this).attr('first'))
				.attr('last', $(this).attr('last'))
				.attr('email', $(this).attr('email'))
				.attr('type', 'tgl');

			var email = $(this).attr('email');
			$(xml).find('person[email=' + email + ']').append('<people></people>');

			$(this).find('instructor').each(function(){
				var instEmail = $(this).attr('email');

				$(xml).find('person[email=' + email + '][type=tgl]').find('people')
					.append('<person email="' + instEmail + '" id="tmp"></person>').find('person[id=tmp]').removeAttr('id')
					.attr('first', $(this).attr('first'))
					.attr('last', $(this).attr('last'))
					.attr('type', 'instructor');
			});
		});
	}
	else if (highestrole == 'tgl'){
		$(oldXml).find('instructors instructor').each(function(){
			$(xml).find('people').append('<person id="tmp"></person>').find('person[id=tmp]').removeAttr('id')
				.attr('first', $(this).attr('first'))
				.attr('last', $(this).attr('last'))
				.attr('email', $(this).attr('email'))
				.attr('type', 'instructor');
		});
	}

	return xml;
}

function createLeadership(oldXml){
	var xml = $('<leadership></leadership>');
	var firstNode = $(oldXml).find('semester').children().first();
	var highestrole = $(firstNode).prop('nodeName').toLowerCase();
	if (highestrole == 'aim'){}
	else if (highestrole == 'tgl'){
		$(xml).append('<person></person>').find('person')
			.attr('type', 'aim')
			.attr('first', $(firstNode).attr('aim_first'))
			.attr('last', $(firstNode).attr('aim_last'))
			.attr('email', $(firstNode).attr('aim_email'))
	}
	else{
		$(xml).append('<person></person>').find('person')
			.attr('type', 'aim')
			.attr('first', $(firstNode).attr('aim_first'))
			.attr('last', $(firstNode).attr('aim_last'))
			.attr('email', $(firstNode).attr('aim_email'))
		$(xml).append('<person id="tmp"></person>').find('person[id=tmp]').removeAttr('id')
			.attr('type', 'tgl')
			.attr('first', $(firstNode).attr('tgl_first'))
			.attr('last', $(firstNode).attr('tgl_last'))
			.attr('email', $(firstNode).attr('tgl_email'))
	}
	return xml;
}

function mergeExisting(oldXml, newXml){
	var firstNode = $(oldXml).find('semester').children().first();
	var highestrole = $(firstNode).prop('nodeName').toLowerCase();
	var courses = $(oldXml).find('courses');
	courses = cleanCourses(courses);
	var surveys = $(oldXml).find('survey');
	surveys = cleanSurveys(surveys, courses);

	stewardship = createStewardship(oldXml);
	leadership = createLeadership(oldXml);

	$(newXml).find('semester > people > person')
		.attr("highestrole", highestrole).attr('first', $(firstNode)
		.attr('first')).attr('last', $(firstNode).attr('last'))
		.attr('email', $(firstNode).attr('email'))
		.append(courses).find('roles')
		.append('<role></role>').find('role').attr('type', highestrole)
		.append('<surveys></surveys>').find('surveys')
		.append(surveys[highestrole]);
	$(newXml).find('role')
		.append(stewardship)
		.append(leadership);

	var keys = Object.keys(surveys);
	if (keys.length > 1){
		for (var i = 0; i < keys.length; i++){
			var nextRole = keys[i];
			if (nextRole == highestrole) continue;
			$(newXml).find('roles')
				.append('<role type="' + nextRole + '"></role>').find('role[type=' + nextRole + ']')
				.append('<surveys></surveys>').find('surveys')
				.append(surveys[nextRole]).parent()
				.append('<stewardship></stewardship><leadership></leadership>');
		}
	}

	return newXml;
}

var masterXml = $('<semesters><semester code="FA15"><people></people></semester></semesters>');
function createMasterXml(){
	var keys = Object.keys(individualXml);
	var spot = $(masterXml).find('semester people');
	for (var i = 0; i < keys.length; i++){
		var xml = $(individualXml[keys[i]]);
		$(spot).append($(xml).find('semester > people > person').clone());
	}
}

var aimFiles = {};
function createAimFiles(){
	$(map).find('aim').each(function(){
		var aimFile = $('<semesters><semester code="FA15"><people></people></semester></semesters>');
		var spot = $(aimFile).find('semester people');
		$(this).children().each(function(){
			var xml = $(individualXml[$(this).attr('email')]);
			var raw = $(xml).find('semester > people > person').clone();
			$(spot).append(raw);
		})

		aimFiles[$(this).attr('email')] = aimFile;
	})
}

var tglFiles = {};
function createTglFiles(){
	$(map).find('tgl').each(function(){
		var tglFile = $('<semesters><semester code="FA15"><people></people></semester></semesters>');
		var spot = $(tglFile).find('semester people');
		$(this).children().each(function(){
			var xml = $(individualXml[$(this).attr('email')]);
			var raw = $(xml).find('semester > people > person').clone();
			$(spot).append(raw);
		})

	 	tglFiles[$(this).attr('email')] = tglFile;
	})
}

postFile(config, 'config', true);

// var map = getXmlFile('map');

// $(map).find('aim, tgl').each(function(){
// 	var email = $(this).attr('email');
// 	var personFile = getXmlFile(email);
// 	var file = $(personFile).children().first().children().first();
// 	postFile(file, email, false);
// });

// $(map).find('[email]').each(function(){
// 	var email = $(this).attr('email');
// 	if ($(this).prop('nodeName') == 'ocr') return;
// 	var oldXml = getXmlFile(email);
// 	if (!oldXml) return;
// 	var newXml = createStructure(oldXml);
// 	newXml = mergeExisting(oldXml, newXml);
// 	individualXml[email] = newXml;
// })

// createMasterXml();
// createAimFiles();
// createTglFiles();

// postFile(config, 'config', true);
// postFile(masterXml, 'master', false);
// for (var email in individualXml){
// 	postFile(individualXml[email], email, false);
// }

// for (var email in tglFiles){
// 	postFile(tglFiles[email], 'T-' + email, false)
// }

// for (var email in aimFiles){
// 	postFile(aimFiles[email], 'A-' + email, false);
// }

