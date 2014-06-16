exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'browserName': 'phantomjs',
  },

  baseUrl: 'http://localhost:8001/',

  framework: 'jasmine',

  onPrepare: function() {
    require('jasmine-reporters');

    jasmine.getEnv().addReporter(
      new jasmine.JUnitXmlReporter('reports', true, true));
  }

};
