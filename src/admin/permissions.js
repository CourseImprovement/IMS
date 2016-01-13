/**
 * Steps
 *  1. get sharepoint siteusers, roles, permissions, and master
 */
function Permissions(){
	this.master = new Master();
	this.rolesXml = null;
	this.permissionsXml = null;
	this.siteUsersXml = null;
	window._permissions = this;
	this.roles = {};
	this.permissionsXmlFiles = {
		graph: {},
		ary: []
	};
	this.permissionPersons = {
		graph: {},
		ary: []
	};
	this.changes = {
		graph: {},
		ary: []
	};
}

Permissions.prototype.start = function(){
	var _this = this;

	// this needs to be ugly to refresh the UI loading screen...
	ims.loading.reset();
	this.stepOne(function(){
		setTimeout(function(){
			ims.loading.set(5);
			_this.stepTwo();
			setTimeout(function(){
				ims.loading.set(15);
				setTimeout(function(){
					_this.stepThree(function(){
						ims.loading.set(20);
						setTimeout(function(){
							_this.stepFour(function(){
								setTimeout(function(){
									ims.loading.set(60);
									_this.stepFive(function(){
										setTimeout(function(){
											ims.loading.set(70);
											_this.stepSix();
											setTimeout(function(){
												ims.loading.set(100);
											}, 10);
										}, 10);
									})
								}, 10);
							})
						}, 10)
					})
				}, 10)
			}, 10)
		}, 10)
	})
}

Permissions.prototype.getSiteUserIdByEmail = function(email){
	var id = $(this.siteUsersXml).find('d\\:Email:contains(' + email + '), Email:contains(' + email + ')').parent().find('d\\:Id, Id').text();
	return id;
}

Permissions.prototype.stepSix = function(){
	for (var i = 0; i < this.permissionPersons.ary.length; i++){
		$(this.permissionsXml).find('file[name=' + this.permissionPersons.ary[i].email + ']').remove();
		var spot = $(this.permissionsXml).find('permissions').append('<file broken="true" name="' + this.permissionPersons.ary[i].email + '"></file>')
			.find('file[name=' + this.permissionPersons.ary[i].email + ']');
		var keys = Object.keys(this.permissionPersons.ary[i].org);
		for (var j = 0; j < keys.length; j++){
			var role = keys[j];
			var email = this.permissionPersons.ary[i].org[role];
			$(spot).append('<user email="' + email + '" role="' + role + '" />');
		}
	}
	Sharepoint.postFile(this.permissionsXml, 'config/', 'permissions.xml', function(){
		alert('Completed');
		window.location.reload();
	});
}

Permissions.prototype.stepFive = function(callback){
	console.log('Step 5');

	var USER_SIZE = 50;
	var digest;

	$.ajax({
	  	url: ims.sharepoint.base + '_api/contextinfo',
	  	header: {
	  		'accept': 'application/json; odata=verbose',
	  		'content-type': 'application/json;odata=verbose'
	  	},
	  	type: 'post',
	  	contentType: 'application/json;charset=utf-8'
	  }).done(function(d){
  	digest = $(d).find('d\\:FormDigestValue, FormDigestValue').text();
  	nextWave(0);
  })

	function nextWave(spot){
		var calls = [];
  	for (var i = spot; i < USER_SIZE + spot; i++){
  		if (!_permissions.permissionPersons.ary[i]) {
  			callback();
  			break;
  		}
  		else{
  			var urls = _permissions.permissionPersons.ary[i].getUrls();
	  		for (var j = 0; j < urls.length; j++){
	  			calls.push({
						name: _permissions.permissionPersons.ary[i].email,
						url: ims.url.relativeBase + urls[j],
						headers: {
							"accept": "application/json;odata=verbose",
		          "X-RequestDigest": digest
						},
						method: 'POST'
					});	
	  		}  		
  		}
  	}

  	byui.ajaxPool({
  		calls: calls,
  		done: function(err, succ){
  			console.log(err);
  			nextWave(spot + USER_SIZE - 1);
  		}
  	})
	}
}

Permissions.prototype.stepFour = function(callback){
	console.log('Step 4');
  $.ajax({
  	url: ims.sharepoint.base + '_api/contextinfo',
  	header: {
  		'accept': 'application/json; odata=verbose',
  		'content-type': 'application/json;odata=verbose'
  	},
  	type: 'post',
  	contentType: 'application/json;charset=utf-8'
  }).done(function(d){
  	var digest = $(d).find('d\\:FormDigestValue, FormDigestValue').text();
  	var calls = [];
  	for (var i = 0; i < _permissions.permissionPersons.ary.length; i++){
  		if (_permissions.permissionPersons.ary[i].broken) continue;
  		calls.push({
				name: _permissions.permissionPersons.ary[i].email,
				url: ims.url.relativeBase + _permissions.permissionPersons.ary[i].breakUrl,
				headers: {
					"accept": "application/json;odata=verbose",
          "X-RequestDigest": digest
				},
				method: 'POST'
			});	
  	}
  	callback();
  	byui.ajaxPool({
  		calls: calls,
  		done: function(err, succ){
  			console.log(err);
  			callback();
  		}
  	})
  })
}

Permissions.prototype.stepThree = function(callback){
	console.log('Step 3');
	var firstUrl = ims.url._base + 	"_api/Web/GetFileByServerRelativeUrl('" + ims.url.relativeBase + "Instructor%20Reporting/Master/";
	var secondUrl = ".xml')/ListItemAllFields";
	var calls = [];
	for (var i = 0; i < this.permissionPersons.ary.length; i++){
		if (this.permissionPersons.ary[i].hasChanges()){
			calls.push({
				name: this.permissionPersons.ary[i].email,
				url: firstUrl + this.permissionPersons.ary[i].email + secondUrl
			})
		}
	}
	var _this = this;
	byui.ajaxPool({
		done: function(err, success){
			console.log(err);
			var keys = Object.keys(success);
			for (var i = 0; i < keys.length; i++){
				var begin = $(success[keys[i]]).find('[title=RoleAssignments]').attr('href');
				var breakUrl = '_api/' + begin.replace('RoleAssignments', 'breakroleinheritance(copyRoleAssignments=true, clearSubscopes=true)');
				var baseUrl = '_api/' + begin;
				_this.permissionPersons.graph[keys[i]].breakUrl = breakUrl;
				_this.permissionPersons.graph[keys[i]].baseUrl = baseUrl;
			}
			callback();
		},
		calls: calls
	})
}

Permissions.prototype.stepTwo = function(callback){
	console.log('Step 2');
	var _this = this;
	$(this.permissionsXml).find('file').each(function(){
		var p = new PermissionFile(this);

		_this.permissionsXmlFiles.ary.push(p);
		_this.permissionsXmlFiles.graph[p.name] = p;
	});

	for (var i = 0; i < this.master.people.length; i++){
		var mp = this.master.people[i];
		var p = PermissionPerson.fromMasterPerson(mp);
		this.permissionPersons.ary.push(p);
		this.permissionPersons.graph[p.email] = p;
		p.compareWithPermissionsXml(this.permissionsXmlFiles.graph[p.email]);
	}

	$(this.rolesXml).find('properties Name, m\\:properties d\\:Name').each(function(){
		_this.roles[$(this).text()] = $(this).prev().text();
	})
}

Permissions.prototype.stepOne = function(callback){
	console.log('Step 1');
	var _this = this;
	byui.ajaxPool({
		done: function(err, success){
			if (err && err.length > 0) console.log(err);
			_this.rolesXml = success.siteRoles;
			_this.siteUsersXml = success.siteUsers;
			_this.permissionsXml = success.permissionsXml;
			callback();
		},
		calls: [
		 	{
		 		name: 'siteUsers',
		 		url: ims.url._base + '_api/Web/siteUsers'
		 	},
		 	{
		 		name: 'siteRoles',
		 		url: ims.url._base + '_api/Web/roledefinitions'
		 	},
		 	{
		 		name: 'permissionsXml',
		 		url: ims.sharepoint.base + 'Instructor%20Reporting/config/permissions.xml'
		 	}
		]
	})
}

function PermissionFile(xml){
	var obj = byui(xml).obj();
	var keys = Object.keys(obj.file);
	for (var i = 0; i < keys.length; i++){
		this[keys[i]] = obj.file[keys[i]];
	}
	this._rawXml = xml;
}

// End Result
function PermissionPerson(email, org){
	this.email = email;
	this.org = org;
	this.changes = {
		add: new Set(),
		remove: new Set()
	}
	this.breakUrl = null;
	this.baseUrl = null;
	this.broken = false;
}

PermissionPerson.fromMasterPerson = function(mp){
	var org = {};
	for (var i = 0; i < mp.uppers.length; i++){
		org[mp.uppers[i].role] = mp.uppers[i].person.email;
	}
	var pp = new PermissionPerson(mp.email, org);
	return pp;
}

PermissionPerson.prototype.hasChanges = function(){
	return this.changes.add.size > 0 || this.changes.remove.size > 0;
}

PermissionPerson.prototype.getUrls = function(){
	var result = [];

	var adds = this.changes.add.values();
	if (adds && this.changes.add.size > 0){
		var next = adds.next();
		while (!next.done){
			var email = next.value;
			var id = _permissions.getSiteUserIdByEmail(email);
			if (!id){
				console.log('Add ' + email + ' user to site');
			}
			else{
				result.push(this.baseUrl + '/addroleassignment(principalid=' + id + ',roledefid=' + _permissions.roles.Edit + ')');
			}
			next = adds.next();
		}
	}

	var removes = this.changes.remove.values();
	if (removes && this.changes.remove.size > 0){
		var next = removes.next();
		while (!next.done){
			var email = next.value;
			var id = _permissions.getSiteUserIdByEmail(email);
			if (!id){
				console.log('Add ' + email + ' user to site');
			}
			else{
				result.push(this.baseUrl + '/removeroleassignment(principalid=' + id + ',roledefid=' + _permissions.roles.Edit + ')');
			}
			next = removes.next();
		}
	}

	return result;
}

PermissionPerson.prototype.compareWithPermissionsXml = function(permissionsXmlFile){
	if (!permissionsXmlFile){ // create file
		var keys = Object.keys(this.org);
		for (var i = 0; i < keys.length; i++){
			this.changes.add.add(this.org[keys[i]]);
		}
	}
	else{
		this.broken = permissionsXmlFile.broken == 'true';
		for (var i = 0; i < permissionsXmlFile.children.length; i++){
			var role = permissionsXmlFile.children[i].user.role;
			var email = permissionsXmlFile.children[i].user.email;
			if (!this.org[role]){
				this.changes.remove.add(email)
			}
			else if (this.org[role] != email){
				this.changes.remove.add(email);
				this.changes.add.add(this.org[role]);
			}
			else {} // do nothing
		}
	}

	if (!this.org.self){
		this.changes.add.add(this.email);
	}
}