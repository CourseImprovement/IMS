

// GROUP PERMISSIONS
/**
 * Permissions Object
 */
function Permissions(){
	console.log('new Permissions object created');
	this._xml = this.getPermissionsXml();
	var map = window.config.getMaster();
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
	if (!this._areDifferent) return true;
	console.log('Checking if permissions need changing');
}

/**
 * UPDATE THE PERMISSIONS ON VARIOUS FILES
 */
Permissions.prototype.update = function(){
	console.log('updating the permissions');
}
// GROUP PERM             ISSIONS END