
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
		'Building Faith in Jesus Christ'
	]
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
		console.log(leader + ' - ' + $(this).closest('person').attr('email'));
		for (var i = 0; i < _this._questions.length; i++){
			var text = $(this).find('survey[id=' + _this._surveyId + '] answer[id=' + _this._questions[i].id + ']').text();
			if (text.length == 0) continue;
			if (!result[_this._questions[i].spot][leader]) result[_this._questions[i].spot][leader] = [];
			result[_this._questions[i].spot][leader].push(parseFloat(text));
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
			var avg = sum / count;
			avg = Math.floor(avg * 10) / 10;
			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + tgl + '][type=tgl] question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
		}
		for (var aim in aims[q]){
			var ary = aims[q][aim];
			var count = ary.length;
			var sum = 0;
			for (var i = 0; i < count; i++){
				sum += ary[i];
			}
			var avg = sum / count;
			avg = Math.floor(avg * 10) / 10;

			$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] person[email=' + tgl + '][type=aim] question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
		}
		$(this._xml).find('semester[code=' + window.config.getCurrentSemester() + '] > questions > question[name="' + questions[q] + '"]').append('<survey id="' + this._surveyId + '" value="' + avg + '" />');
	}



}
// GROUP ROLLUP END