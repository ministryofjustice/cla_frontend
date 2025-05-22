'use strict';
(function(){
  angular.module('cla.services')
    .factory('cla.guidance', ['GuidanceNote', function(GuidanceNote) {
      return {
        search: function(query) {
          return GuidanceNote.query({'search': query}).$promise;
        },

        getDoc: function(docName) {
          return GuidanceNote.get({'name': docName}).$promise;
        }
      };
    }
  ]);

  angular.module('cla.controllers')
    .controller('GuidanceCtrl',
      ['$scope', '$rootScope', '$http', 'cla.guidance', '$sce', '$location', 'postal','$anchorScroll',
        function($scope, $rootScope, $http, guidance, $sce, $location, postal, $anchorScroll){
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

          $scope.addDoc = function(docName) {
            $scope.toggleResults(false);
            $scope.docName = docName;
            if(docName) {
              var hash = docName.split("#").pop();
              if (hash) {
                $location.hash(hash);
                setTimeout(function (){
                  $anchorScroll();
                }, 100);
              }
            }
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

          $scope.$watch('docName', function(newVal) {
            if (!newVal) {
              $scope.htmlDoc = null;
            } else {
              var docName = newVal;

              guidance.getDoc(docName).then(function(doc) {
                // track the document that has been opened
                postal.publish({
                  channel: 'Guidance',
                  topic: 'openDoc',
                  data: {
                    label: '/static/guidance/' + doc.name + '.html'
                  }
                });

                $scope.htmlDoc = $sce.trustAsHtml(doc.body);
              });
            }
          });

          $rootScope.$on('guidance:openDoc', function(__, docName) {
            $scope.addDoc(docName);
          });

          $rootScope.$on('guidance:closeDoc', function() {
            postal.publish({channel: 'Guidance', topic: 'closeDoc'});
            $scope.htmlDoc = null;
            $scope.docName = null;
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
