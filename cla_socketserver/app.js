var app = require('express')()
  , _ = require('underscore')._
  , server = require('http').Server(app)
  , io = require('socket.io')(server)
  , nsp = io.of('/socket.io')
  , bodyParser = require('body-parser')
  , peopleManager = require('./utils/peopleManager')
  , adminApp = require('./admin')
  , StatsD = require('node-statsd').StatsD
  , statsd = new StatsD({
      host: process.env.STATSD_HOST || 'localhost',
      post: process.env.STATSD_POST || 8125
    });

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
server.listen(8005);

app.use(function(err, req, res, next){
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.status(err.status || 500);
  res.render('error', { error: err });
});

// ADMIN

adminApp.install(app, nsp);


// SOCKETS

function sendConnStats() {
  // console.log('sending to statsd people count: '+peopleManager.getPeopleCount());
  statsd.gauge('people_connected', peopleManager.getPeopleCount());

  var versionCounts = peopleManager.getVersionCounts();
  _.each(versionCounts, function(value, key) {
    // console.log('version ' + key + ': ' + value);
    statsd.gauge('people_connected.'+key, value);
  });
}

nsp.on('connection', function (socket) {
  socket.on('identify', function(data) {
    peopleManager.identify(nsp, socket, data.username || data, data.usertype, data.appVersion);
    sendConnStats();
  });

  socket.on('disconnect', function () {
    peopleManager.disconnect(nsp, socket);
    sendConnStats();
  });

  socket.on('startViewingCase', function(caseref) {
    peopleManager.startViewingCase(nsp, socket, caseref);
  });

  socket.on('stopViewingCase', function(caseref) {
    peopleManager.stopViewingCase(nsp, socket, caseref);
  });
});
