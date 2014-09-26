(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('LayoutCtrl',
      ['$rootScope', '$scope', '$window', 'History', 'user', 'hotkeys',
        function($rootScope, $scope, $window, History, user, hotkeys){
          var offStateChange = $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams){
            if (from.name === 'case_list') {
              History.caseListStateParams = fromParams;
            }
            $window.scrollTo(0,0);
          });

          $scope.$on('$destroy', function () {
            offStateChange();
          });

          $rootScope.user = user;

          hotkeys.add({
            combo: 's c',
            description: 'Search cases',
            callback: function(e) {
              e.preventDefault();
              $('#search [name="q"]').focus();
            }
          });
        }
      ]
    );
})();
