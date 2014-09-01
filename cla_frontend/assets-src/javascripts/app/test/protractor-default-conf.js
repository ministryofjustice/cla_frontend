exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  baseUrl: 'http://localhost:8001/',

  framework: 'jasmine',

  onPrepare: function() {
    // At this point, global 'protractor' object will be set up, and
    // jasmine will be available.
    var minWindowWidth = 1024,
      minWindowHeight = 768,
      browserName,
      platform,
      window = browser.manage().window();

    // The require statement must be down here, since jasmine-reporters
    // needs jasmine to be in the global and protractor does not guarantee
    // this until inside the onPrepare function.
    require('jasmine-reporters');

    browser.getCapabilities().then(function(capabilities) {
      browserName = capabilities.caps_.browserName;
      platform = capabilities.caps_.platform;
    }).then(function getCurrentWindowSize() {
      return window.getSize();
    }).then(function setWindowSize(dimensions) {
      var windowWidth = Math.max(dimensions.width, minWindowWidth),
        windowHeight = Math.max(dimensions.height, minWindowHeight);

      return window.setSize(windowWidth, windowHeight);
    }).then(function getUpdatedWindowSize() {
      return window.getSize();
    }).then(function showWindowSize(dimensions) {
      console.log('Browser:', browserName, 'on', platform, 'at', dimensions.width + 'x' + dimensions.height);
      console.log("Running e2e tests...");
    });

    jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter('reports', true, true));
  }


};
