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

/**
 * Initalize and create all the necessary items to setup for permission
 * @return {[type]} [description]
 */
Permissions.prototype.init = function(){
	this.graph = {};
	this.people = [];
	var _this = this;
	$(this._xml).find('file').each(function(){
		var p = new PermissionsPerson(this, _this);
		_this.people.push(p);
		_this.graph[p.email] = p;
	});
	ims.sharepoint.getSiteUsers(function(users){
		_this.siteUsers = {xml: users, add: []};
	})
	ims.sharepoint.getRoles(function(roles){
		_this.roles = roles;
	})
}

Permissions._xml = null;

/**
 * Get the permissions xml file. If it was already pulled, it will grab the 
 * global version
 * @return {[type]} [description]
 */
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
// GROUP PERMISSIONS END
// GROUP PermissionsPerson
/**
 * create a new permissions file person
 * @param {[type]} xml         [description]
 * @param {[type]} permissions [description]
 */
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

/**
 * Check the permsisions based on the current master file
 * @param  {Map} mapPerson [description]
 * @return {[type]}           [description]
 */
PermissionsPerson.prototype.check = function(mapPerson){
	if (!mapPerson) return null;
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
	this.results = results;
	if (results.add.length > 0 || results.remove.length > 0) return results;
	return null;
}

PermissionsPerson.prototype.removeUsers = function(){

}

PermissionsPerson.prototype.addUsers = function(){
	var err = [];
	var _this = this;
	ims.sharepoint.getFileItems(this.email, function(listItemsXml){
		for (var i = 0; i < _this.results.add.length; i++){
			var file = _this.results.add[i];
			var user = $(_this.permissions.siteUsers.xml).find('d\\:Email:contains(' + file + '), Email:contains(' + file + ')');
			var id = $(user).parent().find('d\\:Id, Id').text();
			if (id){
				var begin = $(listItemsXml).find('[title=RoleAssignments]').attr('href');
				var raHref = '/addroleassignment(principalid=' + id + ',roledefid=' + _this.roles.Edit + ')';
							

				ims.sharepoint.makePostRequest('_api/' + begin + raHref, function(){}, function(){
					err.push(u);
				});	
			}
			else{
				_this.permissions.siteUsers.add.push(file);
			}
		}
	});
}
// GROUP PermissionsPerson END