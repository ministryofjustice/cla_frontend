(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailCtrl',
      ['$rootScope', '$scope', 'case', 'eligibility_check', 'personal_details',
        function($rootScope, $scope, $case, $eligibility_check, $personal_details){
          $scope.case = $case;
          $scope.eligibility_check = $eligibility_check;
          $scope.personal_details = $personal_details;

          $rootScope.$emit('timer:check');

          var indexedTimers = [];
          $scope.logSet = function() {
            indexedTimers = [];
            return $scope.case.log_set;
          }

          $scope.filterLogItems = function(log) {
            var timerIsNew = indexedTimers.indexOf(log.timer) == -1;
            if (timerIsNew) {
              indexedTimers.push(log.timer);
            }
            return timerIsNew;
          }
        }
      ]
    );
})();