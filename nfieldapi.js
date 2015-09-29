module.exports = (function Nfield () {
  
  var Promise = require('bluebird');
  
  var nfieldInstance;
  
  /** 
   * Creates Nfield instance
   * @constructor NfieldInstance
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
     * @memberof NfieldInstance
     * @method configure
     * @param {Object=} nfieldParams - Parameters to configure Nfield user to use with API, must contain server url and user credentials
     * @param {Object=} requestParams - Parameters to configure request module, that is used to connect to API
     */
    _this.configure = function configure (nfieldParams, requestParams) {
      nfieldOptions = nfieldParams || nfieldOptions;
      requestOptions = requestParams || requestOptions;
      requestOptions.baseUrl = nfieldOptions.server || 'https://api.nfieldmr.com/';
      request = Promise.promisify(require('request').defaults(requestOptions));
    };
    
    /**
     * Response callback
     * @callback responseCallback
     * @param {Array} err
     * @param {Array} resp
     */
    
    // SignIn +
    
    /**
     * <p>Sign in to the Nfield API</p>
     * <p> Nfield API reference:
     * <ul><li>[POST v1/SignIn]{@link https://api.nfieldmr.com/help/api/post-v1-signin}</li></ul>
     * </p>
     * @memberof NfieldInstance
     * @method signIn
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
    
    // SurveyFieldwork +
    
    /**
     * <p>Request survey fieldwork status</p>
     * <p> Nfield API reference:
     * <ul><li>[GET v1/Surveys/{surveyId}/Fieldwork/Status]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-fieldwork-status}</li></ul>
     * </p>
     * @memberof NfieldInstance
     * @method getSurveyStatus
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
     * <p>Start survey</p>
     * <p> Nfield API reference:
     * <ul><li>[PUT v1/Surveys/{surveyId}/Fieldwork/Start]{@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-start}</li></ul>
     * </p>
     * @memberof NfieldInstance
     * @method startSurvey
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
     * <p>Stop (pause) survey</p>
     * <p> Nfield API reference:
     * <ul><li>[PUT v1/Surveys/{surveyId}/Fieldwork/Stop]{@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-stop}</li></ul>
     * </p>
     * @memberof NfieldInstance
     * @method stopSurvey
     * @param {String} surveyId - Survey ID
     * @param {Boolean=} [terminate=false] - Terminate running interviews
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.stopSurvey = function stopSurvey (surveyId, terminate, callback) {
      return request({
        method : 'PUT',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Stop').replace('{surveyId}', surveyId),
        json : {
          'TerminateRunningInterviews' : terminate || false
        },
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    };
    
    // DefaultTexts +
    
    /**
     * <p>Get specific/all default text(s) for the domain</p>
     * <p>Nfield API reference:
     * <ul><li>[GET v1/DefaultTexts]{@link https://api.nfieldmr.com/help/api/get-v1-defaulttexts}</li>
     * <li>[GET v1/DefaultTexts/{translationKey}]{@link https://api.nfieldmr.com/help/api/get-v1-defaulttexts-translationkey}</li></ul>
     * </p>
     * @memberof NfieldInstance
     * @method getDefaultText
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
    
    // SurveyTranslations
    
    /**
     * <p>Get specific/all translation(s) for a particular survey language</p>
     * <p>Nfield API reference:
     * <ul><li>[GET v1/Surveys/{surveyId}/Languages/{languageId}/Translations]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid-translations}</li>
     * <li>[GET v1/Surveys/{surveyId}/Languages/{languageId}/Translations/{translationKey}]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid-translations-translationkey}</li></ul>
     * </p>
     * @memberof NfieldInstance
     * @method getTranslation
     * @param {String} surveyId - Survey ID
     * @param {Number} languageId - Language ID
     * @param {String=} translationKey - Translation key
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.getTranslation = function getTranslation (surveyId, languageId, translationKey, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages/{languageId}/Translations'
        .replace('{surveyId}', surveyId)
        .replace('{languageId}', languageId);
      
      if (translationKey) {
        reqURI += ('/' + translationKey);
      }
      
      return request({
        method : 'GET',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    };
    
    // SurveyLanguages
    
    /**
     * <p>Get specific/all languages for a specific survey</p>
     * <p>Nfield API reference:
     * <ul><li>[GET v1/Surveys/{surveyId}/Languages]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages}</li>
     * <li>[GET v1/Surveys/{surveyId}/Languages/{languageId}]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid}</li></ul>
     * </p>
     * @memberof NfieldInstance
     * @method getLanguage
     * @param {String} surveyId - Survey ID
     * @param {Number} languageId - Language ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.getLanguage = function getLanguage (surveyId, languageId, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages'
        .replace('{surveyId}', surveyId);
      
      if (languageId) {
        reqURI += ('/' + languageId);
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
     * <p>Removes specified language from the survey</p>
     * <p>Nfield API reference:
     * <ul><li>[DELETE v1/Surveys/{surveyId}/Languages/{languageId}]{@link https://api.nfieldmr.com/help/api/delete-v1-surveys-surveyid-languages-languageid}</li></ul>
     * </p>
     * @memberof NfieldInstance
     * @method deleteLanguage
     * @param {String} surveyId - Survey ID
     * @param {Number} languageId - Language ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    _this.deleteLanguage = function deleteLanguage (surveyId, languageId, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages/{languageId}'
        .replace('{surveyId}', surveyId)
        .replace('{languageId}', languageId);
      
      return request({
        method : 'GET',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    };    
    
    
    
    // **************
    // Connect to API
    
    /**
     * Token update error callback
     * @callback persistantErrorCallback
     * @param {Array} error - Request response array
     */
    
    /**
     * <p>Connects Nfield instance to Nfield API with parameters provided during initialization</p>
     * <p>Nfield API uses tokens that lasts for 15 minutes for authorisation, so as an options this method allows you to initiate an autoupdate for the token in Nfield instance, that fires every 12 minutes</p>
     * @memberof NfieldInstance
     * @method connect
     * @param {Boolean=} persistant - Initiate an autoupdate for token (true/false)
     * @param {persistantErrorCallback=} persistantErrorCallback - Callback, that fires if something goes wrong during token update
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
     * @memberof NfieldInstance
     * @method stopPersistant
     */
    _this.stopPersistant = function stopPersistant () {
      clearInterval(connectInterval);
      connectInterval = null;
    };
    
    _this.configure(nfieldOptions, requestOptions);
  }
  
  /**
   * Creates new [Nfield instance]{@link NfieldInstance} or returns existing one
   * @memberof Nfield
   * @method init
   * @param {Object} nfieldParams - Parameters to configure Nfield user to use with API, must contain server url and user credentials
   * @param {String} nfieldParams.credentials.Domain
   * @param {String} nfieldParams.credentials.Username
   * @param {String} nfieldParams.credentials.Password
   * @param {String} nfieldParams.server
   * @param {Object=} requestParams - Parameters to configure request module, that is used to connect to API
   * @returns {NfieldInstance} Returns Nfield instance
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