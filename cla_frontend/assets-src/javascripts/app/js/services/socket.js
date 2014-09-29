/* jshint unused: false */
(function(){
  'use strict';

  angular.module('cla.services')
    .factory('cla.bus', ['postal', '$rootScope', '_', function (postal, $rootScope, _) {
      // io is global reference to socket.io
      var host = $('head').data('socketioServer');
      host = host.replace(/^https?:/, window.location.protocol);
      var socket = io.connect(host);

      var sendForBroadcast = function (eventType) {
        return function (data) {
          socket.emit('client', {type: eventType, data: data});
        };
      };

      var messageHandlers = {
        'Case.created': sendForBroadcast('case.new')
      };

      var channel = postal.channel('cla.operator');

      var publishToChannel = function (message) {
        channel.publish(message.type, message.data);
      };

      for (var message in messageHandlers) {
        socket.on('server', publishToChannel);

        postal.subscribe({
          channel: 'models',
          topic: message,
          callback: messageHandlers[message]
        });
      }


      postal.subscribe({
        channel: 'system',
        topic: 'user.identified',
        callback: function(username) {
          // console.log('identified');
          socket.emit('identify', username);
        }
      });

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

      return {
        install: function() {
          
        }
      };
    }]);
})();
