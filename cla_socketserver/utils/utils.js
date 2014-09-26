module.exports.sendToSelf = function(socket, method, data) {
  socket.emit(method, data);
}

// module.exports.sendToAllConnectedClients = function(io, method, data) {
//   io.sockets.emit(method, data);
// }

module.exports.sendToAllClientsInChannel = function(nsp, channel, method, data) {
	console.log('sending message to all in channel '+channel);
  nsp.in(channel).emit(method, data);
}