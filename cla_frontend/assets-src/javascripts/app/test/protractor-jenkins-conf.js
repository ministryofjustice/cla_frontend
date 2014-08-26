var extend = require('extend');
var defaults = require('./protractor-default-conf').config;

exports.config = extend(defaults, {
  baseUrl: 'http://72085322.ngrok.com/',

  multiCapabilities: [
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
