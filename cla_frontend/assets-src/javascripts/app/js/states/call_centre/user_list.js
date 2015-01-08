(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.UserList.templateUrl = 'call_centre/user_list.html';

    mod.states = states;
  });
})();
