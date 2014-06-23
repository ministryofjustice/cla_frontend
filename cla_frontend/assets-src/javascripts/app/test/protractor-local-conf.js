var extend = require('extend');
var defaults = require('./protractor-default-conf').config;

exports.config = extend(defaults, {
  capabilities: {
    browserName: 'chrome'
  },
  logfile: null
});
