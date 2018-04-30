(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CaseDetailDeclineHelpCtrl',
      ['$scope', '$uibModal', '$q', '$state', 'flash',
        function($scope, $uibModal, $q, $state, flash){
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
                eod_details: function() {return null;},
                Complaint: function() {return null;},
                event_key: function() { return 'decline_help'; },  //this is also the function name on Case model
                notes: function() { return notes || ''; },
                outcome_codes: ['Event', function (Event) {
                  return new Event().list_by_event_key('decline_help').then(function (response) {
                    return response.data;
                  });
                }]
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
              $uibModal.open(modalOpts).result.then(onSuccess);
            });
          };
        }
      ]
    );
})();
