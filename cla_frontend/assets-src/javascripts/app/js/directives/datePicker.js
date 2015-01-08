/* global rome */
(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('datePicker', function() {
      return {
        restrict: 'A',
        scope: {
          config: '=pickerConfig'
        },
        link: function(scope, element, attrs, ngModelCtrl) {
          var settings = $.extend({
            time: false,
            weekStart: 1,
            dayFormat: 'D',
            monthFormat: 'MMMM YY',
            inputFormat: 'DD/MM/YYYY'
          }, scope.config);

          rome(element[0], settings).on('data', function (value) {
            if (ngModelCtrl) {
              ngModelCtrl.$setViewValue(value);
            }
          });
        }
      };
    });

  angular.module('cla.directives')
    .directive('datetimePicker', function() {
      return {
        restrict: 'A',
        scope: {
          config: '=pickerConfig'
        },
        link: function(scope, element, attrs, ngModelCtrl) {
          var settings = $.extend({
            weekStart: 1,
            inputFormat: 'DD/MM/YYYY HH:mm',
            timeInterval: 900
          }, scope.config);

          rome(element[0], settings).on('data', function (value) {
            if (ngModelCtrl) {
              ngModelCtrl.$setViewValue(value);
            }
          });
        }
      };
    });
}());
