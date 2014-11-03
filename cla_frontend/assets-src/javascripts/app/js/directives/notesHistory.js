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
              controller: ['$scope', '$modalInstance', 'NotesHistory', 'dmp',
                function($modalScope, $modalInstance, NotesHistory, dmp) {
                  function updatePage() {
                    NotesHistory.query(
                      {
                        case_reference: $scope.case.reference,
                        type: $scope.type,
                        page: $modalScope.currentPage,
                        with_extra: true
                      }
                    ).$promise.then(function(data) {
                      var el,
                          prevNotes = ' ';

                      $modalScope.notes = data;

                      for (var i=$modalScope.notes.results.length-1; i>=0; i--) {
                        el = $modalScope.notes.results[i];
                        el.diffHTML = dmp.createSemanticDiffHtml(prevNotes || ' ', el.type_notes || ' ');
                        prevNotes = el.type_notes;
                      }

                      if (data.next !== null) {
                        $modalScope.notes.results.pop();
                      }
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
