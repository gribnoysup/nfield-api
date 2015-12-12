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
 * Return Nfield survey status
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
 * Start Nfield survey
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
 * Stop Nfield survey
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

/**
 * Retrieve an array of Default Texts (or a specific Default Text) for domain
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-defaulttexts}
 * {@link https://api.nfieldmr.com/help/api/get-v1-defaulttexts-translationkey}
 */
function getDefaultTexts (defOptions, credentials, token, translationKey, callback) {
  var options;
  
  translationKey = translationKey || '';
  
  if (typeof translationKey === 'function') {
    callback = translationKey;
    translationKey = '';
  }
  
  options = {
    method : 'GET',
    uri : `v1/DefaultTexts/${translationKey}`,
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Retrieve an array of Survey Translations (or a specific Survey Translation) for specific language in survey
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid-translations}
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid-translations-translationkey}
 */
function getSurveyTranslations (defOptions, credentials, token, requestParams, callback) {
  var options;
  
  requestParams.TranslationKey = requestParams.TranslationKey || '';
  
  options = {
    method : 'GET',
    uri : `v1/Surveys/${requestParams.SurveyId}/Languages/${requestParams.LanguageId}/Translations/${requestParams.TranslationKey}`,
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Add new translation
 * 
 * {@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-languages-languageid-translations}
 */
function addSurveyTranslations (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'POST',
    uri : `v1/Surveys/${requestParams.SurveyId}/Languages/${requestParams.LanguageId}/Translations`,
    json : {
      'Name' : requestParams.Name,
      'Text' : requestParams.Text
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Update existing translation
 * 
 * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-languages-languageid-translations}
 */
function updateSurveyTranslations (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'PUT',
    uri : `v1/Surveys/${requestParams.SurveyId}/Languages/${requestParams.LanguageId}/Translations`,
    json : {
      'Name' : requestParams.Name,
      'Text' : requestParams.Text
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Remove existing translation
 * 
 * {@link https://api.nfieldmr.com/help/api/delete-v1-surveys-surveyid-languages-languageid-translations-translationkey}
 */
function removeSurveyTranslations (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'DELETE',
    uri : `v1/Surveys/${requestParams.SurveyId}/Languages/${requestParams.LanguageId}/Translations/${requestParams.TranslationKey}`,
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Retrieve an array of languages (or a specific language) for survey
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages}
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid}
 */
function getSurveyLanguages (defOptions, credentials, token, requestParams, callback) {
  var options;
  
  requestParams.LanguageId = requestParams.LanguageId || '';
  
  options = {
    method : 'GET',
    uri : `v1/Surveys/${requestParams.SurveyId}/Languages/${requestParams.LanguageId}`,
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Add new language to survey
 * 
 * {@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-languages}
 */
function addSurveyLanguages (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'POST',
    uri : `v1/Surveys/${requestParams.SurveyId}/Languages`,
    json : {
      'Name' : requestParams.Name
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Update existing language
 * 
 * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-languages}
 */
function updateSurveyLanguages (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'PUT',
    uri : `v1/Surveys/${requestParams.SurveyId}/Languages`,
    json : {
      'Id' : requestParams.Id,
      'Name' : requestParams.Name
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Remove existing language
 * 
 * {@link https://api.nfieldmr.com/help/api/delete-v1-surveys-surveyid-languages-languageid}
 */
function removeSurveyLanguages (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'DELETE',
    uri : `v1/Surveys/${requestParams.SurveyId}/Languages/${requestParams.LanguageId}`,
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Retrieve survey settings
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-settings}
 */
function getSurveySettings (defOptions, credentials, token, surveyId, callback) {
  var options = {
    method : 'GET',
    uri : `v1/Surveys/${surveyId}/Settings`
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Update specific survey setting
 * 
 * {@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-settings}
 */
function updateSurveySettings (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'POST',
    uri : `v1/Surveys/${requestParams.SurveyId}/Settings`,
    json : {
      'Name' : requestParams.Name,
      'Value' : requestParams.Value
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Retrieve survey script
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-script}
 */
function getSurveyScript (defOptions, credentials, token, surveyId, callback) {
  var options = {
    method : 'GET',
    uri : `v1/Surveys/${surveyId}/Script`
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Update survey script
 * 
 * {@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-script}
 */
function updateSurveyScript (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'POST',
    uri : `v1/Surveys/${requestParams.SurveyId}/Script`,
    json : {
      'FileName' : requestParams.FileName,
      'Script' : requestParams.Script
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Post a request for survey data download link
 * 
 * {@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-data}
 */
function requestSurveyData (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'POST',
    uri : `v1/Surveys/${requestParams.SurveyId}/Data`,
    json : requestParams
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

module.exports = {
  signIn : signIn,
  getSurveyStatus : getSurveyStatus,
  startSurvey : startSurvey,
  stopSurvey : stopSurvey,
  getDefaultTexts : getDefaultTexts,
  getSurveyTranslations : getSurveyTranslations,
  addSurveyTranslations : addSurveyTranslations,
  updateSurveyTranslations : updateSurveyTranslations,
  removeSurveyTranslations : removeSurveyTranslations,
  getSurveyLanguages : getSurveyLanguages,
  addSurveyLanguages : addSurveyLanguages,
  updateSurveyLanguages : updateSurveyLanguages,
  removeSurveyLanguages : removeSurveyLanguages,
  getSurveySettings : getSurveySettings,
  updateSurveySettings : updateSurveySettings,
  getSurveyScript : getSurveyScript,
  updateSurveyScript : updateSurveyScript,
  requestSurveyData : requestSurveyData
};
