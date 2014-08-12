(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category', '$stateParams', 'flash',
        function($scope, Category, $stateParams, flash){
          $scope.category_list = Category.query();
          $scope.warnings = {};
          $scope.sections = [{
              title: 'Problem',
              id: 'problem',
              show: $stateParams.section === 'your_problem' || $stateParams.section === '',
              template: 'includes/eligibility.problem.html'
            }, {
              title: 'Details',
              id: 'details',
              show: $stateParams.section === 'details',
              template: 'includes/eligibility.details.html'
            }, {
              title: 'Finances',
              id: 'finances',
              show: $stateParams.section === 'your_capital',
              template: 'includes/eligibility.finances.html'
            }, {
              title: 'Income',
              id: 'income',
              show: $stateParams.section === 'your_income',
              template: 'includes/eligibility.income.html'
            }, {
              title: 'Expenses',
              id: 'expenses',
              show: $stateParams.section === 'your_allowances',
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

          $scope.eligibilityTitle = function () {
            return $scope.eligibility_check.isEligibilityTrue() ? 'Eligible for Legal Aid' : ($scope.eligibility_check.isEligibilityFalse() ? 'Not eligible for Legal Aid' : 'Means test');
          };
          $scope.eligibilityTitleClass = function () {
            return $scope.eligibility_check.isEligibilityTrue() ? 'Icon Icon--lrg Icon--solidTick Icon--green' : ($scope.eligibility_check.isEligibilityFalse() ? 'Icon Icon--lrg Icon--solidCross Icon--red' : '');
          };
        }
      ]
    );
})();
