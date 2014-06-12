'use strict';
(function(){

  angular.module('cla.filters', [])
    .filter('general_date', [ '$filter', function(filter) {
      // builtin $filter inheritance to create a standardised date filter
      var builtInDateFilter = filter('date');
      return function(date_str) {
        return builtInDateFilter(date_str, 'short');
      };
    }])

    .filter('nl2br', function(){
      return function(text) {
        if (typeof text !== 'undefined' && text) {
          return text.replace(/\n/g, '<br/>');
        } else {
          return;
        }
      };
    });

})();
