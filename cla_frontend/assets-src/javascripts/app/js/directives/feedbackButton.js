(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('feedbackButton', ['$state', '$compile', '$http', '$timeout', 'AppSettings', 'flash', 'url_utils', 'hotkeys',
      function($state, $compile, $http, $timeout, AppSettings, flash, url_utils, hotkeys) {
      return {
        restrict: 'C',
        replace: true,
        scope: true,
        link: function(scope, elem) {
          scope.isPopoverVisible = false;
          scope.feedbackTypes = ['Issue', 'Suggestion'];

          function reset() {
            scope.feedbackType = scope.feedbackTypes[0];
            scope.comments = '';
          }

          // Create and compile overlay and insert next to the feedback button
          var popover = angular.element('<feedback-popover/>');
          popover.insertAfter(elem);
          $compile(popover)(scope);

          reset();

          scope.toggle = function() {
            scope.isPopoverVisible = !scope.isPopoverVisible;
            elem.toggleClass('feedbackButton--toggled', scope.isPopoverVisible);

            if(scope.isPopoverVisible) {
              $timeout(function() {
                popover.find('textarea').first().focus();
              });
            }
          };

          scope.close = function() {
            scope.toggle(false);
            reset();
            scope.feedback_frm.$setValidity('server', true);
          };

          scope.submit = function(form) {
            $http({
              url: url_utils.url('zendesk/'),
              method: 'POST',
              data: $.param({
                comments: this.comments,
                feedback_type: this.feedbackType,
                url: $state.href($state.current),
                app_name: AppSettings.appName,
                user_agent: navigator.userAgent
              }),
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
              }
            }).success(function(){
              scope.close();
              flash('success', 'Your feedback has been sent');
            }).error(function() {
              form.$setValidity('server', false);
            });
          };

          // Set up hotkeys
          hotkeys.bindTo(scope)
            .add({
              combo: '!',
              description: 'Toggle feedback overlay',
              callback: function() {
                scope.toggle(!scope.isPopoverVisible);
              }
            })
            // Close dialogue on ESC but don't clear the form
            .add({
              combo: 'esc',
              allowIn: ['SELECT', 'TEXTAREA'],
              callback: function() {
                scope.toggle(false);
              }
            });
        }
      };
    }
  ]);
}());
