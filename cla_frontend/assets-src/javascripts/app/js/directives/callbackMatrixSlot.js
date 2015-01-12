(function () {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackMatrixSlot', ['_', function (_) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'callbackData': '=',
        'slotDay': '=',
        'slotTime': '='
      },
      templateUrl: 'directives/callbackMatrixSlot.html',
      link: function (scope, ele) {
        var slot = _.findWhere(scope.callbackData, {day: scope.slotDay.day, hour: scope.slotTime.hour});

        if (!slot) {
          ele.remove();
        } else {
          scope.slot = slot;

          var density = '1';
          if (slot.value >= 10) {
            density = '5';
          } else if (slot.value >= 7) {
            density = '4';
          } else if (slot.value >= 4) {
            density = '3';
          } else if (slot.value >= 2) {
            density = '2';
          }
          ele.addClass('CallbackMatrix-density CallbackMatrix-density--' + density);
        }
      }
    };
  }]);
})();
