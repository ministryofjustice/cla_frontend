(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('LogListCtrl',
    ['$scope', '$modal',
      function ($scope, $modal) {
        $scope.logSet = [];

        $scope.$watch('log_set.data', function(newVal) {
          // log set grouping
          var currentTimer = null;
          $scope.logSet = [];
          angular.forEach(newVal, function(log) {
            if (!log.timer) {
              $scope.logSet.push([log]);
            } else {
              if (log.timer !== currentTimer) {
                currentTimer = log.timer;
                $scope.logSet.push([log]);
              } else {
                var ll = $scope.logSet[$scope.logSet.length-1];
                ll.push(log);
                $scope.logSet[$scope.logSet.length-1] = ll;
              }
            }
          });
        });

        $scope.showDiagnosisSummary = function(log) {
          $modal.open({
            templateUrl: 'includes/diagnosis.summary.modal.html',
            controller: ['$scope', '$modalInstance', 'log', 'Diagnosis',
              function($scope, $modalInstance, log, Diagnosis) {
                $scope.diagnosis = new Diagnosis(log.patch);
                $scope.diagnosisTitle = function () {
                  if ($scope.diagnosis.isInScopeTrue()) {
                    return 'In scope';
                  }

                  if ($scope.diagnosis.isInScopeFalse()) {
                    return 'Not in scope';
                  }

                  return 'Incomplete Diagnosis';
                };
                $scope.diagnosisTitleClass = function () {
                  if ($scope.diagnosis.isInScopeTrue()) {
                    return 'Icon Icon--lrg Icon--solidTick Icon--green';
                  }

                  if ($scope.diagnosis.isInScopeFalse()) {
                    return 'Icon Icon--lrg Icon--solidCross Icon--red';
                  }

                  return 'Icon Icon--lrg';
                };
                $scope.close = function () {
                  $modalInstance.dismiss('cancel');
                };
              }
            ],
            resolve: {
              'log': function () {
                return log;
              }
            }
          });
        };
      }
    ]
  );
})();
