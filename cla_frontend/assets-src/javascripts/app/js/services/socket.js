'use strict';
(function(){
  angular.module('cla.services')
    .factory('cla.bus', ['postal', 'SOCKETIO_CLIENT_CONFIG', function (postal, SOCKETIO_CLIENT_CONFIG) {
      // io is global reference to socket.io
      var host = $('head').data('socketioServer');
      var socket = io.connect(host);

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
