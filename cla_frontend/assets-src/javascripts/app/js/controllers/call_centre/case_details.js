(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('HistoricCaseListCtrl',
    ['$scope', 'historicCases', '$stateParams', '$state', 'History',
      function ($scope, historicCases, $stateParams, $state, History) {
        $scope.caseListStateParams = History.caseListStateParams;
        $scope.historicCases = historicCases;
        $scope.currentPage = $stateParams.page || 1;
        $scope.search = $stateParams.search;

        function _updatePage() {
          $state.go($state.current, {
            page: $scope.currentPage,
            search: $scope.search
          });
        }

        $scope.pageChanged = function(newPage) {
          $scope.currentPage = newPage;
          _updatePage();
        };

      }
    ]
  );

  angular.module('cla.controllers.operator')
    .controller('HistoricCaseDetailCtrl',
    ['$scope', 'historicCase',
      function ($scope, historicCase) {
        $scope.historicCase = historicCase;
      }
    ]
  );


})();
