(function () {
  'use strict';
  angular.module('cla.services')
    // this is the place to map properties / context between
    // eligibility check and diagnosis
    .service('EligibilityCheckService', function() {
      this.onEnter = function(eligibility_check, diagnosis) {
        if (!eligibility_check.category && diagnosis.category) {
          eligibility_check.category = diagnosis.category;
        }
      };
    });
})();

