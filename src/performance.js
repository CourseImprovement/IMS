function Performance(obj){
	this.link = obj.link;
	this.name = obj.name;
}

Performance.prototype.isNew = function(){return false;}
Performance.prototype.getHref = function(){return this.link;}
Performance.prototype.getFullName = function(){return this.name;}