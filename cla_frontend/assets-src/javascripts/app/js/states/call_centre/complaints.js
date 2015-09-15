(function() {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(['AppSettings', function(AppSettings) {
    var states = mod.states || angular.module('cla.states').states,
      complaintSubscriptions = [];

    states.ComplaintsList = {
      name: 'complaints_list',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'complaints/?page&ordering&show_closed&search',
      templateUrl: 'call_centre/complaints_list.html',
      controller: 'ComplaintsListCtrl',
      resolve: {
        complaintConstants: ['ComplaintConstants', function(ComplaintConstants) {
          return ComplaintConstants.get().$promise;
        }],
        complaintsList: ['user', '$q', '$stateParams', 'Complaint', function(user, $q, $stateParams, Complaint) {
          var deferred = $q.defer();
          if (!user.is_manager) {
            deferred.reject({
              msg: 'You must be a manager to view complaints.'
            });
            return deferred.promise;
          }

          var params = {
            dashboard: 'True',
            page: $stateParams.page,
            ordering: $stateParams.ordering,
            search: $stateParams.search
          };
          if($stateParams.show_closed === 'True') {
            params.show_closed = 'True';
          }

          return Complaint.query(params).$promise;
        }]
      }
    };

    states.Complaint = {
      name: 'complaint',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'complaint/{complaint_id}/',
      templateUrl: 'call_centre/complaint.html',
      controller: 'ComplaintCtrl',
      resolve: {
        managers: ['User', function(User) {
          return User.query({is_manager: 'True'}).$promise;
        }],
        complaintCategories: ['ComplaintCategory', function(ComplaintCategory) {
          return ComplaintCategory.query().$promise;
        }],
        complaintConstants: ['ComplaintConstants', function(ComplaintConstants) {
          return ComplaintConstants.get().$promise;
        }],
        complaint: ['user', '$q', '$stateParams', 'Complaint', function(user, $q, $stateParams, Complaint) {
          var deferred = $q.defer();
          if (!user.is_manager) {
            deferred.reject({
              msg: 'You must be a manager to view complaints.'
            });
            return deferred.promise;
          }

          return Complaint.get({
            complaint_id: $stateParams.complaint_id
          }).$promise;
        }],
        complaintCase: ['complaint', 'Case', function(complaint, Case) {
          return Case.get({caseref: complaint.case_reference}).$promise;
        }],
        personal_details: ['complaintCase', 'PersonalDetails', function(complaintCase, PersonalDetails) {
          if(complaintCase.personal_details) {
            return PersonalDetails.get({case_reference: complaintCase.reference}).$promise;
          } else {
            return new PersonalDetails({case_reference: complaintCase.reference});
          }
        }],
        complaintLogs: ['complaint', function(complaint) {
          return complaint.$getLogs();
        }]
      },
      onEnter: ['postal', 'complaintLogs', function(postal, complaintLogs) {
        var callback = function() {
          complaintLogs.$refresh();
        };
        complaintSubscriptions.push(
          postal.subscribe({
            channel: 'Complaint',
            topic: 'save',
            callback: callback
          })
        );
        complaintSubscriptions.push(
          postal.subscribe({
            channel: 'models',
            topic: 'Log.refresh',
            callback: callback
          })
        );
      }],
      onExit: function() {
        angular.forEach(complaintSubscriptions, function(subscription) {
          subscription.unsubscribe();
        });
        complaintSubscriptions = [];
      }
    };

    mod.states = states;
  }]);
})();
