var app = require('express')()
  , siteHostname = process.env.SITE_HOSTNAME || 'localhost'
  , _ = require('underscore')._
  , httpServer = require('http').Server(app)
  , bodyParser = require('body-parser')
  , peopleManager = require('./utils/peopleManager')
  , adminApp = require('./admin');

var socketServer = require('socket.io')(httpServer, {
    cors: {
      origin: `*${siteHostname}:*`
    },
    allowEIO3: true
});

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(err, req, res, next){
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.status(err.status || 500);
  res.render('error', { error: err });
});

// ADMIN
adminApp.install(app, socketServer);

// SOCKETS
socketNamespace = socketServer.of('/socket.io');

socketNamespace.on('connection', function (socket) {
  socket.on('identify', function(data) {
    peopleManager.identify(socketNamespace, socket, data.username || data, data.usertype, data.appVersion);
  });

  socket.on('disconnect', function () {
    peopleManager.disconnect(socketNamespace, socket);
  });

  socket.on('startViewingCase', function(caseref) {
    peopleManager.startViewingCase(socketNamespace, socket, caseref);
  });

  socket.on('stopViewingCase', function(caseref) {
    peopleManager.stopViewingCase(socketNamespace, socket, caseref);
  });
});

module.exports = {app, httpServer, socketServer};
