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
              controller: 'ImplicitOutcomeModalCtl',
              resolve: {
                tplVars: function() {
                  return {
                    title: 'Debt Referral'
                  };
                },
                case: function() { return $scope.case; },
                model_action: function() { return 'close_case_debt_referral'; },
                notes: function() { return ''; }
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
