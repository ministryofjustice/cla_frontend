(function(){
  'use strict';
  
  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category',
        function($scope, Category){
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
      ]
    );
})();