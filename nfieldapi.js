"use strict";

var Promise = require('bluebird');
var extend = require('extend');
var request = Promise.promisify(require('request'));
var tokenUpdateTime = 12 * 60 * 1000;

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
 * Creates an instance of object, connected to Nfield API
 */
function ConnectedInstance (requestOptions, authToken, credentials) {
  this.__REQUEST_OPTIONS = requestOptions;
  this.__TOKEN = authToken;
  this.__CREDENTIALS = credentials;
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
  
}

module.exports = {
  NfieldClient : new NfieldCliConstructor()
};