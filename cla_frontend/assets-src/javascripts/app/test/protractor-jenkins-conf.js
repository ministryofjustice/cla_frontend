var extend = require('extend');
var defaults = require('./protractor-default-conf').config;

exports.config = extend(defaults, {
  baseUrl: 'http://jenkins.local.dsd.io:8001/',

  multiCapabilities: [
    {
      browserName: 'chrome',
      platform: 'OS X 10.9',
      version: '',
      shardTestFiles: true,
      maxInstances: 5
    },
    {
      browserName: 'firefox',
      platform: 'OS X 10.9',
      version: '30',
      shardTestFiles: true,
      maxInstances: 5
    }
  ],
  allScriptsTimeout: 120000,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120000
  }
});
