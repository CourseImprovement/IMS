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
	if (!ary || ary.length == 0) return;
	this._items = [];
	this._setItems(ary);
}

Menu.prototype._setItems = function(ary){
	for (var i = 0; i < ary.length; i++){
		this._items.push(new MenuItem(ary[i]));
	}
}

/**
 * Event for the menu being clicked
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Menu.prototype.click = function(callback){

}

/**
 * Gets a specific item at an index
 * @param  {[type]} idx [description]
 * @return {[type]}     [description]
 */
Menu.prototype.getItem = function(idx){
	
}

/**
 * A specific item in the menu
 * @param {[type]} obj [description]
 */
function MenuItem(obj){
	this.href = obj.href;
	this.name = obj.value;
}

/**
 * Event for the clicking of a specific menu item
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
MenuItem.prototype.click = function(callback){

}