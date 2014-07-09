(function(){
  'use strict';
  
  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category', '$stateParams',
        function($scope, Category, $stateParams){
          $scope.category_list = Category.query();

          $scope.warnings = {};

          console.log($stateParams.section);

          $scope.sections = [{
              title: 'Problem',
              show: $stateParams.section === 'your_problem' || $stateParams.sections === '',
              template: 'includes/eligibility.problem.html'
            }, {
              title: 'Details',
              show: $stateParams.section === 'details',
              template: 'includes/eligibility.details.html'
            }, {
              title: 'Finances',
              show: $stateParams.section === 'your_capital',
              template: 'includes/eligibility.finances.html'
            }, {
              title: 'Income',
              show: $stateParams.section === 'your_income',
              template: 'includes/eligibility.income.html'
            }, {
              title: 'Expenses',
              show: $stateParams.section === 'your_allowances',
              template: 'includes/eligibility.expenses.html'
            }
          ];

          $scope.save = function() {
            $scope.eligibility_check.$update($scope.case.reference, function () {
              $scope.eligibility_check.validate($scope.case.reference).then(function (resp) {
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
      ]
    );
})();