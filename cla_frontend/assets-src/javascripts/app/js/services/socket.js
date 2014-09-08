'use strict';
(function(){
  angular.module('cla.services')
    .factory('cla.bus', ['postal', function (postal) {
      var channel = postal.channel('cla.operator');

      // io is global reference to socket.io
      var socket = io.connect('http://localhost:8005');

      var sendForBroadcast = function (eventType) {
        return function (data, env) {
          socket.emit('client', {type: eventType, data: data});
        };
      };

      var messageHandlers = {
        'case.new': sendForBroadcast('case.new')
      };

      var publishToChannel = function (message) {
        channel.publish(message.type, message.data);
      };

      for (var message in messageHandlers) {
        socket.on('server', publishToChannel);

        postal.subscribe({
          channel: 'cla.operator',
          topic: message + '.self',
          callback: messageHandlers[message]
        });
      }

      return postal;
    }]);
})();
