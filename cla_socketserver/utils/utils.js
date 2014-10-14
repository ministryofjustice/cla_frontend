var _ = require('underscore')._;


module.exports.sendToSelf = function(socket, method, data) {
  socket.emit(method, data);
}

// module.exports.sendToAllConnectedClients = function(io, method, data) {
//   io.sockets.emit(method, data);
// }

module.exports.sendToAllClientsInChannel = function(nsp, channel, method, data) {
	// console.info('sending message to all in channel '+channel);
  nsp.in(channel).emit(method, data);
}

module.exports.findPersonBySocket = function(socket, people) {
	return _.find(_.values(people), function(person) {
		return person.ownsSocket(socket);
	})
}