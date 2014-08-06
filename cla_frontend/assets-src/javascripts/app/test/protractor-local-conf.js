var extend = require('extend');
var defaults = require('./protractor-default-conf').config;

exports.config = extend(defaults, {
  multiCapabilities: [
    {
      browserName: 'chrome'
    },
    {
      browserName: 'firefox'
    }
  ],
  logfile: null
});
