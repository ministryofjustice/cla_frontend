(function () {
  'use strict';
  var extend = require('extend'),
      defaults = require('./protractor.conf');

  exports.config = extend(defaults.config, {

    capabilities:
    {
      browserName: 'firefox'
    }

  });
})();
