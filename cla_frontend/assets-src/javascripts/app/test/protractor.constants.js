(function () {
  'use strict';

  var _ = require('lodash');

  var testConstants = {
    callcentreBaseUrl: 'call_centre/',
    providerBaseUrl: 'provider/',
    scope: {
      true: [
        'n115', // Family
        'n116', // The client wants to protect themselves
        'n119'  // Child abuse
      ],
      false: [
        'n2', // debt
        'n77', // other money owed
        'n80' // business debts
      ]
    },
    eligibility: {
      required: '{"category": "family"}',
      partial: '{"category": "family", "is_you_or_your_partner_over_60": true, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": true, "state": "yes", "partner": {"savings": null}, "you": {"savings": {"credit_balance": 0, "investment_balance": 0, "total": 4560000, "asset_balance": 0, "bank_balance": 4560000}}, "on_nass_benefits": false}',
      true: '{"category": "family", "is_you_or_your_partner_over_60": true, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": false, "state": "yes", "dependants_old": 0, "partner": {"deductions": {"income_tax": {}, "mortgage": {}, "childcare": {}, "rent": {}, "maintenance": {}, "criminal_legalaid_contributions": null, "total": 0, "national_insurance": {}}, "savings": null, "income": {"other_income": {}, "self_employed": null, "total": 0, "earnings": {}}}, "you": {"deductions": {"income_tax": {"per_interval_value": 0, "interval_period": "per_month"}, "mortgage": {"per_interval_value": 0, "interval_period": "per_month"}, "childcare": {"per_interval_value": 0, "interval_period": "per_month"}, "rent": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance": {"per_interval_value": 0, "interval_period": "per_month"}, "criminal_legalaid_contributions": 0, "total": 0, "national_insurance": {"per_interval_value": 0, "interval_period": "per_month"}}, "savings": {"credit_balance": 0, "investment_balance": 0, "total": 4560000, "asset_balance": 0, "bank_balance": 4560000}, "income": {"other_income": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employed": false, "total": 0, "earnings": {"per_interval_value": 0, "interval_period": "per_month"}}}, "dependants_young": 0, "on_nass_benefits": false}',
      false: '{"category": "family", "is_you_or_your_partner_over_60": false, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": false, "state": "yes", "dependants_old": 0, "partner": {"deductions": {"income_tax": {}, "mortgage": {}, "childcare": {}, "rent": {}, "maintenance": {}, "criminal_legalaid_contributions": null, "total": 0, "national_insurance": {}}, "savings": null, "income": {"other_income": {}, "self_employed": null, "total": 0, "earnings": {}}}, "you": {"deductions": {"income_tax": {"per_interval_value": 0, "interval_period": "per_month"}, "mortgage": {"per_interval_value": 0, "interval_period": "per_month"}, "childcare": {"per_interval_value": 0, "interval_period": "per_month"}, "rent": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance": {"per_interval_value": 0, "interval_period": "per_month"}, "criminal_legalaid_contributions": 0, "total": 0, "national_insurance": {"per_interval_value": 0, "interval_period": "per_month"}}, "savings": {"credit_balance": 10000000, "investment_balance": 0, "total": 20000000, "asset_balance": 0, "bank_balance": 10000000}, "income": {"other_income": {"per_interval_value": 200000, "interval_period": "per_month"}, "self_employed": false, "total": 1000000, "earnings": {"per_interval_value": 800000, "interval_period": "per_month"}}}, "dependants_young": 0, "on_nass_benefits": false}'
    },
    case: {
      required: {
        notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec feugiat aliquet imperdiet. Integer id sem quis eros consectetur vulputate ut.',
        media_code: 'AA'
      },
      remaining: {
        exempt_user: true,
        exempt_user_reason: '12 month exemption'
      }
    },
    personal_details: {
      required: {
        full_name: 'Foo Bar Quux',
        mobile_phone: '0123456789',
        dob: '1/1/2014'
      },
      recommended: {
        ni_number: '0123456789',
        postcode: 'F00 B4R',
        street: '1 Foo Bar'
      },
      remaining: {
        email: 'foo.bar@foobar.com',
        vulnerable_user: true,
        contact_for_research: true
      },
      full: {}
    },
    adaptations: {
      adaptations: ['BSL - Webcam', 'Callback preference'],
      language: 'English',
      notes: 'Personal details notes'
    },
    thirdparty: {
      personal_details: {
        full_name: 'Bar Foo',
        postcode: 'B4R F00',
        street: '1 Bar Foo',
        mobile_phone: '9876543210',
        email: 'bar.foo@foobar.com'
      },
      reason: 'Child or patient',
      personal_relationship: 'Parent or guardian',
      pass_phrase: 'Earth'
    }
  };

  // can't run inside object
  _.assign(
    testConstants.personal_details.full,
    testConstants.personal_details.required,
    testConstants.personal_details.recommended,
    testConstants.personal_details.remaining
  );

  console.log('==========');
  console.log(testConstants.personal_details);

  module.exports = testConstants;
})();