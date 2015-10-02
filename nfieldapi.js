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
    
    // SignIn
    
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
    
    // SurveyFieldwork
    
    /**
     * <p>Request survey fieldwork status</p>
     * <p> Nfield API reference:
     * <ul><li>[GET v1/Surveys/{surveyId}/Fieldwork/Status]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-fieldwork-status}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyFieldwork
     * @method get
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function getSurveyStatus (surveyId, callback) {
      return request({
        method : 'GET',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Status').replace('{surveyId}', surveyId),
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    }
    
    /**
     * <p>Start survey</p>
     * <p> Nfield API reference:
     * <ul><li>[PUT v1/Surveys/{surveyId}/Fieldwork/Start]{@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-start}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyFieldwork
     * @method start
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function startSurvey (surveyId, callback) {
      return request({
        method : 'PUT',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Start').replace('{surveyId}', surveyId),
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    }
    
    /**
     * <p>Stop (pause) survey</p>
     * <p> Nfield API reference:
     * <ul><li>[PUT v1/Surveys/{surveyId}/Fieldwork/Stop]{@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-stop}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyFieldwork
     * @method stop
     * @param {String} surveyId - Survey ID
     * @param {Boolean=} [terminate=false] - Terminate running interviews
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function stopSurvey (surveyId, terminate, callback) {
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
    }
    
    /** 
     * Survey Fieldwork API
     * @namespace SurveyFieldwork
     * @memberof NfieldInstance
     */
    _this.SurveyFieldwork = {
      get : getSurveyStatus,
      start : startSurvey,
      stop : stopSurvey
    };
    
    // DefaultTexts
    
    /**
     * <p>Get specific/all default text(s) for the domain</p>
     * <p>Nfield API reference:
     * <ul><li>[GET v1/DefaultTexts]{@link https://api.nfieldmr.com/help/api/get-v1-defaulttexts}</li>
     * <li>[GET v1/DefaultTexts/{translationKey}]{@link https://api.nfieldmr.com/help/api/get-v1-defaulttexts-translationkey}</li></ul>
     * </p>
     * @memberof NfieldInstance.DefaultTexts
     * @method get
     * @param {String=} translationKey - Translation key
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function getDefaultText (translationKey, callback) {
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
    }
    
    /** 
     * Default Texts API
     * @namespace DefaultTexts
     * @memberof NfieldInstance
     */
    _this.DefaultTexts = {
      get : getDefaultText
    };
    
    // SurveyTranslations
    
    /**
     * <p>Get specific/all translation(s) for a particular survey language</p>
     * <p>Nfield API reference:
     * <ul><li>[GET v1/Surveys/{surveyId}/Languages/{languageId}/Translations]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid-translations}</li>
     * <li>[GET v1/Surveys/{surveyId}/Languages/{languageId}/Translations/{translationKey}]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid-translations-translationkey}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyTranslations
     * @method get
     * @param {String} surveyId - Survey ID
     * @param {Number} languageId - Language ID
     * @param {String=} translationKey - Translation key
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function getTranslation (surveyId, languageId, translationKey, callback) {
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
    }
    
    /**
     * <p>Remove specific translation for a particular survey language</p>
     * <p>Nfield API reference:
     * <ul><li>[DELETE v1/Surveys/{surveyId}/Languages/{languageId}/Translations/{translationKey}]{@link https://api.nfieldmr.com/help/api/delete-v1-surveys-surveyid-languages-languageid-translations-translationkey}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyTranslations
     * @method remove
     * @param {String} surveyId - Survey ID
     * @param {Number} languageId - Language ID
     * @param {String} translationKey - Translation key
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function removeTranslation (surveyId, languageId, translationKey, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages/{languageId}/Translations/{translationKey}'
        .replace('{surveyId}', surveyId)
        .replace('{languageId}', languageId)
        .replace('{translationKey}', translationKey);
      
      return request({
        method : 'DELETE',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
  
    /**
     * <p>Update specific translation for a particular survey language</p>
     * <p>Nfield API reference:
     * <ul><li>[PUT v1/Surveys/{surveyId}/Languages/{languageId}/Translations]{@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-languages-languageid-translations}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyTranslations
     * @method update
     * @param {String} surveyId - Survey ID
     * @param {Number} languageId - Language ID
     * @param {Object} translationParams - Translation Object
     * @param {String} translationParams.Name
     * @param {String} translationParams.Text
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function updateTranslation (surveyId, languageId, translationParams, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages/{languageId}/Translations'
        .replace('{surveyId}', surveyId)
        .replace('{languageId}', languageId);
      
      return request({
        method : 'PUT',
        uri : reqURI,
        json : translationParams,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /**
     * <p>Add translation for a particular survey language</p>
     * <p>Nfield API reference:
     * <ul><li>[POST v1/Surveys/{surveyId}/Languages/{languageId}/Translations]{@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-languages-languageid-translations}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyTranslations
     * @method add
     * @param {String} surveyId - Survey ID
     * @param {Number} languageId - Language ID
     * @param {Object} translationParams - Translation Object
     * @param {String} translationParams.Name
     * @param {String} translationParams.Text
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function addTranslation (surveyId, languageId, translationParams, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages/{languageId}/Translations'
        .replace('{surveyId}', surveyId)
        .replace('{languageId}', languageId);
      
      return request({
        method : 'POST',
        uri : reqURI,
        json : translationParams,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /** 
     * Survey Translations API
     * @namespace SurveyTranslations
     * @memberof NfieldInstance
     */
    _this.SurveyTranslations = {
      get : getTranslation,
      remove : removeTranslation,
      add : addTranslation,
      update : updateTranslation 
    };
    
    // SurveyLanguages
    
    /**
     * <p>Get specific/all languages for a specific survey</p>
     * <p>Nfield API reference:
     * <ul><li>[GET v1/Surveys/{surveyId}/Languages]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages}</li>
     * <li>[GET v1/Surveys/{surveyId}/Languages/{languageId}]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyLanguages
     * @method get
     * @param {String} surveyId - Survey ID
     * @param {Number} languageId - Language ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function getLanguage (surveyId, languageId, callback) {
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
    }
    
    /**
     * <p>Removes specified language from the survey</p>
     * <p>Nfield API reference:
     * <ul><li>[DELETE v1/Surveys/{surveyId}/Languages/{languageId}]{@link https://api.nfieldmr.com/help/api/delete-v1-surveys-surveyid-languages-languageid}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyLanguages
     * @method remove
     * @param {String} surveyId - Survey ID
     * @param {Number} languageId - Language ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function removeLanguage (surveyId, languageId, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages/{languageId}'
        .replace('{surveyId}', surveyId)
        .replace('{languageId}', languageId);
      
      return request({
        method : 'DELETE',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /**
     * <p>Update the name of the specific language in survey</p>
     * <p>Notice, that 'Default' language name could not be updated</p>
     * <p>Nfield API reference:
     * <ul><li>[PUT v1/Surveys/{surveyId}/Languages]{@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-languages}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyLanguages
     * @method update
     * @param {String} surveyId - Survey ID
     * @param {Object} languageParams - Language object
     * @param {Number} languageParams.Id
     * @param {String} languageParams.Name
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function updateLanguage (surveyId, languageParams, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'PUT',
        uri : reqURI,
        json : languageParams,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /**
     * <p>Create new language in specific survey</p>
     * <p>Nfield API reference:
     * <ul><li>[POST v1/Surveys/{surveyId}/Languages]{@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-languages}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveyLanguages
     * @method add
     * @param {String} surveyId - Survey ID
     * @param {String} languageName - Language name
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function addLanguage (surveyId, languageName, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'POST',
        uri : reqURI,
        json : {
          'Name' : languageName
        },
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /** 
     * Survey Languages API
     * @namespace SurveyLanguages
     * @memberof NfieldInstance
     */
    _this.SurveyLanguages = {
      get : getLanguage,
      remove : removeLanguage,
      add : addLanguage,
      update : updateLanguage 
    };
    
    // SurveySettings
    
    /**
     * <p>Get survey settings</p>
     * <p>Nfield API reference:
     * <ul><li>[GET v1/Surveys/{surveyId}/Settings]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-settings}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveySettings
     * @method get
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function getSurveySettings (surveyId, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Settings'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'GET',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /**
     * <p>Update survey settings</p>
     * <p>Settings could be changed one option at a time only, their names are case sensitive</p>
     * <p>Nfield API reference:
     * <ul><li>[POST v1/Surveys/{surveyId}/Settings]{@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-settings}</li></ul>
     * </p>
     * @memberof NfieldInstance.SurveySettings
     * @method update
     * @param {String} surveyId - Survey ID
     * @param {Object} option - Survey option
     * @param {String} option.Name
     * @param {String} option.Value
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function updateSurveySettings (surveyId, option, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Settings'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'POST',
        uri : reqURI,
        json : option,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /** 
     * Survey Settings API
     * @namespace SurveySettings
     * @memberof NfieldInstance
     */
    _this.SurveySettings = {
      get : getSurveySettings,
      update : updateSurveySettings
    };
    
    // SamplingPoints
    
    /**
     * <p>Get specific/all survey sampling point(s)</p>
     * <p>Nfield API reference:
     *   <ul>
     *     <li>[GET v1/Surveys/{surveyId}/SamplingPoints]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-samplingpoints}</li>
     *     <li>[GET v1/Surveys/{surveyId}/SamplingPoints/{samplingPointId}]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-samplingpoints-samplingpointid}</li>
     *   </ul>
     * </p>
     * @memberof NfieldInstance.SamplingPoints
     * @method get
     * @param {String} surveyId - Survey ID
     * @param {String=} samplingPointId - Sampling point ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function getSamplingPoints (surveyId, samplingPointId, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/SamplingPoints'
        .replace('{surveyId}', surveyId);
      
      if (samplingPointId) {
        reqURI += '/' + samplingPointId;
      }
      
      return request({
        method : 'GET',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /**
     * <p>Add new sampling point to survey</p>
     * <p>Nfield API reference:
     *   <ul>
     *     <li>[POST v1/Surveys/{surveyId}/SamplingPoints]{@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-samplingpoints}</li>
     *   </ul>
     * </p>
     * @memberof NfieldInstance.SamplingPoints
     * @method add
     * @param {String} surveyId - Survey ID
     * @param {Object} samplingPoint - Sampling Point
     * @param {String} samplingPoint.SamplingPointId - Sampling point unique identifier
     * @param {String} samplingPoint.Name - Name of the sampling point
     * @param {String} samplingPoint.Description - Desctiption
     * @param {String} samplingPoint.Instruction - Instruction link, this is a link to a pdf blob storage.
     * @param {String} samplingPoint.FieldworkOfficeId - Associcated fieldwork office id.
     * @param {String} samplingPoint.GroupId - Group id
     * @param {String} samplingPoint.Stratum - Stratum the sampling point belongs to
     * @param {String} samplingPoint.Kind - Kind of the sampling point
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function addSamplingPoints (surveyId, samplingPoint, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/SamplingPoints'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'POST',
        uri : reqURI,
        json : samplingPoint,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /**
     * <p>Update existing sampling point in survey</p>
     * <p>You can't update SamplingPointId, Instruction or Kind of existing Sampling Point</p>
     * <p>Nfield API reference:
     *   <ul>
     *     <li>[PATCH v1/Surveys/{surveyId}/SamplingPoints/{samplingPointId}]{@link https://api.nfieldmr.com/help/api/patch-v1-surveys-surveyid-samplingpoints-samplingpointid}</li>
     *   </ul>
     * </p>
     * @memberof NfieldInstance.SamplingPoints
     * @method update
     * @param {String} surveyId - Survey ID
     * @param {Object} samplingPoint - Sampling Point
     * @param {String} samplingPoint.SamplingPointId - Sampling point unique identifier
     * @param {String} samplingPoint.Name - Name of the sampling point
     * @param {String} samplingPoint.Description - Desctiption
     * @param {String} samplingPoint.Instruction - Instruction link, this is a link to a pdf blob storage.
     * @param {String} samplingPoint.FieldworkOfficeId - Associcated fieldwork office id.
     * @param {String} samplingPoint.GroupId - Group id
     * @param {String} samplingPoint.Stratum - Stratum the sampling point belongs to
     * @param {String} samplingPoint.Kind - Kind of the sampling point
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function updateSamplingPoints (surveyId, samplingPoint, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/SamplingPoints/{samplingPointId}'
        .replace('{surveyId}', surveyId)
        .replace('{samplingPointId}', samplingPoint.SamplingPointId);
      
      delete samplingPoint.SamplingPointId;
      delete samplingPoint.Instruction;
      delete samplingPoint.Kind;
      
      return request({
        method : 'PATCH',
        uri : reqURI,
        json : samplingPoint,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /**
     * <p>Remove existing sampling point in survey</p>
     * <p>Nfield API reference:
     *   <ul>
     *     <li>[DELETE v1/Surveys/{surveyId}/SamplingPoints/{samplingPointId}]{@link https://api.nfieldmr.com/help/api/delete-v1-surveys-surveyid-samplingpoints-samplingpointid}</li>
     *   </ul>
     * </p>
     * @memberof NfieldInstance.SamplingPoints
     * @method remove
     * @param {String} surveyId - Survey ID
     * @param {String} samplingPointId - Sampling point unique identifier
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function removeSamplingPoints (surveyId, samplingPointId, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/SamplingPoints/{samplingPointId}'
        .replace('{surveyId}', surveyId)
        .replace('{samplingPointId}', samplingPointId);
      
      return request({
        method : 'DELETE',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /** 
     * Sampling Points API
     * @namespace SamplingPoints
     * @memberof NfieldInstance
     */
    _this.SamplingPoints = {
      get : getSamplingPoints,
      add : addSamplingPoints,
      update : updateSamplingPoints,
      remove : removeSamplingPoints
    };
    
    // SurveyScript
    
    /**
     * <p>Get survey script</p>
     * <p>Nfield API reference:
     *   <ul>
     *     <li>[GET v1/Surveys/{surveyId}/Script]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-script}</li>
     *   </ul>
     * </p>
     * @memberof NfieldInstance.SurveyScript
     * @method get
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function getSurveyScript (surveyId, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Script'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'GET',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /**
     * <p>Set/update survey script</p>
     * <p>Nfield API reference:
     *   <ul>
     *     <li>[POST v1/Surveys/{surveyId}/Script]{@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-script}</li>
     *   </ul>
     * </p>
     * @memberof NfieldInstance.SurveyScript
     * @method update
     * @param {String} surveyId - Survey ID
     * @param {Object} scriptObj - The (odin) script for the survey
     * @param {String} scriptObj.Script - Odin script
     * @param {String} scriptObj.FileName - File name for script file
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function updateSurveyScript (surveyId, scriptObj, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Script'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'POST',
        uri : reqURI,
        json : scriptObj,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /** 
     * Survey Script API
     * @namespace SurveyScript
     * @memberof NfieldInstance
     */
    _this.SurveyScript = {
      get : getSurveyScript,
      update : updateSurveyScript
    };
    
    // SurveyData
    
    /**
     * <p>Request data download for survey</p>
     * <p>Although all booleans are marked as optional, at leat one data type <b>and</b> file type must have 'true' value</p>
     * <p>Nfield API reference:
     *   <ul>
     *     <li>[POST v1/Surveys/{surveyId}/Data]{@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-data}</li>
     *   </ul>
     * </p>
     * @memberof NfieldInstance.SurveyData
     * @method request
     * @param {String} surveyId - Survey ID
     * @param {Object} options - Download parameters
     * @param {String} options.SurveyId
     * @param {Boolean=} options.DownloadTestInterviewData
     * @param {Boolean=} options.DownloadSuccessfulLiveInterviewData
     * @param {Boolean=} options.DownloadRejectedLiveInterviewData
     * @param {Boolean=} options.DownloadNotSuccessfulLiveInterviewData
     * @param {Boolean=} options.DownloadSuspendedLiveInterviewData
     * @param {Boolean=} options.DownloadParaData
     * @param {Boolean=} options.DownloadCapturedMedia
     * @param {Boolean=} options.DownloadClosedAnswerData
     * @param {Boolean=} options.DownloadOpenAnswerData
     * @param {String} options.DownloadFileName
     * @param {String=} options.StartDate
     * @param {String=} options.EndDate
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function requestSurveyData (surveyId, options, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Data'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'POST',
        uri : reqURI,
        json : options,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /** 
     * Survey Data API
     * @namespace SurveyData
     * @memberof NfieldInstance
     */
    _this.SurveyData = {
      request : requestSurveyData
    };
    
    // SurveyPublish
    
    /**
     * <p>Get publish state of survey</p>
     * <p>Nfield API reference:
     *   <ul>
     *     <li>[GET v1/Surveys/{surveyId}/Publish]{@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-publish}</li>
     *   </ul>
     * </p>
     * @memberof NfieldInstance.SurveyScript
     * @method get
     * @param {String} surveyId - Survey ID
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function getSurveyPublish (surveyId, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Publish'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'GET',
        uri : reqURI,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /**
     * <p>Publish survey</p>
     * <p>Nfield API reference:
     *   <ul>
     *     <li>[PUT v1/Surveys/{surveyId}/Publish]{@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-publish}</li>
     *   </ul>
     * </p>
     * @memberof NfieldInstance.SurveyScript
     * @method publish
     * @param {String} surveyId - Survey ID
     * @param {Object} publishParams - Publish parameters
     * @param {Number} publishParams.PackageType - Interview package type (1 - Live, 2 - Test)
     * @param {Number} publishParams.ForceUpgrade - Force Upgrade option (0 - false, 1 - true) <i>There is no explanation what this option does on Nfiled API documentation page, but their manager website always publishes with this option turned off with no way to turn it on</i>
     * @param {responseCallback=} callback - Optional node-style callback
     * @returns {Promise} Returns a promise of the request
     */
    function publishSurveyPublish (surveyId, publishParams, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Publish'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'PUT',
        uri : reqURI,
        json : publishParams,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    /** 
     * Survey Publish API
     * @namespace SurveyPublish
     * @memberof NfieldInstance
     */
    _this.SurveyPublish = {
      get : getSurveyPublish,
      publish : publishSurveyPublish
    };
    
    // Connect to API
    
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

/**
 * Token update error callback
 * @memberof NfieldInstance
 * @callback persistantErrorCallback
 * @param {Array} error - Request response array
 */
 
/**
 * Response callback
 * @memberof NfieldInstance
 * @callback responseCallback
 * @param {Array} err
 * @param {Array} resp
 */