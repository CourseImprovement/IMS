// GROUP PERMISSIONS
/**
 * Permissions Object
 * NOTE:
 * 	If the users are not found in the SharePoint site somewhere (anywhere),
 * 	they will need to be added manually to the SharePoint site using some 
 * 	sort of groups. An API was attempted to be made to automate this, 
 * 	however, it has become difficult.
 */
function Permissions(){
	console.log('new Permissions object created');
	this._xml = this.getPermissionsXml();
	//this.map = window.config.getMaster();
	this.map = new Master();
	this.init();
	this.changes = [];
	this.status = {inProgress: 0, completed: 0};
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
	// get the site users
	ims.sharepoint.getSiteUsers(function(users){
		_this.siteUsers = {xml: users, add: [], remove: []};
	})
	// Get the sharepoint site roles
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
		for (var i = 0; i < this.people.length; i++){
			this.people[i].change();
		}
	}
}

Permissions.prototype.checkForCompletion = function(){
	var _this = this;
	this.status.completed++;
	if (--this.status.inProgress == 0){
		for (var i = 0; i < this.siteUsers.remove.length; i++){
			var p = this.siteUsers.remove[i];
			$(this._xml).find('file[email=' + p.file + '] user[email=' + p.user + ']').remove();
		}
		for (var i = 0; i < this.siteUsers.add.length; i++){
			var p = this.siteUsers.add[i];
			$(this._xml).find('file[email=' + p.file + ']').append('<user email="' + p.user + '" />');
		}
		Sharepoint.postFile(this._xml, 'config/', 'permissions.xml', function(){
			console.log(_this.siteUsers);
			alert('Updated ' + this.status.completed + ' permissions');
		});
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

/**
 * Change the permissions from the objects collected during check
 * @return {[type]} [description]
 */
PermissionsPerson.prototype.change = function(){
	if (this.results.add.length > 0) this.addUsers();
	if (this.results.remove.length > 0) thos.removeUsers();
}

/**
 * Remove the users from the files, SharePoint API calls are made here
 * @return {[type]} [description]
 */
PermissionsPerson.prototype.removeUsers = function(){
	this.api(this.results.remove, false);
}

/**
 * Add users to the files, SharePoint calls are used here
 */
PermissionsPerson.prototype.addUsers = function(){
	this.api(this.results.add, true);
}

/** 
 * The API call for the permissions api
 */
PermissionsPerson.prototype.api = function(ary, isAdd){
	var err = [];
	var _this = this;
	ims.sharepoint.getFileItems(this.email, function(listItemsXml){
		for (var i = 0; i < ary.length; i++){
			var file = ary[i];
			var user = $(_this.permissions.siteUsers.xml).find('d\\:Email:contains(' + file + '), Email:contains(' + file + ')');
			var id = $(user).parent().find('d\\:Id, Id').text();
			if (id){
				var begin = $(listItemsXml).find('[title=RoleAssignments]').attr('href');
				var raHref = (isAdd ? '/addroleassignment' : '/removeroleassignment') + '(principalid=' + id + ',roledefid=' + _this.roles.Edit + ')';
							
				_this.status.inProgress++;
				ims.sharepoint.makePostRequest('_api/' + begin + raHref, function(){
					_this.checkForCompletion();
				}, function(){
					err.push(u);
				});	
			}
			else{
				if (isAdd){
					_this.permissions.siteUsers.add.push({file: _this.email, user: file});
				}
				else{
					_this.permissions.siteUsers.remove.push({file: _this.email, user: file});
				}
			}
		}
	});
}
// GROUP PermissionsPerson END