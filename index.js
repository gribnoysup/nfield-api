"use strict";

var API = require('./api.js');
var extend = require('extend');

/**
 * Creates an instance of object, connected to Nfield API
 * @constructor
 */
function ConnectedInstance (requestOptions, authToken, credentials) {
  this.__REQUEST_OPTIONS = requestOptions;
  this.__TOKEN = authToken;
  this.__CREDENTIALS = credentials;
  
  this.SurveyFieldwork = {
    status : API.getSurveyStatus.bind(this, this.__REQUEST_OPTIONS, this.__CREDENTIALS, this.__TOKEN),
    start : API.startSurvey.bind(this, this.__REQUEST_OPTIONS, this.__CREDENTIALS, this.__TOKEN),
    stop : API.stopSurvey.bind(this, this.__REQUEST_OPTIONS, this.__CREDENTIALS, this.__TOKEN)
  };
  
  this.DefaultTexts = {
    get : API.getDefaultTexts.bind(this, this.__REQUEST_OPTIONS, this.__CREDENTIALS, this.__TOKEN)
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
   * Returns a new instance of NfieldClient with new request parameters
   */
  this.defaults = function defaults (options) {
    if (typeof options !== 'object') throw new Error('`options` must be an object with request parameters');
    return new NfieldClient(options);
  };
  
  /**
   * Connects NfieldClient to API
   * Returns ConnectedInstance
   */
  this.connect = function connect (credentials, callback) {
    if (typeof credentials === 'undefined' || typeof credentials === 'function') throw new Error('not all required parameters provided: no `credentials`');
    if (!credentials.Domain || !credentials.Username || !credentials.Password) throw new Error('not all required parameters provided: no `Domain` or `Username` or `Password`');
    
    var token = {};
    var promise = API.signIn(defaultRequestCliOptions, credentials).then(function (data) {
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
  NfieldClient : new NfieldClient()
};