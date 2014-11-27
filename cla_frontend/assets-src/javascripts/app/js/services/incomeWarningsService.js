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
        // fail if sections aren't complete
        if (!this.isComplete(this.eligibilityCheck.you.income)) {
          return false;
        }

        var total = this.eligibilityCheck.you.income.total;

        if (this.hasPartner()) {
          // fail if sections aren't complete
          if (!this.isComplete(this.eligibilityCheck.partner.income)) {
            return false;
          }
          // add partner income to total
          total += this.eligibilityCheck.partner.income.total;
        }

        return total <= 0 ? true : false;
      };

      this.checkDisposableIncome = function () {
        // fail if sections aren't complete
        if (!this.isComplete(this.eligibilityCheck.you.income) || !this.isComplete(this.eligibilityCheck.you.deductions)) {
          return false;
        }

        var total = this.eligibilityCheck.you.income.total;
        total -= this.eligibilityCheck.you.deductions.total;

        if (this.hasPartner()) {
          // fail if sections aren't complete
          if (!this.isComplete(this.eligibilityCheck.partner.income) || !this.isComplete(this.eligibilityCheck.partner.deductions)) {
            return false;
          }
          // add partner income to total
          total += this.eligibilityCheck.partner.income.total;
          total -= this.eligibilityCheck.partner.deductions.total;
        }

        return total < 0 ? true : false;
      };

      this.calculateHousingCosts = function (person) {
        var mortgage = this.eligibilityCheck[person].deductions.mortgage;
        var monthlyMortgage = MoneyIntervalService.asMonthly(mortgage.interval_period, mortgage.per_interval_value);

        var rent = this.eligibilityCheck[person].deductions.rent;
        var monthlyRent = MoneyIntervalService.asMonthly(rent.interval_period, rent.per_interval_value);

        return monthlyMortgage + monthlyRent;
      };

      this.checkHousing = function () {
        // fail if sections aren't complete
        if (!this.isComplete(this.eligibilityCheck.you.income) || !this.isComplete(this.eligibilityCheck.you.deductions)) {
          return false;
        }

        var totalIncome = this.eligibilityCheck.you.income.total;
        var housingCosts = this.calculateHousingCosts('you');

        if (this.hasPartner()) {
          // fail if sections aren't complete
          if (!this.isComplete(this.eligibilityCheck.partner.income) || !this.isComplete(this.eligibilityCheck.partner.deductions)) {
            return false;
          }
          // add partner income to total
          totalIncome += this.eligibilityCheck.partner.income.total;
          housingCosts += this.calculateHousingCosts('partner');
        }

        return (totalIncome / 3) < housingCosts ? true : false;
      };

      // public methods
      this.update = function (data) {
        var _warnings = {};

        if (data) {
          this.eligibilityCheck = data.eligibilityCheck;
        }

        if (!this.isPassported() && this.eligibilityCheck.you !== undefined && this.eligibilityCheck.you !== null) {
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

