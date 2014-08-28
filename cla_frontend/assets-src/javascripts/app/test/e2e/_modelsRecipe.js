/* jshint unused:false */
(function(){
  'use strict';

  var protractor = require('protractor'),
      utils = require('./_utils');

  module.exports = {
    Case: {
      DEFAULT_REQUIRED_CASE_FIELDS: {
        notes: 'Case notes',
        media_code: 'AA'
      },

      DEFAULT_REQUIRED_ELIGIBILITY_CHECK_FIELDS: '{"category": "family"}',

      IN_SCOPE: [
        'n115', // Family
        'n116', // The client wants to protect themselves
        'n119'  // Child abuse
      ],

      OUT_SCOPE: [
        'n2', // debt
        'n77', // other money owed
        'n80' // business debts
      ],

      ELIGIBLE: '{"category": "family", "is_you_or_your_partner_over_60": true, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": false, "state": "yes", "dependants_old": 0, "partner": {"deductions": {"income_tax": {}, "mortgage": {}, "childcare": {}, "rent": {}, "maintenance": {}, "criminal_legalaid_contributions": null, "total": 0, "national_insurance": {}}, "savings": null, "income": {"other_income": {}, "self_employed": null, "total": 0, "earnings": {}}}, "you": {"deductions": {"income_tax": {"per_interval_value": 0, "interval_period": "per_month"}, "mortgage": {"per_interval_value": 0, "interval_period": "per_month"}, "childcare": {"per_interval_value": 0, "interval_period": "per_month"}, "rent": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance": {"per_interval_value": 0, "interval_period": "per_month"}, "criminal_legalaid_contributions": 0, "total": 0, "national_insurance": {"per_interval_value": 0, "interval_period": "per_month"}}, "savings": {"credit_balance": 0, "investment_balance": 0, "total": 4560000, "asset_balance": 0, "bank_balance": 4560000}, "income": {"other_income": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employed": false, "total": 0, "earnings": {"per_interval_value": 0, "interval_period": "per_month"}}}, "dependants_young": 0, "on_nass_benefits": false}',
      INELIGIBLE: '{"category": "family", "is_you_or_your_partner_over_60": false, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": false, "state": "yes", "dependants_old": 0, "partner": {"deductions": {"income_tax": {}, "mortgage": {}, "childcare": {}, "rent": {}, "maintenance": {}, "criminal_legalaid_contributions": null, "total": 0, "national_insurance": {}}, "savings": null, "income": {"other_income": {}, "self_employed": null, "total": 0, "earnings": {}}}, "you": {"deductions": {"income_tax": {"per_interval_value": 0, "interval_period": "per_month"}, "mortgage": {"per_interval_value": 0, "interval_period": "per_month"}, "childcare": {"per_interval_value": 0, "interval_period": "per_month"}, "rent": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance": {"per_interval_value": 0, "interval_period": "per_month"}, "criminal_legalaid_contributions": 0, "total": 0, "national_insurance": {"per_interval_value": 0, "interval_period": "per_month"}}, "savings": {"credit_balance": 10000000, "investment_balance": 0, "total": 20000000, "asset_balance": 0, "bank_balance": 10000000}, "income": {"other_income": {"per_interval_value": 200000, "interval_period": "per_month"}, "self_employed": false, "total": 1000000, "earnings": {"per_interval_value": 800000, "interval_period": "per_month"}}}, "dependants_young": 0, "on_nass_benefits": false}',
      PARTIAL:  '{"category": "family", "is_you_or_your_partner_over_60": true, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": true, "state": "yes", "partner": {"savings": null}, "you": {"savings": {"credit_balance": 0, "investment_balance": 0, "total": 4560000, "asset_balance": 0, "bank_balance": 4560000}}, "on_nass_benefits": false}',

      FULL_PERSONAL_DETAILS_FIELDS: {
        full_name: 'Foo Bar Quux',
        postcode: 'F00 B4R',
        street: '1 Foo Bar',
        mobile_phone: '0123456789',
        email: 'foo.bar@foobar.com',
        ni_number: '0123456789',
        dob: '1/1/2000',
        vulnerable_user: true,
        contact_for_research: true
      },

      FULL_ADAPTATIONS: {
        adaptations: ['BSL - Webcam', 'Callback preference'],
        language: 'English',
        notes: 'Personal details notes'
      },

      FULL_THIRDPARTY_PD_FIELDS: {
        full_name: 'Bar Foo',
        postcode: 'B4R F00',
        street: '1 Bar Foo',
        mobile_phone: '9876543210',
        email: 'bar.foo@foobar.com'
      },

      FULL_THIRDPARTY_ADAPTATIONS: {
        reason: 'Child or patient',
        personal_relationship: 'Parent or guardian',
        pass_phrase: 'Earth'
      },

      DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS: {
        full_name: 'Foo Bar Quux',
        mobile_phone: '0123456789',
        dob: '01/01/2014'
      },

      DEFAULT_RECOMMENDED_PERSONAL_DETAILS_FIELDS: {
        ni_number: '0123456789',
        postcode: 'F00 B4R',
        street: '1 Foo Bar'
      },

      createRecipe: function(caseFields, personalDetailsFields, eligibilityCheckFields, diagnosisNodes) {
        
        function _createCase(el, caseFields, personalDetailsFields, eligibilityCheckFields, diagnosisNodes, callback) {
          var $el = document.querySelector(el),
              injector = angular.element($el).injector(),
              Case = injector.get('Case'),
              PersonalDetails = injector.get('PersonalDetails'),
              EligibilityCheck = injector.get('EligibilityCheck'),
              Diagnosis = injector.get('Diagnosis'),
              $case, $personalDetails, $eligibilityCheck, $diagnosis;

          $case = new Case();

          angular.forEach(caseFields, function(value, key) {
            $case[key] = value;
          });

          $case.$save().then(function(data) {
            $personalDetails = new PersonalDetails({
              case_reference: data.reference
            });

            angular.forEach(personalDetailsFields, function(value, key) {
              $personalDetails[key] = value;
            });
            var dob = personalDetailsFields.dob || null;
            if (dob) {
              var parts = dob.split('/');
              $personalDetails.dob = {
                day: parts[0],
                month: parts[1],
                year: parts[2]
              };
            }

            function _completeDiagnosis(nodes, callback) {
              if (!nodes || !nodes.length) {
                return callback();
              }
              $diagnosis.current_node_id = nodes[0];
              $diagnosis
                .$move_down({case_reference: data.reference})
                .then(function () {
                  _completeDiagnosis(nodes.slice(1), callback);
                });
            }

            function _createDiagnosis() {
              $diagnosis = new Diagnosis({case_reference: data.reference});
              return $diagnosis.$save();
            }

            function _completeMeansTest() {
              $eligibilityCheck = new EligibilityCheck({
                case_reference: data.reference
              });

              if (eligibilityCheckFields) {
                eligibilityCheckFields = JSON.parse(eligibilityCheckFields);
                angular.forEach(eligibilityCheckFields, function(value, key) {
                  $eligibilityCheck[key] = value;
                });
              }

              return $eligibilityCheck.$save();
            }

            $personalDetails.$save().then(function() {
              // only create if diagnosis nodes present
              if (diagnosisNodes) {
                _createDiagnosis().then(function () {
                  _completeDiagnosis(diagnosisNodes, function () {
                    if (eligibilityCheckFields) {
                      _completeMeansTest().then(function () {
                        callback(data.reference);
                      });
                    } else {
                      callback(data.reference);
                    }
                  });
                });
              } else {
                callback(data.reference);
              }
            });
          });
        }

        return browser.driver.executeAsyncScript(
          _createCase, browser.rootEl, caseFields, personalDetailsFields, eligibilityCheckFields, diagnosisNodes
        );
      },

      createEmpty: function() {
        return this.createRecipe({}, {});
      },

      createWithRequiredFields: function() {
        return this.createRecipe(
          this.DEFAULT_REQUIRED_CASE_FIELDS,
          this.DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS,
          this.DEFAULT_REQUIRED_ELIGIBILITY_CHECK_FIELDS
        );
      },

      createWithRequiredRecommendedFields: function() {
        return this.createRecipe(
          this.DEFAULT_REQUIRED_CASE_FIELDS, 
          utils.mergeObjects(
            this.DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS,
            this.DEFAULT_RECOMMENDED_PERSONAL_DETAILS_FIELDS
          ),
          this.DEFAULT_REQUIRED_ELIGIBILITY_CHECK_FIELDS
        );
      },

      createWithScopeAndEligibility: function(inScope, isEligible) {
        return this.createRecipe(
          this.DEFAULT_REQUIRED_CASE_FIELDS, 
          utils.mergeObjects(
            this.DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS,
            this.DEFAULT_RECOMMENDED_PERSONAL_DETAILS_FIELDS
          ),
          inScope ? (isEligible ? this.ELIGIBLE : this.INELIGIBLE) : undefined,
          inScope ? this.IN_SCOPE : this.OUT_SCOPE
        );
      },

      createWithInScopeAndEligible: function () {
        return this.createWithScopeAndEligibility(true, true);
      },
      createWithOutScopeAndInEligible: function () {
        return this.createWithScopeAndEligibility(false, false);
      },
      createWithPartialMeansTest: function () {
        return this.createRecipe(
          this.DEFAULT_REQUIRED_CASE_FIELDS,
          merged(this.DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS,
            this.DEFAULT_RECOMMENDED_PERSONAL_DETAILS_FIELDS),
          this.PARTIAL,
          this.IN_SCOPE);
      }
    }
  };

  function per_month(amount) {
    return {
      interval_period: 'per_month',
      per_interval_value: amount
    };
  }

})();
