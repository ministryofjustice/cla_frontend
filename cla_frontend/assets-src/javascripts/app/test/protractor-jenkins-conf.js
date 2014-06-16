exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  multiCapabilities: [
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
  ],

  baseUrl: 'http://localhost:8001/',

  framework: 'jasmine',

  onPrepare: function() {
    require('jasmine-reporters');

    jasmine.getEnv().addReporter(
      new jasmine.JUnitXmlReporter('reports', true, true));
  }

};
