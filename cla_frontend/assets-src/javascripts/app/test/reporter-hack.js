var reporters = jasmine.getEnv().reporter.subReporters_;
var jasmineSpecReporter, minijasmineReporter;
for (var i = 0 ; i < reporters.length ; i++) {
  if (reporters[i].callback_ !== undefined) {
    minijasmineReporter = reporters[i];
  }
  if (reporters[i].jasmineCallback !== undefined) {
    jasmineSpecReporter = reporters[i];
  }
}
if (jasmineSpecReporter && minijasmineReporter) {
  jasmineSpecReporter.jasmineCallback = minijasmineReporter.callback_;
  reporters.splice(reporters.indexOf(minijasmineReporter), 1);
} else {
  console.log('Unable to find both reporters');
  console.log('jasmineSpecReporter:\n', jasmineSpecReporter);
  console.log('minijasmineReporter:\n', minijasmineReporter);
}
