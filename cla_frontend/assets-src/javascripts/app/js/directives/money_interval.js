'use strict';
(function(){

  angular.module('cla.directives')
  .directive('moneyInterval', function() {
    return  {
      restrict: 'E',
      templateUrl:  '/static/javascripts/app/partials/includes/money_interval.html',
      scope: {
        miModel: '='
      }
    };
  });

})();
