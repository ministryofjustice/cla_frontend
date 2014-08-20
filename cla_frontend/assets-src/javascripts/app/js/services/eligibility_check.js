(function () {
  'use strict';
  angular.module('cla.services')
    // this is the place to map properties / context between
    // eligibility check and diagnosis
    .service('EligibilityCheckService', ['$state', function($state) {
      this.onEnter = function(eligibility_check, diagnosis, flash) {
        if(diagnosis.state !== 'INSCOPE' && !eligibility_check.state) {
          // redirect if not in scope and no previous means test present
          $state.go('case_detail.edit.diagnosis', {}, {'reload': true});
          flash('warn', 'You must complete an <strong>in scope diagnosis</strong> before completing the financial assessment');
        } else {
          if (!eligibility_check.reference && diagnosis.category) {
            eligibility_check.category = diagnosis.category;
          }
          if (eligibility_check.category !== diagnosis.category) {
            flash('warn', 'The category selected for the financial assessment (' +
              eligibility_check.category +') doesn\'t match diagnosis category ('+
              diagnosis.category +')');
          }
        }
      };
    }]);
})();

