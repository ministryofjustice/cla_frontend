var _ = require('underscore')._;


module.exports.sendToSelf = function(socket, method, data) {
  socket.emit(method, data);
}

module.exports.sendToAllConnectedClients = function(nsp, method, data) {
  nsp.emit(method, data);
}

module.exports.sendToClient = function(nsp, socketID, method, data) {
  nsp.in(socketID).emit(method, data);
}

module.exports.sendToAllClientsInChannel = function(nsp, channel, method, data) {
	// console.info('sending message to all in channel '+channel);
  nsp.in(channel).emit(method, data);
}

module.exports.findPersonBySocket = function(socket, people) {
	return _.find(_.values(people), function(person) {
		return person.ownsSocket(socket);
	})
}