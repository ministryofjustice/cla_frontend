(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CompleteCallbackCtrl',
      ['$scope', 'flash', function($scope, flash){
          $scope.completeCallback = function() {
            $scope.case.$complete_call_me_back().then(function() {
              $scope.case.requires_action_at = null;
              $scope.case.callback_attempt = 0;
              flash('Callback stopped successfully.');
            });
          };
        }
      ]
    );
})();
