(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('AlternativeHelpCtrl',
      ['$scope', '_', '$stateParams', '$state', 'form_utils',
        'kb_providers', 'kb_categories', 'AlternativeHelpService',
        function($scope, _, $stateParams, $state, form_utils,
                 kb_providers, kb_categories, AlternativeHelpService){
          $scope.category = $stateParams.category || null;
          $scope.keyword = $stateParams.keyword;
          $scope.currentPage = $stateParams.page || 1;

          $scope.categories = kb_categories;
          $scope.providers = kb_providers;
          $scope.alternativeHelpService = AlternativeHelpService;

          $scope.code = 'IRKB';
          // if search value, focus on element
          if ($scope.keyword) {
            angular.element('[name="keyword"]').focus();
          }

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


          $scope.submit = function () {
            $scope.case.$assign_alternative_help({
              selected_providers: AlternativeHelpService.get_selected_provider_ids(),
              notes: AlternativeHelpService.notes,
              event_code: this.code
            }).then(function () {
              AlternativeHelpService.clear();
              $state.go('case_list');
            }, function(response){
              console.log('something went wrong', response);
            });
          };

        }
      ]
    );
})();
