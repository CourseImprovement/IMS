

// GROUP PERMISSIONS
/**
 * Permissions Object
 */
function Permissions(){
	console.log('new Permissions object created');
	this._xml = this.getPermissionsXml();
	//this.map = window.config.getMaster();
	this.map = new Master();
	this.init();
	this.changes = [];
}

Permissions.prototype.init = function(){
	this.graph = {};
	this.people = [];
	var _this = this;
	$(this._xml).find('file').each(function(){
		var p = new PermissionsPerson(this, _this);
		_this.people.push(p);
		_this.graph[p.email] = p;
	});
}

Permissions._xml = null;

Permissions.prototype.getPermissionsXml = function(){
	if (!Permissions._xml){
		Permissions._xml = ims.sharepoint.getPermissionsXml();
	}
	return Permissions._xml;
}

/**
 * CHECK IF THERE ARE ANY CHANGES TO DO
 */
Permissions.prototype.check = function(){
	console.log('Checking if permissions need changing');
	var actions = [];
	for (var i = 0; i < this.people.length; i++){
		var r = this.people[i].check(this.map.graph[this.people[i].email]);
		if (r) actions.push(r);
	}
	this.changes = actions;
	return actions.length > 0;
}

/**
 * UPDATE THE PERMISSIONS ON VARIOUS FILES
 */
Permissions.prototype.update = function(){
	console.log('updating the permissions');
	if (this.check()){
		console.log('Changes needed');
	}
}
// GROUP PERM             ISSIONS END

function PermissionsPerson(xml, permissions){
	this.email = $(xml).attr('email');
	this.people = [];
	this.graph = {};
	this.permissions = permissions;
	if ($(xml).prop('nodeName') == 'file'){
		var _this = this;
		this.email = $(xml).attr('name');
		$(xml).find('user').each(function(){
			var p = new PermissionsPerson(this, permissions);
			_this.people.push(p);
			_this.graph[p.email] = p;
		})
	}
}

PermissionsPerson.prototype.check = function(mapPerson){
	var results = {
		email: this.email,
		add: [],
		remove: []
	};
	for (var i = 0; i < mapPerson.uppers.length; i++){
		var person = mapPerson.uppers[i].person;
		if (!this.graph[person.email]){
			results.add.push(person.email);
		}
		else{
			this.graph[person.email].exists = true;
		}
	}
	for (var i = 0; i < this.people.length; i++){
		if (!this.people[i].exists){
			results.remove.push(this.people[i].email);
		}
	}
	if (results.add.length > 0 || results.remove.length > 0) return results;
	return null;
}