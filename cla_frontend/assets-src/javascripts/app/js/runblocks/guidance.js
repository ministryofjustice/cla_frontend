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

// FOR DOM: START RUBBISH

  angular.module('cla.controllers')
    .controller('GuidanceModalCtrl',
      ['$scope', '$http', 'cla.guidance', 'docRef', '$sce', '$location', '$modalInstance',
        function($scope, $http, guidance, docRef, $sce, $location, $modalInstance){
          $scope.results = [];
          $scope.query = '';
          $scope.htmlDoc = null;
          $scope.docRef = docRef;

          $scope.search = function() {
            guidance.search(this.query).then(function(data) {
              $scope.htmlDoc = null;
              $scope.results = data;
            });
          };

          $scope.setDocRef = function(docRef) {
            $scope.docRef = docRef;
          };

          $scope.$watch('docRef', function(newVal) {
            if (!newVal) {
              $scope.htmlDoc = null;
            } else {
              var parts = newVal.split('#'),
                  docRef = parts[0],
                  section = parts.length === 2 ? parts[1] : null;

              guidance.getDoc(docRef).then(function(doc) {
                $http.get(doc.source).success(function(data) {
                  $scope.htmlDoc = $sce.trustAsHtml(data);
                  if (section) {
                    $location.hash(section);
                  }
                });
              });
            }
          });

          $modalInstance.result.then(function() {}, function() {
            $location.hash('no_scroll');
          });
        }
      ]
    );


  angular.module('cla.controllers')
    .controller('GuidanceCtrl',
      ['$scope', '$rootScope', '$modal',
        function($scope, $rootScope, $modal){
          $scope.openGuidance = function(docRef) {
            $modal.open({
              template: '<form ng-submit="search()"><input type="text" name="query" ng-model="query" /><button type="submit">Search</button></form><div ng-show="!htmlDoc"><ul><li ng-repeat="result in results"><a href="" ng-click="setDocRef(result.ref)">{{result.title}}</a></li></div><p ng-bind-html="htmlDoc"></p>',
              controller: 'GuidanceModalCtrl',
              resolve: {
                docRef: function() { return docRef; }
              }
            });
          };

          $rootScope.$on('guidance:openDoc', function(__, docRef) {
            $scope.openGuidance(docRef);
          });
        }
      ]
    );

  angular.module('cla.app')
    .run(function() {
      $(document.body).append('<div ng-controller="GuidanceCtrl"><a href="" ng-click="openGuidance()">Guidance</a></div>');
    });

// FOR DOM: END RUBBISH

  angular.module('cla.directives')
    .directive('guidanceLink', [function() {
      return {
        restrict: 'E',
        scope: {
          doc: '@doc'
        },
        template: '<a href="" ng-click="openGuidance()" class="Icon Icon--right Icon--info"></a>',
        link: function(scope) {
          scope.openGuidance = function() {
            scope.$emit('guidance:openDoc', scope.doc);
          };
        }
      };
    }]
  );
})();
