module.exports = (function Nfield () {
  
  var Promise = require('bluebird');
  
  var nfieldInstance;

  function NfieldInstance (nfieldParams, requestParams) {
    
    var _this = this;
    var request;
    var token = { 'AuthenticationToken' : '', 'Timestamp' : 0 };
    var connectInterval;
    var nfieldOptions = nfieldParams || {};
    var requestOptions = requestParams || {};
    
    _this.configure = function configure (nfieldParams, requestParams) {
      nfieldOptions = nfieldParams || nfieldOptions;
      requestOptions = requestParams || requestOptions;
      requestOptions.baseUrl = nfieldOptions.server || 'https://api.nfieldmr.com/';
      request = Promise.promisify(require('request').defaults(requestOptions));
    };
    
    // SignIn
    
    _this.signIn = function signIn (credentials, callback) {
      return request({
        method : 'POST',
        uri : 'v1/SignIn',
        json : credentials
      }).nodeify(callback);
    };
    
    // SurveyFieldwork
    
    function getSurveyStatus (surveyId, callback) {
      return request({
        method : 'GET',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Status').replace('{surveyId}', surveyId),
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    }
    
    function startSurvey (surveyId, callback) {
      return request({
        method : 'PUT',
        uri : ('v1/Surveys/{surveyId}/Fieldwork/Start').replace('{surveyId}', surveyId),
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
  			}
      }).nodeify(callback);
    }
    
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
    
    _this.SurveyFieldwork = {
      get : getSurveyStatus,
      start : startSurvey,
      stop : stopSurvey
    };
    
    // DefaultTexts
    
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
    
    _this.DefaultTexts = {
      get : getDefaultText
    };
    
    // SurveyTranslations
    
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
  
    function updateTranslation (surveyId, languageId, translation, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages/{languageId}/Translations'
        .replace('{surveyId}', surveyId)
        .replace('{languageId}', languageId);
      
      return request({
        method : 'PUT',
        uri : reqURI,
        json : translation,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    function addTranslation (surveyId, languageId, translation, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages/{languageId}/Translations'
        .replace('{surveyId}', surveyId)
        .replace('{languageId}', languageId);
      
      return request({
        method : 'POST',
        uri : reqURI,
        json : translation,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    _this.SurveyTranslations = {
      get : getTranslation,
      remove : removeTranslation,
      add : addTranslation,
      update : updateTranslation 
    };
    
    // SurveyLanguages
    
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
    
    function updateLanguage (surveyId, language, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Languages'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'PUT',
        uri : reqURI,
        json : language,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
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
    
    _this.SurveyLanguages = {
      get : getLanguage,
      remove : removeLanguage,
      add : addLanguage,
      update : updateLanguage 
    };
    
    // SurveySettings
    
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
    
    _this.SurveySettings = {
      get : getSurveySettings,
      update : updateSurveySettings
    };
    
    // SamplingPoints
    
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
    
    _this.SamplingPoints = {
      get : getSamplingPoints,
      add : addSamplingPoints,
      update : updateSamplingPoints,
      remove : removeSamplingPoints
    };
    
    // SurveyScript
    
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
    
    function updateSurveyScript (surveyId, script, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Script'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'POST',
        uri : reqURI,
        json : script,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    _this.SurveyScript = {
      get : getSurveyScript,
      update : updateSurveyScript
    };
    
    // SurveyData
    
    function requestSurveyData (surveyId, downloadOptions, callback) {
      var reqURI = 'v1/Surveys/{surveyId}/Data'
        .replace('{surveyId}', surveyId);
      
      return request({
        method : 'POST',
        uri : reqURI,
        json : downloadOptions,
        headers : {
          'Authorization': 'Basic ' + token.AuthenticationToken
        }
      }).nodeify(callback);
    }
    
    _this.SurveyData = {
      request : requestSurveyData
    };
    
    // SurveyPublish
    
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
    
    _this.SurveyPublish = {
      get : getSurveyPublish,
      publish : publishSurveyPublish
    };
    
    // Connect to API
    
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
    
    _this.stopPersistant = function stopPersistant () {
      clearInterval(connectInterval);
      connectInterval = null;
    };
    
    _this.configure(nfieldOptions, requestOptions);
  }
  
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