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

    .provider('$escapeHtml', function() {
      this.$get = [function() {
        return function(html) {
          if (typeof html !== 'undefined' && html) {
            var text = document.createTextNode(html);
            var div = document.createElement('div');
            div.appendChild(text);
            return div.innerHTML;
          } else {
            return;
          }
        };
      }];
    })
    .filter('escapeHtml', ['$escapeHtml', function($escapeHtml) {
      return $escapeHtml;
    }])

    .filter('nl2br', [function() {
      return function(text) {
        if (typeof text !== 'undefined' && text) {
          return text.replace(/\n/g, '<br/>');
        } else {
          return;
        }
      };
    }])

    .filter('ordinal', function() {
      return function(input) {
        var s = ['th', 'st', 'nd', 'rd'],
            v = input % 100;
        return input + (s[(v - 20) % 10] || s[v] || s[0]);
      };
    })

    .filter('snakeCaseToHuman', function() {
      return function(input) {
        return input.charAt(0).toUpperCase() + input.substr(1).replace(/_/g, ' ');
      };
    })

    .filter('camelCaseToHuman', function() {
      return function(input) {
        return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
      };
    })

    .filter('ageFromDate', function() {
      return function(input) {
        // return early if not date
        if (!input) { return; }

        var diff = Date.now() - new Date(input.month + '/' + input.day + '/' + input.year).getTime(),
            diffDays = diff / 1000 / (60 * 60 * 24);

        return Math.floor(diffDays / 365.25);
      };
    })

    .filter('dob', function() {
      return function(input) {
        return input ? input.day + '/' + input.month + '/' + input.year : '';
      };
    })

    // Capitalizes the first letter of each word of a string
    .filter('capitalize', function() {
      return function(input) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
      };
    })

    // Capitalizes the first letter of a string
    .filter('capitalizeFirst', function() {
      return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.slice(1) : '';
      };
    })

    .filter('constantByValue', function () {
      return function (lookupVal, constant) {
        return _.find(constant, {value: lookupVal});
      };
    })

    .filter('join', function () {
      return function (list) {
        if (!list) {
          return '';
        }
        return list.join(', ');
      };
    })

    .filter('stripTags', function () {
      return function(input) {
        if(angular.isString(input)) {
          return input.replace(/<\S[^><]*>/g, '');
        }
        return input;
      };
    });

})();
