
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
			if (iValue != 0 && iValue != NaN) {
				$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + _im + '][type=im] > questions > question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + iValue + '" />');
				$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + _im + '][type=im] > questions > question[name="' + questions[q] + '"] > survey[id=' + this._surveyId + ']').remove();
			}
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
				if (aValue != 0 && aValue != NaN) {
					$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + _aim + '][type=aim] > questions > question[name="' + questions[q] + '"] > survey[id=' + this._surveyId + ']').remove();
					$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + _aim + '][type=aim] > questions > question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + aValue + '" />');
				}
			}
		}
	}
}
/**
 * @end
 */