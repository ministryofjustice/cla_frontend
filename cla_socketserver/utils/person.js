var _ = require('underscore')._;


function Person(username) {
  this.username = username;
  this.connections = {};
};

Person.prototype.connect = function(socket) {
	if (typeof this.connections[socket.id] === 'undefined') {
		this.connections[socket.id] = {
			caseViewed: null
		};
	}
};

Person.prototype.disconnect = function(socket) {
	conn = this.connections[socket.id];
	if (conn !== 'undefined') {
		delete this.connections[socket.id];
	}
};

Person.prototype.getViewedCase = function(socket) {
	conn = this.connections[socket.id];
	if (conn !== 'undefined') {
		return conn.caseViewed;
	}

	return null;
}

Person.prototype.getAllViewedCase = function() {
	return _.pluck(_.values(this.connections), 'caseViewed');
}

Person.prototype.ownsSocket = function(socket) {
	return _.contains(_.keys(this.connections), socket.id);
};

Person.prototype.canBeDeleted = function() {
	return _.isEmpty(this.connections);
}

Person.prototype.startViewingCase = function(socket, caseref) {
	var conn = this.connections[socket.id];
	if (typeof conn === 'undefined') {
		console.error('Something\'s wrong, can\'t find socket data');
		return;
	}

	conn.caseViewed = caseref;
	socket.join(caseref);
};

Person.prototype.stopViewingCase = function(socket, caseref) {
	var conn = this.connections[socket.id];
	if (typeof conn === 'undefined') {
		console.error('Something\'s wrong, can\'t find socket data');
		return;
	}

	socket.leave(conn.caseViewed);
	conn.caseViewed = null;
};


module.exports = Person;