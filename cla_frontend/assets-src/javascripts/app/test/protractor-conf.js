var capabilities;

if (process.env.SAUCE_ONDEMAND_BROWSERS === undefined){
  capabilities = [{
    'platform': process.env.SELENIUM_PLATFORM,
    'browser': process.env.SELENIUM_BROWSER,
    'browser-version': process.env.SELENIUM_VERSION,
    'url': process.env.SELENIUM_DRIVER
  }]
} else {
  capabilities = process.env.SAUCE_ONDEMAND_BROWSERS || [{
    'browserName': 'phantomjs',
  }];
}

exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  multiCapabilities: capabilities,

  baseUrl: 'http://localhost:8001/',

  framework: 'jasmine',

  onPrepare: function() {
    require('jasmine-reporters');

    jasmine.getEnv().addReporter(
      new jasmine.JUnitXmlReporter('reports', true, true));
  }

};
