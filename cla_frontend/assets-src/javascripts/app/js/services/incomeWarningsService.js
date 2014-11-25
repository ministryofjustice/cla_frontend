/* jshint maxcomplexity: 10 */

(function () {
  'use strict';

  angular.module('cla.services')
    .service('IncomeWarningsService', ['postal', '_', 'MoneyIntervalService', function(postal, _, MoneyIntervalService) {
      this.eligibilityCheck = {};
      this.warnings = {};

      this.isPassported = function () {
        return this.eligibilityCheck.on_passported_benefits && this.eligibilityCheck.on_passported_benefits !== '0';
      };

      this.hasPartner = function () {
        return this.eligibilityCheck.has_partner && this.eligibilityCheck.has_partner !== '0';
      };

      this.isComplete = function (fields) {
        var complete = true;
        angular.forEach(fields, function (v, k) {
          if (k !== 'self_employed' && v === null || v === undefined) {
            complete = false;
          }
        });
        return complete;
      };

      this.checkZeroIncome = function () {
        var total = 0;
        // fail if you or income don't exist
        if (!this.eligibilityCheck.you) {
          return false;
        }
        if (!this.isComplete(this.eligibilityCheck.you.income)) {
          return false;
        }

        // add income to total
        total += this.eligibilityCheck.you.income.total;

        if (this.hasPartner()) {
          // fail if partner or partner income don't exist
          if (!this.eligibilityCheck.partner) {
            return false;
          }
          if (!this.isComplete(this.eligibilityCheck.partner.income)) {
            return false;
          }
          // add partner income to total
          total += this.eligibilityCheck.partner.income.total;
        }

        return total <= 0 ? true : false;
      };

      this.checkDisposableIncome = function () {
        var total = 0;
        // fail if you or income don't exist
        if (!this.eligibilityCheck.you) {
          return false;
        }
        if (!this.isComplete(this.eligibilityCheck.you.income) || !this.isComplete(this.eligibilityCheck.you.deductions)) {
          return false;
        }

        // add income to total
        total += this.eligibilityCheck.you.income.total;
        total -= this.eligibilityCheck.you.deductions.total;

        if (this.hasPartner()) {
          // fail if partner or partner income don't exist
          if (!this.eligibilityCheck.partner) {
            return false;
          }
          if (!this.isComplete(this.eligibilityCheck.partner.income) || !this.isComplete(this.eligibilityCheck.partner.deductions)) {
            return false;
          }
          // add partner income to total
          total += this.eligibilityCheck.partner.income.total;
          total -= this.eligibilityCheck.partner.deductions.total;
        }

        return total < 0 ? true : false;
      };

      this.checkHousing = function () {
        var totalIncome = 0;
        var housingCosts = 0;
        // fail if you or income don't exist
        if (!this.eligibilityCheck.you) {
          return false;
        }
        if (!this.isComplete(this.eligibilityCheck.you.income) || !this.isComplete(this.eligibilityCheck.you.deductions)) {
          return false;
        }

        // add income to total
        totalIncome += this.eligibilityCheck.you.income.total;

        var mortgage = this.eligibilityCheck.you.deductions.mortgage;
        var monthlyMortgage = MoneyIntervalService.asMonthly(mortgage.interval_period, mortgage.per_interval_value);
        var rent = this.eligibilityCheck.you.deductions.rent;
        var monthlyRent = MoneyIntervalService.asMonthly(rent.interval_period, rent.per_interval_value);
        housingCosts += (monthlyMortgage + monthlyRent);

        if (this.hasPartner()) {
          // fail if partner or partner income don't exist
          if (!this.eligibilityCheck.partner) {
            return false;
          }
          if (!this.isComplete(this.eligibilityCheck.partner.income) || !this.isComplete(this.eligibilityCheck.partner.deductions)) {
            return false;
          }
          // add partner income to total
          totalIncome += this.eligibilityCheck.partner.income.total;

          var partnerMortgage = this.eligibilityCheck.partner.deductions.mortgage;
          var partnerMonthlyMortgage = MoneyIntervalService.asMonthly(partnerMortgage.interval_period, partnerMortgage.per_interval_value);
          var partnerRent = this.eligibilityCheck.partner.deductions.rent;
          var partnerMonthlyRent = MoneyIntervalService.asMonthly(partnerRent.interval_period, partnerRent.per_interval_value);
          housingCosts += (partnerMonthlyMortgage + partnerMonthlyRent);
        }

        return (housingCosts) > (totalIncome / 3) ? true : false;
      };

      // public methods
      this.update = function (data) {
        var _warnings = {};

        if (data) {
          this.eligibilityCheck = data.eligibilityCheck;
        }

        if (!this.isPassported()) {
          _warnings.housing = this.checkHousing();
          _warnings.zeroIncome = this.checkZeroIncome();
          _warnings.negativeDisposable = this.checkDisposableIncome();
        }

        this.warnings = _.pick(_warnings, function (value) {
          return value;
        });

        postal.publish({
          channel: 'IncomeWarnings',
          topic: 'update',
          data: {
            warnings: this.warnings
          }
        });
      };

      this.setEligibilityCheck = function (eligibilityCheck) {
        this.eligibilityCheck = eligibilityCheck;
        this.update();
      };

      _.bindAll(this, 'update');

      // subscribe to EC save
      postal.subscribe({
        channel: 'EligibilityCheck',
        topic: 'save',
        callback: this.update
      });
    }]);
})();

