/* jshint unused:false */
(function(){
  'use strict';

  var protractor = require('protractor'),
      CONSTANTS = require('../protractor.constants');

  function set_diagnosis_choices(choices) {
    browser.findElement(by.buttonText('New scope diagnosis')).click();

    function next_step() {
      browser.findElement(by.buttonText('Next')).click();
    }

    choices.map(function (choice) {
      var options = browser.findElements(by.repeater('choice in diagnosis.choices'));
      options.then(select_option_matching(choice)).then(next_step);
    });

    return_to_case();
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
    };
    return select_matching;
  }

  function return_to_case() {
    browser.findElement(by.cssContainingText('a', 'Return to case')).click();
  }

  function complete_means_test(answers) {
    show_means_test();
    for (var section in answers) {
      var handler = {
        'problem': complete_means_test_problem_section,
        'details': complete_means_test_details_section,
        'finances': complete_means_test_finances_section,
        'income': complete_means_test_income_section,
        'expenses': complete_means_test_expenses_section
      }[section.toLowerCase()];
      /*jshint -W030 */
      handler && handler(answers[section]);
    }
    $('[name=save-means-test]').click();
    return_to_case();
  }

  function show_means_test() {
    var _visible = function (text, success, fail) {
      var button = browser.findElement(by.buttonText(text));
      if (button) {
        return button.isDisplayed().then(function (visible) {
          if (visible && success) { return success(button); }
          if (!visible && fail) { return fail(button); }
        });
      }
    };

    var _click = function (button) { button.click(); };

    _visible('New means test', _click, function () {
      _visible('Complete means test', _click);
    });
  }

  function complete_means_test_problem_section(answer) {
    show_means_test_section(0);
    var options = browser.findElements(by.repeater('category in category_list'));
    try {
      options.then(select_option_matching(answer));
    } catch (e) {
      throw 'Failed selecting means test problem: "' + e + '"';
    }
  }

  function show_means_test_section(i) {
    var section = browser.findElement(by.repeater('section in sections').row(i));
    section.findElement(by.css('h2')).click();
    return section;
  }

  function complete_means_test_details_section(answers) {
    var section = show_means_test_section(1);
    for (var question in answers) {
      var value = answers[question].toLowerCase() === 'yes' ? '1' : '0';
      var id = '#id_your_details-' + question + '_' + value;
      $(id).click();
    }
  }

  function prefix(pre) { return function (item) { return pre + item; }; }
  var _ec = prefix('eligibility_check.');

  function complete_means_test_finances_section(answers) {
    show_means_test_section(2);
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
    delete answers.properties;
  }

  function fill_model_field(model, value, defaultValue) {
    var val = value || defaultValue;
    browser.findElement(by.model(model)).sendKeys(val);
  }

  function complete_means_test_income_section(answers) {
    show_means_test_section(3);
    ['you.', 'partner.'].map(function (pre) {
      var p = prefix(pre);
      set_money_interval(_ec(p('income.earnings')), answers[p('income.earnings')], '0');
      set_money_interval(_ec(p('income.self_employment_drawings')), answers[p('income.self_employment_drawings')], '0');
      set_money_interval(_ec(p('income.benefits')), answers[p('income.benefits')], '0');
      set_money_interval(_ec(p('income.tax_credits')), answers[p('income.tax_credits')], '0');
      if (pre !== 'partner.') {
        set_money_interval(_ec(p('income.child_benefits')), answers[p('income.child_benefits')], '0');
      }
      set_money_interval(_ec(p('income.maintenance_received')), answers[p('income.maintenance_received')], '0');
      set_money_interval(_ec(p('income.pension')), answers[p('income.pension')], '0');
      set_money_interval(_ec(p('income.other_income')), answers[p('income.other_income')], '0');
      var value = (answers[p('self_employed')] || '').toLowerCase() === 'yes' ? 0 : 1;
      var person = (pre === 'you.' ? 'your' : 'partners');
      var radio_id = '#id_' + person + '_income-self_employed_' + value;
      $(radio_id).click();
    });
    fill_model_field(_ec('dependants_old'), answers.dependants_old, '0');
    fill_model_field(_ec('dependants_young'), answers.dependants_young, '0');
  }

  function set_money_interval(model, value, defaultValue) {
    // TODO - set interval dropdown
    var val = value || defaultValue;
    var field = browser.findElement(by.model(model));
    field.findElement(by.css('input[type=number]')).sendKeys(val);
  }

  function complete_means_test_expenses_section(answers) {
    show_means_test_section(4);
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

  function login(login_path, user, pass) {
    var pro = protractor.getInstance(),
        driver = pro.driver;

    pro.manage().getCookie('sessionid').then(function(cookie) {
      if (!cookie) {
        driver.get(pro.baseUrl + login_path);

        // kill django debug toolbar if it's showing
        pro.manage().addCookie('djdt', 'hide');

        driver.get(pro.baseUrl + login_path);
        driver.findElement(by.id('id_username')).sendKeys(user);
        driver.findElement(by.id('id_password')).sendKeys(pass);
        driver.findElement(by.css('form')).submit();
      }
    });
  }

  module.exports = {
    setUp: function() {
      login(CONSTANTS.callcentreBaseUrl + 'login/', 'test_operator', 'test_operator');
    },

    setUpAsProvider: function() {
      login(CONSTANTS.providerBaseUrl + 'login/', 'test_duncanlewis', 'test_duncanlewis');
    },

    logout: function () {
      element(by.css('.UserMenu-toggle')).click();
      element(by.cssContainingText('a[target="_self"]', 'Sign out')).click();
      protractor.getInstance().manage().deleteAllCookies();
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
        if (name === 'media_code') {
          browser.findElement(by.cssContainingText('[name="media_code"] option', details[name])).click();
        } else {
          this.fillField(name, details[name]);
        }
      }
    },

    fillField: function(name, value) {
      if (value === true || value === false) {
        element(by.name(name)).click();
      } else {
        element(by.css('[name="' + name + '"]')).sendKeys(value).blur;
      }
    },

    saveCase: function() {
      browser.findElement(by.css('button[name="save-personal-details"]')).click();
      this.scrollTo(browser.findElement(by.id('personal_details')));
    },

    setCategory: function(category) {
      show_means_test();
      complete_means_test_problem_section(category);
      browser.findElement(by.css('button[name="save-means-test"]')).click();
    },

    set_diagnosis_choices: set_diagnosis_choices,
    select_option_matching: select_option_matching,
    return_to_case: return_to_case,
    complete_means_test: complete_means_test,
    show_means_test: show_means_test,
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
        'Problem': 'Family',
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
