(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('LayoutCtrl',
      ['$rootScope', '$scope', '$window', 'History', 'Session',
        function($rootScope, $scope, $window, History, Session){
          var offStateChange = $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams){
            if (from.name === 'case_list') {
              History.caseListStateParams = fromParams;
            }
            $window.scrollTo(0,0);
          });

          $scope.$on('$destroy', function () {
            offStateChange();
          });
        }
      ]
    );
})();