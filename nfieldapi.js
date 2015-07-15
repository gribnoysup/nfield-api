module.exports = (function Nfield () {
  
  var Promise = require('bluebird');
  
  var nfieldInstance;
  
  /**
   * Creates Nfield instance
   * @param {Object} nfieldParams - Parameters to configure Nfield user to use with API, must contain server url and user credentials
   * @param {Object=} requestParams - Parameters to configure request module, that is used to connect to API
   */
  function NfieldInstance (nfieldParams, requestParams) {
    
    var _this = this;
    var request;
    var token = { 'AuthenticationToken' : '', 'Timestamp' : 0 };
    var connectInterval;
    var nfieldOptions = nfieldParams || {};
    var requestOptions = requestParams || {};
    
    /**
     * Reconfigures Nfield instance
     * @param {Object=} nP - Parameters to configure Nfield user to use with API, must contain server url and user credentials
     * @param {Object=} rP - Parameters to configure request module, that is used to connect to API
     */
    _this.configure = function configure (nP, rP) {
      nfieldOptions = nP || nfieldOptions;
      requestOptions = rP || requestOptions;
      requestOptions.baseUrl = nfieldOptions.server || 'https://api.nfieldmr.com/';
      request = Promise.promisify(require('request').defaults(requestOptions));
    };
    
    /**
     * Response callback
     * @callback responseCallback
     * @param {Array} err
     * @param {Array} resp
     */
    
    // SignIn
    
    /**
     * Sign in to the Nfield API<br>
     * {@link https://api.nfieldmr.com/help/api/post-v1-signin 'POST v1/SignIn' API reference}
     * @param {Object} credentials - Sign in credentials
     * @param {String} credentials.Domain
     * @param {String} credentials.Username
     * @param {String} credentials.Password
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.signIn = function signIn (credentials, callback) {
      return request({
        method : 'POST',
        uri : 'v1/SignIn',
        json : credentials
      }).nodeify(callback);
    };
    
    // SurveyFieldwork
    
    /**
     * Request survey fieldwork status
     * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-fieldwork-status 'GET v1/Surveys/{surveyId}/Fieldwork/Status' API reference}
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.getSurveyStatus = function getSurveyStatus (surveyId, callback) {
      return request({
        method : 'GET',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Status').replace('{surveyId}', surveyId),
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    };
    
    /**
     * Start survey
     * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-start 'PUT v1/Surveys/{surveyId}/Fieldwork/Start' API reference}
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.startSurvey = function startSurvey (surveyId, callback) {
      return request({
        method : 'PUT',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Start').replace('{surveyId}', surveyId),
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    };
    
    /**
     * Stop (pause) survey
     * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-stop 'PUT v1/Surveys/{surveyId}/Fieldwork/Stop' API reference}
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.stopSurvey = function stopSurvey (surveyId, callback) {
      return request({
        method : 'PUT',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Stop').replace('{surveyId}', surveyId),
        json : {
          // TODO: Wainig for the answer from the NIPO support to clarify meaning of the variable, value is fixed for now
          'TerminateRunningInterviews' : true
        },
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    };
    
    // DefaultTexts
    
    /**
     * Get specific/all default text(s) for the domain
     * {@link https://api.nfieldmr.com/help/api/get-v1-defaulttexts 'GET v1/DefaultTexts' API reference}
     * {@link https://api.nfieldmr.com/help/api/get-v1-defaulttexts-translationkey 'GET v1/DefaultTexts/{translationKey}' API reference}
     * @param {String=} translationKey - Translation key
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.getDefaultText = function getDefaultText (translationKey, callback) {
      var reqURI = '';
      
      if (translationKey) {
        reqURI = ('v1/DefaultTexts/{translationKey}').replace('{translationKey}', translationKey);
      } else {
        reqURI = 'v1/DefaultTexts';
      }
      
      return request({
        method : 'GET',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    };
    
    /**
     * Token update error callback
     * @callback persistantErrorCallback
     * @param {Array} error - Request response array
     */
    
    /**
     * Connects Nfield instance to Nfield API with parameters provided during initialization<br>
     * Nfield API uses tokens that lasts for 15 minutes for authorisation, so as an options this method allows you to initiate an autoupdate for the token in Nfield instance, that fires every 12 minutes
     * @param {Boolean} persistant - Initiate an autoupdate for token (true/false)
     * @param {persistantErrorCallback} persistantErrorCallback - Callback, that fires if something goes wrong during token update
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.connect = function connect (persistant, persistantErrorCallback, callback) {
      if (persistant === true && !connectInterval) {
        connectInterval = setInterval(function () {
          _this.signIn(nfieldOptions.credentials).then(function(data) {
            if (data[0].statusCode == 200) {
              token.AuthenticationToken = data[0].body.AuthenticationToken;
              token.Timestamp = Date.now();
            } else {
              if (typeof persistantErrorCallback == 'function') persistantErrorCallback(data);
            }
          });
        }, 1000 * 60 * 12);
      } else if (persistant === true && connectInterval) {
        console.log('Persistant connection already running');
      }
      
      return new Promise(function (resolve, reject) {
        if (token.AuthenticationToken !== '' && (Date.now() - token.Timestamp) < 1000 * 60 * 12) {
          resolve(token);
        } else {
          _this.signIn(nfieldOptions.credentials).then(function (data) {
            if (data[0].statusCode == 200) {
              token.AuthenticationToken = data[0].body.AuthenticationToken;
              token.Timestamp = Date.now();
              resolve(token);
            } else {
              reject(data);
            }
          }).catch(function (error) {
            reject(error);
          });
        }
      }).nodeify(callback);
    };
    
    /**
     * Clears persistant token update interval
     */
    _this.stopPersistant = function stopPersistant () {
      clearInterval(connectInterval);
      connectInterval = null;
    };
    
    _this.configure(nfieldOptions, requestOptions);
  }
  
  /**
   * Creates new Nfield instance or returns existing one
   * @param {Object} nfieldParams - Parameters to configure Nfield user to use with API, must contain server url and user credentials
   * @param {String} nfieldParams.credentials.Domain
   * @param {String} nfieldParams.credentials.Username
   * @param {String} nfieldParams.credentials.Password
   * @param {String} nfieldParams.server
   * @param {Object=} requestParams - Parameters to configure request module, that is used to connect to API
   * @returns {Object} Returns Nfield instance
   */
  function init (nfieldParams, requestParams) {
    if (!nfieldInstance) {
      nfieldInstance = new NfieldInstance(nfieldParams, requestParams);
    } else {
      nfieldInstance.configure(nfieldParams, nfieldParams);
    }
    return nfieldInstance;
  }
  
  return {
    init : init
  };
  
})();