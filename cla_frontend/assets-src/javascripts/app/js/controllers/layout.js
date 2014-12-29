(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('LayoutCtrl',
      ['$rootScope', '$scope', '$window', 'History', 'user', 'hotkeys', 'localStorageService', 'ClaPostalService',
        function($rootScope, $scope, $window, History, user, hotkeys, localStorageService, ClaPostalService){
          var offStateChange = $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams){
            if (from.name === 'case_list') {
              History.caseListStateParams = fromParams;
            }

            if (to.parent !== 'case_detail.edit.eligibility') {
              $window.scrollTo(0,0);
            }
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
            callback: function(e, hotkey) {
              e.preventDefault();

              ClaPostalService.publishHotKey(hotkey);

              angular.element('#search [name="q"]').focus();
            }
          });

          hotkeys.add({
            combo: '$',
            description: 'Show call scripts',
            callback: function(e, hotkey) {
              e.preventDefault();

              ClaPostalService.publishHotKey(hotkey);

              $rootScope.showCallScript = !$rootScope.showCallScript;
              localStorageService.set('showCallScript', $rootScope.showCallScript);
            }
          });
        }
      ]
    );
})();
