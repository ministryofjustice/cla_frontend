(function () {
  'use strict';

  angular.module('cla.services')
    .factory('ClaPostalService', ['postal', function(postal) {
      return {
        publishHotKey: function (hotkey) {
          postal.publish({
            channel: 'HotKey',
            topic: hotkey.combo[0],
            data: {
              label: hotkey.description
            }
          });
        }
      };
    }]);
})();
