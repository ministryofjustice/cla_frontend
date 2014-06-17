var defaults = require('./protractor-default-conf');

defaults.config.capabilities = {
  'browserName': 'phantomjs'
};

exports.config = defaults.config;
