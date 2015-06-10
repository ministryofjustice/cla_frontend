(function () {
  'use strict';

  var _ = require('lodash');

  var testConstants = {
    authUrl: 'auth/',
    callcentreBaseUrl: 'call_centre/',
    providerBaseUrl: 'provider/',
    scope: {
      true: [
        'n97',  // Family
        'n307', // Domestic violence or abuse
        'n98',  // Domestic violence or abuse
        'n272'  // Click 'Next' to continue
      ],
      true_debt: [
        'n2',   // Debt and housing - loss of home
        'n3',   // Home owner
        'n4',   // The mortgage lender is seeking a court order
        'n5'    // Documentation: A warrant of possession
      ],
      false: [
        'n2',   // Debt and housing - loss of home
        'n70',  // Owes other money
        'n289'  // Please read the following to the client
      ],
      allocation: [
        'n2',   // Debt and housing
        'n24',  // In rented accommodation
        'n43',  // The landlord is unlawfully evicting the client
        'n44'   // Describe scenario carefully in notes
      ]
    },
    eligibility: {
      required: '{"category": "family"}',
      partial: '{"category": "family", "is_you_or_your_partner_over_60": true, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": true, "specific_benefits": {}, "state": "yes", "partner": {"savings": null}, "you": {"savings": {"credit_balance": 0, "investment_balance": 0, "total": 4560000, "asset_balance": 0, "bank_balance": 4560000}}, "on_nass_benefits": false}',
      groupedBenefits: '{"category": "family", "is_you_or_your_partner_over_60": true, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": false, "state": "yes", "dependants_old": 0, "partner": {"deductions": {"income_tax": {}, "mortgage": {}, "childcare": {}, "rent": {}, "maintenance": {}, "criminal_legalaid_contributions": null, "total": 0, "national_insurance": {}}, "savings": null, "income": {"other_income": {}, "self_employed": null, "total": 0, "earnings": {}, "self_employment_drawings": {}, "benefits": {}, "tax_credits": {}, "maintenance_received": {}, "pension": {}}}, "you": {"deductions": {"income_tax": {"per_interval_value": 0, "interval_period": "per_month"}, "mortgage": {"per_interval_value": 0, "interval_period": "per_month"}, "childcare": {"per_interval_value": 0, "interval_period": "per_month"}, "rent": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance": {"per_interval_value": 0, "interval_period": "per_month"}, "criminal_legalaid_contributions": 0, "total": 0, "national_insurance": {"per_interval_value": 0, "interval_period": "per_month"}}, "savings": {"credit_balance": 0, "investment_balance": 0, "total": 4560000, "asset_balance": 0, "bank_balance": 4560000}, "income": {"other_income": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employed": false, "total": 0, "earnings": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employment_drawings": {"per_interval_value": 0, "interval_period": "per_month"}, "benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "tax_credits": {"per_interval_value": 0, "interval_period": "per_month"}, "child_benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance_received": {"per_interval_value": 0, "interval_period": "per_month"}, "pension": {"per_interval_value": 0, "interval_period": "per_month"}}}, "dependants_young": 0, "on_nass_benefits": false}',
      specificBenefits: '{"category": "family", "is_you_or_your_partner_over_60": true, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": false, "specific_benefits": {"universal_credit": true, "income_support": false}, "state": "yes", "dependants_old": 0, "partner": {"deductions": {"income_tax": {}, "mortgage": {}, "childcare": {}, "rent": {}, "maintenance": {}, "criminal_legalaid_contributions": null, "total": 0, "national_insurance": {}}, "savings": null, "income": {"other_income": {}, "self_employed": null, "total": 0, "earnings": {}, "self_employment_drawings": {}, "benefits": {}, "tax_credits": {}, "maintenance_received": {}, "pension": {}}}, "you": {"deductions": {"income_tax": {"per_interval_value": 0, "interval_period": "per_month"}, "mortgage": {"per_interval_value": 0, "interval_period": "per_month"}, "childcare": {"per_interval_value": 0, "interval_period": "per_month"}, "rent": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance": {"per_interval_value": 0, "interval_period": "per_month"}, "criminal_legalaid_contributions": 0, "total": 0, "national_insurance": {"per_interval_value": 0, "interval_period": "per_month"}}, "savings": {"credit_balance": 0, "investment_balance": 0, "total": 4560000, "asset_balance": 0, "bank_balance": 4560000}, "income": {"other_income": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employed": false, "total": 0, "earnings": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employment_drawings": {"per_interval_value": 0, "interval_period": "per_month"}, "benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "tax_credits": {"per_interval_value": 0, "interval_period": "per_month"}, "child_benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance_received": {"per_interval_value": 0, "interval_period": "per_month"}, "pension": {"per_interval_value": 0, "interval_period": "per_month"}}}, "dependants_young": 0, "on_nass_benefits": false}',
      true: '{"category": "family", "is_you_or_your_partner_over_60": true, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": false, "specific_benefits": {}, "state": "yes", "dependants_old": 0, "partner": {"deductions": {"income_tax": {}, "mortgage": {}, "childcare": {}, "rent": {}, "maintenance": {}, "criminal_legalaid_contributions": null, "total": 0, "national_insurance": {}}, "savings": null, "income": {"other_income": {}, "self_employed": null, "total": 0, "earnings": {}, "self_employment_drawings": {}, "benefits": {}, "tax_credits": {}, "maintenance_received": {}, "pension": {}}}, "you": {"deductions": {"income_tax": {"per_interval_value": 0, "interval_period": "per_month"}, "mortgage": {"per_interval_value": 0, "interval_period": "per_month"}, "childcare": {"per_interval_value": 0, "interval_period": "per_month"}, "rent": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance": {"per_interval_value": 0, "interval_period": "per_month"}, "criminal_legalaid_contributions": 0, "total": 0, "national_insurance": {"per_interval_value": 0, "interval_period": "per_month"}}, "savings": {"credit_balance": 0, "investment_balance": 0, "total": 4560000, "asset_balance": 0, "bank_balance": 4560000}, "income": {"other_income": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employed": false, "total": 0, "earnings": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employment_drawings": {"per_interval_value": 0, "interval_period": "per_month"}, "benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "tax_credits": {"per_interval_value": 0, "interval_period": "per_month"}, "child_benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance_received": {"per_interval_value": 0, "interval_period": "per_month"}, "pension": {"per_interval_value": 0, "interval_period": "per_month"}}}, "dependants_young": 0, "on_nass_benefits": false}',
      false: '{"category": "family", "is_you_or_your_partner_over_60": false, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": false, "specific_benefits": {}, "state": "yes", "dependants_old": 0, "partner": {"deductions": {"income_tax": {}, "mortgage": {}, "childcare": {}, "rent": {}, "maintenance": {}, "criminal_legalaid_contributions": null, "total": 0, "national_insurance": {}}, "savings": null, "income": {"other_income": {}, "self_employed": null, "total": 0, "earnings": {}, "self_employment_drawings": {}, "benefits": {}, "tax_credits": {}, "maintenance_received": {}, "pension": {}}}, "you": {"deductions": {"income_tax": {"per_interval_value": 0, "interval_period": "per_month"}, "mortgage": {"per_interval_value": 0, "interval_period": "per_month"}, "childcare": {"per_interval_value": 0, "interval_period": "per_month"}, "rent": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance": {"per_interval_value": 0, "interval_period": "per_month"}, "criminal_legalaid_contributions": 0, "total": 0, "national_insurance": {"per_interval_value": 0, "interval_period": "per_month"}}, "savings": {"credit_balance": 10000000, "investment_balance": 0, "total": 20000000, "asset_balance": 0, "bank_balance": 10000000}, "income": {"other_income": {"per_interval_value": 200000, "interval_period": "per_month"}, "self_employed": false, "total": 1000000, "earnings": {"per_interval_value": 800000, "interval_period": "per_month"}, "self_employment_drawings": {"per_interval_value": 0, "interval_period": "per_month"}, "benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "tax_credits": {"per_interval_value": 0, "interval_period": "per_month"}, "child_benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance_received": {"per_interval_value": 0, "interval_period": "per_month"}, "pension": {"per_interval_value": 0, "interval_period": "per_month"}}}, "dependants_young": 0, "on_nass_benefits": false}',
      allocation: '{"category": "housing", "is_you_or_your_partner_over_60": true, "disputed_savings": {"credit_balance": 0, "investment_balance": 0, "total": 0, "asset_balance": 0, "bank_balance": 0}, "has_partner": false, "property_set": [], "on_passported_benefits": false, "specific_benefits": {}, "state": "yes", "dependants_old": 0, "partner": {"deductions": {"income_tax": {}, "mortgage": {}, "childcare": {}, "rent": {}, "maintenance": {}, "criminal_legalaid_contributions": null, "total": 0, "national_insurance": {}}, "savings": null, "income": {"other_income": {}, "self_employed": null, "total": 0, "earnings": {}, "self_employment_drawings": {}, "benefits": {}, "tax_credits": {}, "maintenance_received": {}, "pension": {}}}, "you": {"deductions": {"income_tax": {"per_interval_value": 0, "interval_period": "per_month"}, "mortgage": {"per_interval_value": 0, "interval_period": "per_month"}, "childcare": {"per_interval_value": 0, "interval_period": "per_month"}, "rent": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance": {"per_interval_value": 0, "interval_period": "per_month"}, "criminal_legalaid_contributions": 0, "total": 0, "national_insurance": {"per_interval_value": 0, "interval_period": "per_month"}}, "savings": {"credit_balance": 0, "investment_balance": 0, "total": 4560000, "asset_balance": 0, "bank_balance": 4560000}, "income": {"other_income": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employed": false, "total": 0, "earnings": {"per_interval_value": 0, "interval_period": "per_month"}, "self_employment_drawings": {"per_interval_value": 0, "interval_period": "per_month"}, "benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "tax_credits": {"per_interval_value": 0, "interval_period": "per_month"}, "child_benefits": {"per_interval_value": 0, "interval_period": "per_month"}, "maintenance_received": {"per_interval_value": 0, "interval_period": "per_month"}, "pension": {"per_interval_value": 0, "interval_period": "per_month"}}}, "dependants_young": 0, "on_nass_benefits": false}'
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
        ni_number: 'AA123456B',
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
      spoke_to: 'false',
      reason: 'Child or patient',
      personal_relationship: 'Parent or guardian',
      pass_phrase: 'Earth'
    },
    mattertypes: {
      standard: {
        matter_type1: 'FMEA',
        matter_type2: 'FPET'
      },
      housing: {
        matter_type1: 'HRNT',
        matter_type2: 'HPRI'
      }
    }
  };

  // can't run inside object
  _.assign(
    testConstants.personal_details.full,
    testConstants.personal_details.required,
    testConstants.personal_details.recommended,
    testConstants.personal_details.remaining
  );

  module.exports = testConstants;
})();
