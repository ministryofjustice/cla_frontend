(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('notesHistory', ['$modal', function($modal) {
      return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'directives/notesHistory.html',
        scope: {
          case: '=',
          type: '@type'
        },
        controller: ['$scope', function($scope) {
          $scope.showNotesHistory = function() {
            $modal.open({
              templateUrl: 'notes.history.modal.html',
              controller: ['$scope', '$modalInstance', 'NotesHistory',
                function($modalScope, $modalInstance, NotesHistory) {
                  function updatePage() {
                    NotesHistory.query(
                      {
                        case_reference: $scope.case.reference,
                        type: $scope.type,
                        page: $modalScope.currentPage
                      }
                    ).$promise.then(function(data) {
                      $modalScope.notes = data;
                    });
                  }

                  $modalScope.currentPage = 1;

                  $modalScope.goToNextPage = function() {
                    $modalScope.currentPage += 1;
                    updatePage();
                  };

                  $modalScope.goToPreviousPage = function() {
                    $modalScope.currentPage -= 1;
                    updatePage();
                  };
                  
                  $modalScope.close = function () {
                    $modalInstance.dismiss('cancel');
                  };

                  updatePage();
                }
              ]
            });
          };
        }]
      };
    }]);
}());
