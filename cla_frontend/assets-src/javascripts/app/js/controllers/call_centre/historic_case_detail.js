(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('HistoricCaseDetailCtrl',
    ['$scope', 'historicCase',
      function ($scope, historicCase) {
        $scope.historicCase = historicCase;
      }
    ]
  );
})();
