(function () {
  'use strict';

  angular.module('cla.services')
    .run(['postal', '$analytics', function(postal, $analytics) {
      var $body = angular.element('body');
      var trackEvent = function (data, envelope) {
        var eventData = {
          category: envelope.channel
        };

        if (data) {
          if (data.value !== undefined) {
            eventData.value = data.value;
          }
          if (data.label !== undefined) {
            eventData.label = data.label;
          }
        }

        $analytics.eventTrack(envelope.topic, eventData);
      };

      // Address Finder
      var addressFinder = postal.channel('AddressFinder');
      addressFinder.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Notes History
      var notesHistory = postal.channel('NotesHistory');
      notesHistory.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Eligibility Check
      var EligibilityCheck = postal.channel('EligibilityCheck');
      EligibilityCheck.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Guidance
      var Guidance = postal.channel('Guidance');
      Guidance.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Call Scripts
      var CallScript = postal.channel('CallScript');
      CallScript.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Assign Provider
      var AssignProvider = postal.channel('AssignProvider');
      AssignProvider.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Callback modal
      var CallBack = postal.channel('CallBack');
      CallBack.subscribe({
        topic: 'open',
        callback: trackEvent
      });
      CallBack.subscribe({
        topic: 'close',
        callback: trackEvent
      });
      CallBack.subscribe({
        topic: 'set.*',
        callback: trackEvent
      });

      // Search filters
      var SearchFilter = postal.channel('SearchFilter');
      SearchFilter.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Income Warnings
      var IncomeWarnings = postal.channel('IncomeWarnings');
      IncomeWarnings.subscribe({
        topic: 'update',
        callback: function (data) {
          angular.forEach(data.warnings, function (value, key) {
            $analytics.eventTrack(key, {category: 'IncomeWarnings'});
          });
        }
      });

      // Person card
      var Person = postal.channel('Person');
      Person.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Third party card
      var ThirdParty = postal.channel('ThirdParty');
      ThirdParty.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Safe to contact flag
      var SafeToContact = postal.channel('SafeToContact');
      SafeToContact.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // User address copy
      var AddressCopy = postal.channel('AddressCopy');
      AddressCopy.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Hotkey use
      var HotKey = postal.channel('HotKey');
      HotKey.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Server side error catching
      var ServerError = postal.channel('ServerError');
      ServerError.subscribe({
        topic: '*',
        callback: trackEvent
      });

      $body
        // Details/Summary clicks
        .on('click', 'summary', function () {
          var $details = angular.element(this).parent('details');
          var summaryText = angular.element(this).text();

          if (
            (!$details.hasClass('is-notnative') && !$details.is('[open]')) ||
            ($details.hasClass('is-notnative') && $details.hasClass('is-open'))
          ) {
            $analytics.eventTrack('click', {  category: 'DetailsTag', label: summaryText });
          }
        })
        // External link clicks
        .on('click', '[target="_blank"]', function () {
          var $this = angular.element(this);
          var text = $this.text();
          var loc = $this.attr('href');

          $analytics.eventTrack(loc, {  category: 'Outbound', label: text });
        })
        // Diagnosis history
        .on('click', '.CaseHistory-card a', function () {
          var $this = angular.element(this);
          var text = $this.text();

          $analytics.eventTrack('click', {  category: 'CaseHistory', label: text });
        });
    }]);
})();
