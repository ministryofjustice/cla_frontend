(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CaseDetailDeclineHelpCtrl',
      ['$scope', '$modal', '$q', '$state', 'flash',
        function($scope, $modal, $q, $state, flash){
          $scope.decline_help = function(notes) {
            var parentQ = $q.when(true);
            var modalOpts = {
              templateUrl: 'case_detail.outcome_modal.html',
              controller: 'OutcomesModalCtl',
              resolve: {
                tplVars: function() {
                  return {
                    'title': 'Decline help'
                  };
                },
                case: function() { return $scope.case; },
                event_key: function() { return 'decline_help'; },  //this is also the function name on Case model
                notes: function() { return notes || ''; }
              }
            };
            var onSuccess = function (result) {
              if (result) {
                flash('success', 'Declined help for Case ' + $scope.case.reference);
              } else {
                flash('error', 'There was a problem declining help on this case');
              }
              $state.go('case_list');
            };

            if ($scope.$parent && $scope.$parent.decline_help) {
              parentQ = $scope.$parent.decline_help();
            }

            parentQ.then(function () {
              $modal.open(modalOpts).result.then(onSuccess);
            });
          };
        }
      ]
    );
})();
