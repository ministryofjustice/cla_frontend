(function() {
  "use strict";
  var extend = require("extend"),
    defaults = require("./protractor.conf");

  exports.config = extend(defaults.config, {
    baseUrl: "http://localhost:8001/",
    seleniumAddress: "http://localhost:4444/wd/hub"
  });
})();
