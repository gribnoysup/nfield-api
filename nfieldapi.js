"use strict";

var Promise = require('bluebird');
var extend = require('extend');
var request = Promise.promisify(require('request'));
var tokenUpdateTime = 12 * 60 * 1000;

/**
 * Creates NfieldClient object
 * @constructor NfieldClient
 */
function NfieldCliConstructor () {
  
  var defaultRequestCliOptions = {
    baseUrl : 'https://api.nfieldmr.com/',
    headers : {
      'Content-Type' : 'application/json'
    }
  };
  
}

module.exports = {
  NfieldClient : new NfieldCliConstructor()
};