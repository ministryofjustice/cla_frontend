'use strict';
(function(){

  angular.module('cla.directives')
  .directive('addressFinder', ['Address', '$modal', function(Address, $modal) {
    return  {
      restrict: 'E',
      require: 'ngModel',
      templateUrl:  'directives/address_finder.html',
      scope: {
        model: '=ngModel'
      },
      link: function(scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$setViewValue(scope.model);
      },
      controller: function($scope, $element){
        $scope.findAddress = function(){
          $scope.loading = true;
          $scope.addresses = [];

          var params = {
            postcode: $scope.model.postcode,
            fields: 'formatted_address'
          };

          Address.query(params, function(addresses){
            $scope.loading = false;
            $scope.addresses = addresses;

            $modal.open({
              templateUrl: 'includes/address_finder.modal.html',
              scope: $scope,
              controller: 'AddressFinderModalCtl',
            });

          });

        };
      }
    };
  }]);

  angular.module('xeditable').directive('editableAddressFinder', ['editableDirectiveFactory',
    function(editableDirectiveFactory) {
      return editableDirectiveFactory({
        directiveName: 'editableAddressFinder',
        inputTpl: '<address-finder></address-finder>',
        useCopy: true
      });
    }]);

  angular.module('cla.services')
    .factory('Address', ['$resource', function($resource) {
      return $resource('/addressfinder/addresses/?postcode=:postcode&fields=:fields',
        {postcode: '@postcode', fields: '@fields'}, {
        get: {
          method: 'GET',
          isArray: true
        }
      });
    }]);

  angular.module('cla.controllers')
    .controller('AddressFinderModalCtl',
      ['$scope', '$modalInstance',
        function($scope, $modalInstance) {
          $scope.close = function () {
            $modalInstance.close();
          };

          $scope.setAddress = function(addr){
            var parts = addr.split('\n');
            $scope.$parent.model.postcode = parts.pop();
            $scope.$parent.model.street = parts.join('\n');
            $modalInstance.close();
          }
        }
      ]
    );

})();
