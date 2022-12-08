(function () {
  'use strict';

  var utils = require('./utils/utils');

  function getViews(nsp) {
    return {
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
