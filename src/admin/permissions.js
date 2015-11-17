

// GROUP PERMISSIONS
/**
 * Permissions Object
 */
function Permissions(){
	console.log('new Permissions object created');
	this._map = window.config.getMap();
	this._xml = this.getPermissionsXml();
	this._areDifferent = $(this._map).html() != $(this._xml).html();
	if (this._areDifferent){
		this._old = this.setOld();
		this._new = this.setNew();
	}
	this._toChange = null;
}

Permissions._xml = null;

Permissions.prototype.getPermissionsXml = function(){
	if (!Permissions._xml){
		Permissions._xml = ims.sharepoint.getPermissionsXml();
	}
	return Permissions._xml;
}

Permissions.prototype.setOld = function(){
	var _this = this;
	$(this._xml).find('file').each(function(){
		var email = $(this).attr('name');
		_this._old[email] = [];
		$(this).find('user').each(function(){
			_this._old[email].push($(this).attr('email'));
		});
	});
}

Permissions.prototype.setNew = function(){
	
}

/**
 * CHECK IF THERE ARE ANY CHANGES TO DO
 */
Permissions.prototype.check = function(){
	if (!this._areDifferent) return true;
	console.log('Checking if permissions need changing');
}

/**
 * UPDATE THE PERMISSIONS ON VARIOUS FILES
 */
Permissions.prototype.update = function(){
	console.log('updating the permissions');
}
// GROUP PERMISSIONS END