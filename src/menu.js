/**
 * ary = [
 * 		{
 * 			value: 'FA15',
 * 			href: 'laskjdflskf.aspx'
 * 		}
 * ]
 * @param {[type]} obj [description]
 */
function Menu(ary){
	this._items = [];
	if (ary && ary.length > 0){
		this._setItems(ary);
	}
}

/**
 * Set the items
 * @param {[type]} ary [description]
 */
Menu.prototype._setItems = function(ary){
	for (var i = 0; i < ary.length; i++){
		this._items.push(new MenuItem(ary[i]));
	}
}

/**
 * Get all items
 * @return {[type]} [description]
 */
Menu.prototype.getItems = function(){
	return this._items;
}

/**
 * A specific item in the menu
 * @param {[type]} obj [description]
 */
function MenuItem(obj){
	this.href = obj.href;
	this.name = obj.value;
	this.type = obj.type;
	this.selected = obj.selected;
}