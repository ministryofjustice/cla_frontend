function CaseContext(reference) {
  this.reference = reference;
  this.peopleViewing = [];
};

CaseContext.prototype.addPersonViewing = function(personID) {
	this.peopleViewing.push(personID);
};

module.exports = CaseContext;