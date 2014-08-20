(function () {
  'use strict';
  angular.module('cla.services')
    // this is the place to map properties / context between
    // eligibility check and diagnosis
    .service('EligibilityCheckService', function() {
      this.onEnter = function(eligibility_check, diagnosis, flash) {
        if (!eligibility_check.reference && diagnosis.category) {
          eligibility_check.category = diagnosis.category;
        }
        if (eligibility_check.category !== diagnosis.category) {
          flash('warn', 'The category selected for the financial assessment (' +
            eligibility_check.category +') doesn\'t match diagnosis category ('+
            diagnosis.category +')');
        }
      };
    });
})();

