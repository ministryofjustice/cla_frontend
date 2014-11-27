'use strict';
(function(){

  angular.module('cla.directives')
  .directive('moneyInterval', function() {
    return  {
      restrict: 'E',
      require: 'ngModel',
      templateUrl:  'directives/money_interval.html',
      scope: {
        model: '=ngModel',
        name: '@ngModel',
        miLabel: '@',
        guidanceLink: '=?'
      },
      link: function(scope, elem, attrs, ngModelCtrl) {
        function toMoneyInterval(viewValue){
          if (viewValue) {
            scope.per_interval_value = viewValue.per_interval_value;
            scope.interval_period = viewValue.interval_period;
          } else {
            scope.per_interval_value = undefined;
            scope.interval_period = undefined;
          }
          return viewValue;
        }

        scope.$watch('per_interval_value + interval_period', function () {
          if (scope.per_interval_value !== undefined && !scope.interval_period) {
            scope.interval_period = 'per_month';
          }

          if (scope.per_interval_value !== undefined) {
            scope.per_interval_value = parseInt(scope.per_interval_value);
          }


          ngModelCtrl.$setViewValue(
            {
              per_interval_value: scope.per_interval_value,
              interval_period: scope.interval_period
            });

        });

        ngModelCtrl.$render = function() {
          if (ngModelCtrl.$viewValue) {
            scope.per_interval_value = ngModelCtrl.$viewValue.per_interval_value;
            scope.interval_period  = ngModelCtrl.$viewValue.interval_period;
          } else {
            scope.per_interval_value = undefined;
            scope.interval_period = undefined;
          }
        };

        ngModelCtrl.$formatters.push(toMoneyInterval);
      }
    };
  });

})();
