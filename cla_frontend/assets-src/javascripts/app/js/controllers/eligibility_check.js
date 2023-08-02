(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category', '$stateParams', 'flash', '$state', 'postal', 'moment', '_', 'IncomeWarningsService', 'SPECIFIC_BENEFITS', '$timeout', 'diagnosis', 'DISREGARDS',
        function($scope, Category, $stateParams, flash, $state, postal, Moment, _, IncomeWarningsService, SPECIFIC_BENEFITS, $timeout, diagnosis, DISREGARDS ){
          $scope.category_list = Category.query();
          $scope.formDidChange = false;
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
          $scope.getCategoryForScriptNotes = function() {
            if($scope.inJudicialReview()) {
              return 'Judicial review';
            } else {
              return diagnosis.category;
            }
          }

          $scope.inJudicialReview = function() {
            return diagnosis.nodes[diagnosis.nodes.length - 2].id === 'n156';
          }

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
          $scope.disregardOptions = DISREGARDS;
          var under_18_passported = function() {
            if(!$scope.eligibility_check.is_you_under_18) {
              return false;
            }
            if($scope.eligibility_check.under_18_receive_regular_payment === false && $scope.eligibility_check.under_18_has_valuables === false) {
              return true;
            }
            return false;
          }
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
            'Finances': [under_18_passported],
            'Income': [passported, under_18_passported],
            'Expenses': [passported, under_18_passported]
          };

          var isRequired = function (section) {
            var isFalse = function (fn) { return !fn(); };
            var r = tabHideRules[section.title].every(isFalse);
            return r;
          };

          $scope.hasSpecificBenefits = function () {
            return $scope.eligibility_check.specific_benefits !== undefined && $scope.eligibility_check.specific_benefits !== null && typeof $scope.eligibility_check.specific_benefits === 'object';
          };

          $scope.hasDisregards = function () {
            return $scope.eligibility_check.disregards !== undefined && $scope.eligibility_check.disregards !== null && typeof $scope.eligibility_check.disregards === 'object';
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
          $scope.under18Change = function() {
            $scope.eligibility_check.under_18_passported = under_18_passported();
            $scope.updateTabs();
          }

          $scope.updateTabs = function () {
            $scope.sections = all_sections.filter(isRequired);
          };
          $scope.updateTabs();

          var monthly = function (amount) {
            return {'per_interval_value': amount, 'interval_period': 'per_month'};
          };

          var setDetailsDefaults = function (ec) {
            ec.has_partner = false;
            ec.is_you_or_your_partner_over_60 = false;
            ec.specific_benefits = {
              universal_credit: false,
              income_support: false,
              job_seekers_allowance: false,
              pension_credit: false,
              employment_support: false
            };
            ec.disregards = {
              infected_blood: false,
              vaccine_damage: false,
              vcjd_trust: false,
              criminal_injuries: false,
              national_emergencies: false,
              london_emergencies: false,
              love_manchester: false,
              energy_prices: false,
              cost_living: false
            }
          };

          var setSavingsDefaults = function (ec) {
            [ec.you, ec.partner].map(function (person) {
              person.savings = {
                bank_balance: 0,
                investment_balance: 0,
                childcare: 0,
                asset_balance: 0,
                credit_balance: 0
              };
            });
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

          $scope.skipMeansTest = function () {
            setDetailsDefaults($scope.eligibility_check);
            setSavingsDefaults($scope.eligibility_check);
            setIncomeDefaults($scope.eligibility_check);
            setExpensesDefaults($scope.eligibility_check);
            $scope.save();
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
            // auto-save eligibility check when switching tabs if form changed
            if($scope.formDidChange) {
              // can't use $dirty of form as it doesn't change at the right time
              $scope.save();
            }
            $state.go(section.state);
          };

          $scope.save = function () {
            $scope.setDefaultsInNonRequiredSections($scope.eligibility_check);
            $scope.eligibility_check.$update($scope.case.reference, function (data) {
              $scope.formDidChange = false;
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
