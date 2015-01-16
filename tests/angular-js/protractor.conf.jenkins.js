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

    baseUrl: 'http://172.31.42.35:'+process.env.FRONTEND_BASE_PORT+'/',
    seleniumAddress: 'http://172.31.23.107:4444/wd/hub',

    multiCapabilities: [
      {
        browserName: 'chrome'
      },
      {
        browserName: 'firefox'
      }
    ]
  });
})();
