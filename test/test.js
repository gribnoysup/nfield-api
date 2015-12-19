var nfieldCli = require('../index.js').NfieldClient;
var nock = require('nock');
var expect = require('chai').expect;

var token = { AuthenticationToken : 'mocked token' };

var credentials;

describe('NfieldClient', function () {
  
  it('should have two methods: \'connect\' and \'defaults\'', function () {
    expect(nfieldCli).to.have.all.keys('defaults', 'connect');
  });
  
  describe('defaults', function () {
    
    before(function () {
      credentials = { Domain : 'Domain', Username : 'Username', Password : 'Password' };
      nock('https://api.anothernfieldserver.com/').post('/v1/SignIn').reply(200, token);
    });
    
    after(function () {
      nock.cleanAll();
    });
    
    it('should return a new instance of \'NfieldClient\' with updated default request options', function (done) {
      var newCli = nfieldCli.defaults({ baseUrl : 'https://api.anothernfieldserver.com/' });
      
      expect(newCli).to.have.all.keys('defaults', 'connect');
      
      newCli.connect(credentials).then(function (result) {
        expect(result).to.contain.all.keys('__TOKEN', '__REQUEST_OPTIONS', '__CREDENTIALS');
        done();
      }).catch(done);
    });
    
    it('should throw a TypeError if called without options', function(done) {
      expect(nfieldCli.defaults).to.throw(TypeError);
      done();
    });
    
  });
  
  describe('connect', function() {
    
    beforeEach(function () {
      credentials = { Domain : 'Domain', Username : 'Username', Password : 'Password' };
      nock('https://api.nfieldmr.com/').post('/v1/SignIn').reply(200, token);
    });
    
    afterEach(function () {
      nock.cleanAll();
    });
    
    it('should return a \'ConnectedInstance\' after connectiong to api with proper login information', function (done) {
      nfieldCli.connect(credentials).then(function (result) {
        expect(result).to.contain.all.keys('__TOKEN', '__REQUEST_OPTIONS', '__CREDENTIALS');
        done();
      }).catch(done);
    });
    
    it('should return a \'RequiredError\' if not all required parameters provided during connection', function (done) {
      
      delete credentials.Domain;
      
      nfieldCli.connect(credentials).then(done).catch(function (error) {
        expect(error).to.have.property('name');
        expect(error.name).to.equal('RequiredError');
        done();
      });
    });
  
  });
  
});
