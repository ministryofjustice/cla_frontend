(function () {
  'use strict';

  angular.module('cla.services')
    .service('ClaFeatures', [function() {
      try{
        this.features = document.documentElement.getAttribute("data-cla-features").split(" ");
      }
      catch(error) {
        this.features = [];
      }
      this.is_feature_enabled = function(name) {
          return this.features.includes(name)
      };
    }]);
})();
