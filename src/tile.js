function Tile(config){
	if (!config) throw "Invalid config of tile";
	this.title = config.title;
	this.helpText = config.helpText;
	this.type = config.type;
	this.data = config.data;
	this.hidden = config.hidden;
}