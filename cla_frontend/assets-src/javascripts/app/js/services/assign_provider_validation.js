(function () {
  'use strict';

  var m = angular.module('cla.services');

  m.service('AssignProviderValidation', function () {
    var service = {};
    var _warned = false;
    var _models = {};
    var _warnings =  [];
    var _errors = [];
    var _required = [
      {object: 'case', field: 'notes', message: 'Case notes must be added to close a case'},
      {object: 'case', field: 'media_code', message: 'A media code is required to close a case'},
      {object: 'personal_details', field: 'full_name', message: 'Name is required to close a case'},
      {object: 'personal_details', field: 'dob', message: 'Date of birth is required to close a case'},
      {object: 'personal_details', field: 'mobile_phone', message: 'A contact number is required to close a case'},
      {object: 'adaptation_details', field: 'bsl_webcam,minicom,text_relay,skype_webcam,callback_preference,no_adaptations_required', message: 'At least one adaptation is required to close a case. If no adaptions are required please select "No adaptations required"'}
    ];
    var _recommended = [
      {object: 'personal_details', field: 'postcode', message: 'It is recommended to include postcode before closing a case'},
      {object: 'personal_details', field: 'street', message: 'It is recommended to include an address before closing a case'},
      {object: 'personal_details', field: 'ni_number', message: 'National Insurance number is not required to close a case but the specialist will ask for it once assigned'}
    ];

    function isValidValue (value) {
      if (value === undefined || (value !== undefined && !value)) {
        return false;
      }
      return true;
    }

    function setMessages (fields, list) {
      angular.forEach(fields, function (obj) {
        var isValue = false;
        if (obj.field.indexOf(',') > -1) {
          angular.forEach(obj.field.split(','), function (field) {
            if (isValidValue(_models[obj.object][field])) {
              isValue = true;
            }
          });
        } else {
          isValue = isValidValue(_models[obj.object][obj.field]);
        }
        if (!isValue) {
          list.push({message: obj.message});
        }
      });
    }

    service.validate = function (models) {
      // reset messages
      _warnings = [];
      _errors = [];

      // merge models to check
      _models = angular.extend(_models, models);

      // find errors
      setMessages(_required, _errors);
      setMessages(_recommended, _warnings);

      if ((_warnings.length === 0 && _errors.length === 0) || (_errors.length === 0 && _warned)) {
        return true;
      } else {
        return false;
      }
    };

    service.getErrors = function () {
      return _errors;
    };

    service.getWarnings = function () {
      return _warnings;
    };

    service.setWarned = function (value) {
      _warned = value;
    };

    service.getWarned = function () {
      return _warned;
    };

    return service;
  });
})();

