(function(){
  'use strict';

  angular.module('cla.directives')
    .directive('notifications', [function() {
      return {
        templateUrl: 'directives/notifications.html',
        controller: 'NotificationCtrl',
        replace: true
      };
    }]
  );
})();
