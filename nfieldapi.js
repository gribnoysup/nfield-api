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
    var token = { 'AuthenticationToken' : '', 'Timestamp' : 0 };
    var connectInterval;
    var nfieldOptions = nfieldParams || {};
    var requestOptions = requestParams || {};
    
    /**
     * Reconfigures Nfield instance
     * @alias configure
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
     * @param {Array} err
     * @param {Array} resp
     */
    
    // SignIn
    
    /**
     * Sign in to the Nfield API<br>
     * {@link https://api.nfieldmr.com/help/api/post-v1-signin 'POST v1/SignIn' API documentation}
     * @param {Object} credentials - Sign in credentials
     * @param {String} credentials.Domain
     * @param {String} credentials.Username
     * @param {String} credentials.Password
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function signIn (credentials, callback) {
      return request({
        method : 'post',
        uri : 'v1/SignIn',
        json : credentials
      }).nodeify(callback);
    }
    
    // SurveyFieldwork
    
    /**
     * Request survey fieldwork status
     * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-fieldwork-status 'GET v1/Surveys/{surveyId}/Fieldwork/Status' API documentation}
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function getSurveyStatus (surveyId, callback) {
      return request({
        method : 'get',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Status').replace('{surveyId}', surveyId),
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    }
    
    /**
     * Start survey
     * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-start 'PUT v1/Surveys/{surveyId}/Fieldwork/Start' API documentation}
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function startSurvey (surveyId, callback) {
      return request({
        method : 'put',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Start').replace('{surveyId}', surveyId),
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    }
    
    /**
     * Stop (pause) survey
     * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-stop 'PUT v1/Surveys/{surveyId}/Fieldwork/Stop' API documentation}
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function stopSurvey (surveyId, callback) {
      return request({
        method : 'put',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Stop').replace('{surveyId}', surveyId),
        json : {
          // TODO: Wainig for the answer from the NIPO support to clarify meaning of the variable, value is fixed for now
          'TerminateRunningInterviews' : true
        },
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    }    
    
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
    function connect (persistant, persistantErrorCallback, callback) {
      if (persistant === true && !connectInterval) {
        connectInterval = setInterval(function () {
          signIn(nfieldOptions.credentials).then(function(data) {
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
          signIn(nfieldOptions.credentials).then(function (data) {
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
    }
    
    /**
     * Clears persistant token update interval
     * @alias stop
     */
    function disablePersistant () {
      clearInterval(connectInterval);
      connectInterval = null;
    }
    
    updateParams(nfieldOptions, requestOptions);
    
    return {
      configure : updateParams,
      signIn : signIn,
      connect : connect,
      stop : disablePersistant,
      getSurveyStatus : getSurveyStatus,
      startSurvey : startSurvey,
      stopSurvey : stopSurvey
    };
    
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
      nfieldInstance = createNfieldInstance(nfieldParams, requestParams);
    }
    return nfieldInstance;
  }
  
  return {
    init : init
  };
  
})();