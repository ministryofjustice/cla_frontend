exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  multiCapabilities: [
    {
      'browserName': 'firefox'
    },
    {
      'browserName': 'chrome'
    }
  ],

  baseUrl: 'http://localhost:8001/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }

};
