module.exports = (function Nfield () {
  
  var Promise = require('bluebird');
  
  var nfieldInstance;
  
  /**
   * Creates Nfield instance
   * @param {Object} nfieldParams - Parameters to configure Nfield user to use with API, must contain server url and user credentials
   * @param {Object=} requestParams - Parameters to configure request module, that is used to connect to API
   */
  function createNfieldInstance (nfieldParams, requestParams) {
    
    var request;
    var nfieldOptions = nfieldParams || {};
    var requestOptions = requestParams || {};
    
    /**
     * Reconfigures Nfield instance
     * @param {Object=} nP - Parameters to configure Nfield user to use with API, must contain server url and user credentials
     * @param {Object=} rP - Parameters to configure request module, that is used to connect to API
     */
    function updateParams (nP, rP) {
      nfieldOptions = nP || nfieldOptions;
      requestOptions = rP || requestOptions;
      requestOptions.baseUrl = nfieldOptions.server || 'https://api.nfieldmr.com/';
      request = Promise.promisify(require('request').defaults(requestOptions));
    }
    
    /**
     * Response callback
     * @callback responseCallback
     * @param {Error} Error
     * @param {Object} Response
     */
    
    /**
     * Sign in to the Nfield API<br>
     * {@link https://api.nfieldmr.com/help/api/post-v1-signin POST v1/SignIn API documentation}
     * @param {Object} credentials - Sign in credentials
     * @param {String} credentials.Domain
     * @param {String} credentials.Username
     * @param {String} credentials.Password
     * @param {responseCallback} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function signIn (credentials, callback) {
      return request({
        method : 'post',
        uri : 'v1/SignIn',
        json : credentials
      }).nodeify(callback);
    }

    updateParams(nfieldOptions, requestOptions);
    
    return {
      configure : function publicConfigure (nP, rP) {
        updateParams(nP, rP);
      },
      signIn : function publicSignIn (cred, cb) {
        return signIn(cred, cb);
      }
    };
    
  }
  
  /**
   * Creates new Nfield instance or returns existing one
   * @param {Object} nfieldParams - Parameters to configure Nfield user to use with API, must contain server url and user credentials
   * @param {Object=} requestParams - Parameters to configure request module, that is used to connect to API
   * @returns {Object} Returns Nfield instance
   */
  function init (nfieldParams, requestParams) {
    if (!nfieldInstance) {
      nfieldInstance = createNfieldInstance(nfieldParams, requestParams);
    }
    return nfieldInstance;
  }
  
  return {
    init : init
  };
  
})();