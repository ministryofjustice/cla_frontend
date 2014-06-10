'use strict';

(function(){
  var saveDelay = 750;

  angular.module('cla.controllers')
    .controller('CaseListCtrl', ['$scope', 'Case', '$location', function($scope, Case, $location) {
      $scope.search = $location.search().search || '';
      $scope.orderProp = $location.search().sort || '-created';

      Case.query({search: $scope.search}, function(data) {
        $scope.cases = data;
      });

      $scope.sortToggle = function(currentOrderProp){
        if (currentOrderProp === $scope.orderProp) {
          return '-' + currentOrderProp;
        }

        return currentOrderProp;
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
        $state.go('case_list', {search: $scope.search, sort:''});
      };

    }]);

  angular.module('cla.controllers')
  .controller('CaseDetailCtrl', ['$scope', 'case', function($scope, $case){
    $scope.case = $case;
  }]);

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl', ['$scope', '$timeout', function($scope, $timeout){
      var timeout = null,

          watchChange = function(newVal, oldVal) {
            if (newVal !== oldVal) {
              if (timeout) {
                $timeout.cancel(timeout);
              }
              timeout = $timeout($scope.save, saveDelay);
            }
          };

      // save personal details
      $scope.save = function() {
        $scope.case.$personal_details_patch();
      };

      // watch all fields
      $scope.$watchCollection('case.personal_details', watchChange);
    }]);

  angular.module('cla.controllers')
    .controller('CaseEditDetailCtrl', ['$scope', '$timeout', 'Category', 'EligibilityCheck', function($scope, $timeout, Category, EligibilityCheck){
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
        $scope.case.$case_details_patch();
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
        }
      };

      $scope.assign = function() {
        $scope.case.$assign({
          provider_id: $scope.selected_provider.id,
          is_manual: $scope.is_manual
        }).success(function(){
          $scope.is_complete = true;
        });
      };
    }]);

})();
