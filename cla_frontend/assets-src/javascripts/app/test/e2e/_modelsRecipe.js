(function(){
  'use strict';

  var protractor = require('protractor');

  module.exports = {
    createCase: function() {
      function _createCase() {
        var callback = arguments[arguments.length - 1];
        var el = document.querySelector(arguments[0]);
        var Case = angular.element(el).injector().get('Case');

        new Case().$save().then(function(data) {
          callback(data.reference);
        });
      }

      return browser.driver.executeAsyncScript(
        _createCase, browser.rootEl
      );
    }
  };

})();