var defaults = require('./protractor-default-conf');

defaults.config.multiCapabilities = [
  {
    'browserName': 'chrome',
    'platform': 'OS X 10.8',
    'version': '35'
  },
  {
    'browserName': 'internet explorer',
    'platform': 'Windows 7',
    'version': '11'
  }
];

exports.config = defaults.config;
