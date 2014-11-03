(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('LayoutCtrl',
      ['$rootScope', '$scope', '$window', 'History', 'user', 'hotkeys', 'localStorageService',
        function($rootScope, $scope, $window, History, user, hotkeys, localStorageService){
          var offStateChange = $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams){
            if (from.name === 'case_list') {
              History.caseListStateParams = fromParams;
            }
            $window.scrollTo(0,0);
          });

          var numberFields = angular.element('body');
          numberFields.on('mousewheel', ':input[type=number]',function () {
            angular.element(this).blur();
          });

          $scope.$on('$destroy', function () {
            offStateChange();
            numberFields.off('mousewheel');
          });

          $rootScope.user = user;

          hotkeys.add({
            combo: 's c',
            description: 'Search cases',
            callback: function(e) {
              e.preventDefault();
              angular.element('#search [name="q"]').focus();
            }
          });

          hotkeys.add({
            combo: '$',
            description: 'Show call scripts',
            callback: function(e) {
              e.preventDefault();
              $rootScope.showCallScript = !$rootScope.showCallScript;
              localStorageService.set('showCallScript', $rootScope.showCallScript);
            }
          });
        }
      ]
    );
})();
