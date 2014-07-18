(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('AlternativeHelpCtrl',
      ['$scope', '_', '$stateParams', '$state', 'form_utils', 'kb_providers', 'kb_categories',
        function($scope, _, $stateParams, $state, form_utils, kb_providers, kb_categories){
          $scope.category = $stateParams.category || null;
          $scope.keyword = $stateParams.keyword;
          $scope.currentPage = $stateParams.page || 1;

          $scope.categories = kb_categories;
          $scope.providers = kb_providers;

          $scope.selected_providers = {};

          function updatePage() {
            $state.go('case_detail.alternative_help', {
              'type': $scope.type,
              'page': $scope.currentPage,
              'category': $scope.category,
              'keyword': $scope.keyword
            });
          }

          $scope.pageChanged = function(newPage) {
            $scope.currentPage = newPage;
            updatePage();
          };

          $scope.changeCategory = function (category) {
            $scope.category = parseInt($scope.category) === parseInt(category) ? null : category;
            $scope.currentPage = 1;
            updatePage();
          };

          $scope.searchProviders = function (query) {
            $scope.currentPage = 1;
            $scope.keyword = query;
            updatePage();
          };

          $scope.validateSelected = function (submit) {
            var count = _.filter($scope.selected_providers, function(v){ 
              return v === true;
            });

            if (typeof count !== 'undefined' && count.length > 3) {
              $scope.valid = false;
            } else if (submit === true && typeof count !== 'undefined' && count.length < 3) {
              $scope.valid = false;
            } else {
              $scope.valid = true;
            }
          };

          $scope.submit = function () {
            $scope.validateSelected(true);

            if ($scope.valid) {
              console.log('submitting');
            }
          };
        }
      ]
    );
})();
