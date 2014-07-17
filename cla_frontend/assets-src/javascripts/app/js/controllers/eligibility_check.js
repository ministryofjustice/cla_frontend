(function(){
  'use strict';
  
  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category', '$stateParams',
        function($scope, Category, $stateParams){
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
        }
      ]
    );
})();