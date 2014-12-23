'use strict';
(function(){
  angular.module('cla.services')
    .factory('cla.guidance', ['lunr', '$http', '$q', 'STATIC_ROOT', function(lunr, $http, $q, STATIC_ROOT) {
      var _index,
          indexPath = STATIC_ROOT+'javascripts/guidance_index.json',
          guidanceHtmlPath = function(fileName) {
            return STATIC_ROOT+'guidance/'+fileName+'.html';
          };

      function getIndex() {
        var deferred = $q.defer();

        if (_index !== undefined) {
          deferred.resolve(_index);
        } else {
          $http.get(indexPath).success(function(data) {
            _index = lunr.Index.load(data);
            _index._claTitles = data._claTitles;

            deferred.resolve(_index);
          }).error(function(data) {
            deferred.reject(data);
          });
        }
        return deferred.promise;
      }

      return {
        search: function(query) {
          return getIndex().then(function(index) {
            return index.search(query).map(function (result) {
              result.title = index._claTitles[result.ref];
              result.source = guidanceHtmlPath(result.ref);
              return result;
            });
          });
        },

        getDoc: function(docRef) {
          return getIndex().then(function(index) {
            return {
              title: index._claTitles[docRef],
              source: guidanceHtmlPath(docRef)
            };
          });
        }
      };
    }
  ]);

  angular.module('cla.controllers')
    .controller('GuidanceCtrl',
      ['$scope', '$rootScope', '$http', 'cla.guidance', '$sce', '$location', 'postal',
        function($scope, $rootScope, $http, guidance, $sce, $location, postal){
          $scope.results = [];
          $scope.htmlDoc = null;

          $scope.search = function() {
            if ($scope.guidance !== undefined) {
              postal.publish({channel: 'Guidance', topic: 'search'});

              guidance.search($scope.guidance.query).then(function(data) {
                $scope.results = data;
                $scope.no_results = data.length === 0 && $scope.guidance.query !== '' ? true : false;
              });
            } else {
              postal.publish({channel: 'Guidance', topic: 'search.blank'});
            }
          };

          $scope.addDoc = function(docRef) {
            $scope.toggleResults(false);
            $scope.docRef = docRef;
          };

          $scope.closeDoc = function() {
            $scope.htmlDoc = null;
          };

          $scope.toggleResults = function(toggle) {
            $scope.show_results = toggle;

            // bind/unbind click listener to show/hide results
            if (toggle) {
              angular.element('body').on('click.guidanceDelegate', function (e) {
                if (angular.element(e.target).parents('.Guidance-searchContainer').length < 1) {
                  $scope.toggleResults(false);
                }
              });
            } else {
              angular.element('body').off('click.guidanceDelegate');
            }
          };

          $scope.$watch('docRef', function(newVal) {
            if (!newVal) {
              $scope.htmlDoc = null;
            } else {
              var parts = newVal.split('#'),
                  docRef = parts[0],
                  section = parts.length === 2 ? parts[1] : null;

              guidance.getDoc(docRef).then(function(doc) {
                // track the document that has been opened
                postal.publish({
                  channel: 'Guidance',
                  topic: 'openDoc',
                  data: {
                    label: doc.source
                  }
                });

                $http.get(doc.source).success(function(data) {
                  $scope.htmlDoc = $sce.trustAsHtml(data);
                  if (section) {
                    $location.hash(section);
                  }
                });
              });
            }
          });

          $rootScope.$on('guidance:openDoc', function(__, docRef) {
            $scope.addDoc(docRef);
          });

          $rootScope.$on('guidance:closeDoc', function() {
            postal.publish({channel: 'Guidance', topic: 'closeDoc'});
            $scope.htmlDoc = null;
            $scope.docRef = null;
          });
        }
      ]
    );

  angular.module('cla.operatorApp')
    .run(function() {
      $(document.body).append('<div ng-controller="GuidanceCtrl"><guidance></guidance></div>');
    });

  angular.module('cla.providerApp')
    .run(function() {
      $(document.body).append('<div ng-controller="GuidanceCtrl"><guidance></guidance></div>');
    });


  angular.module('cla.directives')
    .directive('guidance', [function() {
      return {
        restrict: 'E',
        templateUrl: 'directives/guidance.html'
      };
    }]
  );

  angular.module('cla.directives')
    .directive('guidanceLink', [function() {
      return {
        restrict: 'E',
        scope: {
          doc: '@doc'
        },
        templateUrl: 'directives/guidance.inline_link.html',
        link: function(scope) {
          scope.openGuidance = function() {
            scope.$emit('guidance:openDoc', scope.doc);
          };
        }
      };
    }]
  );

  angular.module('cla.directives')
    .directive('guidanceItem', [function() {
      return {
        restrict: 'E',
        scope: {
          content: '=',
          ref: '='
        },
        templateUrl: 'directives/guidance.tab.html',
        link: function(scope) {
          scope.closeDoc = function() {
            scope.$emit('guidance:closeDoc', scope.ref);
          };

          scope.$watch('content', function(newVal) {
            if (newVal) {
              scope.minimise = false;
            }
          });
        }
      };
    }]
  );
})();
