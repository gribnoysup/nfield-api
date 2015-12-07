"use strict";

var Promise = require('bluebird');
var extend = require('extend');
var request = Promise.promisify(require('request'));
var tokenUpdateTime = 12 * 60 * 1000;

/**
 * Wrapper function for all Nfield API requests that checks if API token is not outdated, and refreshes it otherwise
 */
function requestWithTokenCheck (defOptions, credentials, token, options, callback) {
  var returnedPromise;
  var chainedPromise;
  
  extend(true, options, defOptions);
  chainedPromise = request(options);
  
  if (Date.now() - token.Timestamp > tokenUpdateTime) {
    returnedPromise = SignIn(defOptions, credentials).then(function (data) {
      if (data[0].statusCode !== 200) {
        throw new Error(`${data[0].statusCode}: ${data[0].body.Message}`);
      } else {
        token.AuthenticationToken = data[0].body.AuthenticationToken;
        token.Timestamp = Date.now();
        return chainedPromise;
      }
    });
  } else {
    returnedPromise = chainedPromise;
  }
  
  returnedPromise.nodeify(callback);
  return returnedPromise;
}

/**
 * SignIn to Nfield API
 */
function SignIn (defOptions, credentials, callback) {
  var options = {
    method : 'POST',
    uri : 'v1/SignIn',
    json : credentials
  };
  
  extend(true, options, defOptions);
  return request(options).nodeify(callback);
}

/**
 * Returns Nfield survey status
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-fieldwork-status}
 */
function getSurveyStatus (defOptions, credentials, token, surveyId, callback) {
  var options = {
    method : 'GET',
    uri : `v1/Surveys/${surveyId}/Fieldwork/Status`,
    headers : {
      'Authorization' : `Basic ${token.AuthenticationToken}`
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}


/**
 * Starts Nfield survey
 * 
 * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-start}
 */
function startSurvey (defOptions, credentials, token, surveyId, callback) {
  var options = {
    method : 'PUT',
    uri : `v1/Surveys/${surveyId}/Fieldwork/Start`,
    headers : {
      'Authorization' : `Basic ${token.AuthenticationToken}`
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Stops Nfield survey
 * 
 * Has a 'magical' parameter called TerminateRunningInterviews, that never explained in any part of Nfield API documentation
 * and doesn't seem to affect anything when changed, but present here for the sake of making requests as close to API docs as possible (defaults to 'false')
 * 
 * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-fieldwork-stop}
 */
function stopSurvey (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'PUT',
    uri : `v1/Surveys/${requestParams.SurveyId}/Fieldwork/Stop`,
    json : {
      'TerminateRunningInterviews' : requestParams.TerminateRunningInterviews || false
    },
    headers : {
      'Authorization' : `Basic ${token.AuthenticationToken}`
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Creates an instance of object, connected to Nfield API
 */
function ConnectedInstance (requestOptions, authToken, credentials) {
  this.__REQUEST_OPTIONS = requestOptions;
  this.__TOKEN = authToken;
  this.__CREDENTIALS = credentials;
  
  this.SurveyFieldwork = {
    status : getSurveyStatus.bind(this, this.__REQUEST_OPTIONS, this.__CREDENTIALS, this.__TOKEN),
    start : startSurvey.bind(this, this.__REQUEST_OPTIONS, this.__CREDENTIALS, this.__TOKEN),
    stop : stopSurvey.bind(this, this.__REQUEST_OPTIONS, this.__CREDENTIALS, this.__TOKEN)
  };
}

/**
 * Creates NfieldClient object
 * @constructor NfieldClient
 */
function NfieldCliConstructor (defOptions) {
  
  var defaultRequestCliOptions = {
    baseUrl : 'https://api.nfieldmr.com/',
    headers : {
      'Content-Type' : 'application/json'
    }
  };
  
  extend(true, defaultRequestCliOptions, defOptions);
  
  /**
   * Returns a new instance of NfieldClient with new request parameters
   */
  this.defaults = function defaults (options) {
    if (typeof options !== 'object') throw new Error('`options` must be an object with request parameters');
    return new NfieldCliConstructor(options);
  };
  
  /**
   * Connects NfieldClient to API
   * Returns ConnectedInstance
   */
  this.connect = function connect (credentials, callback) {
    if (typeof credentials === 'undefined' || typeof credentials === 'function') throw new Error('not all required parameters provided: no `credentials`');
    if (!credentials.Domain || !credentials.Username || !credentials.Password) throw new Error('not all required parameters provided: no `Domain` or `Username` or `Password`');
    
    var token = {};
    var promise = SignIn(defaultRequestCliOptions, credentials).then(function (data) {
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
  NfieldClient : new NfieldCliConstructor()
};