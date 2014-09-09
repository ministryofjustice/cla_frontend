
var config = { weekStart: 1, timeInterval: 900 },
    startPicker = rome(id_start_date, config),
    endPicker = rome(id_end_date, config);

startPicker.on('data', function (value) {
  endPicker.setValue(value).refresh();
});