(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category', '$stateParams', 'flash', '$state', 'postal', 'moment', '_', 'IncomeWarningsService', 'SPECIFIC_BENEFITS', '$timeout',
        function($scope, Category, $stateParams, flash, $state, postal, Moment, _, IncomeWarningsService, SPECIFIC_BENEFITS, $timeout){
          $scope.category_list = Category.query();
          // set nass benefits to FALSE by default
          $scope.eligibility_check.on_nass_benefits = $scope.eligibility_check.on_nass_benefits || false;

          // income warnings
          postal.subscribe({
            channel: 'IncomeWarnings',
            topic: 'update',
            callback: function(data) {
              $scope.incomeWarnings = data.warnings;
            }
          });

          IncomeWarningsService.setEligibilityCheck($scope.eligibility_check);
          $scope.incomeWarnings = IncomeWarningsService.warnings;
          $scope.hasIncomeWarnings = function () {
            return _.size($scope.incomeWarnings) > 0;
          };

          $scope.warnings = {};
          $scope.oneMonthAgo = new Moment().add(1, 'days').subtract(1, 'months').format('Do MMMM, YYYY');
          var all_sections = [{
              title: 'Details',
              state: 'case_detail.edit.eligibility.details',
              template: 'includes/eligibility.details.html'
            }, {
              title: 'Finances',
              state: 'case_detail.edit.eligibility.finances',
              template: 'includes/eligibility.finances.html'
            }, {
              title: 'Income',
              state: 'case_detail.edit.eligibility.income',
              template: 'includes/eligibility.income.html'
            }, {
              title: 'Expenses',
              state: 'case_detail.edit.eligibility.expenses',
              template: 'includes/eligibility.expenses.html'
            }
          ];

          $scope.specificBenefitsOptions = SPECIFIC_BENEFITS;

          var passported = function() {
            var _radio = $('#id_your_details-passported_benefits_0').get(0);
            if (_radio) {
              return _radio.checked;
            }
            var _passported = $scope.eligibility_check.on_passported_benefits;
            if (_passported === '0') {
              _passported = false;
            }
            return !!_passported;
          };

          var tabHideRules = {
            'Details': [],
            'Finances': [],
            'Income': [passported],
            'Expenses': [passported]
          };

          var isRequired = function (section) {
            var isFalse = function (fn) { return !fn(); };
            var r = tabHideRules[section.title].every(isFalse);
            return r;
          };

          $scope.hasSpecificBenefits = function () {
            return $scope.eligibility_check.specific_benefits !== undefined && $scope.eligibility_check.specific_benefits !== null && typeof $scope.eligibility_check.specific_benefits === 'object';
          };

          $scope.benefitChange = function () {
            var passported = _.some($scope.eligibility_check.specific_benefits, function (benefit) {
              return benefit === true || benefit === '1';
            });

            if (passported) {
              $scope.eligibility_check.on_passported_benefits = true;
            } else {
              $scope.eligibility_check.on_passported_benefits = false;
            }

            $timeout(function () {
              $scope.updateTabs();
            });
          };

          $scope.updateTabs = function () {
            $scope.sections = all_sections.filter(isRequired);
          };
          $scope.updateTabs();

          var monthly = function (amount) {
            return {'per_interval_value': amount, 'interval_period': 'per_month'};
          };

          var setIncomeDefaults = function (ec) {
            [ec.you.income, ec.partner.income].map(function (person) {
              person.earnings = monthly(0);
              person.other_income = monthly(0);
              person.self_employed = false;
              person.total = 0;
              person.self_employment_drawings = monthly(0);
              person.benefits = monthly(0);
              person.tax_credits = monthly(0);
              person.child_benefits = monthly(0);
              person.maintenance_received = monthly(0);
              person.pension = monthly(0);
            });
            ec.dependants_young = 0;
            ec.dependants_old = 0;
          };

          var setExpensesDefaults = function (ec) {
            [ec.you.deductions, ec.partner.deductions].map(function (person) {
              person.income_tax = monthly(0);
              person.mortgage = monthly(0);
              person.childcare = monthly(0);
              person.rent = monthly(0);
              person.maintenance = monthly(0);
              person.criminal_legalaid_contributions = 0;
              person.total = 0;
              person.national_insurance = monthly(0);
            });
          };

          var defaultsSetters = {
            'Income': setIncomeDefaults,
            'Expenses': setExpensesDefaults
          };

          $scope.setDefaultsInNonRequiredSections = function (eligibility_check) {
            all_sections.map(function (section) {
              if (!isRequired(section) && section.title in defaultsSetters) {
                defaultsSetters[section.title](eligibility_check);
              }
            });
          };

          $scope.hasSMOD = function () {
            return $scope.eligibility_check.category === 'family' || $scope.eligibility_check.category === 'debt';
          };

          $scope.hasPartner = function () {
            return $scope.eligibility_check.has_partner;
          };

          $scope.tabWarningClass = function (section) {
            var incomeWarnings = $scope.incomeWarnings;
            var className = '';

            switch (section.title) {
              case 'Income':
                if (incomeWarnings.zeroIncome || incomeWarnings.negativeDisposable || incomeWarnings.housing) {
                  className = 'is-warning';
                }
                break;
              case 'Expenses':
                if (incomeWarnings.negativeDisposable || incomeWarnings.housing) {
                  className = 'is-warning';
                }
                break;
            }

            return className;
          };

          $scope.fieldWarningClass = function (warnings) {
            var className = '';

            angular.forEach(warnings, function (warning) {
              if ($scope.incomeWarnings[warning]) {
                className = 'is-warning';
              }
            });

            return className;
          };

          $scope.isComplete = function (section) {
            var emptyInputs = angular.element('#' + section).find('input, select, textarea').filter(function() {
              var $this = angular.element(this),
                  type = $this.attr('type');

              if (type === 'radio' || type === 'checkbox') {
                return angular.element('[name=' + $this.attr('name') + ']:checked').val() === undefined;
              } else {
                return $this.val() === '';
              }
            });

            return !emptyInputs.length;
          };

          $scope.currentState = function () {
            var current = 'case_detail.edit.eligibility.details';
            angular.forEach($scope.sections, function(section) {
              if ($state.includes(section.state)) {
                current = section.state;
              }
            });
            return current;
          };

          $scope.gotoSection = function (section) {
            $state.go(section.state);
          };

          $scope.save = function () {
            $scope.setDefaultsInNonRequiredSections($scope.eligibility_check);
            $scope.eligibility_check.$update($scope.case.reference, function (data) {
              $scope.case.eligibility_check = data.reference;
              $scope.case.$get();
              $scope.eligibility_check.validate($scope.case.reference).then(function (resp) {
                $scope.warnings = resp.data.warnings;
              });

              // updates the state of case.eligibility_state after each save
              $scope.case.state = data.state;

              // publish eligibility save
              postal.publish({
                channel: 'EligibilityCheck',
                topic: 'save',
                data: {
                  eligibilityCheck: data
                }
              });

              // fire a save notification
              flash('success', 'The means test has been saved. The current result is <strong>' + $scope.eligibilityText(data.state) + '</strong>');

              // refreshing the logs
              postal.publish({
                channel: 'models',
                topic: 'Log.refresh'
              });
            });
          };

          $scope.removeProperty = function (index) {
            $scope.eligibility_check.property_set.splice(index, 1);
          };
          $scope.addProperty = function () {
            var property = {};

            if (typeof $scope.eligibility_check.property_set === 'undefined') {
              $scope.eligibility_check.property_set = [];
            }
            // if not SMOD, set to not disputed
            if (!$scope.hasSMOD()) {
              property.disputed = 0;
            }

            $scope.eligibility_check.property_set.push(property);
          };

          $scope.eligibilityText = function (eligible) {
            return eligible === 'yes' ? 'eligible for Legal Aid' : (eligible === 'no' ? 'not eligible for Legal Aid' : 'unknown');
          };
        }
      ]
    );
})();
