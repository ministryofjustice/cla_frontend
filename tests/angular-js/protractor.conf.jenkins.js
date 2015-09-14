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

    //baseUrl: 'http://52.18.3.241:' + process.env.CLA_FRONTEND_PORT + '/',
    //seleniumAddress: 'http://52.17.63.29:4444/wd/hub',

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
