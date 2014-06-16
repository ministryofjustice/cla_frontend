(function () {
  'use strict';
  // this is not really required yet but is being used as a central place
  // to hold historic state params. The idea is for this to save itself
  // into localStorage so even if user refreshes the page the back links
  // will go back to the right place.
  angular.module('cla.services')
    .factory('History', [function() {
      return {};
    }]);
})();
