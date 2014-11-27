(function () {
  'use strict';



  exports.config = {
    // --- tests to run ---
    specs: [
      // 'reporter-hack.js',
      'e2e/!(_*).js'
    ],
    suites: {},

    // --- global test config ---
    baseUrl: 'http://localhost:8001/',
    allScriptsTimeout: 11000,
    onPrepare: function() {
      var minWindowWidth = 1920,
          minWindowHeight = 1200,
          browserName,
          platform,
          window = browser.manage().window();

      // spec style reporting on the command line
      require('jasmine-spec-reporter');
      jasmine.getEnv().addReporter(new jasmine.SpecReporter({
        displayStacktrace: true
      }));

      // Add a screenshot reporter and store screenshots to `/tmp/screnshots`:
      var ScreenShotReporter = require('protractor-screenshot-reporter');
      var path = require('path');
      var camel = require('to-camel-case');
      jasmine.getEnv().addReporter(new ScreenShotReporter({
        baseDirectory: 'reports/protractor-e2e/screenshots',
        takeScreenShotsOnlyForFailedSpecs: true,
        pathBuilder: function pathBuilder(spec, descriptions, results, capabilities) {
          // Return '<platform>/<browser>/<specname>' as path for screenshots:
          descriptions = descriptions.reverse().map(function (desc) {
            return camel(desc);
          });
          return path.join(capabilities.caps_.platform, capabilities.caps_.browserName, descriptions.join('-'));
        }
      }));

      // The require statement must be down here, since jasmine-reporters
      // needs jasmine to be in the global and protractor does not guarantee
      // this until inside the onPrepare function.
      require('jasmine-reporters');
      browser.getCapabilities().then(function(caps){
        var browserName = caps.caps_.browserName.toUpperCase(),
            browserVersion = caps.caps_.version,
            prePendStr = browserName + '-' + browserVersion + '-';
        jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter('reports/protractor-e2e', true, true, prePendStr));
      });

      // add current browser, system and dimensions to console log
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
      });

      window.maximize();
    },

    // --- test framework ---
    framework: 'jasmine',
    jasmineNodeOpts: {
      silent: true,
      isVerbose: false
    }
  };
})();
