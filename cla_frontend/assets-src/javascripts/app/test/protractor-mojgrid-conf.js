"use strict";

var extend = require('extend'),
  defaults = require('./protractor-default-conf').config;


exports.config = extend(defaults, {

  seleniumAddress: 'http://clas-mac-mini.local:4444/wd/hub',
  baseUrl: 'http://ubuntu.local:8001/',
  multiCapabilities: [
    {
      browserName: 'chrome'
    },
    {
      browserName: 'firefox'
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

