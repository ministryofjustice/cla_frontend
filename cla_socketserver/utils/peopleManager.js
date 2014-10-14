var _ = require('underscore')._
	, utils = require('./utils')
  , Person = require('./person');


module.exports = {
	people: {},

	identify: function(nsp, socket, username) {
    var person = this.people[username];
    if (typeof person === 'undefined') {
      person = new Person(username);
      this.people[username] = person;
    }

    // console.info('identified as '+username);
    person.connect(socket);
	},

	disconnect: function(nsp, socket) {
    person = this.findPersonBySocket(socket, this.people);
    if (typeof person !== 'undefined') {
      // console.info('disconnected '+person.username);

      if (person.getViewedCase(socket)) {
      	this.stopViewingCase(nsp, socket, person.getViewedCase(socket));
      }

      person.disconnect(socket);

      if (person.canBeDeleted()) {
        // console.info('deleting '+person.username);
        delete this.people[person.username];
      }
    }
	},

	startViewingCase: function(nsp, socket, caseref) {
    person = this.findPersonBySocket(socket, this.people);
    if (typeof person !== 'undefined') {
      // console.info(person.username+' started viewing case '+caseref);
      person.startViewingCase(socket, caseref);


      utils.sendToAllClientsInChannel(nsp, caseref, 'peopleViewing', this.getPeopleViewingCase(caseref));
    }
	},

	stopViewingCase: function(nsp, socket, caseref) {
    person = this.findPersonBySocket(socket, this.people);
    if (typeof person !== 'undefined') {
      // console.info(person.username+' stopped viewing case '+caseref);
      person.stopViewingCase(socket, caseref);

      utils.sendToAllClientsInChannel(nsp, caseref, 'peopleViewing', this.getPeopleViewingCase(caseref));
    }
	},

	getPeopleViewingCase: function(caseref) {
		var peopleViewing = [];

		_.each(_.values(this.people), function(person) {
			if (person.getAllViewedCase().indexOf(caseref) > -1) {
				peopleViewing.push(person.username);
			}
		});

		return peopleViewing;
	},

	findPersonBySocket: function(socket) {
		return _.find(_.values(this.people), function(person) {
			return person.ownsSocket(socket);
		})
	},

  getPeopleCount: function() {
    return _.size(this.people);
  }
}