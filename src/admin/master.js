/**
 * Get the master file
 * @param {Boolean} isMap [description]
 */
function Master(isMap){
	this._xml = ims.sharepoint.getXmlByEmail('master');
	this.init();
}

/**
 * Initialize the master file by creating all of the people and organization
 * @return {[type]} [description]
 */
Master.prototype.init = function(){
	var sem = window.config.getCurrentSemester();
	this.people = [];
	this.graph = {};
	var _this = this;
	$(this._xml).find('semester[code=' + sem + '] > people > person').each(function(){
		var mp = new MasterPerson(this, _this);
		_this.people.push(mp);
		_this.graph[mp.email] = mp;
	});	
	for (var i = 0; i < this.people.length; i++){
		this.people[i].addUpperAndLowers();
	}
}

/**
 * Master person, person was too polluted
 * @param {[type]} xml    [description]
 * @param {[type]} master [description]
 */
function MasterPerson(xml, master){
	this.email = $(xml).attr('email');
	this.first = $(xml).attr('first');
	this.last = $(xml).attr('last');
	this.highestRole = $(xml).attr('highestrole');
	this.isNew = $(xml).attr('new') == 'true';
	this._xml = xml;
	this.roles = [];
	var _this = this;
	$(xml).find('role').each(function(){
		_this.roles.push($(this).attr('type'));
	});
	this.leaders = {}; // organized
	this.uppers = []; // unorganized
	this.lowers = []; // unorganized
	this.master = master;
}

/**
 * Provide the uppers and the lowers
 */
MasterPerson.prototype.addUpperAndLowers = function(){
	var _this = this;
	$(this._xml).find('> roles > role > stewardship > people > person').each(function(){
		var person = _this.master.graph[$(this).attr('email')];
		_this.lowers.push({
			role: $(this).attr('type'),
			person: person
		});
	});
	$(this._xml).find('> roles > role > leadership > people > person').each(function(){
		var person = _this.master.graph[$(this).attr('email')];
		_this.leaders[$(this).attr('type')] = person;
		_this.uppers.push({
			role: $(this).attr('type'),
			person: person
		});
	});
}