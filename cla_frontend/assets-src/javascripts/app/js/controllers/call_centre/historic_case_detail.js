(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('HistoricCaseDetailCtrl',
    ['$scope', 'historicCase', 'History',
      function ($scope, historicCase, History) {
        $scope.caseListStateParams = History.caseListStateParams;
        $scope.historicCase = historicCase;
      }
    ]
  );
})();
