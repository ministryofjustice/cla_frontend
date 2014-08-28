(function () {
  'use strict';
  var extend = require('extend'),
      defaults = require('./protractor.conf');

  exports.config = extend(defaults.config, {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    capabilities: {
      browserName: 'phantomjs'
    }
  });
})();