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
  .controller('CaseDetailCtrl', ['$scope', 'case',
      function($scope, $case){
        $scope.case = $case;
      }]);

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl', ['$scope', 'form_utils', '_', 'PersonalDetails', 'History',
      function($scope, form_utils, _, PersonalDetails, History){

        $scope.caseListStateParams = History.caseListStateParams;

        if ($scope.case.personal_details) {
          $scope.personal_details = PersonalDetails.get({ref: $scope.case.personal_details});
        } else {
          $scope.personal_details = new PersonalDetails();
        }

        var clean_details;

        $scope.toggleEdit = function (edit, save) {
          $scope.edit_mode = edit;
          if (!edit) {
            if (!!save) {
              clean_details = angular.copy($scope.personal_details);
            } else {
              _.extend($scope.personal_details, clean_details);
            }
          } else {
            clean_details = angular.copy($scope.personal_details);
          }
        };

        // save personal details
        $scope.save = function(isValid) {
          if (isValid) {
            $scope.personal_details.$update(function (data) {
              $scope.toggleEdit(false, true);

              if (!$scope.case.personal_details) {
                $scope.case.$associate_personal_details(data.reference, function () {
                  $scope.case.personal_details = data.reference;
                });
              }
            }, angular.bind(this, form_utils.ctrlFormErrorCallback, $scope));
          }
        };
      }]);

  angular.module('cla.controllers')
    .controller('CaseEditDetailCtrl',
      ['$scope', '$timeout', 'Category', 'EligibilityCheck', 'form_utils',
      function($scope, $timeout, Category, EligibilityCheck, form_utils){
      var timeout = null,

          watchChange = function(newVal, oldVal) {
            if (newVal !== oldVal) {
              if (timeout) {
                $timeout.cancel(timeout);
              }
              timeout = $timeout($scope.save, saveDelay);
            }
          };

      $scope.category_list = Category.query();
      $scope.eligibility_check = EligibilityCheck.get({ref: $scope.case.eligibility_check});

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
        $scope.eligibility_check.$patch();
      };

      // watch fields
      $scope.$watch('case.notes', watchChange);
    }]);

  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category', 'EligibilityCheck', 'form_utils',
      function($scope, Category, EligibilityCheck, form_utils){
        $scope.category_list = Category.query();
        $scope.eligibility_check = EligibilityCheck.get({ref: $scope.case.eligibility_check});
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

        $scope.currentTab = 'ec_finances';

        $scope.onClickTab = function (tab) {
          $scope.currentTab = tab.id;
        };

        $scope.isActiveTab = function(tabId) {
          return tabId === $scope.currentTab;
        };

        $scope.save = function() {
          $scope.eligibility_check.$patch().then(function () {
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
          $state.go('case_detail.edit.assign.complete', {}, {'reload': true});
        });
      };
    }]);

  angular.module('cla.controllers')
    .controller('AssignProviderCompleteCtrl', ['$scope', 'Provider', function($scope, Provider) {
      $scope.selected_provider = Provider.get({id: $scope.case.provider});
    }]);

  angular.module('cla.controllers')
    .controller('CaseMeansTestCtrl', ['$scope', '$http', function($scope, $http) {
      $http.get('/call_centre/case/'+$scope.case.reference+'/means_summary/').success(function(data) {
        $scope.means_summary = data;
      });
    }]);
})();
