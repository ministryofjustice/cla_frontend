var http = require('http')
  , server = http.createServer().listen(8005)
  , io = require('socket.io')(server)
  , nsp = io.of('/socket.io')
  , peopleManager = require('./utils/peopleManager')
  , StatsD = require('node-statsd').StatsD
  , statsd = new StatsD({
      host: process.env.STATSD_HOST || 'localhost',
      post: process.env.STATSD_POST || 8125
    });


nsp.on('connection', function (socket) {
  /*
  socket.on('client', function (data) {
    socket.broadcast.emit('server', data);
  });
  */

  socket.on('identify', function(username) {
    peopleManager.identify(nsp, socket, username);

    // console.log('sending to statsd people count: '+peopleManager.getPeopleCount());
    statsd.gauge('people_connected', peopleManager.getPeopleCount());
  });

  socket.on('disconnect', function () {
    peopleManager.disconnect(nsp, socket);

    // console.log('sending to statsd people count: '+peopleManager.getPeopleCount());
    statsd.gauge('people_connected', peopleManager.getPeopleCount());
  });

  socket.on('startViewingCase', function(caseref) {
    peopleManager.startViewingCase(nsp, socket, caseref);
  });

  socket.on('stopViewingCase', function(caseref) {
    peopleManager.stopViewingCase(nsp, socket, caseref);
  });
});
