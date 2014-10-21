var _ = require('underscore')._
  , peopleManager = require('./utils/peopleManager')
  , utils = require('./utils/utils')
  , MSG_OPTIONS = {
    '1': 'Please refresh your browser.'
  };


function getViews(nsp) {
  function validateMsg(msg) {
    if (!_.has(MSG_OPTIONS, msg)) {
      var err = new Error('You didn\'t pass any msg options.');
      err.status = 403;
      throw err;
    }
  }

  return {
    peopleMap: function (req, res) {
      res.send(peopleManager.people);
    },

    admin: function (req, res) {
      res.render('admin', {
        people: peopleManager.people,
        msgOptions: MSG_OPTIONS
      });
    },

    sendBroadcast: function (req, res, next) {
      validateMsg(req.body.msg);

      utils.sendToAllConnectedClients(nsp, 'systemMessage', req.body.msg);
      res.send("Done");
    },

    sendToClients: function (req, res) {
      validateMsg(req.body.msg);

      var socketIDs = req.body.socketID;

      if (!_.isArray(socketIDs)) {
        socketIDs = [socketIDs];
      }

      _.each(socketIDs, function(socketID) {
        utils.sendToClient(nsp, socketID, 'systemMessage', req.body.msg);
      })
      res.send("Done");
    }
  }
}

module.exports = {
  install: function(app, nsp) {
    var views = getViews(nsp);

    app.get('/admin/', views.admin);
    app.post('/admin/send-broadcast/', views.sendBroadcast);
    app.post('/admin/send-to-clients/', views.sendToClients);
    app.get('/admin/peopleMap/', views.peopleMap);
  }
}