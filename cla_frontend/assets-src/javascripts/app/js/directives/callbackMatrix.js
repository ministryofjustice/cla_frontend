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

  mod.directive('callbackMatrix', ['goToCase', 'Category', '$state', '$stateParams', '_', function (goToCase, Category, $state, $stateParams, _) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'slots': '=',
        'cases': '='
      },
      templateUrl: 'directives/callbackMatrix.html',
      link: function (scope, ele, attrs) {
        scope.categories = Category.query(function(results){
          scope.selected_category = _.findWhere(results, {code: $stateParams.category})
        });

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
        scope.colours = [
          { suffix: '1', text: '1-2', lowerLimit: 0 },
          { suffix: '2', text: '3-4', lowerLimit: 2 },
          { suffix: '3', text: '5-6', lowerLimit: 4 },
          { suffix: '4', text: '7-8', lowerLimit: 6 },
          { suffix: '5', text: '9+', lowerLimit: 8 }
        ];
        scope.goToCase = goToCase;

        scope.getSlot = function (day, hour) {
          return _.findWhere(scope.slots, {day: day, hour: hour});
        };

        scope.getDayTotal = function (day) {
          var slotsByDay = _.map(scope.slots, function (slot) {
            return slot.day === day ? slot.value : 0;
          });
          var sum = _.reduce(slotsByDay, function (memo, num) { return memo + num; }, 0);
          return sum;
        };

        scope.getCellClass = function (day, time) {
          if (
            day.day === 7 ||
            (day.day === 6 && time !== undefined && time.hour > 12)
          ) {
            return ' is-unavailable';
          }

          if (time !== undefined && scope.getSlot(day.day, time.hour) === undefined) {
            return ' is-empty';
          }
        };

        scope.showSlotCases = function (event, day, time) {
          var cases = _.filter(scope.cases, function ($case) {
            var callbackDate = new Date($case.requires_action_at);
            if (callbackDate.getDay() === day && callbackDate.getHours() === time) {
              return true;
            }
            return false;
          });
          ele.find('.CallbackMatrix-slot.is-active').removeClass('is-active');
          ele.find(event.target).addClass('is-active');
          scope.slotsCases = _.sortBy(cases, 'requires_action_at');
        };

        scope.filterByCategory = function() {
          var category =  scope.selected_category ? scope.selected_category.code : ""
          var params = {"category": category}
          $state.go($state.current, params);

        };
      }
    };
  }]);
})();
