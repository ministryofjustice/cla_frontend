var http = require('http')
  , server = http.createServer().listen(8005)
  , io = require('socket.io')(server)
  , nsp = io.of('/socket.io')
  , peopleManager = require('./utils/peopleManager');


nsp.on('connection', function (socket) {
  socket.on('client', function (data) {
    socket.broadcast.emit('server', data);
  });

  socket.on('identify', function(username) {
    peopleManager.identify(nsp, socket, username);
  });

  socket.on('disconnect', function () {
    peopleManager.disconnect(nsp, socket);
  });

  socket.on('startViewingCase', function(caseref) {
    peopleManager.startViewingCase(nsp, socket, caseref);
  });

  socket.on('stopViewingCase', function(caseref) {
    peopleManager.stopViewingCase(nsp, socket, caseref);
  });
});

server.addListener('request', function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end('{"status": "OK"}\n');
});
