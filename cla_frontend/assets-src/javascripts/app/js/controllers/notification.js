(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('NotificationCtrl',
      ['$scope', '$state', '$location', 'cla.notification',
        function($scope, $state, $location, notification) {
          notification.list().then(function (notifications) {
            $scope.notifications = notifications;
            angular.forEach(notifications, function (n) {
              console.log(n);
            });
          });
        }
      ]
    );
})();
