(function(){
  'use strict';


  angular.module('cla.controllers.operator')
    .controller('InvalidCtrl',
    ['$scope', 'tplVars', 'postal',
      function ($scope, tplVars, postal) {
        // template vars
        tplVars = angular.extend({
          'title': 'Missing information'
        }, tplVars);
        $scope.tplVars = tplVars;

        // track which data hasn't been entered
        angular.forEach(tplVars.errors, function (value) {
          postal.publish({
            channel: 'ConfirmationModal',
            topic: 'error',
            data: {
              label: value.message
            }
          });
        });
        angular.forEach(tplVars.warnings, function (value) {
          postal.publish({
            channel: 'ConfirmationModal',
            topic: 'warning',
            data: {
              label: value.message
            }
          });
        });

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
