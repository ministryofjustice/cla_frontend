(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('NotificationCtrl',
      ['$scope', 'cla.notification',
        function($scope, notification) {
          notification.list().then(function (notifications) {
            $scope.notifications = notifications;
          });
        }
      ]
    );
})();
