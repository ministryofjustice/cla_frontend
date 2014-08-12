var extend = require('extend');
var defaults = require('./protractor-default-conf').config;

exports.config = extend(defaults, {
  baseUrl: 'http://localhost:8001/',

  multiCapabilities: [
    {
      browserName: 'chrome',
      platform: 'OS X 10.9',
      version: ''
    },
    {
      browserName: 'firefox',
      platform: 'OS X 10.9',
      version: '30'
    }
  ],
  allScriptsTimeout: 120000,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120000
  }
});
