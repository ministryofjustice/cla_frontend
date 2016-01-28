(function () {
  'use strict';
  var extend = require('extend'),
      defaults = require('./protractor.conf');

  exports.config = extend(defaults.config, {
    // --- uncomment to use mac mini's ---
    // seleniumAddress: 'http://clas-mac-mini.local:4444/wd/hub',
//    baseUrl: 'http://172.22.5.98:8001/',
//    seleniumAddress: 'http://0.0.0.0:4444/wd/hub',

    multiCapabilities: [
//      {
//        browserName: 'chrome',
//        'chromeOptions': {
//          args: ['--test-type']
//        }
//      }
      {
        browserName: 'firefox'
      }
//      {
//        browserName: 'phantomjs'
//      }
    ]
  });
})();
