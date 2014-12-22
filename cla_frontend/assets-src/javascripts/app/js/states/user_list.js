(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || {};

    states.UserList = {
      name: 'user_list',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'user/?search',
      templateUrl: 'user_list.html',
      controller: 'UserListCtrl',
      resolve: {
        users: ['User', 'user', '$q', function(User, user, $q){

          var deferred = $q.defer();

          if (!user.is_manager) {
            // reject promise and handle in $stateChangeError
            deferred.reject({
              msg: 'The you must be a manager to edit users.'
            });
            return deferred.promise;
          }
          return User.query().$promise;
        }]
      }
    };

    mod.states = states;
  }]);
})();
