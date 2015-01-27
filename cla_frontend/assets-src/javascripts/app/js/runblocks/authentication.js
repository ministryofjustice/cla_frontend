(function () {
  'use strict';

  // in seconds
  var idle = 3300;
  var timeout = 300;

  angular.module('cla.operatorApp')
    .config(['IdleProvider', function(IdleProvider) {
      IdleProvider.autoResume(false); // don't auto resume
      IdleProvider.idle(idle);
      IdleProvider.timeout(timeout);
    }]);

  angular.module('cla.services')
    .run(['$rootScope', 'postal', 'Idle', '$modal', '$http', 'form_utils', 'url_utils', 'flash',
      function($rootScope, postal, Idle, $modal, $http, form_utils, url_utils, flash) {
        var loginModal, warningModal;

        var openLoginModal = function () {
          closeWarningModal();

          loginModal = $modal.open({
            templateUrl: 'includes/login.html',
            backdrop: 'static',
            controller: function ($scope) {
              $scope.login = function (form) {
                $http({
                  url: url_utils.url('login/'),
                  method: 'POST',
                  data: $.param({
                    username: this.username,
                    password: this.password
                  }),
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                  }
                }).then(
                  function() {
                    flash('Your session has been successfully restored');
                    $scope.$close();
                  },
                  function(response){
                    form_utils.ctrlFormErrorCallback($scope, response, form);
                  }
                );
              };
            }
          });
        };

        var openWarningModal = function () {
          warningModal = $modal.open({
            templateUrl: 'includes/session_expiring.html',
            backdrop: 'static',
            controller: function ($scope) {
              $scope.countdown = timeout;

              $scope.extend = function () {
                $http({
                  url: url_utils.proxy('user/me/'),
                  method: 'GET'
                })
                .then(
                  function () {
                    $scope.$close();
                    warningModal = null;
                  },
                  function () {
                    logout();
                  }
                );
              };

              $scope.logout = function () {
                logout();
              };
            }
          });
        };

        var closeWarningModal = function () {
          if (warningModal) {
            warningModal.close();
            warningModal = null;
          }
        };

        var logout = function () {
          $http({
            url: 'auth/logout/',
            method: 'GET'
          })
          .then(openLoginModal);
        };

        // Listen to authentication events
        var AuthSub = postal.channel('Authentication');
        AuthSub.subscribe({
          topic: 'unauthorized',
          callback: openLoginModal
        });
        AuthSub.subscribe({
          topic: 'extend',
          callback: function (data) {
            Idle.setIdle(data.expiresIn - timeout);
          }
        });

        // Open modal when idle time has passed without action
        $rootScope.$on('IdleStart', openWarningModal);
        // close modal if idle time is interrupted
        $rootScope.$on('IdleEnd', closeWarningModal);
        // open modal if idle time ends without interruption
        $rootScope.$on('IdleTimeout', logout);

        // start watching for idleness
        Idle.watch();
      }
    ]);
})();
