'use strict';
(function(){

  angular.module('cla.directives')
  .directive('moneyInterval', function() {
    return  {
      restrict: 'E',
      templateUrl:  'directives/money_interval.html',
      scope: {
        miModel: '=',
        miLabel: '@'
      }//,
      // link: function(scope) {
      //   scope.miModel = typeof scope.miModel === 'undefined' ? {interval_period: ''} : scope.miModel;
      // }
    };
  });

})();
