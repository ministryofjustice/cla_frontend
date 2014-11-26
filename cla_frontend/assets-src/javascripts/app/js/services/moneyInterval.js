(function () {
  'use strict';

  angular.module('cla.services')
    .factory('MoneyIntervalService', [function() {
      var factors = {
        'per_week': 52.0 / 12.0,
        'per_2week': 26.0 / 12.0,
        'per_4week': 13.0 / 12.0,
        'per_month': 1.0,
        'per_year': 1.0 / 12.0
      };

      return {
        asMonthly: function (interval, value) {
          return value * factors[interval];
        }
      };
    }]);
})();
