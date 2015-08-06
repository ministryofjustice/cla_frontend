(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackSla', ['moment', '$interval', function (moment, $interval) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var callbackDate = attrs.callbackSla;
        var caseSource = attrs.caseSource;
        var callbackTime = moment(callbackDate);
        var classes = ['is-warning', 'is-important'];
        var timer;
        var slaTimeLimits = {
          'WEB': {
            'min': 1710,
            'max': 7200
          },
          'DEFAULT': {
            'min': 7110,
            'max': 28800
          }
        };

        var slaLimits = slaTimeLimits[caseSource] || slaTimeLimits.DEFAULT;

        function getDiff () {
          var now = moment();
          return callbackTime.diff(now, 'seconds');
        }

        function setClass () {
          var className;
          var diff = getDiff();

          // over 30 mins, under 2h
          if (diff < -slaLimits.min && diff >= -slaLimits.max) {
            className = classes[0];
          }
          // over 2 hour SLA
          else if (diff < -slaLimits.max) {
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
