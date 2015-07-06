module.exports = (function Nfield () {
  
  var Promise = require('bluebird');
  
  var nfieldInstance;
  
  function createNfieldInstance (nfieldParams, requestParams) {
    
    var request;
    var nfieldOptions = nfieldParams || {};
    var requestOptions = requestParams || {};
    
    function updateParams (nP, rP) {
      
      nfieldOptions = nP || nfieldOptions;
      requestOptions = rP || requestOptions;
      
      requestOptions.baseUrl = nfieldOptions.server || 'https://api.nfieldmr.com/';

      request = Promise.promisify(require('request').defaults(requestOptions));
      
    }

    function signIn (credentials, callback) {
      return request({
        method : 'post',
        uri : 'v1/SignIn',
        json : credentials
      }).nodeify(callback);
    }
    
    updateParams(nfieldOptions, requestOptions);
    
    return {
      configure : function publicConfigure (nP, rP) {
        updateParams(nP, rP);
      },
      signIn : function publicSignIn (cred, cb) {
        return signIn(cred, cb);
      }
    };
    
  }
  
  return {
    init : function (nfieldParams, requestParams) {
      if (!nfieldInstance) {
        nfieldInstance = createNfieldInstance(nfieldParams, requestParams);
      }
      return nfieldInstance;
    }
  };
  
})();