(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category', '$stateParams', 'flash', '$state',
        function($scope, Category, $stateParams, flash, $state){
          $scope.category_list = Category.query();
          $scope.warnings = {};
          $scope.sections = [{
              title: 'Details',
              state: 'case_detail.edit.eligibility.details',
              template: 'includes/eligibility.details.html'
            }, {
              title: 'Finances',
              state: 'case_detail.edit.eligibility.finances',
              template: 'includes/eligibility.finances.html'
            }, {
              title: 'Income',
              state: 'case_detail.edit.eligibility.income',
              template: 'includes/eligibility.income.html'
            }, {
              title: 'Expenses',
              state: 'case_detail.edit.eligibility.expenses',
              template: 'includes/eligibility.expenses.html'
            }
          ];

          $scope.isComplete = function (section) {
            var emptyInputs = angular.element('#' + section).find('input, select, textarea').filter(function() {
              var $this = angular.element(this),
                  type = $this.attr('type');

              if (type === 'radio' || type === 'checkbox') {
                return angular.element('[name=' + $this.attr('name') + ']:checked').val() === undefined;
              } else {
                return $this.val() === '';
              }
            });

            return !emptyInputs.length;
          };

          $scope.currentState = function () {
            var current = 'case_detail.edit.eligibility.details';
            angular.forEach($scope.sections, function(section) {
              if ($state.includes(section.state)) {
                current = section.state;
              }
            });
            return current;
          };

          $scope.gotoSection = function (section) {
            $state.go(section.state);
          };

          $scope.save = function () {
            $scope.eligibility_check.$update($scope.case.reference, function (data) {
              $scope.case.eligibility_check = data.reference;
              $scope.case.$get();
              $scope.eligibility_check.validate($scope.case.reference).then(function (resp) {
                $scope.warnings = resp.data.warnings;
              });

              // updates the state of case.eligibility_state after each save
              $scope.case.state = data.state;

              // fire a save notification
              flash('success', 'The means test has been saved. The current result is <strong>' + $scope.eligibilityText(data.state) + '</strong>');

              $scope.logManager.refresh();
            });
          };

          $scope.removeProperty = function (index) {
            $scope.eligibility_check.property_set.splice(index, 1);
          };
          $scope.addProperty = function () {
            if (typeof $scope.eligibility_check.property_set === 'undefined') {
              $scope.eligibility_check.property_set = [];
            }
            $scope.eligibility_check.property_set.push({});
          };

          $scope.eligibilityText = function (eligible) {
            return eligible === 'yes' ? 'eligible for Legal Aid' : (eligible === 'no' ? 'not eligible for Legal Aid' : 'unknown');
          };
        }
      ]
    );
})();
