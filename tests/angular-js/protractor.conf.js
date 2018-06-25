var HtmlScreenshotReporter = require("protractor-jasmine2-screenshot-reporter");

var reporter = new HtmlScreenshotReporter({
  dest: "reports/protractor-e2e/screenshots",
  filename: "my-report.html",
  pathBuilder: function(currentSpec, suites, browserCapabilities) {
    return browserCapabilities.get("browserName") + "/" + currentSpec.fullName;
  }
});

exports.config = {
  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    browserName: "chrome",
    chromeOptions: {
      args: ["--headless", "--disable-gpu", "--window-size=1920,1200"]
    }
  },

  specs: [
    //"e2e/addressFinder.js" ,
    "e2e/caseList.js",
    "e2e/claAuth.js"
    //"e2e/!(_*).js"
  ],

  framework: "jasmine",

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true // Use colors in the command line report.
  },

  // Setup the report before any tests start
  beforeLaunch: function() {
    return new Promise(function(resolve) {
      reporter.beforeLaunch(resolve);
    });
  },

  // Assign the test reporter to each running instance
  onPrepare: function() {
    jasmine.getEnv().addReporter(reporter);
  },

  // Close the report after all tests finish
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve) {
      reporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }
};
