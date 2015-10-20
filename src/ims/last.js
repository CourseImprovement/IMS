/**
 * Indicator if an error was thrown in the ims.sharepoint.initEmail
 * @memberOf ims
 * @type {Boolean}
 * @var {Boolean}
 */
ims.error = false;

/**
 * Initialization. This will be the first function called. It checks if the current
 * user has a file on the survey, it they do, they will be redirected to their dashboard,
 * if not, they will see the search for a user view.
 *
 * @memberOf ims
 * @function
 */
ims.init = (function(){
	
})();

/**
 * Used for the search screen so when you hit enter, it initiates the search.
 * @param  {KeyboardEvent} e Keyboard event
 * @function
 * @memberOf ims
 */
ims.keypress = function(e){
	
}

/**
 * Indicates if the loading screen should be enabled or disabled
 * @param  {Boolean} on inidicates of the loading screen should be on
 * @return {null}    returns nothing
 * @memberOf ims
 * @function
 */
ims.loading = function(on){
	
}