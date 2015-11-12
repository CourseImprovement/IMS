
window._rollup;

// GROUP ROLLUP
/**
 * Rollup Object
 */
function Rollup(){
	this._xml = ims.sharepoint.getXmlByEmail('rollup');
	window._rollup = this._xml;
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
					credits += parseInt($(this).parents('roles').parent().find("course[id=" + courseid + ']').attr('credit'));
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
				var avg = Rollup.avg(sum, credits);
				result[_this._questions[i].spot][leader].push(avg);
			}
			else{
				var text = $(this).find('survey[id=' + _this._surveyId + '] answer[id=' + _this._questions[i].id + ']').text();
				if (text.length == 0) continue;
				if (!result[_this._questions[i].spot][leader]) result[_this._questions[i].spot][leader] = [];
				result[_this._questions[i].spot][leader].push(parseFloat(text));
			}
		}
	});

	var top = {};
	var aims = {};

	for (var q in result){
		top[q] = {total: 0, sum: 0}
		for (var tgl in result[q]){
			var ary = result[q][tgl];
			var isAim = $(master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email=' + tgl + ']').attr('highestrole') == 'aim';
			if (isAim){
				if (!aims[q]) aims[q] = {};
				if (!aims[q][tgl]) aims[q][tgl] = [];
				aims[q][tgl].concat(result[q][tgl].raw);
			}
			var count = ary.length;
			var sum = 0;
			for (var i = 0; i < count; i++){
				sum += ary[i];
				top[q].sum += ary[i];
				top[q].total++;
			}
			var avg = Rollup.avg(sum, count);
			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + tgl + '][type=tgl] question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
		}
		for (var aim in aims[q]){
			var ary = aims[q][aim];
			var count = ary.length;
			var sum = ary.sum();
			var avg = Rollup.avg(sum, count);

			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + tgl + '][type=aim] question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
		}
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > questions > question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
	}

	var a = 10;
}

Rollup.prototype.aimLevelUpdate = function(){
	var questions = [
		'Seek Development Opportunities',
		'Inspire a Love for Learning',
		'Develop Relationships with and among Students',
		'Embrace University Citizenship',
		'Building Faith in Jesus Christ',
		'Weekly Hours'
	]
	var result = {};
	var _this = this;
	$(this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[highestrole=aim]').each(function(){
		var email = $(this).attr('email'); 
		result[email] = {};
		for (var i = 0; i < _this._questions.length; i++){
			result[email][_this._questions[i].spot] = [];
			$(this).find('> roles > role[type=aim] > stewardship > people person').each(function(){
				$(_this._master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person[email="' + $(this).attr('email') + '"]').each(function(){
					var text = $(this).find('survey[id=' + _this._surveyId + '] answer[id=' + _this._questions[i].id + ']').text();
					if (text.length == 0) return;
					if (questions[_this._questions[i].spot] == 'Weekly Hours'){
						var credits = 0;
						$(this).find('> courses course').each(function(){
							var credit = parseFloat($(this).attr('credit'));
							if (credit == 1){
								credit = 1.5;
							}
							else if (credits == 2){
								credit = 2.25;
							}
							
							credits += credit;
						});
						result[email][_this._questions[i].spot].push({
							hours: parseFloat(text),
							credits: credits
						});
					}
					else {
						result[email][_this._questions[i].spot].push(parseFloat(text));
					}
				});
			});
		}
	});
	
	for (var a in result){
		for (var q in result[a]){
			var total = result[a][q].length;
			var credits = 0
			var sum = 0;
			var question = $(window._rollup).find('semester[code=' + window.config.getCurrentSemester() + '] people > person[email=' + a + '][type=aim] question[name="' + questions[q] + '"]');
			
			if (question[q] == 'Weekly Hours'){
				total = 0;
				for (var i = 0; i < result[a][q].length; i++){
					sum += result[a][q][i].hours;
					total += result[a][q][i].credits;
				}
			}
			else{
				for (var i = 0; i < result[a][q].length; i++){
					sum += result[a][q][i];
				}
			}
			
			var avg = sum / total;
			$(question).append('<survey id="' + this._surveyId + '" value="' + avg + '"/>');
		}
	}

	console.log(window._rollup);
}
// GROUP ROLLUP END