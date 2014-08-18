/* jshint undef: false */
(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('AssignProviderCompleteCtrl',
      ['$scope', 'Provider',
        function($scope, Provider) {
          $scope.selected_provider = Provider.get({id: $scope.case.provider});

          Provider.get({id: $scope.case.provider}, function(data) {
            Raven.captureMessage('Assigned provider', {tags: { provider: data }});
          });
        }
      ]
    );
})();