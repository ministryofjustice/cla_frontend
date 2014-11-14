(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseListCtrl',
      ['$rootScope', '$scope', 'cases', 'person', '$stateParams', '$state', 'Case', 'History', 'goToCase', 'hotkeys', 'historicCases',
        function($rootScope, $scope, cases, person, $stateParams, $state, Case, History, goToCase, hotkeys, historicCases) {
          // PARAMS
          $scope.searchParams = angular.extend({}, $stateParams);
          $scope.searchParams.ordering = $scope.searchParams.ordering || '-priority';
          $scope.searchParams.page = $scope.searchParams.page || 1;

          $scope.cases = cases;
          $scope.person = person;
          $scope.historicCases = historicCases;


          // SEARCH ACTIONS

          function _updatePage(options) {
            $state.go('case_list', $scope.searchParams, options);
          }

          $scope.pageChanged = function(newPage) {
            $scope.searchParams.page = newPage;
            _updatePage();
          };

          $scope.filterByPerson = function(person_ref) {
            History.latestSearchParams = angular.extend({}, $scope.searchParams);

            $scope.searchParams = {
              person_ref: person_ref
            };
            _updatePage({inherit: false});
          };

          $scope.backToLatestSearch = function() {
            $scope.searchParams = History.latestSearchParams || {};
            _updatePage({inherit: false});
          };

          $scope.resetSearch = function() {
            $scope.searchParams = {};
            _updatePage({inherit: false});
          };

          // FILTER ACTIONS

          $scope.filterCases = function(newState, acceptedState){
            $scope.searchParams.new = newState;
            $scope.searchParams.accepted = acceptedState;
            _updatePage();
          };

          $scope.filterClass = function(newState, acceptedState) {
            if (
              typeof $scope.searchParams.new !== 'undefined' &&
              $scope.searchParams.new !== null &&
              typeof $scope.searchParams.accepted !== 'undefined' &&
              $scope.searchParams.accepted !== null
            ) {
              if (parseInt($scope.searchParams.new) === parseInt(newState) && parseInt($scope.searchParams.accepted) === parseInt(acceptedState)) {
                return 'is-selected';
              }
            } else {
              if (typeof newState === 'undefined' && typeof acceptedState === 'undefined') {
                return 'is-selected';
              }
            }
          };

          // SORT ACTIONS

          $scope.sortToggle = function(currentOrderProp){
            if (currentOrderProp === $scope.searchParams.ordering) {
              $scope.searchParams.ordering = '-' + currentOrderProp;
            } else {
              $scope.searchParams.ordering = currentOrderProp;
            }
            $scope.searchParams.page = 1;
            _updatePage();
          };

          $scope.sortClass = function(orderProp) {
            if ($scope.searchParams.ordering === orderProp) {
              return 'u-sortAsc';
            } else if ($scope.searchParams.ordering === '-' + orderProp) {
              return 'u-sortDesc';
            }
          };

          // Classes
          $scope.rowClass = function (_case) {
            return {
              'is-rejected': _case.rejected, // OPERATOR
              'is-new': !_case.provider_viewed && _case.provider_viewed !== undefined, // PROVIDER
              'is-complete': _case.outcome_code === 'SPOP' // PROVIDER
            };
          };

          $scope.caseTypeClass = function (_case) {
            return {
              'Icon--call': _case.source === 'PHONE',
              'Icon--form': _case.source === 'WEB',
              'Icon--sms': _case.source === 'SMS',
              'Icon--voicemail': _case.source === 'VOICEMAIL'
            };
          };

          // ADD / EDIT CASE ACTIONS

          $scope.addCase = function(person_ref) {
            var saveParams = {
              personal_details: person_ref || null
            };

            $rootScope.$emit('timer:start', {
              success: function() {
                new Case(saveParams).$save(function(data) {
                  $state.go('case_detail.edit', {caseref:data.reference});
                });
              }
            });
          };

          // keyboard shortcut to create case
          hotkeys
            .bindTo($scope)
            .add({
              combo: 'c c',
              description: 'Create case',
              callback: function() {
                $scope.addCase($scope.person.reference);
              }
            });

          $scope.goToCase = goToCase;

          // checking the time after the template as been rendered
          $scope.$evalAsync(function() {
            $rootScope.$emit('timer:check');
          });

        }
      ]
    );
})();
