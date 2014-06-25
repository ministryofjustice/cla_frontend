(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDeclineSpecialistsCtrl',
      ['$scope', '$state', 'OutcomeCode',
        function($scope, $state, OutcomeCode) {
          /*
           TODO:
           - api should not expect an outcome code as input as it's the only one available for this action
           - a success message should be shown to the user after the action
           - some of these controllers could be generalised and reused
           */
          $scope.outcome_codes = OutcomeCode.query({action_key: 'decline_specialists'}, function(data) {
            $scope.outcome_code = data[0].code;
          });

          $scope.decline = function() {
            $scope.case.$decline_specialists({
              'outcome_code': $scope.outcome_code,
              'outcome_notes': $scope.outcome_notes
            }, function() {
              $state.go('case_list');
            });
          };
        }
      ]
    );
})();