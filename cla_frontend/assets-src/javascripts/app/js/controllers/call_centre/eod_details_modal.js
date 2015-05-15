(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('EODDetailsModalCtrl',
      ['$scope', 'case', 'eod_details', 'tplVars', '$modalInstance', 'EXPRESSIONS_OF_DISSATISFACTION', 'EXPRESSIONS_OF_DISSATISFACTION_FLAGS', '$q', '$timeout', 'flash', 'postal',
        function($scope, $case, eod_details, tplVars, $modalInstance, EXPRESSIONS_OF_DISSATISFACTION, EXPRESSIONS_OF_DISSATISFACTION_FLAGS, $q, $timeout, flash, postal) {

          // template vars
          tplVars = angular.extend({
            title: 'Expressions of Dissatisfaction',
            buttonText: 'Save'
          }, tplVars);
          $scope.tplVars = tplVars;

          $scope.case = $case;
          $scope.EXPRESSIONS_OF_DISSATISFACTION = EXPRESSIONS_OF_DISSATISFACTION;

          // focus on search field on open
          $modalInstance.opened.then(function() {
            $timeout(function() {
              angular.element('#eod-modal-search').focus();
            }, 50);
          });

          $scope.eod_details_model = {
            categories: {},
            notes: eod_details.notes || ''
          };
          angular.forEach(eod_details.categories, function(category) {
            $scope.eod_details_model.categories[category.category] = {
              is_major: category.is_major
            };
          });

          $scope.isCategorySelected = function(category) {
            return $scope.eod_details_model.categories[category] || false;
          };

          $scope.categoryNeedsMajorFlag = function(category) {
            if(EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category]) {
              return EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category].length > 1;
            }
            return null;
          };

          $scope.isCategoryFlaggedMajor = function(category) {
            if(!$scope.eod_details_model.categories[category]) {
              return false;
            }
            return $scope.eod_details_model.categories[category].is_major || false;
          };

          $scope.toggleCategory = function(category) {
            if($scope.eod_details_model.categories[category]) {
              delete $scope.eod_details_model.categories[category];
            } else {
              var defaultMajorFlag = false;
              if(EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category].length === 1 &&
                EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category].indexOf('major') > -1) {
                defaultMajorFlag = true;
              }
              $scope.eod_details_model.categories[category] = {
                is_major: defaultMajorFlag
              };
            }
          };

          $scope.toggleCategoryMajorFlag = function(category) {
            if(!$scope.eod_details_model.categories[category] || !EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category] || EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category].length < 2) {
              return;
            }
            $scope.eod_details_model.categories[category].is_major = !$scope.eod_details_model.categories[category].is_major;
          };

          $scope.submit = function(theForm) {
            if(theForm.$valid) {
              var eodPromise = $q.defer();

              eod_details.notes = $scope.eod_details_model.notes;
              eod_details.categories = [];
              angular.forEach($scope.eod_details_model.categories, function(category_details, category_key) {
                eod_details.categories.push({
                  category: category_key,
                  is_major: category_details.is_major
                });
              });

              eod_details.$update($scope.case.reference, function() {
                postal.publish({channel: 'EOD', topic: 'save'});
                eodPromise.resolve();
              }, function() {
                eodPromise.reject('fail');
              });

              var response = $q.all([eodPromise.promise]);
              $scope.$close(response);
            }
          };

          $scope.cancel = function() {
            $scope.$dismiss('cancel');
          };
        }
      ]
    );
})();