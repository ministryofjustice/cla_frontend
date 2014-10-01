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
                    'title': 'Decline Help'
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

  angular.module('cla.controllers.operator')
    .controller('CaseDetailAssignProviderCtrl',
      ['$rootScope', '$scope', '$modal', '$state',
        function($rootScope, $scope, $modal, $state){
          // function to create a list of warnings/errors from an obj
          function setMessages (fields, list) {
            angular.forEach(fields, function (obj) {
              var field = $scope[obj.object][obj.field];
              if (field === undefined || (field !== undefined && !field)) {
                list.push({message: obj.message});
              }
            });
          }

          // Case validation
          $scope.resetCaseErrors = function () {
            $scope.case_errors = [];
            $scope.case_warnings = [];
          };
          $scope.resetCaseErrors();

          $scope.validateCase = function () {
            var required_fields = [
                  {object: 'case', field: 'notes', message: 'Case notes must be added to close a case'},
                  {object: 'case', field: 'media_code', message: 'A media code is required to close a case'},
                  {object: 'personal_details', field: 'full_name', message: 'Name is required to close a case'},
                  {object: 'personal_details', field: 'dob', message: 'Date of birth is required to close a case'},
                  {object: 'personal_details', field: 'mobile_phone', message: 'A contact number is required to close a case'}
                ],
                warning_fields = [
                  {object: 'personal_details', field: 'postcode', message: 'It is recommended to include postcode before closing a case'},
                  {object: 'personal_details', field: 'street', message: 'It is recommended to include an address before closing a case'},
                  {object: 'personal_details', field: 'ni_number', message: 'National Insurance number is not required to close a case but the specialist will ask for it once assigned'}
                ];

            // clear errors
            $scope.case_errors = [];
            $scope.case_warnings = [];

            // find errors
            setMessages(required_fields, $scope.case_errors);
            setMessages(warning_fields, $scope.case_warnings);

            if ($scope.case_errors.length === 0 && $scope.case_warnings.length === 0) {
              return true;
            } else {
              return false;
            }
          };
          var offStateChange = $rootScope.$on('$stateChangeSuccess', function() {
            $scope.resetCaseErrors();
          });
          $scope.$on('$destroy', function () {
            offStateChange();
          });

          $scope.assign_to_provider = function () {
            var child_scope = $scope.$new(),
                transition_to = 'case_detail.assign';

            child_scope.next = transition_to;

            if (!$scope.validateCase() && !$scope.case.warned) {
              $modal.open({
                templateUrl: 'call_centre/case_detail.invalid.html',
                controller: 'InvalidCtrl',
                scope: child_scope
              });
            } else if (!($scope.case.matter_type1 && $scope.case.matter_type2)) {
              $scope.edit_matter_types(transition_to);
            } else {
              $state.go(transition_to);
            }
          };
        }
      ]
    );

  angular.module('cla.controllers.operator')
    .controller('InvalidCtrl',
    ['$scope', '$modalInstance',
      function ($scope, $modalInstance) {
        $scope.close = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.proceed = function() {
          $modalInstance.close();
          $scope.case.warned = true;
          $scope.assign_to_provider();
        };
      }
    ]
  );

  angular.module('cla.controllers.operator')
    .controller('CaseDetailValidateAltHelpCtrl',
      ['$scope', '$modal', '$state',
        function($scope, $modal, $state){
          $scope.validateAltHelp = function() {

            if (!$scope.diagnosis || !$scope.diagnosis.category) {
              $modal.open({
                templateUrl: 'case_detail.alt_help_modal.html',
                controller: 'InvalidCtrl'
              });
            } else {
              $state.go('case_detail.alternative_help');
            }
          };
        }
      ]
    );

})();
