'use strict';
(function(){
  angular.module('cla.services')
    .factory('cla.bus', ['postal', function (postal) {
      // io is global reference to socket.io
      var socket = io.connect('http://localhost:8005');

      var sendForBroadcast = function (eventType) {
        return function (data, env) {
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

      return postal;
    }]);
})();
