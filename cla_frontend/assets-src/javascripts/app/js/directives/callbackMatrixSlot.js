(function () {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackMatrixSlot', ['_', 'moment', function (_, moment) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'slot': '=callbackSlot',
        'colours': '='
      },
      templateUrl: 'directives/callbackMatrixSlot.html',
      link: function (scope, ele) {
        if (!scope.slot) {
          ele.remove();
        } else {
          scope.day = moment().day(scope.slot.day).format('dddd');
          scope.slotTimeStart = moment().hour(scope.slot.hour).format('ha');
          scope.slotTimeEnd = moment().hour(scope.slot.hour).add(1, 'h').format('ha');

          var getDensitySuffix = function (value) {
            var suffix = '1';
            angular.forEach(scope.colours, function (colour) {
              if (value > colour.lowerLimit) {
                suffix = colour.suffix;
              }
            });
            return suffix;
          };

          ele.addClass('CallbackMatrix-density CallbackMatrix-density--' + getDensitySuffix(scope.slot.value));
        }
      }
    };
  }]);
})();
