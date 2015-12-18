var nfieldCli = require('../index.js').NfieldClient;
var nock = require('nock');

var nfieldSifnIn = nock('https://api.nfieldmr.com/').post('/v1/SignIn').reply(200, { AuthenticationToken : 'mocked token' });

nfieldCli.connect(function (err, res) {
    if (err) console.log(err);
});//.then(console.log).catch(console.log)