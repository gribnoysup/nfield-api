"use strict";

var Promise = require('bluebird');
var extend = require('extend');
var defaults = require('./defaults.json');

var request = Promise.promisify(require('request'));
var tokenUpdateTime = 12 * 60 * 1000;

/**
 * Check if specific required request parameter is valid
 */
function checkRequiredParameter (param) {
  return (
    typeof param === 'function' || typeof param === 'undefined' || param === '' || param === null || (typeof param === 'number' && isNaN(param))
  );
}

/**
 * Return a promise with normalized request parameters or an error
 */
function normalizeRequestParameters (defaultsObject, paramsName, requestParams) {
  var promise = new Promise(function (resolve, reject) {
    var defaultParams;
  
    if (typeof defaultsObject[paramsName] !== 'object') reject(new Error(`No default parameters for '${paramsName}'`));
    if (typeof requestParams !== 'object') reject(new Error('No request parameters provided'));
    
    defaultParams = extend(Object.create(null), defaultsObject[paramsName]);
    
    for (var key in defaultParams) {
      if (typeof requestParams[key] !== 'undefined') defaultParams[key] = requestParams[key];
      if (checkRequiredParameter(defaultParams[key])) reject(new Error(`Missing required parameter '${key}'`));
      if (defaultParams[key] === '__optional') defaultParams[key] = '';
    }
    
    resolve(defaultParams);
    
  });
  
  return promise;
}

/**
 * Sign in to Nfield API
 * 
 * {@link https://api.nfieldmr.com/help/api/post-v1-signin}
 */
function signIn (defOptions, credentials, callback) {
  var promise = normalizeRequestParameters(defaults, 'SignIn', credentials).then(function (credentials) {

    var options = {
      method : 'POST',
      uri : 'v1/SignIn',
      json : credentials
    };
    
    extend(true, options, defOptions);
    
    return options;
    
  }).then(request).nodeify(callback);
  
  return promise;
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
function statusSurveyFieldwork (defOptions, credentials, token, surveyId, callback) {
  
  if (typeof surveyId === 'function') callback = surveyId;
  if (checkRequiredParameter(surveyId)) return Promise.reject(new Error(`Missing required parameter 'SurveyId'`)).nodeify(callback);
  
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
function startSurveyFieldwork (defOptions, credentials, token, surveyId, callback) {
  
  if (typeof surveyId === 'function') callback = surveyId;
  if (checkRequiredParameter(surveyId)) return Promise.reject(Error(`Missing required parameter 'SurveyId'`)).nodeify(callback);
  
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
function stopSurveyFieldwork (defOptions, credentials, token, requestParams, callback) {
  
  var promise = normalizeRequestParameters(defaults, 'StopSurveyFieldwork', requestParams).then(function (params) {
    
    var options = {
      method : 'PUT',
      uri : `v1/Surveys/${params.SurveyId}/Fieldwork/Stop`,
      json : params
    };
    
    return options;
  
  }).then(options => requestWithTokenCheck(defOptions, credentials, token, options)).nodeify(callback);
  
  return promise;
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
  
  var promise = normalizeRequestParameters(defaults, 'GetSurveyTranslations', requestParams).then(function (params) {
    
    var options = {
      method : 'GET',
      uri : `v1/Surveys/${params.SurveyId}/Languages/${params.LanguageId}/Translations/${params.TranslationKey}`,
    };
    
    return options;
  
  }).then(options => requestWithTokenCheck(defOptions, credentials, token, options)).nodeify(callback);
  
  return promise;
}

/**
 * Add new translation
 * 
 * {@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-languages-languageid-translations}
 */
function addSurveyTranslations (defOptions, credentials, token, requestParams, callback) {
  
  var promise = normalizeRequestParameters(defaults, 'AddSurveyTranslations', requestParams).then(function (params) {
  
    var options = {
      method : 'POST',
      uri : `v1/Surveys/${params.SurveyId}/Languages/${params.LanguageId}/Translations`,
      json : params
    };
    
    return options;
  
  }).then(options => requestWithTokenCheck(defOptions, credentials, token, options)).nodeify(callback);
  
  return promise;
}

/**
 * Update existing translation
 * 
 * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-languages-languageid-translations}
 */
function updateSurveyTranslations (defOptions, credentials, token, requestParams, callback) {
  
  var promise = normalizeRequestParameters(defaults, 'UpdateSurveyTranslations', requestParams).then(function (params) {
  
    var options = {
      method : 'PUT',
      uri : `v1/Surveys/${params.SurveyId}/Languages/${params.LanguageId}/Translations`,
      json : params
    };
    
    return options;
  
  }).then(options => requestWithTokenCheck(defOptions, credentials, token, options)).nodeify(callback);
  
  return promise;
}

/**
 * Remove existing translation
 * 
 * {@link https://api.nfieldmr.com/help/api/delete-v1-surveys-surveyid-languages-languageid-translations-translationkey}
 */
function removeSurveyTranslations (defOptions, credentials, token, requestParams, callback) {
  
  var promise = normalizeRequestParameters(defaults, 'RemoveSurveyTranslations', requestParams).then(function (params) {
    
    var options = {
      method : 'DELETE',
      uri : `v1/Surveys/${params.SurveyId}/Languages/${params.LanguageId}/Translations/${params.TranslationKey}`,
    };
    
    return options;
    
  }).then(options => requestWithTokenCheck(defOptions, credentials, token, options)).nodeify(callback);
  
  return promise;
}

/**
 * Retrieve an array of languages (or a specific language) for survey
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages}
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-languages-languageid}
 */
function getSurveyLanguages (defOptions, credentials, token, requestParams, callback) {
  
  var promise = normalizeRequestParameters(defaults, 'GetSurveyLanguages', requestParams).then(function (params) {
    
    var options = {
      method : 'GET',
      uri : `v1/Surveys/${params.SurveyId}/Languages/${params.LanguageId}`,
    };
    
    return options;
  
  }).then(options => requestWithTokenCheck(defOptions, credentials, token, options)).nodeify(callback);
  
  return promise;
}

/**
 * Add new language to survey
 * 
 * {@link https://api.nfieldmr.com/help/api/post-v1-surveys-surveyid-languages}
 */
function addSurveyLanguages (defOptions, credentials, token, requestParams, callback) {
  
  var promise = normalizeRequestParameters(defaults, 'AddSurveyLanguages', requestParams).then(function (params) {
  
    var options = {
      method : 'POST',
      uri : `v1/Surveys/${params.SurveyId}/Languages`,
      json : params
    };
    
    return options;
  
  }).then(options => requestWithTokenCheck(defOptions, credentials, token, options)).nodeify(callback);
  
  return promise;
}

/**
 * Update existing language
 * 
 * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-languages}
 */
function updateSurveyLanguages (defOptions, credentials, token, requestParams, callback) {
  
  var promise = normalizeRequestParameters(defaults, 'UpdateSurveyLanguages', requestParams).then(function (params) {
  
    var options = {
      method : 'PUT',
      uri : `v1/Surveys/${params.SurveyId}/Languages`,
      json : params
    };
    
    return options;
  
  }).then(options => requestWithTokenCheck(defOptions, credentials, token, options)).nodeify(callback);
  
  return promise;
}

/**
 * Remove existing language
 * 
 * {@link https://api.nfieldmr.com/help/api/delete-v1-surveys-surveyid-languages-languageid}
 */
function removeSurveyLanguages (defOptions, credentials, token, requestParams, callback) {
    
  var promise = normalizeRequestParameters(defaults, 'RemoveSurveyLanguages', requestParams).then(function (params) {
    
    var options = {
      method : 'DELETE',
      uri : `v1/Surveys/${params.SurveyId}/Languages/${params.LanguageId}`,
    };
    
    return options;
  
  }).then(options => requestWithTokenCheck(defOptions, credentials, token, options)).nodeify(callback);
  
  return promise;
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

/**
 * Retrieve an array of surveys (or a specific survey) for domain
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys}
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid}
 */
function getSurveys (defOptions, credentials, token, surveyId, callback) {
  var options;
  
  surveyId = surveyId || '';
  
  if (typeof surveyId === 'function') {
    callback = surveyId;
    surveyId = '';
  }
  
  options = {
    method : 'GET',
    uri : `v1/Surveys/${surveyId}`,
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Add new survey to domain
 * 
 * {@link https://api.nfieldmr.com/help/api/post-v1-surveys}
 */
function addSurveys (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'POST',
    uri : `v1/Surveys`,
    json : requestParams
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Update survey
 * 
 * {@link https://api.nfieldmr.com/help/api/patch-v1-surveys-surveyid}
 */
function updateSurveys (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'PATCH',
    uri : `v1/Surveys/${requestParams.SurveyId}`
  };
  
  delete requestParams.SurveyId;
  options.json = requestParams;
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Remove survey
 * 
 * {@link https://api.nfieldmr.com/help/api/delete-v1-surveys-surveyid}
 */
function removeSurveys (defOptions, credentials, token, surveyId, callback) {
  var options = {
    method : 'DELETE',
    uri : `v1/Surveys/${surveyId}`
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Get survey publish state
 * 
 * {@link https://api.nfieldmr.com/help/api/get-v1-surveys-surveyid-publish}
 */
function getSurveyPublish (defOptions, credentials, token, surveyId, callback) {
  var options = {
    method : 'GET',
    uri : `v1/Surveys/${surveyId}/Publish`
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

/**
 * Update survey publish state
 * `ForceUpgrade` parameter is never explained anywhere in Nfield API docs, but set to 0 in their manager and can't be changed
 * 
 * {@link https://api.nfieldmr.com/help/api/put-v1-surveys-surveyid-publish}
 */
function updateSurveyPublish (defOptions, credentials, token, requestParams, callback) {
  var options = {
    method : 'PUT',
    uri : `v1/Surveys/${requestParams.SurveyId}/Publish`,
    json : {
      'PackageType' : requestParams.PackageType,
      'ForceUpgrade' : requestParams.ForceUpgrade
    }
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback); 
}

function getBackgroundTasks (defOptions, credentials, token, taskId, callback) {
  var options;
  
  taskId = taskId || '';
  
  if (typeof taskId === 'function') {
    callback = taskId;
    taskId = '';
  }
  
  options = {
    method : 'GET',
    uri : `v1/BackgroundTasks/${taskId}`
  };
  
  return requestWithTokenCheck(defOptions, credentials, token, options, callback);
}

module.exports = {
  signIn : signIn,
  statusSurveyFieldwork : statusSurveyFieldwork,
  startSurveyFieldwork : startSurveyFieldwork,
  stopSurveyFieldwork : stopSurveyFieldwork,
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
  requestSurveyData : requestSurveyData,
  getSurveys : getSurveys,
  addSurveys : addSurveys,
  updateSurveys : updateSurveys,
  removeSurveys : removeSurveys,
  getSurveyPublish : getSurveyPublish,
  updateSurveyPublish : updateSurveyPublish,
  getBackgroundTasks : getBackgroundTasks
};
