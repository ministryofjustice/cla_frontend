var extend = require('extend');
var defaults = require('./protractor-default-conf').config;

exports.config = extend(defaults, {
  multiCapabilities: [
    {
      browserName: 'chrome',
      platform: 'OS X 10.8',
      version: '35'
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '11'
    }
  ]
});
