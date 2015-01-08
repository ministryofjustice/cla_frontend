(function(){
  'use strict';

  // event trigger for search filters
  angular.module('cla.directives')
    .directive('searchFilter', ['postal', function (postal) {
      return {
        restrict: 'A',
        link: function(scope, elem) {
          elem
            .on('blur', function () {
              if (elem.val() !== '') {
                var lbl = elem.attr('name');
                postal.publish({channel: 'SearchFilter', topic: 'search', data: {label: lbl}});
              }
            })
            .on('keydown keypress', function (event) {
              if (event.which === 13) {
                event.preventDefault();
              }
            });
        }
      };
    }]);
})();
