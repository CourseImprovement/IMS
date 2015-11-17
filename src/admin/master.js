function Master(isMap){
	this._xml = ims.sharepoint.getXmlByEmail('master');
	this.init();
}

Master.prototype.init = function(){
	var sem = window.config.getCurrentSemester();
	this.people = [];
	var _this = this;
	$(this._xml).find('semester[code=' + sem + '] > people > person').each(function(){
		var person = $('<semesters><semester code="' + sem + '"><people></people></semester></semesters>');
		person.find('people').append($(this).clone());
		console.log(person[0]);
		_this.people.push(new Person(person[0], true, false));
	});	
}