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

    baseUrl: 'http://' + process.env.CLA_FRONTEND_HOST + ':' + process.env.CLA_FRONTEND_PORT + '/',
    seleniumAddress: 'http://' + process.env.SELENIUM_HOST + ':4444/wd/hub',

    multiCapabilities: [
      //{
      //  browserName: 'chrome'
      //},
      {
        browserName: 'firefox'
      }
    ]
  });
})();
