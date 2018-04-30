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
    .run(['$rootScope', 'postal', 'Idle', '$uibModal', '$http', 'form_utils', 'url_utils', 'flash',
      function($rootScope, postal, Idle, $uibModal, $http, form_utils, url_utils, flash) {
        var loginModal, warningModal;

        var openLoginModal = function () {
          closeModals();

          loginModal = $uibModal.open({
            templateUrl: 'includes/login.html',
            backdrop: 'static',
            controller: function ($scope) {
              $scope.login = function (form) {
                $http({
                  url: url_utils.login,
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
                    loginModal = null;
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
          warningModal = $uibModal.open({
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

        var closeModals = function () {
          if (warningModal) {
            try {
              warningModal.close();
            } catch (err) {
            } finally {
              warningModal = null;
            }
          }
          if (loginModal) {
            try {
              loginModal.close();
            } catch (err) {
            } finally {
              loginModal = null;
            }
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
        $rootScope.$on('IdleEnd', closeModals);
        // open modal if idle time ends without interruption
        $rootScope.$on('IdleTimeout', logout);

        // start watching for idleness
        Idle.watch();
      }
    ]);
})();
