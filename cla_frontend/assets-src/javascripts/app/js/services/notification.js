(function(){
  'use strict';

  angular.module('cla.services')
    .factory('cla.notification', ['Notification', function(Notification) {
      return {
        list: function() {
          return Notification.get().$promise;
        }
      };
    }
  ]);
})();
