

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
	var add = [];
	var remove = [];
	for (var i = 0; i < this.people.length; i++){
		if (this.people[i].access.length == this.map.graph[this.people[i].email].uppers.length){
			console.log('fine');
		}
	}
}

/**
 * UPDATE THE PERMISSIONS ON VARIOUS FILES
 */
Permissions.prototype.update = function(){
	console.log('updating the permissions');
}
// GROUP PERM             ISSIONS END

function PermissionsPerson(xml, permissions){
	this.email = $(xml).attr('email');
	this.access = [];
	this.permissions = permissions;
	if ($(xml).prop('nodeName') == 'file'){
		var _this = this;
		this.email = $(xml).attr('name');
		$(xml).find('user').each(function(){
			_this.access.push(new PermissionsPerson(this, permissions));
		})
	}
}