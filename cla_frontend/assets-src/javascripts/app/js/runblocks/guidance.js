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
        }
      };
    }
  ]);

  angular.module('cla.controllers')
    .controller('GuidanceModalCtrl',
      ['$scope', '$http', 'cla.guidance',
        function($scope, $http, guidance){
          $scope.results = [];
          $scope.query = '';
          $scope.doc = null;
          $scope.search = function() {
            guidance.search(this.query).then(function(data) {
              $scope.doc = null;
              $scope.results = data;
            });
          };

          $scope.loadDocument = function(doc) {
            $http.get(doc.source).success(function(data) {
              $scope.doc = data;
            });
          };
        }
      ]
    );


  angular.module('cla.controllers')
    .controller('GuidanceCtrl',
      ['$scope', '$modal',
        function($scope, $modal){
          $scope.openGuidance = function() {
            $modal.open({
              template: '<form ng-submit="search()"><input type="text" name="query" ng-model="query" /><button type="submit">Search</button></form><div ng-show="!doc"><ul><li ng-repeat="result in results"><a href="" ng-click="loadDocument(result)">{{result.title}}</a></li></div><p ng-bind-html="doc"></p>',
              controller: 'GuidanceModalCtrl',
              resolve: {}
            });
          };
        }
      ]
    );

  angular.module('cla.app')
    .run(function() {
      $(document.body).append('<div ng-controller="GuidanceCtrl"><a href="" ng-click="openGuidance()">Guidance</a></div>');
    });
})();
