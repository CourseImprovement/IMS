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
		if (differences.length > 0 && surveyList[i][0] != undefined && surveyList[i][0]._user){
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
    //if (people.length == 0) people = $(xml).find('person');
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
        // org.push({
        //     user: user,
        //     lower: _this._recursiveChildren($(person).find('> roles > role[type=' + $(person).attr('type') + ']'))
        // });
        org.push({
            user: user
        });
        // if (user._role._org != null && user._role._org.length != org[org.length - 1].lower.length){
        //     org[org.length - 1].lower = user._role._org; 
        // }
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
    var items = [];

    $(this._user._xml).find('> stewardship person[first*="' + q + '"], > stewardship person[last*="' + q + '"], > stewardship person[email*="' + q + '"]').each(function(){
        items.push({
            role: $(this).first().attr('type'),
            full: $(this).first().attr('first') + ' ' + $(this).first().attr('last'),
            _xml: this
        });
    });
    var found = {};
    var result = [];
    for (var i = 0; i < items.length; i++){
        var first = items[i].role.toUpperCase().slice(0, 4);
        var last = items[i].full;
        if (!found[first + ' - ' + last]){
            result.push(items[i]);
            found[first + ' - ' + last] = true;
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