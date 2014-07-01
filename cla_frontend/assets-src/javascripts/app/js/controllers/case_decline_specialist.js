(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDeclineSpecialistsCtrl',
      ['$scope', '$state', 'Event', 'flash',
        function($scope, $state, Event, flash) {
          new Event().list_by_event_key('decline_help', function(data) {
            $scope.codes = data;

            // default to first
            $scope.event_code = $scope.codes[0].code;
          });

          $scope.decline = function() {
            $scope.case.$decline_specialists({
              'event_code': $scope.event_code,
              'notes': $scope.notes
            }, function() {
              $state.go('case_list');
              flash('success', 'Case '+$scope.case.reference+' closed successfully');
            });
          };
        }
      ]
    );
})();
