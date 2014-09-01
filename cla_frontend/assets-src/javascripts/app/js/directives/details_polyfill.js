(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('details', function() {
      return {
        restrict: 'E',
        link: function(scope, element) {
          var hasNativeSupport = 'open' in document.createElement('details'),
              notSummaryChildren,
              toggleShow;

          // return if browser already has native support
          if (hasNativeSupport) { return; }

          notSummaryChildren = element.children(':not(summary)');
          // hide on load
          notSummaryChildren.hide();

          toggleShow = function () {
            notSummaryChildren
              .toggle()
              .toggleClass('is-open');
            element
              .toggleClass('is-open');
          };

          element
            .addClass('is-notnative')
            .on('click', toggleShow);
        }
      };
    });
}());
