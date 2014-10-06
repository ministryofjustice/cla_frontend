(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('ConfirmationCtrl', ['$scope', 'tplVars', function ($scope, tplVars) {
      $scope.tplVars = angular.extend({
        'title': 'Confirmation required',
        'message': 'Please ensure you are comfortable with the action you are doing.'
      }, tplVars);

      $scope.cancel = function () {
        $scope.$dismiss('cancel');
      };

      $scope.confirm = function () {
        $scope.$close(true);
      };
    }]
  );
})();
