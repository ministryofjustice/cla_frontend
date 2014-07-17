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
        }
      ]
    );
})();
