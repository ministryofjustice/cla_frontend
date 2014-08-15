var extend = require('extend');
var defaults = require('./protractor-default-conf').config;

exports.config = extend(defaults, {
  multiCapabilities: [
    {
      browserName: 'chrome'
    }
  ],
  logfile: null,
  specs: [
    'reporter-hack.js',
    'e2e/*.js',
  ],
  onPrepare: function () {
    require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new jasmine.SpecReporter({displayStacktrace: true}));
  }
});
