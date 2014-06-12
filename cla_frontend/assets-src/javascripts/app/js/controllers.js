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
  .controller('CaseDetailCtrl', ['$scope', 'case', function($scope, $case){
    $scope.case = $case;
  }]);

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl', ['$scope', 'form_utils', 'PersonalDetails', function($scope, form_utils, PersonalDetails){
      $scope.edit_mode = false;
      if ($scope.case.personal_details) {
        $scope.personal_details = PersonalDetails.get({ref: $scope.case.personal_details});
      } else {
        $scope.personal_details = new PersonalDetails()
      }

      $scope.toggleEdit = function (edit) {
        $scope.edit_mode = edit;
        $scope.editable_details = angular.copy($scope.personal_details);
      };

      // save personal details
      $scope.save = function(isValid) {
        if (isValid) {
          $scope.personal_details = angular.copy($scope.editable_details);
          $scope.edit_mode = false;

          if ($scope.personal_details.reference) {
            $scope.personal_details.$patch()
          } else {
            $scope.personal_details.$save()
          }}}
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
    .controller('AssignProviderCtrl', ['$scope', '_', function($scope, _){
      $scope.is_manual = false;
      $scope.title = 'Assign a provider';

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
          $scope.is_complete = true;
          $scope.title = 'Provider successfully assigned';
        });
      };
    }]);

  angular.module('cla.controllers')
    .controller('CaseMeansTestCtrl', ['$scope', '$http', function($scope, $http) {
      $http.get('/operator/case/'+$scope.case.reference+'/means_summary/').success(function(data) {
        $scope.means_summary = data;
      });
    }]);

})();
