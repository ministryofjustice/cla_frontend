/*jslint plusplus: true, unused: false */

(function() {
  'use strict';

  angular.module('cla.directives')
  // lazy-model
  .directive('lazyModel', ['$compile', '$timeout',
    function($compile, $timeout) {
      return {
        restrict: 'A',
        priority: 500,
        terminal: true,
        require: ['lazyModel', '^form', '?^lazySubmit'],
        scope: true,
        controller: ['$scope', '$element', '$attrs', '$parse',
          function($scope, $element, $attrs, $parse) {
            if ($attrs.lazyModel === '') {
              throw '`lazy-model` should have a value.';
            }

            // getter and setter for original model
            var ngModelGet = $parse($attrs.lazyModel),
                ngModelSet = ngModelGet.assign;

            // accept changes
            this.accept = function() {
              console.log('setting');
              ngModelSet($scope.$parent, $scope.buffer);
            };

            // reset changes
            this.reset = function() {
              console.log('getting');
              $scope.buffer = ngModelGet($scope.$parent);
            };

            // watch for original model change (and initialization also)
            $scope.$watch($attrs.lazyModel, angular.bind(this, function(newValue, oldValue) {
              this.reset();
            }));
          }
        ],
        compile: function compile(elem, attr) {
          // set ng-model to buffer in directive scope (nested)
          elem.attr('ng-model', 'buffer');
          // remove lazy-model attribute to exclude recursion
          elem.removeAttr('lazy-model');
          // store compiled fn
          var compiled = $compile(elem);
          return {
            pre: function(scope, elem) {
              // compile element with ng-model directive poining to `scope.buffer`   
              compiled(scope);
            },
            post: function postLink(scope, elem, attr, ctrls) {
              var lazyModelCtrl = ctrls[0],
                  formCtrl = ctrls[1],
                  lazySubmitCtrl = ctrls[2],
                  // parentCtrl may be formCtrl or lazySubmitCtrl
                  parentCtrl = lazySubmitCtrl || formCtrl,
                  form;

              // for the first time attach hooks
              if (parentCtrl.$lazyControls === undefined) {
                parentCtrl.$lazyControls = [];

                // find form element
                form = elem.parent();
                while (form[0].tagName !== 'FORM') {
                  form = form.parent();
                }

                // bind submit
                form.bind('submit', function() {
                  // this submit handler must be called LAST after all other `submit` handlers
                  // to get final value of formCtrl.$valid. The only way - is to call it in
                  // the next tick via $timeout
                  $timeout(function() {
                    if (formCtrl.$valid) {
                      // form valid - accept new values
                      for (var i = 0; i < parentCtrl.$lazyControls.length; i++) {
                        parentCtrl.$lazyControls[i].accept();
                      }

                      // call final hook `lazy-submit`
                      if (lazySubmitCtrl) {
                        lazySubmitCtrl.finalSubmit();
                      }
                    }
                  });
                });

                // bind reset
                form.bind('reset', function(e) {
                  e.preventDefault();
                  $timeout(function() {
                    // reset changes
                    for (var i = 0; i < parentCtrl.$lazyControls.length; i++) {
                      parentCtrl.$lazyControls[i].reset();
                    }
                  });
                });

              }

              // add to collection
              parentCtrl.$lazyControls.push(lazyModelCtrl);

              // remove from collection on destroy
              scope.$on('$destroy', function() {
                for (var i = parentCtrl.$lazyControls.length; i--;) {
                  if (parentCtrl.$lazyControls[i] === lazyModelCtrl) {
                    parentCtrl.$lazyControls.splice(i, 1);
                  }
                }
              });

            }
          };
        }
      };
    }
  ])

  // lazy-submit
  .directive('lazySubmit', function() {
    return {
      restrict: 'A',
      require: ['lazySubmit', 'form'],
      controller: ['$element', '$attrs', '$scope', '$parse',
        function($element, $attrs, $scope, $parse) {
          var finalHook = $attrs.lazySubmit ? $parse($attrs.lazySubmit) : angular.noop;
          this.finalSubmit = function() {
            finalHook($scope);
          };
        }
      ]
    };
  });
})();
