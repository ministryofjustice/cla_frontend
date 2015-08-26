(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('ComplaintsListCtrl',
      ['$scope', '$state', '$stateParams', 'complaintConstants', 'complaintsList', 'goToComplaint',
        function($scope, $state, $stateParams, complaintConstants, complaintsList, goToComplaint) {
          $scope.complaintsList = complaintsList;

          var maps = {};
          ['justified', 'resolved', 'levels'].map(function(key) {
            angular.forEach(complaintConstants[key], function(data) {
              maps[key] = maps[key] || {};
              maps[key][data.value] = data.description;
            });
          });
          $scope.displayMappedValue = function(key, data) {
            return maps[key][data] || '';
          };

          $scope.goToComplaint = goToComplaint;

          $scope.currentPage = $stateParams.page || 1;
          $scope.currentOrdering = $stateParams.ordering || '-created';
          $scope.showingClosed = $stateParams.show_closed === 'True';
          $scope.pageChanged = function(newPage) {
            $scope.currentPage = newPage;
            updatePage();
          };
          $scope.orderToggle = function(ordering) {
            if($scope.currentOrdering === ordering) {
              $scope.currentOrdering = '-' + ordering;
            } else {
              $scope.currentOrdering = ordering;
            }
            $scope.currentPage = 1;
            updatePage();
          };
          $scope.orderClass = function(ordering) {
            if($scope.currentOrdering === ordering) {
              return 'u-sortAsc';
            } else if($scope.currentOrdering === '-' + ordering) {
              return 'u-sortDesc';
            }
          };
          $scope.toggleShowClosed = function() {
            $scope.showingClosed = !$scope.showingClosed;
            updatePage();
          };

          function updatePage() {
            var params = {
              page: $scope.currentPage,
              ordering: $scope.currentOrdering,
              show_closed: $scope.showingClosed ? 'True': null
            };
            $state.go($state.current.name, params, {
              reload: true
            });
          }
        }
      ])
    .controller('ComplaintCtrl',
      ['$scope', '$state', '$stateParams', 'managers', 'complaintCategories', 'complaintConstants', 'complaint', 'complaintLogs', 'personal_details', 'goToComplaint', 'goToCase', 'form_utils', 'flash', 'postal', 'History',
        function($scope, $state, $stateParams, managers, complaintCategories, complaintConstants, complaint, complaintLogs, personal_details, goToComplaint, goToCase, form_utils, flash, postal, History) {
          $scope.complaintCategories = complaintCategories;
          $scope.complaintConstants = complaintConstants;

          $scope.managers = managers;
          $scope.getUserDisplayName = function(user) {
            if(user.first_name || user.last_name) {
              return (user.first_name + ' ' + user.last_name).trim();
            }
            return user.username;
          };

          $scope.goToCase = goToCase;
          $scope.complaintsListStateParams = History.complaintsListStateParams;

          $scope.complaint = complaint;
          $scope.complaintLogs = complaintLogs;
          $scope.personal_details = personal_details;

          $scope.complaintStatusNote = 'Complaint registered';  // TODO: bind this to complaint progress

          $scope.saveComplaintDetails = function() {
            $scope.complaint.$update(function() {
              postal.publish({
                channel: 'Complaint',
                topic: 'save',
                data: $scope.complaint
              });
              flash('success', 'Complaint details saved');
            }, function() {
              flash('error', 'Complaint details not saved');
            });
          };

          $scope.errors = {};
          $scope.currentAction = {};
          function resetActionForm() {
            $scope.currentAction.event_code = null;
            $scope.currentAction.notes = '';
            delete $scope.currentAction.resolved;
          }
          $scope.saveAction = function(actionFrm) {
            complaint.$addEvent($scope.currentAction, function() {
              $scope.complaint.$get();
              resetActionForm();
              postal.publish({
                channel: 'models',
                topic: 'Log.refresh'
              });
              flash('success', 'Complaint action saved');
            }, function(response) {
              form_utils.ctrlFormErrorCallback($scope, response, actionFrm);
            });
          };
          resetActionForm();

          $scope.reopenComplaint = function() {
            complaint.$reopen(function() {
              $scope.complaint.$get();
              resetActionForm();
              postal.publish({
                channel: 'models',
                topic: 'Log.refresh'
              });
              flash('success', 'Complaint reopened');
            }, function() {
              flash('warning', 'Complaint could not be reopened');
            });
          };

          $scope.getLogMessages = function(action, key) {
            var messages = {
              COMPLAINT_CREATED: {
                logHeading: 'Complaint created'
              },
              OWNER_SET: {
                logHeading: 'Complaint owner set'
              },
              COMPLAINT_REOPENED: {
                logHeading: 'Complaint reopened'
              },
              COMPLAINT_NOTE: {
                logHeading: '',
                notesPlaceholder: 'Enter notes',
                button: 'Save note'
              },
              HOLDING_LETTER_SENT: {
                logHeading: 'Holding letter sent',
                notesPlaceholder: 'Enter notes and copy of letter',
                button: 'Save letter'
              },
              FULL_RESPONSE_SENT: {
                logHeading: 'Full response sent',
                notesPlaceholder: 'Enter notes and copy of letter',
                button: 'Save letter'
              },
              COMPLAINT_CLOSED: {
                logHeading: 'Complaint closed',
                notesPlaceholder: 'Enter notes',
                button: 'Close complaint'
              }
            }[action];
            messages = messages || {
              logHeading: '',
              notesPlaceholder: 'Enter notes',
              button: 'Save'
            };
            if(typeof key !== 'undefined') {
              return messages[key];
            }
            return messages;
          };
        }
      ]);
})();
