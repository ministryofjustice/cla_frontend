(function(){
  'use strict';

  angular.module('cla.controllers.provider')
    .controller('CaseDetailCloseCtrl',
      ['$scope', '$state', 'flash', '$modal', '$modal',
        function($scope, $state, flash, $modal){
          var case_ref = $scope.case.reference;

          $scope.close = function() {
            this.case.$close_case().then(function() {
              $state.go('case_list');
              flash('success', 'Case '+case_ref+' closed successfully.');
            });
          };

          $scope.closeAsDREFER = function() {
            var modalOpts = {
              templateUrl: 'case_detail.outcome_modal.html',
              controller: 'OutcomesModalCtl',
              resolve: {
                tplVars: function() {
                  return {
                    title: 'Debt Referral'
                  };
                },
                case: function() { return $scope.case; },
                eod_details: function() {return null;},
                Complaint: function() {return null;},
                event_key: function() { return 'close_case_debt_referral'; },
                notes: function() { return null; },
                outcome_codes: function() { return null; }
              }
            };
            var onSuccess = function (result) {
              if (result) {
                $state.go('case_list');
                flash('success', 'Case '+case_ref+' closed successfully.');
              } else {
                flash('error', 'There was a problem re-opening this case');
              }
            };

            $modal.open(modalOpts).result.then(onSuccess);
          };
        }
      ]
    );
})();
