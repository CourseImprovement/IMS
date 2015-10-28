window.ims = {}

if (window.location.href.indexOf('?r=1') > 0){
    ims.error = true;
    ims.search = false;
}

/** 
 * Get the params found in the url
 * @param  {Object} ){                 var map [description]
 * @return {[type]}     [description]
 */
ims.params = (function(){
    var map = {};
    var loc = window.location.href;
    if (loc.indexOf('#') > -1){
      loc = loc.split('#')[0];
    }
    var hashes = loc.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        map[hash[0]] = hash[1];
    }
    return map;
})();

function redirectError(){
    if (window.location.href.indexOf('?r=1') > -1) return;
    if (window.location.href.indexOf('?v=') > 0){
        window.location.href = window.location.href.split('?v=')[0] + '?r=1';
    }
    else{
        window.location.href += '?r=1';
    }
}

/**
 * Global encryption library
 * @memberOf ims
 * @namespace ims.aes
 * @type {Object}
 */
ims.aes = {
    /**
     * Encryption Key
     * @memberOf ims.aes
     * @type {String}
     */
    key: '00420059005500490023',
    /**
     * Encrypt a string
     * @param  {String} str 
     * @param  {String} key   generally will always be ims.aes.key
     * @return {String}       Encrypted string
     * @function
     * @memberOf ims.aes
     */
    encrypt: function(str, key){
        var encrypted = CryptoJS['AES']['encrypt'](str, key);
        return encrypted.toString();
    },
    /**
     * Decrypt a string
     * @param  {String} code  Encrypted code 
     * @param  {String} key   generally will always be ims.aes.key
     * @return {String}       Encrypted string
     * @function
     * @memberOf ims.aes
     */
    decrypt: function(code, key){
        var decrypted = CryptoJS['AES']['decrypt'](code, key).toString(CryptoJS['enc']['Utf8']);
        return decrypted;
    },
    /**
     * The global encrypted value
     * @type {Object}
     * @memberOf ims.aes
     */
    value: {},
    raw: ''
}


/**
 * Encode the string in hex
 * @return {string} String of hex
 * @memberOf String
 */
String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

/**
 * Dencode the string in hex
 * @return {string} String
 * @memberOf String
 */
String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

/**
     * Initial decrypt
     * @function
     * @memberOf ims.aes
     */
ims.aes.initDecrypt = (function(){
    if (window.location.href.indexOf('?') == -1){
        ims.error = true;
        ims.search = true;
    }
    else{
        try{
            var obj = ims.aes.decrypt(ims.params['v'], ims.aes.key.hexDecode());
            ims.aes.raw = obj;
            ims.aes.value = JSON.parse(ims.aes.raw);
        }
        catch (e){
            redirectError();
        }
    }
})();

/**
 * Show a tooltip
 * @param  {MouseEvent} e The mouse event
 * @param  {string} msg A String to display the message
 * @param  {string} pos left or right
 * @memberOf ims
 */
ims.tooltip = function(e, msg, pos){
    if (pos && pos == 'left'){
        $('body').append('<div id="tooltip-left"></div>');
        var tooltip = $('#tooltip-left');
        tooltip.html(msg);
        tooltip.css({left: ((e.clientX - tooltip.width()) - 65) + 'px', top: (e.clientY - tooltip.height() - 15) + 'px'});
    }
    else{
        $('body').append('<div id="tooltip"></div>');
        var tooltip = $('#tooltip');
        tooltip.html(msg);
        tooltip.css({left: (e.clientX + 35) + 'px', top: (e.clientY - tooltip.height() - 15) + 'px'});
    }
}