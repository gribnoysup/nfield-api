"use strict";

var Promise = require('bluebird');
var extend = require('extend');
var request = Promise.promisify(require('request'));
var tokenUpdateTime = 12 * 60 * 1000;

/**
 * SignIn to Nfield API
 */
function signIn (defOptions, credentials, callback) {
  var options = {
    method : 'POST',
    uri : 'v1/SignIn',
    json : credentials
  };
  
  extend(true, options, defOptions);
  return request(options).nodeify(callback);
}

/**
 * Wrapper function for all Nfield API requests that checks if API token is not outdated, and refreshes it otherwise
 */
function requestWithTokenCheck (defOptions, credentials, token, options, callback) {
  var returnedPromise;
  
  options.headers = options.headers || {};
  extend(true, options, defOptions);
  
  if (Date.now() - token.Timestamp > tokenUpdateTime) {
    returnedPromise = signIn(defOptions, credentials).then(function (data) {
      if (data[0].statusCode !== 200) {
        throw new Error(`${data[0].statusCode}: ${data[0].body.Message}`);
      } else {
        token.AuthenticationToken = data[0].body.AuthenticationToken;
        token.Timestamp = Date.now();
        options.headers.Authorization = `Basic ${token.AuthenticationToken}`;
        return request(options);
      }
    });
  } else {
    options.headers.Authorization = `Basic ${token.AuthenticationToken}`;
    returnedPromise = request(options);
  }
  
  returnedPromise.nodeify(callback);
  return returnedPromise;
}

/**
 * Returns Nfield survey status
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-fieldwork-status}
 */
function getSurveyStatus (defOptions, credentials, token, surveyId, callback) {
  var options = {
    method : 'GET',
    uri : `v1/Surveys/${surveyId}/Fieldwork/Status`
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
    uri : `v1/Surveys/${surveyId}/Fieldwork/Start`
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
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

module.exports = {
  signIn : signIn,
  getSurveyStatus : getSurveyStatus,
  startSurvey : startSurvey,
  stopSurvey : stopSurvey
};