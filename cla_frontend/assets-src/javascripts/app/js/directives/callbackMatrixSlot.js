(function () {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackMatrixSlot', ['moment', '_', 'd3Service', function (moment, _, d3Service) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'max': '=',
        'min': '=',
        'slot': '=callbackSlot'
      },
      templateUrl: 'directives/callbackMatrixSlot.html',
      link: function (scope, ele) {
        if (!scope.slot) {
          ele.remove();
        } else {
          d3Service.d3().then(function (d3) {
            scope.day = moment().day(scope.slot.day).format('dddd');
            scope.slotTimeStart = moment().hour(scope.slot.hour).format('ha');
            scope.slotTimeEnd = moment().hour(scope.slot.hour).add(1, 'h').format('ha');

            var colorScale = d3.scale.quantile();
            colorScale
              .domain([scope.min, scope.max])
              .range(['1', '2', '3', '4', '5']);

            ele.addClass('CallbackMatrix-density CallbackMatrix-density--' + colorScale(scope.slot.value));
          });
        }
      }
    };
  }]);
})();
