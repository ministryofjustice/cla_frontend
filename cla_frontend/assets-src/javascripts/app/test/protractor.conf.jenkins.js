(function () {
  'use strict';
  var extend = require('extend'),
      defaults = require('./protractor.conf');

  exports.config = extend(defaults.config, {
    // increase timeouts on CI
    allScriptsTimeout: 120000,
    jasmineNodeOpts: {
      defaultTimeoutInterval: 120000
    },
    
    baseUrl: 'http://jenkins.local.dsd.io:8001/',

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
    ]
  });
})();