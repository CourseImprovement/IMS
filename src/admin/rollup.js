


// GROUP ROLLUP
/**
 * Rollup Object
 */
function Rollup(){
	this._xml = ims.sharepoint.getXmlByEmail('rollup');
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
		'Building Faith in Jesus Christ',
		'Weekly Hours'
	]
	$(window.config._xml).find('semester[code=' + window.config.getCurrentSemester() + '] survey[id=' + this._surveyId + '] question').each(function(){
		for (var i = 0; i < questions.length; i++){
			if ($(this).find('text:contains("' + questions[i] + '")')){
				_this._questions.push({
					id: $(this).attr('id'),
					spot: i
				});
			}
		}
	});

	var result = {}
	for (var i = 0; i < this._questions.length; i++){
		result[this._questions[i].id] = {};
	}

	$(master).find('semester[code=' + window.config.getCurrentSemester() + '] > people > person > roles > role[type=instructor]').each(function(){
		var leader = $(this).find('leadership person[type=tgl]').attr('email');
		console.log(leader + ' - ' + $(this).closest('person').attr('email'));
		for (var i = 0; i < _this._questions.length; i++){
			var text = $(this).find('survey[id=' + _this._surveyId + '] answer[id=' + _this._questions[i].id + ']').text();
			if (text.length == 0) continue;
			if (!result[_this._questions[i].id][leader]) result[_this._questions[i].id][leader] = [];
			result[_this._questions[i].id][leader].push(text);
		}
	});
	console.log(result);	
}
// GROUP ROLLUP END