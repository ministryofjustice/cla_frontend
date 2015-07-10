var _ = require('underscore')._;


function Person(username, userType) {
  this.username = username;
  this.userType = userType;
  this.connections = {};
};

Person.prototype.connect = function(socket, appVersion, userType) {
  if (typeof this.connections[socket.id] === 'undefined') {
    this.connections[socket.id] = {
      caseViewed: null,
      appVersion: appVersion,
      userType: userType
    };
    socket.join(userType);
  }
};

Person.prototype.disconnect = function(socket) {
  conn = this.connections[socket.id];
  if (conn !== 'undefined') {
    socket.leave(conn.userType);
    delete this.connections[socket.id];
  }
};

Person.prototype.getViewedCase = function(socket) {
  conn = this.connections[socket.id];
  if (conn !== 'undefined') {
    return conn.caseViewed;
  }

  return null;
};

Person.prototype.getAllViewedCase = function() {
  return _.pluck(_.values(this.connections), 'caseViewed');
};

Person.prototype.ownsSocket = function(socket) {
  return _.contains(_.keys(this.connections), socket.id);
};

Person.prototype.canBeDeleted = function() {
  return _.isEmpty(this.connections);
};

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

Person.prototype.getAllAppVersions = function() {
  return _.pluck(_.values(this.connections), 'appVersion');
};


module.exports = Person;
