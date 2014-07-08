'use strict';
(function() {

  angular.module('cla.filters', [])
    .filter('general_date', ['$filter',
      function(filter) {
        // builtin $filter inheritance to create a standardised date filter
        var builtInDateFilter = filter('date');
        return function(date_str) {
          return builtInDateFilter(date_str, 'short');
        };
      }
    ])

    .filter('nl2br', function() {
      return function(text) {
        if (typeof text !== 'undefined' && text) {
          return text.replace(/\n/g, '<br/>');
        } else {
          return;
        }
      };
    })

    .filter('ordinal', function() {
      return function(input) {
        var s = ['th', 'st', 'nd', 'rd'],
            v = input % 100;
        return input + (s[(v - 20) % 10] || s[v] || s[0]);
      };
    });

})();