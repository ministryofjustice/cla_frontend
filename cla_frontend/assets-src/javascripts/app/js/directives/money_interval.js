'use strict';
(function(){

  angular.module('cla.directives')
  .directive('moneyInterval', function() {
    return  {
      restrict: 'E',
      templateUrl:  'partials/includes/money_interval.html',
      scope: {
        miModel: '='
      }
    };
  });

})();
