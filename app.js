var express = require('express');
var path = require('path');
var jade = require('jade');
var bodyParser = require('body-parser');
var routes = require('./index');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var app = require('express')()
	, server = require('http').createServer(app);

var http = require('http');
server.listen(8041);

app.use(cookieParser());
app.use(bodyParser());





//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'views')));
app.use('/', routes);

var port = process.env.PORT || 5040;
app.listen(port, function() {
  console.log('Listening on ' + port);
});



var io = require('socket.io').listen(server);
io.set('log level', 1);
var socket_array = [];

io.sockets.on('connection', function(socket){
	socket_array.push(socket);
	socket.on('client_data', function(data){
   		
		for(var i =0; i< socket_array.length; i++){
			socket_array[i].emit('message', {'text': 'hey there'});
		}
 
 });

});


module.exports = app;
