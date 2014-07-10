
(function () {
  'use strict';

  angular.module('cla.app')
  .run(['$rootScope', '$window', '$interval', function($rootScope, $window, $interval) {
    var LOCAL_STORAGE_KEY = 'cla:tabs-open',
        Tab = function () {
          _.bindAll(this, 'keepAlive');

          this.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c==='x'?r:r&0x3|0x8;return v.toString(16);});

          // on init and every 30 secs, reset the states of the tabs and 
          // the open tabs will add themselves to the list. See $window.addEventListener('storage')
          this.keepAlive();
          this._interval = $interval(this.keepAlive, 30000);
          return this;
        },
        tab = null;

    Tab.prototype = {
      _getJSONItem: function() {
        /*
        Returns the JSON object stored in the localStorage.
        */
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
      },

      _setJSONItem: function(tabs) {
        /*
        Stores the JSON tabs in the localStorage.
        */
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tabs));
      },
      
      getTabsCount: function(tabs) {
        /*
        Returns the tabs count. If the param `tabs` is not
        passed in, it will get it from the storage.
        */
        tabs = tabs || this._getJSONItem();
        return Object.keys(tabs).length;
      },

      keepAlive: function() {
        /*
        Resets the tabs count and the other tabs will add themselves
        to the storage. This is to keep the storage consistent.
        */
        this.addThisTab({});
      },

      addThisTab: function(tabs) {
        /*
        Adds this tab to the storage.If the param `tabs` is not
        passed in, it will get it from the storage.
        */
        tabs = tabs || this._getJSONItem();
        tabs[this.id] = true;

        this._setJSONItem(tabs);
        this.updateScope(tabs);
      },

      remove: function() {
        /*
        Removes this tab from the storage and cancels the interval.
        */
        $interval.cancel(this._interval);
        var tabs = this._getJSONItem();
        delete tabs[this.id];
        this._setJSONItem(tabs);
      },

      updateScope: function(tabs) {
        /*
        Updates the rootScope variable.
        */
        $rootScope.multipleTabsOpen = this.getTabsCount(tabs);
      }
    };

    tab = new Tab();

    // every time a tab updates the localStorage, add this tab as well
    $window.addEventListener('storage', function(event) {
      if (event.key === LOCAL_STORAGE_KEY) {
        $rootScope.$apply(function() {
          tab.addThisTab();
        });
      }
    });

    // cleanup
    
    $window.onbeforeunload = function() {
      tab.remove();
    };

    $rootScope.$on('$destroy', function() {
      tab.remove();
    });

  }]);
})();
