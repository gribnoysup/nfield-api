"use strict";

var API = require('./api.js');
var nfieldDefaults = require('./defaults.json');
var extend = require('extend');

/**
 * A little wrapper for easy binding API functions to ConnectedInstance
 */
function bindAPI (self, api, fnName) {
  return api[fnName].bind(self, self.__REQUEST_OPTIONS, self.__CREDENTIALS, self.__TOKEN);
}

/**
 * Creates an instance of object, connected to Nfield API
 * @constructor
 */
function ConnectedInstance (requestOptions, authToken, credentials) {
  this.__REQUEST_OPTIONS = requestOptions;
  this.__TOKEN = authToken;
  this.__CREDENTIALS = credentials;
  
  this.SurveyFieldwork = {
    status : bindAPI(this, API, 'statusSurveyFieldwork'),
    start : bindAPI(this, API, 'startSurveyFieldwork'),
    stop : bindAPI(this, API, 'stopSurveyFieldwork')
  };
  
  this.DefaultTexts = {
    get : bindAPI(this, API, 'getDefaultTexts')
  };
  
  this.SurveyTranslations = {
    get : bindAPI(this, API, 'getSurveyTranslations'),
    add : bindAPI(this, API, 'addSurveyTranslations'),
    update : bindAPI(this, API, 'updateSurveyTranslations'),
    remove : bindAPI(this, API, 'removeSurveyTranslations')
  };
  
  this.SurveyLanguages = {
    get : bindAPI(this, API, 'getSurveyLanguages'),
    add : bindAPI(this, API, 'addSurveyLanguages'),
    update : bindAPI(this, API, 'updateSurveyLanguages'),
    remove : bindAPI(this, API, 'removeSurveyLanguages')
  };
  
  this.SurveySettings = {
    get : bindAPI(this, API, 'getSurveySettings'),
    update : bindAPI(this, API, 'updateSurveySettings')
  };
  
  this.SurveyScript = {
    get : bindAPI(this, API, 'getSurveyScript'),
    update : bindAPI(this, API, 'updateSurveyScript')
  };
  
  this.SurveyData = {
    request : bindAPI(this, API, 'requestSurveyData')
  };
  
  this.Surveys = {
    get : bindAPI(this, API, 'getSurveys'),
    add : bindAPI(this, API, 'addSurveys'),
    update : bindAPI(this, API, 'updateSurveys'),
    remove : bindAPI(this, API, 'removeSurveys')
  };
  
  this.SurveyPublish = {
    get : bindAPI(this, API, 'getSurveyPublish'),
    update : bindAPI(this, API, 'updateSurveyPublish')
  };
  
  this.BackgroundTasks = {
    get : bindAPI(this, API, 'getBackgroundTasks')
  };
  
  this.InterviewQuality = {
    get : bindAPI(this, API, 'getInterviewQuality'),
    update : bindAPI(this, API, 'updateInterviewQuality')
  };
  
}

/**
 * Creates NfieldClient object
 * @constructor
 */
function NfieldClient (defOptions) {
  
  var defaultRequestCliOptions = {
    baseUrl : 'https://api.nfieldmr.com/'
  };
  
  extend(true, defaultRequestCliOptions, defOptions);
  
  /**
   * Sign In api method provided strait with NfieldCliend instance because it doesn't need authentication
   */
  this.SignIn = API.signIn.bind(null, defaultRequestCliOptions);
  
  /**
   * Returns a new instance of NfieldClient with new request parameters
   */
  this.defaults = function defaults (options) {
    if (typeof options !== 'object') throw new TypeError('`options` must be an object with request parameters');
    return new NfieldClient(options);
  };
  
  /**
   * Connects NfieldClient to API
   * Returns ConnectedInstance
   */
  this.connect = function connect (credentials, callback) {
    
    var token = {};
    var promise;
    
    if (typeof credentials === 'function') callback = credentials;
    
    promise = API.signIn(defaultRequestCliOptions, credentials).then(function (data) {
      if (data[0].statusCode !== 200) {
        throw new Error(`${data[0].statusCode}: ${data[0].body.Message}`);
      } else {
        token = {
          AuthenticationToken : data[0].body.AuthenticationToken,
          Timestamp : Date.now()
        };
        return new ConnectedInstance(defaultRequestCliOptions, token, credentials);
      }
    }).nodeify(callback);
    
    return promise;
  };
  
}

module.exports = {
  NfieldClient : new NfieldClient(),
  DEFAULTS : nfieldDefaults
};
