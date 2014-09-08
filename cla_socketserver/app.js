var http = require('http');
var server = http.createServer().listen(8005);
var io = require('socket.io')(server);
var cookie = require('cookie');
var querystring = require('querystring');


io.use(function (socket, next) {
  if (socket.request.headers.cookie) {
    socket.request.cookie = cookie.parse(socket.request.headers.cookie);
    return next();
  }
  return next(new Error('not authorized'));
});

io.on('connection', function (socket) {
  var id = socket.request.cookie.sessionid.slice(-8);

  console.log('client connected', id);

  socket.on('client', function (data) {
    console.log('received from', id, ':', data);
    io.emit('server', data);
  });

  socket.on('disconnect', function (data) {
    console.log('client disconnected');
  });
});
