/* jshint unused: false */
(function(){
  'use strict';

  angular.module('cla.services')
    .factory('cla.bus', ['postal', '$rootScope', '_', 'appUtils', function (postal, $rootScope, _, appUtils) {

      function init(user) {
        // io is global reference to socket.io
        var host = $('head').data('socketioServer');
        host = host.replace(/^https?:/, window.location.protocol);
        var socket = io.connect(host);
        var SYSTEM_MSG_OPTIONS = {  // hardcoded for now for security reasons
          '1': {
            text: 'Your version of the software is now <strong>out of date</strong>. Please <a href="" target="_self">refresh your browser</a> to correct this problem',
            closeable: false
          }
        };

        // USER IDENTIFICATION

        socket.on('connect', function() {
          socket.emit('identify', {
            'username': user.username,
            'usertype': appUtils.appName,
            'appVersion': appUtils.getVersion()
          });
        });

        socket.on('systemMessage', function(msgID) {
          var msg = SYSTEM_MSG_OPTIONS[msgID];
          if (typeof msg !== undefined) {
            $rootScope.$emit('system:message', msg.text, msg.closeable);
          }
        });

        // VIEWING CASE

        postal.subscribe({
          channel: 'system',
          topic: 'case.startViewing',
          callback: function(data) {
            socket.emit('startViewingCase', data.reference);
          }
        });

        postal.subscribe({
          channel: 'system',
          topic: 'case.stopViewing',
          callback: function(data) {
            socket.emit('stopViewingCase', data.reference);
          }
        });

        socket.on('peopleViewing', function(data) {
          $rootScope.peopleViewingCase = _.without(data, $rootScope.user.username);
          $rootScope.$apply();
          // console.log('got people viewing case: '+$rootScope.peopleViewingCase);
        });
      }

      return {
        install: function() {

          postal.subscribe({
            channel: 'system',
            topic: 'user.identified',
            callback: function(user) {
              init(user);
            }
          });

        }
      };
    }]);
})();
