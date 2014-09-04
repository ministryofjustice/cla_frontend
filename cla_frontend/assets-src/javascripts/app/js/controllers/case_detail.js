(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailCtrl',
      ['$rootScope', '$scope', 'case', 'eligibility_check', 'diagnosis', 'personal_details', '$modal', 'MatterType', 'History', 'log_set',
        function($rootScope, $scope, $case, $eligibility_check, $diagnosis, $personal_details, $modal, MatterType, History, log_set){
          $scope.caseListStateParams = History.caseListStateParams;
          $scope.case = $case;
          $scope.log_set = log_set;
          $scope.eligibility_check = $eligibility_check;
          $scope.diagnosis = $diagnosis;
          $scope.personal_details = $personal_details;


          // checking the time after the template as been rendered
          $scope.$evalAsync(function() {
            $rootScope.$emit('timer:check');
          });

          $scope.edit_matter_types = function (next) {
            var child_scope = $scope.$new();
            child_scope.next = next;
            $modal.open({
              templateUrl: 'case_detail.matter_type.html',
              controller: 'SetMatterTypeCtrl',
              scope: child_scope,
              resolve: {
                'matter_types': function () {
                  return MatterType.get({
                    category__code: $scope.diagnosis.category
                  }).$promise;
                }
              }
            });
          };

          // modelsEventManager.onEnter();
          // $scope.$on('$destroy', function () {
          //   modelsEventManager.onExit();
          // });
        }
      ]
    );

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
                  return $scope.diagnosis.isInScopeTrue() ? 'In scope' : 'Not in scope';
                };
                $scope.diagnosisTitleClass = function () {
                  return $scope.diagnosis.isInScopeTrue() ? 'Icon Icon--lrg Icon--solidTick Icon--green' : 'Icon Icon--lrg Icon--solidCross Icon--red';
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

  angular.module('cla.controllers')
    .controller('SetMatterTypeCtrl',
    ['$scope', '$modalInstance', 'matter_types', '$state',
      function ($scope, $modalInstance, matter_types, $state) {
        $scope.matter_types = matter_types;

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
          $scope.case.matter_type1 = null;
          $scope.case.matter_type2 = null;
        };

        $scope.save = function() {
          $scope.case.$set_matter_types().then(function () {
            $modalInstance.close();
            if ($scope.next) {
              $state.go($scope.next);
            }
          });

        };
      }
    ]
  );


  angular.module('cla.controllers')
    .controller('SetECFundCtrl',
    ['$scope', '$modalInstance', 'ECF_STATEMENT',
      function ($scope, $modalInstance, ECF_STATEMENT) {
        $scope.ecf_statements = ECF_STATEMENT;

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.save = function() {
          $scope.case.$patch().then(function () {
            $modalInstance.close();
          });

        };
      }
    ]
  );

  angular.module('cla.controllers')
    .controller('OutcomesModalCtl',
      ['$scope', '$modalInstance', 'case', 'event_key',
        'success_msg', 'Event', '$state', 'flash', 'notes', 'tplVars',
        function($scope, $modalInstance, _case, event_key, success_msg,
                 Event, $state, flash, notes, tplVars) {

          // template vars
          tplVars = angular.extend({
            'title': 'Outcome code'
          }, tplVars);
          tplVars.buttonText = tplVars.buttonText || tplVars.title;
          $scope.tplVars = tplVars;

          // action

          new Event().list_by_event_key(event_key, function(data) {
            $scope.codes = data;
          });

          $scope.notes = notes || '';

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.post_submit = function() {
            $state.go('case_list');
            flash('success', success_msg);
            $modalInstance.dismiss('cancel');
          };

          $scope.submit_outcome = function (event_code, notes) {
            return _case['$'+event_key]({
              'event_code': event_code,
              'notes': notes || ''
            });
          };

          $scope.submit = function() {
            $scope.submit_outcome(this.event_code, this.notes)
              .then($scope.post_submit);

          };

        }
      ]
    );
})();
