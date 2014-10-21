(function(){
  'use strict';


  angular.module('cla.controllers.operator')
    .controller('InvalidCtrl',
    ['$scope', 'tplVars',
      function ($scope, tplVars) {
        // template vars
        tplVars = angular.extend({
          'title': 'Missing information'
        }, tplVars);
        $scope.tplVars = tplVars;

        $scope.close = function () {
          $scope.$dismiss('cancel');
        };

        $scope.proceed = function() {
          $scope.$close(true);
        };
      }
    ]
  );
})();
