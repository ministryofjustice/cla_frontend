(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CallbacksCtrl',
      ['$scope', 'cases',
        function ($scope, cases) {
          $scope.callbackData = [
            {day: 1, hour: 1, value: 5},
            {day: 1, hour: 7, value: 2},
            {day: 1, hour: 8, value: 4},
            {day: 2, hour: 3, value: 1},
            {day: 2, hour: 0, value: 5},
            {day: 3, hour: 9, value: 1},
            {day: 4, hour: 7, value: 7},
            {day: 4, hour: 8, value: 3},
            {day: 4, hour: 3, value: 4},
            {day: 5, hour: 5, value: 6},
            {day: 5, hour: 9, value: 10},
            {day: 5, hour: 1, value: 10},
            {day: 5, hour: 2, value: 5},
            {day: 5, hour: 6, value: 5}
          ];
        }
      ]
    );
})();
