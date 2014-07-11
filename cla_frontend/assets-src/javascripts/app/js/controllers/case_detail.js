(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailCtrl',
      ['$rootScope', '$scope', 'case', 'eligibility_check', 'personal_details', '$modal',
        function($rootScope, $scope, $case, $eligibility_check, $personal_details, $modal){
          $scope.case = $case;
          $scope.eligibility_check = $eligibility_check;
          $scope.personal_details = $personal_details;

          // log set grouping
          var indexedTimers = [];
          $scope.logSet = function() {
            indexedTimers = [];
            return $scope.case.log_set;
          };

          $scope.filterLogItems = function(log) {
            var timerIsNew = indexedTimers.indexOf(log.timer) === -1;
            if (timerIsNew) {
              indexedTimers.push(log.timer);
            }
            return timerIsNew;
          };

          // checking the time after the template as been rendered
          $scope.$evalAsync(function() {
            $rootScope.$emit('timer:check');
          });

          $scope.suspend = function() {
            $modal.open({
              templateUrl: 'case_detail.suspend.html',
              controller: 'SuspendCaseCtl',
              resolve: {
                'case': function() {
                  return $scope.case;
                }
              }
            });
          };
        }
      ]
    );


  angular.module('cla.controllers')
    .controller('SuspendCaseCtl',
      ['$scope', '$modalInstance', 'case', 'Event', '$state', 'flash',
        function($scope, $modalInstance, _case, Event, $state, flash) {
          new Event().list_by_event_key('suspend_case', function(data) {
            $scope.codes = data;
          });

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.suspend = function() {
            _case.$suspend({
              'event_code': this.event_code,
              'notes': this.notes || ''
            }, function() {
              $state.go('case_list');
              flash('success', 'Case '+_case.reference+' suspended successfully');
              $modalInstance.dismiss('cancel');
            });

          };
        }
      ]
    );

})();