function Rollup(){
	this._xml = ims.sharepoint.getXmlByEmail('rollup');
	this._surveyId = window.config.selectedSurvey.id;
	this._week = window.config.selectedSurvey.getWeekNumber();
	this._questions = [];
}

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
	$(window.config._xml).find('semester[code=' + window.config.getCurrentSemester() + '] survey[id=' + window.config.selectedSurvey.id + '] question').each(function(){
		for (var i = 0; i < questions.length; i++){
			if ($(this).find('text:contains("' + questions[i] + '")')){
				_this._questions.push($(this).attr('id'));
			}
		}
	})
}