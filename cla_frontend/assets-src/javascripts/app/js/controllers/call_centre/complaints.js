(function() {
  'use strict';

  var maps = {},
    setupMappedValues = function(complaintConstants) {
      angular.forEach(['justified', 'resolved', 'sources', 'levels'], function(key) {
        maps[key] = maps[key] || {};
        angular.forEach(complaintConstants[key], function(data) {
          maps[key][data.value] = data.description;
        });
      });
    },
    addCategoriesToMappedValues = function(complaintCategories) {
      maps.categories = {};
      angular.forEach(complaintCategories, function(data) {
        maps.categories[data.id] = data.name;
      });
    },
    displayMappedValue = function(key, data) {
      return maps[key][data] || '';
    };

  angular.module('cla.controllers.operator')
    .controller('ComplaintsListCtrl',
      ['$scope', '$state', '$stateParams', 'complaintConstants', 'complaintsList', 'goToComplaint',
        function($scope, $state, $stateParams, complaintConstants, complaintsList, goToComplaint) {
          setupMappedValues(complaintConstants);
          $scope.displayMappedValue = displayMappedValue;

          $scope.complaintsList = complaintsList;
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

          $scope.statusClass = function(complaint) {
            switch(complaint.status_label) {
              case 'resolved':
              case 'unresolved':
                return 'is-complete';
              case 'pending':
                return '';
              case 'received':
                return 'is-new';
              default:
                return '';
            }
          };
        }
      ])
    .controller('ComplaintCtrl',
      ['$scope', '$state', '$stateParams', 'managers', 'complaintCategories', 'complaintConstants', 'complaint', 'complaintLogs', 'personal_details', 'goToComplaint', 'goToCase', 'form_utils', 'flash', 'postal', 'History',
        function($scope, $state, $stateParams, managers, complaintCategories, complaintConstants, complaint, complaintLogs, personal_details, goToComplaint, goToCase, form_utils, flash, postal, History) {
          setupMappedValues(complaintConstants);
          addCategoriesToMappedValues(complaintCategories);
          $scope.displayMappedValue = displayMappedValue;

          $scope.complaintCategories = complaintCategories;
          $scope.complaintConstants = complaintConstants;

          $scope.managers = managers;
          $scope.findManager = function(username) {
            var userObject = null;
            angular.forEach(managers, function(manager) {
              if(manager.username === username) {
                userObject = manager;
                return false;
              }
            });
            return userObject;
          };
          $scope.getUserDisplayName = function(userObject) {
            if(userObject.first_name || userObject.last_name) {
              return (userObject.first_name + ' ' + userObject.last_name).trim();
            }
            return userObject.username || 'Unknown';
          };

          $scope.goToCase = goToCase;
          $scope.complaintsListStateParams = History.complaintsListStateParams;

          $scope.complaint = complaint;
          $scope.complaintLogs = complaintLogs;
          $scope.personal_details = personal_details;

          $scope.displayStatus = function() {
            return 'Complaint ' + $scope.complaint.status_label;
          };
          $scope.statusClass = function() {
            switch($scope.complaint.status_label) {
              case 'resolved':
                return 'Icon--tick Icon--green';
              case 'unresolved':
                return 'Icon--tick Icon--red';
              case 'pending':
                return 'Icon--edit';
              case 'received':
                /* falls through */
              default:
                return 'Icon--alert Icon--orange';
            }
          };

          $scope.showDetailsForm = function(complaintDetailsFrm) {
            if(complaint.closed !== null) {
              flash('error', 'Complaint is closed, reopen it to edit the details');
              return;
            }
            if($scope.complaint.justified === null) {
                $scope.complaint.justified = '';
            } else {
                $scope.complaint.justified = $scope.complaint.justified + '';
            }
            complaintDetailsFrm.$show();
          };
          $scope.cancelComplaintDetails = function(complaintDetailsFrm) {
            complaintDetailsFrm.$cancel();
          };

          $scope.validateComplaintDetails = function(isValid) {
            return isValid ? true : 'false';
          };
          $scope.saveComplaintDetails = function(complaintDetailsFrm) {
            switch($scope.complaint.justified) {
              case 'true':
                $scope.complaint.justified = true;
                break;
              case 'false':
                $scope.complaint.justified = false;
                break;
              default:
                $scope.complaint.justified = null;
            }

            $scope.complaint.$update(function() {
              postal.publish({
                channel: 'Complaint',
                topic: 'save',
                data: $scope.complaint
              });
              flash('success', 'Complaint details saved');
            }, function(response) {
              form_utils.ctrlFormErrorCallback($scope, response, complaintDetailsFrm);
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
