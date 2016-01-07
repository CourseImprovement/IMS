/**
 * @start Permissions
 */
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
	this.map = new Master();
	this.changes = [];
	this.graph = {};
	this.people = [];
	this.init();
	this.status = {inProgress: 0, completed: 0};
}
/**
 * @name init
 * @description Initalize and create all the necessary items to setup for permission
 * @assign Chase
 */
Permissions.prototype.init = function(){
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

/**
 * @name  change
 * @description The start to changing all of the permissions
 * @assign Chase
 */
Permissions.prototype.change = function(callback){
	if (!this.check()) alert('No Changes Necessary');
	window._permissions = this;
	var result = '';
	for (var i = 0; i < this.changes.length; i++){
		if (!this.siteUsers){
			alert('Press Start Again');
			return;
		}
		if ($(this.siteUsers.xml).find('d\\:Email:contains("' + this.changes[i].email + '"), Email:contains("' + this.changes[i].email + '")').length == 0){
			result += this.changes[i].email + '@byui.edu;';
		}
	}
	if (result.length > 0) document.body.innerHTML += '<textarea>' + result + '</textarea>';
	else{
		alert('Ready');
	}
}

/**
 * The xml file for permissions
 */
Permissions._xml = null;
/**
 * @name getPermissionsXml
 * @description Get the permissions xml file. If it was already pulled, it will grab the 
 * @assign Chase
 */
Permissions.prototype.getPermissionsXml = function(){
	if (!Permissions._xml){
		Permissions._xml = ims.sharepoint.getPermissionsXml();
	}
	return Permissions._xml;
}
/**
 * @name check
 * @description Check if there are any changes to do
 * @assign Chase
 */
Permissions.prototype.check = function(){
	console.log('Checking if permissions need changing');
	var actions = [];
	for (var i = 0; i < this.people.length; i++){
		var r = this.people[i].check(this.map.graph[this.people[i].email]);
		if (r) actions.push(r);
	}
	for (var i = 0; i < this.map.people.length; i++){
		if (!this.map.people[i].checked){
			actions.push(PermissionsPerson.setNewMapPersonInformation(this.map.people[i]));
		}
	}
	this.changes = actions;
	return actions.length > 0;
}
/**
 * @name update
 * @description Update the permissions on various files
 * @assign Chase
 */
Permissions.prototype.update = function(){
	console.log('updating the permissions');
	if (this.check()){
		for (var i = 0; i < this.people.length; i++){
			this.people[i].change();
		}
	}
}
/**
 * @name checkForCompletion 
 * @description
 * @assign Chase
 */
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
/**
 * @end
 */



/**
 * @start PermissionsPerson
 */
/**
 * @name permissionPerson
 * @description create a new permissions file person
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
 * @name check
 * @description Check the permsisions based on the current master file
 * @assign Chase
 */
PermissionsPerson.prototype.check = function(mapPerson){
	if (!mapPerson) return null;
	mapPerson.checked = true;
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
 * @name change
 * @description Change the permissions from the objects collected during check
 * @assign Chase
 */
PermissionsPerson.prototype.change = function(){
	if (this.results.add.length > 0) this.addUsers();
	if (this.results.remove.length > 0) thos.removeUsers();
}
/**
 * @name removeUsers
 * @description Remove the users from the files, SharePoint API calls are made here
 * @assign Chase
 */
PermissionsPerson.prototype.removeUsers = function(){
	this.api(this.results.remove, false);
}
/**
 * @name addUsers
 * @description Add users to the files, SharePoint calls are used here
 * @assign Chase
 */
PermissionsPerson.prototype.addUsers = function(){
	this.api(this.results.add, true);
}
/** 
 * @name api
 * @description The API call for the permissions api
 * @assign Chase
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
/**
 * @name  setNewMapPersonInformation
 * @description Set the new map person and populate who needs to be added to the file
 * @assign Chase
 */
PermissionsPerson.setNewMapPersonInformation = function(mapPerson){
	var results = {
		email: mapPerson.email,
		add: [],
		remove: []
	};
	for (var i = 0; i < mapPerson.lowers.length; i++){
		results.add.push(mapPerson.lowers[i].person.email);
	}
	for (var i = 0; i < mapPerson.uppers.length; i++){
		results.add.push(mapPerson.uppers[i].person.email);
	}

	return results;
}
/**
 * @end
 */