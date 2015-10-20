/**
 * @namespace ims.url
 * @type {Object}
 * @memberOf ims
 * @description All url related items
 */
ims.url = {
  /**
   * Retrieves the prameter variable names and values from the URL, see return value below:
   *
   * <pre><code>
   * ims.url.params = {
   *   v: 10,
   *   c: 100,
   *   example: true
   * }
   * </code></pre>
   *
   * @memberOf ims.url 
   * @type {Object}
   */
  params: (function(){
    
  })(),
  /**
   * Returns the proper url v= parameter. Used in the Dashboard back button
   * <pre><code>
   * 
   * |_____________________|Back| <--
   *
   * </code></pre>
   * @return {String} the encrypted JSON object
   * @memberOf ims.url
   * @function
   */
  back: function(){
   
  },
  /**
   * Redirects to the AIM's TGL hat. Used in the "View As:" drop down menu:
   * <pre><code>
   *  
   * |___________________|View As:|AIM|
   *                               Person A
   *                               Person B
   *                               ---------
   *                               TGL <--
   *
   * </code></pre>
   * @memberOf ims.url
   * @function
   */
  aTGL: function(){
    
  },
  /**
   * Powers if the back button need to be visible
   * @return {Boolean} 
   * @function
   * @memberOf ims.url
   */
  backButton: function(){
    
  },
  /**
   * Append to the end of the url. Which in default will redirect
   * @param  {String} txt The text to append
   * @function
   * @memberOf ims.url
   */
  redirectAppend: function(txt){
    
  },
  /**
   * Redirects the page to a new page. Uses ims.aes
   * @param  {String} hash The hash string to append
   * @function
   * @memberOf ims.url
   */
  redirect: function(hash){
    
  },
  /**
   * Used only in the inital page load, this indicates that there was an error in the hash sequence
   * @function
   * @memberOf ims.url
   */
  toIndex: function(){
    
  },
  /**
   * Redirects back the the base dashboard page.
   *
   * <pre><code>
   * 
   * --> |BYUI|____________________|Back|
   * 
   * </code></pre>
   *
   * @function
   * @memberOf ims.url
   */
  home: function(){
    
  },
  /**
   * When a search item is selected, this calls the redirection
   *
   * <pre><code>
   * 
   * |____________________|AIM|O-|
   *                           INST - Person A <--
   *                           INST - Person B
   * 
   * </code></pre>
   *
   * 
   * @param  {person} person Found in the Angular Scope
   * @function
   * @memberOf ims.url
   */
  suggestionSelected: function(person){
    
  },
  /**
   * Found in the dropdown menu under "View As:". This redirects the the person page
   *
   * <pre><code>
   * 
   * |____________________|TGL|Back|
   *                       Person A <--
   *                       Person B
   * 
   * </code></pre>
   *
   * 
   * @param  {person} person Found in the Angular Scope
   * @function
   * @memberOf ims.url
   */
  gotoUrl: function(person){
    
  },
  /**
   * A placeholder to get the xml configuration files
   * @type {Boolean}
   * @var {Boolean}
   * @memberOf ims.url
   */
  first: false,
  /**
   * Called when the page is loaded first on the home index.aspx page
   * @param  {String} email The current SharePoint user email address
   * @function
   * @memberOf ims.url
   */
  initEmail: function(email){
    
  }
}