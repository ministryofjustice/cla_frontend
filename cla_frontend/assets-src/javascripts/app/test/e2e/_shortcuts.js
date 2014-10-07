(function(){
  'use strict';

  module.exports = {
    goToCaseDetail: function(caseRef) {
      return browser.driver.executeAsyncScript(function(el, caseRef, callback) {
        if (window.__injector === undefined) {
          var $el = document.querySelector(el);
          window.__injector = angular.element($el).injector();
        }
        var $state = window.__injector.get('$state');

        $state.go('case_detail.edit', {'caseref': caseRef}).then(callback);

      }, browser.rootEl, caseRef);
    },

    goToCaseList: function() {
      // TODO not tested yet
      return browser.driver.executeAsyncScript(function(el, callback) {
        if (window.__injector === undefined) {
          var $el = document.querySelector(el);
          window.__injector = angular.element($el).injector();
        }
        var $state = window.__injector.get('$state');

        $state.go('case_list').then(callback);

      }, browser.rootEl);
    }
  };
})();
