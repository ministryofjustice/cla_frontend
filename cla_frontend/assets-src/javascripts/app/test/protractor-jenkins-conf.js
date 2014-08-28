var extend = require('extend');
var defaults = require('./protractor-default-conf').config;

exports.config = extend(defaults, {
  baseUrl: 'http://frontend-integration.cla.dsd.io/',
  seleniumAddress: 'http://54.77.178.131:4444/wd/hub',

  multiCapabilities: [
    {
      browserName: 'chrome',
//      platform: 'OS X 10.9',
//      version: ''
    },
    {
      browserName: 'firefox',
//      platform: 'OS X 10.9',
//      version: '30'
    }
  ],
  allScriptsTimeout: 120000,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120000
  }
});
