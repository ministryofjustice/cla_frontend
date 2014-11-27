(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('ResetPasswordCtrl',
    ['$scope', 'user', '$modalInstance', 'form_utils',
      function ($scope, user_, $modalInstance, form_utils) {
      $scope.user_ = user_;
      $scope.$modalInstance = $modalInstance;

      $scope.save = function(frm) {

        $scope.user_.$resetPassword(this.old_password, this.new_password)
          .then(function (data) {
            $modalInstance.close(data);
          }, function (data) {
            form_utils.ctrlFormErrorCallback($scope, data, frm);
          });
      };

    }])
    .controller('UserListCtrl',
      ['$scope', 'users', 'User', 'form_utils', '$modal', 'flash',
        function($scope, users, User, form_utils, $modal, flash) {
          $scope.users = users;
          $scope.add_user = function(frm) {
            var user = new User(this.new_user),
              this_scope = this;
            user.$save().then(function(data){
              $scope.edit = false;
              $scope.users.push(data);
              this_scope.new_user = {};
              frm.$setPristine(true);
            },
              function (data) {
                form_utils.ctrlFormErrorCallback($scope, data, frm);
              });
          };

          $scope.reset_password = function (user) {
            $modal.open({
              templateUrl: 'includes/reset_password.html',
              controller: 'ResetPasswordCtrl',
              size: 'sm',
              resolve: {user: [function(){return user;}]}
            });
          };

          $scope.reset_lockout = function (user) {
            user.$resetLockout().then(function() {
              flash('Account unlocked successfully');
            });
          };
        }
      ]
    );
})();
