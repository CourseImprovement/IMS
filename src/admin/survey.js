function Survey(config, isXml){
	this.id = parseInt($(config).attr('id'));
	this.week;
	this.placement;
	this.type;
	this.name;
	this.questions = [];
	this.course;
	this._config = config;
	this.people = [];
}

Survey.prototype.save = function(){
	Sharepoint.postFile(window.config._xml, 'config/', 'config.xml', function(){
		alert('Survey removal was successful!')
	});
}

Survey.prototype.remove = function(){

}

Survey.prototype.modify = function(prop, value, save){
	this[prop] = value;
	if (save){
		this.save();
	}
}

Survey.prototype.copy = function(){

}

Survey.prototype.process = function(){

}

Survey.prototype.answerReplace = function(){

}

Survey.prototype.getAnswerByQuestionId = function(id){

}

Survey.prototype.hasAttrs = function(obj){

}