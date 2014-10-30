(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('notesHistory', ['$modal', function($modal) {
      return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'directives/notesHistory.html',
        scope: {
          case: '='
        },
        link: function(scope, element) {
          element.on('click', function() {
            $modal.open({
              templateUrl: 'notes.history.modal.html',
              controller: ['$scope', '$modalInstance', 'notes',
                function($scope, $modalInstance, notes) {
                  $scope.notes = notes;
                  
                  $scope.close = function () {
                    $modalInstance.dismiss('cancel');
                  };
                }
              ],
              resolve: {
                'notes': ['NotesHistory', function (NotesHistory) {
                  return [];
                  // return NotesHistory({case_reference: case_.reference}).$promise;
                }]
              }
            });
          });
        }
      };
    }]);
}());
