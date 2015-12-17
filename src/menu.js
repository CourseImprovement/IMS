/**
 * @name Menu
 * @description
 *  ary = [{
 * 		value: 'FA15',
 * 		href: 'laskjdflskf.aspx'
 *  }]
 */
function Menu(ary){
	this._items = [];
	if (ary && ary.length > 0){
		this._setItems(ary);
	}
}

/**
 * @name _setItems
 * @description Set the items
 */
Menu.prototype._setItems = function(ary){
	for (var i = 0; i < ary.length; i++){
		this._items.push(new MenuItem(ary[i]));
	}
}

/**
 * @name getItems
 * @description Get all items
 */
Menu.prototype.getItems = function(){
	return this._items;
}

/**
 * @name MenuItems
 * @description A specific item in the menu
 */
function MenuItem(obj){
	this.href = obj.href;
	this.name = obj.value;
	this.type = obj.type;
	this.selected = obj.selected;
}