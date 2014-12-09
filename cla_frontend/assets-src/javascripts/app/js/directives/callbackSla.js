(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackSla', ['moment', '$interval', function (moment, $interval) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var callbackDate = attrs.callbackSla;
        var callbackTime = moment(callbackDate);
        var classes = ['is-warning', 'is-important'];
        var timer;

        function getDiff () {
          var now = moment();
          return callbackTime.diff(now, 'seconds');
        }

        function setClass () {
          var className;
          var diff = getDiff();

          // over 15 mins, under 2h
          if (diff < -810 && diff >= -7200) {
            className = classes[0];
          }
          // over 2 hour SLA
          else if (diff < -7200) {
            className = classes[1];
            // cancel timer as no longer needed
            $interval.cancel(timer);
          }

          // switch class, but only if it has changed
          if (!elem.hasClass(className)) {
            elem
              .removeClass(classes.join(' '))
              .addClass(className);
          }
        }

        if (callbackDate) {
          // call on first load
          setClass();

          // start timer
          timer = $interval(setClass, 1000);

          // cancel timer when scope is destroyed
          scope.$on('$destroy', function () {
            $interval.cancel(timer);
          });
        }
      }
    };
  }]);
})();
