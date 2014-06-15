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
    }
  ],

  baseUrl: 'http://localhost:8001/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }

};
