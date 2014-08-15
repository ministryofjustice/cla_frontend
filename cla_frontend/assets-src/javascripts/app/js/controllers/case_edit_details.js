(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseEditDetailCtrl',
      ['$scope', 'AlternativeHelpService',
        function($scope, AlternativeHelpService){
          // when viewing coming back to the details view
          // clear out the Alternative Help selections.
          AlternativeHelpService.clear();
        }
      ]
    );
})();