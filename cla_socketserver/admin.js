(function () {
  'use strict';

  var _ = require('underscore')._;
  var peopleManager = require('./utils/peopleManager');
  var utils = require('./utils/utils');
  var MSG_OPTIONS = {
    '1': 'Out of date version, refresh browser'
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
      notifications: function (req, res) {
        var data = {
          activeTab: 'notifications'
        };
        utils.sendToAllClientsInChannel(nsp, req.body.usertype || 'operator', 'notification', req.body.notifications);
        data.success = true;
        res.send(data);
      }
    }
  }

  module.exports = {
    install: function(app, nsp) {
      var views = getViews(nsp);
      app.all('/admin/notifications/', views.notifications);
    }
  }
})();
