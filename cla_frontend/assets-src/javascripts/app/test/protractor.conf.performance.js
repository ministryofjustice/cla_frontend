(function () {
  'use strict';
  var extend = require('extend'),
      defaults = require('./protractor.conf');

  exports.config = extend(defaults.config, {
    specs: [
      // 'reporter-hack.js',
      'e2e/caseList.js',
      'e2e/caseList.js',
      'e2e/case.js',
      'e2e/caseList.js'
    ],

    allScriptsTimeout: 30000,

    // --- uncomment to use mac mini's ---
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: 'https://cla-frontend.service.dsd.io/',

    multiCapabilities: [
      // {
      //   browserName: 'chrome',
      //   count: 5
      // },
      {
        browserName: 'firefox',
        count: 16,
        version: 99
      }
    ]
  });
})();
