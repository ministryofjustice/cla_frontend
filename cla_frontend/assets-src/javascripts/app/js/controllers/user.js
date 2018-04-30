(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('ResetPasswordCtrl',
    ['$scope', 'user', '$uibModalInstance', 'form_utils',
      function ($scope, user_, $uibModalInstance, form_utils) {
      $scope.user_ = user_;
      $scope.$uibModalInstance = $uibModalInstance;

      $scope.save = function(frm) {

        $scope.user_.$resetPassword(this.old_password, this.new_password)
          .then(function (data) {
            $uibModalInstance.close(data);
          }, function (data) {
            form_utils.ctrlFormErrorCallback($scope, data, frm);
          });
      };

    }])
    .controller('UserListCtrl',
      ['$scope', 'users', 'User', 'form_utils', '$uibModal', 'flash',
        function($scope, users, User, form_utils, $uibModal, flash) {
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
            $uibModal.open({
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
