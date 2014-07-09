(function(){
  'use strict';
  
  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category',
        function($scope, Category){
          $scope.category_list = Category.query();

          $scope.warnings = {};

          $scope.sections = [{
              title: 'Problem',
              template: 'includes/eligibility.problem.html'
            }, {
              title: 'Details',
              template: 'includes/eligibility.details.html'
            }, {
              title: 'Finances',
              template: 'includes/eligibility.finances.html'
            }, {
              title: 'Income',
              template: 'includes/eligibility.income.html'
            }, {
              title: 'Expenses',
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