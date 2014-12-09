(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('copyUserAddress', ['$timeout', function ($timeout) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/copyUserAddress.html',
      scope: {
        pdEdit: '=',
        pdModel: '='
      },
      link: function (scope) {
        scope.copyAddress = function () {
          var tpForm = angular.element('[name="third_party_frm"]');
          var tpPostcode = angular.element('input[name="postcode"]', tpForm);
          var tpStreet = angular.element('textarea[name="street"]', tpForm);
          var postcode, street;

          if (scope.pdEdit) {
            var pdForm = angular.element('[name="personaldetails_frm"]');
            var pdPostcode = angular.element('input[name="postcode"]', pdForm);
            var pdStreet = angular.element('textarea[name="street"]', pdForm);

            postcode = pdPostcode.val();
            street = pdStreet.val();
          } else if (scope.pdModel) {
            postcode = scope.pdModel.postcode;
            street = scope.pdModel.street;
          }

          $timeout(function () {
            tpPostcode.val(postcode).change();
            tpStreet.val(street).change();
          });
        };
      }
    };
  }]);
})();
