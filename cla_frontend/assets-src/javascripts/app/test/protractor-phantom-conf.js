var extend = require('extend');
var defaults = require('./protractor-default-conf').config;

exports.config = extend(defaults, {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  capabilities: {
    browserName: 'phantomjs'
  },
  logfile: null
});
