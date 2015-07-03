module.exports = (function Nfield () {
  
  var Promise = require('bluebird');
  
  var nfieldInstance;
  
  function createNfieldInstance (nfieldParams, requestParams) {
    
    var request;
    var nfieldOptions = nfieldParams || {};
    var requestOptions = requestParams || {};
    
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