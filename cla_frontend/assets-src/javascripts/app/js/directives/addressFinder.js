'use strict';
(function(){

  angular.module('cla.directives')
  .directive('addressFinder', ['AddressService', '$uibModal', '$q', '$timeout', 'postal', function (AddressService, $uibModal, $q, $timeout, postal) {
    return  {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        // hijack enter on this field
        elem.bind('keydown keypress', function (event) {
          if (event.which === 13) {
            event.preventDefault();
            scope.findAddress();
          }
        });

        // find address and load modal
        scope.findAddress = function () {
          elem.attr('disabled', true);
          scope.isLoading = true;

          postal.publish({channel: 'AddressFinder', topic: 'search'});

          var modalOpts = {
            templateUrl: 'includes/address_finder.modal.html',
            controller: 'AddressFinderModalCtl',
            resolve: {
              AddressResponse: function () {
                var deferred = $q.defer();

                AddressService.query({
                  postcode: elem.val(),
                  fields: 'formatted_address'
                }, function (addresses) {
                  elem.removeAttr('disabled');
                  scope.isLoading = false;

                  deferred.resolve({
                    addresses: addresses,
                    postcode: elem.val()
                  });
                }, function () {
                  elem.removeAttr('disabled');
                  scope.isLoading = false;

                  deferred.reject();
                });

                return deferred.promise;
              }
            }
          };
          var onConfirmSuccess = function (response) {
            if (response.chosenAddress) {
              var parts = response.chosenAddress.split('\n');
              var postcode = parts.pop();
              var address = parts.join('\n');
              var streetSelector = attrs.addressFinder;

              // run inside timeout to avoid $digest clash
              $timeout(function () {
                elem
                  .val(postcode)
                  .change();
                angular.element(streetSelector)
                  .val(address)
                  .change()
                  .focus();
              });

              postal.publish({channel: 'AddressFinder', topic: 'selected'});
            } else {
              postal.publish({channel: 'AddressFinder', topic: 'cancelled'});

              $timeout(function () {
                elem.focus();
              });
            }
          };
          var onOpen = function () {
            $timeout(function () {
              angular.element('[name="address-finder-search"]').focus();
            }, 50);
          };
          var onDismiss = function () {
            postal.publish({channel: 'AddressFinder', topic: 'cancelled'});

            $timeout(function () {
              elem.focus();
            });
          };

          var modal = $uibModal.open(modalOpts);
          modal.opened.then(onOpen);
          modal.result.then(onConfirmSuccess, onDismiss);
        };
      },
      template: function(elem) {
        elem
          .after('<button type="button" class="AddressLookup-search" name="find-address" ng-click="findAddress()" ng-disabled="isLoading">Find Address</button>')
          .parents('.FormRow').addClass('AddressLookup');
      }
    };
  }]);

  angular.module('cla.services')
    .factory('AddressService', ['$resource', function($resource) {
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
      ['$scope', 'AddressResponse', '$timeout', '$filter',
        function($scope, AddressResponse, $timeout, $filter) {
          $scope.addresses = AddressResponse.addresses;
          $scope.postcode = AddressResponse.postcode;
          $scope.suffix = $scope.addresses.length > 1 || $scope.addresses.length === 0 ? 'es' : '';
          $scope.selected = {};

          $scope.singleAddr = function (query) {
            var filtered = $filter('filter')($scope.addresses, query);

            if (filtered.length === 1) {
              $scope.selected.address = filtered[0].formatted_address;
            } else {
              $scope.selected.address = null;
            }
          };

          $scope.formatAddress = function (addr) {
            return addr.split('\n').join(', ');
          };

          $scope.close = function () {
            $scope.$dismiss('cancel');
          };

          $scope.setAddress = function(isValid) {
            if (isValid) {
              $scope.$close({
                chosenAddress: $scope.selected.address
              });
            }
          };

          $scope.singleAddr();
        }
      ]
    );
})();
