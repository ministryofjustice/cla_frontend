'use strict';

(function(){
  var saveDelay = 750;

  angular.module('cla.controllers')
    .controller('CaseListCtrl', ['$scope', 'cases', '$stateParams', '$state', function($scope, cases, $stateParams, $state) {
      $scope.orderProp = $stateParams.ordering || '-created';
      $scope.search = $stateParams.search;
      $scope.currentPage = $stateParams.page || 1;

      $scope.cases = cases;

      function updatePage() {
        $state.go('case_list', {
          'page': $scope.currentPage,
          'ordering': $scope.orderProp,
          'search': $scope.search
        });
      }

      $scope.pageChanged = function(newPage) {
        $scope.currentPage = newPage;
        updatePage();
      };

      $scope.sortToggle = function(currentOrderProp){
        if (currentOrderProp === $scope.orderProp) {
          $scope.orderProp = '-' + currentOrderProp;
        } else {
          $scope.orderProp = currentOrderProp;
        }
        updatePage();
      };
    }]);

  angular.module('cla.controllers')
    .controller('CaseCtrl', ['$scope', '$state', 'Case', function($scope, $state, Case) {
      $scope.addCase = function() {
        new Case().$save(function(data) {
          $state.go('case_detail.edit', {caseref:data.reference});
        });
      };
    }]);

  angular.module('cla.controllers')
    .controller('SearchCtrl', ['$scope', '$state', '$location', function($scope, $state, $location) {
      $scope.$on('$locationChangeSuccess', function(){
        $scope.search = $location.search().search || '';
      });

      $scope.submit = function() {
        $state.go('case_list', {search: $scope.search, ordering:'', page: 1});
      };

    }]);

  angular.module('cla.controllers')
    .controller('LayoutCtrl', ['$rootScope', '$scope', '$window', 'History',
      function($rootScope, $scope, $window, History){
        var offStateChange = $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams){
          if (from.name === 'case_list') {
            History.caseListStateParams = fromParams;
          }
          $window.scrollTo(0,0);
        });

        $scope.$on('$destroy', function () {
          offStateChange();
        });

      }]);

  angular.module('cla.controllers')
  .controller('CaseDetailCtrl', ['$scope', 'case', 'eligibility_check', 'personal_details',
      function($scope, $case, $eligibility_check, $personal_details){
        $scope.case = $case;
        $scope.eligibility_check = $eligibility_check;
        $scope.personal_details = $personal_details;
      }]);

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl', ['$scope', 'personal_details', 'ThirdParty', 'History', 'form_utils',
      function($scope, personal_details, ThirdParty, History, form_utils){
        $scope.caseListStateParams = History.caseListStateParams;
        $scope.personal_details = personal_details;
        $scope.third_party = $scope.case.thirdparty_details ? ThirdParty.get({ref: $scope.case.thirdparty_details}) : new ThirdParty();

        $scope.reasons = [
          {value: 'CHILD_PATIENT', text: 'is a child or patient'},
          {value: 'POWER_ATTORNEY', text: 'they are subject to a power of attorney'},
          {value: 'NO_TELEPHONE_DISABILITY', text: 'they cannot communicate via the telephone, due to a disability'},
          {value: 'NO_TELEPHONE_LANGUAGE', text: 'they cannot communicate via the telephone, due to a language requirement'},
          {value: 'OTHER', text: 'other'}
        ];
        $scope.relationships = [
          {value: 'PARENT_GUARDIAN', text: 'Parent or guardian'},
          {value: 'FAMILY_FRIEND', text: 'Family friend'},
          {value: 'PROFESSIONAL', text: 'Professional'},
          {value: 'LEGAL_ADVISOR', text: 'Legal advisor'},
          {value: 'OTHER', text: 'Other'}
        ];

        $scope.validate = function (isValid) {
          if (isValid) {
            return true;
          } else {
            return 'false';
          }
        };

        $scope.validateRadio = function (data) {
          if (data === undefined) {
            return 'This field is required';
          }
        };

        $scope.savePersonalDetails = function(form) {
          $scope.personal_details.$update(function (data) {
            if (!$scope.case.personal_details) {
              $scope.case.$associate_personal_details(data.reference, function () {
                $scope.case.personal_details = data.reference;
              });
            }
          }, function(response){
            form_utils.ctrlFormErrorCallback($scope, response, form);
            $scope.personal_details = personal_details;
          });
          return true;
        };

        $scope.saveThirdParty = function(form) {
          $scope.third_party.$update(function (data) {
            if (!$scope.case.thirdparty_details) {
              $scope.case.$associate_thirdparty_details(data.reference, function () {
                $scope.case.thirdparty_details = data.reference;
              });
            }
          }, function(response){
            form_utils.ctrlFormErrorCallback($scope, response, form);
            $scope.third_party = $scope.case.thirdparty_details ? ThirdParty.get({ref: $scope.case.thirdparty_details}) : new ThirdParty();
          });
          return true;
        };
      }]);

  angular.module('cla.controllers')
    .controller('CaseEditDetailCtrl',
      ['$scope', '$timeout', 'form_utils',
      function($scope, $timeout, form_utils){
      var timeout = null,

          watchChange = function(newVal, oldVal) {
            if (newVal !== oldVal) {
              if (timeout) {
                $timeout.cancel(timeout);
              }
              timeout = $timeout($scope.save, saveDelay);
            }
          };

      $scope.in_scope_choices = [
        { label: 'Unknown', value: null},
        { label: 'Yes', value: true},
        { label: 'No', value: false}
      ];

      $scope.save = function(){
        $scope.case.$case_details_patch(
          angular.noop,
          angular.bind(this, form_utils.ctrlFormErrorCallback, $scope)
        );
      };

      // watch fields
      $scope.$watch('case.notes', watchChange);
    }]);

  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category', 'form_utils',
      function($scope, Category, form_utils){
        $scope.category_list = Category.query();

        $scope.warnings = {};

        $scope.tabs = [{
            title: 'Problem',
            id: 'ec_problem'
          }, {
            title: 'Details',
            id: 'ec_details'
          }, {
            title: 'Finances',
            id: 'ec_finances'
          }, {
            title: 'Income',
            id: 'ec_income'
          }, {
            title: 'Expenses',
            id: 'ec_expenses'
          }
        ];

        $scope.currentTab = 'ec_problem';

        $scope.onClickTab = function (tab) {
          $scope.currentTab = tab.id;
        };

        $scope.isActiveTab = function(tabId) {
          return tabId === $scope.currentTab;
        };

        $scope.save = function() {
          $scope.eligibility_check.$update(function (data) {
            if (!$scope.case.eligibility_check) {
              $scope.case.$associate_eligibility_check(data.reference, function () {
                $scope.case.eligibility_check = data.reference;
              });
            }

            $scope.eligibility_check.validate().then(function (resp) {
              $scope.warnings = resp.data.warnings;
            });
          });
        };

        $scope.removeProperty = function(index) {
          $scope.eligibility_check.property_set.splice(index, 1);
        };

        $scope.addProperty = function() {
          if ($scope.eligibility_check.property_set === null) {
            $scope.eligibility_check.property_set = [];
          }

          $scope.eligibility_check.property_set.push({});
        };
      }
    ]);

  angular.module('cla.controllers')
    .controller('CaseDeclineSpecialistsCtrl',
    ['$scope', '$state', 'OutcomeCode', function($scope, $state, OutcomeCode) {

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
    }]);

  angular.module('cla.controllers')
    .controller('CaseDeferSpecialistsCtrl',
    ['$scope', '$state', 'OutcomeCode', 'flash', function($scope, $state, OutcomeCode, flash) {

      /*
       TODO:
       - api should not expect an outcome code as input as it's the only one available for this action
       - a success message should be shown to the user after the action
       - some of these controllers could be generalised and reused
       */
      $scope.outcome_codes = OutcomeCode.query({action_key: 'defer_assign'}, function(data) {
        $scope.outcome_code = data[0].code;
      });

      $scope.defer = function() {
        $scope.case.$defer_assignment({
          'outcome_code': $scope.outcome_code,
          'outcome_notes': $scope.outcome_notes
        }, function() {
          $state.go('case_list');
          flash('success', 'Case '+$scope.case.reference+' deferred successfully');
        });
      };
    }]);

  angular.module('cla.controllers')
    .controller('AssignProviderCtrl', ['$scope', '_', '$state', function($scope, _, $state){
      $scope.is_manual = false;

      $scope.case.get_suggested_providers().success(function(data){
        $scope.suggested_providers = _.reject(data.suitable_providers, {id: data.suggested_provider.id});
        $scope.suggested_provider = data.suggested_provider;
        $scope.selected_provider = data.suggested_provider;

        if (data.suggested_provider.id === undefined) {
          $scope.is_manual = true;
        }
      });

      $scope.assignManually = function(choice) {
        $scope.is_manual = choice;

        // reset selected to suggested provider
        if (!choice) {
          $scope.selected_provider = $scope.suggested_provider;
          $scope.provider_search = '';
        }
      };

      $scope.assign = function() {
        $scope.case.$assign({
          provider_id: $scope.selected_provider.id,
          is_manual: $scope.is_manual,
          assign_notes: $scope.assign_notes
        }).success(function(){
          $state.go('case_detail.assign.complete', {}, {'reload': true});
        });
      };
    }]);

  angular.module('cla.controllers')
    .controller('AssignProviderCompleteCtrl', ['$scope', 'Provider', function($scope, Provider) {
      $scope.selected_provider = Provider.get({id: $scope.case.provider});
    }]);

  angular.module('cla.controllers')
    .controller('EligibilityCheckSummaryCtrl', ['$scope', '$http', function($scope, $http) {
      if ($scope.case.eligibility_check) {
        $http.get('/call_centre/case/'+$scope.case.reference+'/means_summary/').success(function(data) {
          $scope.means_summary = data;
        });
      }
    }]);
})();
