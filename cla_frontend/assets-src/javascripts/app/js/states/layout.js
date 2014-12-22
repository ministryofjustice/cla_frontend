(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.Layout = {
      name: 'layout',
      abstract: true,
      templateUrl: 'base.html',
      controller: 'LayoutCtrl',
      resolve: {
        user: ['User', function (User) {
          return User.get({username: 'me'}).$promise;
        }]
      },
      onEnter: ['user', 'postal', function(user, postal) {
        postal.publish({
          channel : 'system',
          topic   : 'user.identified',
          data    : user
        });
      }]
    };

    mod.states = states;
  });
})();
