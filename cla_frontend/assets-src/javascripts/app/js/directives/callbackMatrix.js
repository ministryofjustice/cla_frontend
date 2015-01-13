(function () {
  'use strict';

  var mod = angular.module('cla.directives');

  var getDays = function (startDay) {
    var days = [
      { day: 1, text: 'Mon' },
      { day: 2, text: 'Tue' },
      { day: 3, text: 'Wed' },
      { day: 4, text: 'Thu' },
      { day: 5, text: 'Fri' },
      { day: 6, text: 'Sat' },
      { day: 7, text: 'Sun' }
    ];

    // if start day is not Monday, shift to end until new start day is at the front
    if (startDay !== 1) {
      var currentDay = 1;
      while (currentDay < startDay) {
        days.push(days.shift());
        currentDay += 1;
      }
    }

    return days;
  };

  mod.directive('callbackMatrix', ['_', function (_) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'slots': '=',
        'cases': '='
      },
      templateUrl: 'directives/callbackMatrix.html',
      link: function (scope, ele, attrs) {
        // customisable options
        var startDay = parseInt(attrs.startDay) || new Date().getDay();

        scope.days = getDays(startDay);
        scope.times = [
          { hour: 9, text: '9am' },
          { hour: 10, text: '10am' },
          { hour: 11, text: '11am' },
          { hour: 12, text: '12pm' },
          { hour: 13, text: '1pm' },
          { hour: 14, text: '2pm' },
          { hour: 15, text: '3pm' },
          { hour: 16, text: '4pm' },
          { hour: 17, text: '5pm' },
          { hour: 18, text: '6pm' },
          { hour: 19, text: '7pm' }
        ];

        scope.showSlotCases = function (event, day, time) {
          var cases = _.filter(scope.cases, function ($case) {
            var callbackDate = new Date($case.requires_action_at);
            if (callbackDate.getDay() === day && callbackDate.getHours() === time) {
              return true;
            }
            return false;
          });
          // ele.find('.CallbackMatrix-cell').addClass('CallbackMatrix-cell--unselected');
          // ele.find(event.target).parent().removeClass('CallbackMatrix-cell--unselected');
          scope.slotsCases = _.sortBy(cases, 'requires_action_at');
        };

        // from parent - FIX
        scope.opCaseClass = function (_case) {
          var className = '';
          switch (_case.source) {
            case 'PHONE':
              className = 'Icon--call';
              break;
            case 'WEB':
              className = 'Icon--form';
              break;
            case 'SMS':
              className = 'Icon--sms';
              break;
            case 'VOICEMAIL':
              className = 'Icon--voicemail';
              break;
          }
          return className;
        };
      }
    };
  }]);
})();
