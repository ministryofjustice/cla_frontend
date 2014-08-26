(function(){
  'use strict';

  var protractor = require('protractor');

  function set_diagnosis_choices(choices) {
    browser.findElement(by.buttonText('Create scope diagnosis')).click();

    function next_step() {
      browser.findElement(by.buttonText('Next')).click();
    }

    choices.map(function (choice) {
      var options = browser.findElements(by.repeater('choice in diagnosis.choices'));
      options.then(select_option_matching(choice)).then(next_step);
    });
  }

  function select_option_matching(choice) {
    var select_matching = function (options) {
      if (!options.length) {
        throw 'Option matching "' + choice + '" not found';
      }
      options[0].getText().then(function (text) {
        if (text.toLowerCase().indexOf(choice.toLowerCase()) >= 0) {
          options[0].findElement(by.css('input')).sendKeys(' ');
        } else {
          select_matching(options.slice(1));
        }
      });
    }
    return select_matching;
  }

  function complete_means_test(answers) {
    // show_means_test();
    for (var section in answers) {
      var handler = {
        // 'problem': complete_means_test_problem_section,
        'details': complete_means_test_details_section,
        'finances': complete_means_test_finances_section,
        'income': complete_means_test_income_section,
        'expenses': complete_means_test_expenses_section
      }[section.toLowerCase()];
      handler && handler(answers[section]);
    }
    $('[name=save-means-test]').click();
  }

  function show_means_test_section(i) {
    var section = browser.findElement(by.repeater('section in sections').row(i));
    section.findElement(by.css('a')).click();
    return section;
  }

  function complete_means_test_details_section(answers) {
    var section = show_means_test_section(0);
    for (var question in answers) {
      var value = answers[question].toLowerCase() == 'yes' ? '1' : '0';
      var id = '#id_your_details-' + question + '_' + value;
      $(id).click();
    }
  }

  function prefix(pre) { return function (item) { return pre + item } };
  var _ec = prefix('eligibility_check.');

  function complete_means_test_finances_section(answers) {
    show_means_test_section(1);
    add_properties(answers);
    var field_names = [
      'bank_balance',
      'investment_balance',
      'asset_balance',
      'credit_balance'
    ];
    var fields = [].concat(
        field_names.map(prefix('you.savings.')),
        field_names.map(prefix('partner.savings.')),
        field_names.map(prefix('disputed_savings.'))
    );
    fields.map(function (field) {
      fill_model_field(_ec(field), answers[field], '0');
    });
  }

  function add_properties(answers) {
    // TODO
    delete answers['properties'];
  }

  function fill_model_field(model, value, defaultValue) {
    var val = value || defaultValue;
    browser.findElement(by.model(model)).sendKeys(val);
  }

  function complete_means_test_income_section(answers) {
    show_means_test_section(2);
    ['you.', 'partner.'].map(function (pre) {
      var p = prefix(pre);
      set_money_interval(_ec(p('income.earnings')), answers[p('income.earnings')], '0');
      set_money_interval(_ec(p('income.other_income')), answers[p('income.other_income')], '0');
      var value = (answers[p('self_employed')] || '').toLowerCase() == 'yes' ? 0 : 1;
      var person = (pre == 'you.' ? 'your' : 'partners');
      var radio_id = '#id_' + person + '_income-self_employed_' + value;
      $(radio_id).click();
    });
    fill_model_field(_ec('dependants_old'), answers['dependants_old'], '0');
    fill_model_field(_ec('dependants_young'), answers['dependants_young'], '0');
  }

  function set_money_interval(model, value, defaultValue) {
    // TODO - set interval dropdown
    var val = value || defaultValue;
    var field = browser.findElement(by.model(model));
    field.findElement(by.css('input[type=number]')).sendKeys(val);
  }

  function complete_means_test_expenses_section(answers) {
    show_means_test_section(3);
    var field_names = [
      'deductions.mortgage',
      'deductions.rent',
      'deductions.income_tax',
      'deductions.national_insurance',
      'deductions.maintenance',
      'deductions.childcare',
    ];
    var you = prefix('you.');
    var partner = prefix('partner.');
    var fields = [].concat(
        field_names.map(you),
        field_names.map(partner)
    );
    fields.map(function (field) {
      set_money_interval(_ec(field), answers[field], '0');
    });
    var contrib = 'deductions.criminal_legalaid_contributions';
    fill_model_field(_ec(you(contrib)), answers[you(contrib)], '0');
    fill_model_field(_ec(partner(contrib)), answers[partner(contrib)], '0');
  }

  module.exports = {
    APP_BASE_URL: 'call_centre/',

    setUp: function(){
      var pro = protractor.getInstance(),
          driver = pro.driver;

      pro.manage().getCookie('sessionid').then(function(cookie) {
        if (!cookie) {
          driver.get(pro.baseUrl + 'call_centre/login/');

          driver.findElement(by.id('id_username')).sendKeys('test_operator');
          driver.findElement(by.id('id_password')).sendKeys('test_operator');
          driver.findElement(by.css('form')).submit();
          
          // kill django debug toolbar if it's showing
          pro.manage().addCookie('djdt', 'hide');
        }
      });
    },

    debugTeardown: function () {
      // debug log
      browser.manage().logs().get('browser').then(function(browserLog) {
        console.log('====================================================');
        console.log('LOG:');
        console.log(require('util').inspect(browserLog));
        console.log('====================================================');
      });
    },

    scrollTo: function (element) {
      browser.executeScript(function () {
        arguments[0].scrollIntoView();
      }, element);
    },

    expectUrl: function(absUrl, expectedUrl) {
      var pro = protractor.getInstance();

      expect((new RegExp(expectedUrl+'$')).test(absUrl)).toBe(true,
        ['Expected', absUrl, 'to be', pro.baseUrl+expectedUrl].join(' ')
      );
    },

    createCase: function() {
      var pro = protractor.getInstance(),
          _this = this;

      browser.get(this.APP_BASE_URL);
      browser.getLocationAbsUrl().then(function (url) {
        _this.expectUrl(url, _this.APP_BASE_URL);
      });
      browser.findElement(by.css('.newCaseForm')).submit();
      return element.all(by.binding('case.reference')).get(0).getText();
    },

    showPersonalDetailsForm: function() {
      browser.findElement(by.css('#personal_details .VCard-view')).click();
    },

    enterPersonalDetails: function(details) {
      for (var name in details) {
        if (name == 'media_code') {
          browser.findElement(by.cssContainingText('[name="media_code"] option', details[name])).click();
        } else {
          this.fillField(name, details[name]);
        }
      }
    },

    fillField: function(name, value) {
      browser.findElement(by.css('[name="' + name + '"]')).sendKeys(value);
    },

    saveCase: function() {
      browser.findElement(by.css('button[name="save-personal-details"]')).click();
      this.scrollTo(browser.findElement(by.id('personal_details')));
    },

    setCaseNotes: function(notes) {
      this.fillField('notes', notes);
    },

    set_diagnosis_choices: set_diagnosis_choices,
    select_option_matching: select_option_matching,
    complete_means_test: complete_means_test,
    show_means_test_section: show_means_test_section,
    fill_model_field: fill_model_field,
    set_money_interval: set_money_interval,

    out_of_scope: function () {
      set_diagnosis_choices([
        'Debt & Housing',
        'Client owns a house and lives in it',
        'None of the above'
      ]);
    },

    in_scope: function () {
      set_diagnosis_choices([
        'Family',
        'Client wants to protect themselves',
        'Child abuse'
      ]);
    },

    eligible: function () {
      complete_means_test({
        'Details': {
          'has_partner': 'no',
          'nass_benefits': 'no',
          'passported_benefits': 'no',
          'older_than_sixty': 'yes'
        },
        'Finances': {
          'properties': [],
          'you.savings.bank_balance': '5600'
        },
        'Income': {
          'self_employed': 'No'
        },
        'Expenses': {
        }
      });
    }

  };
})();
