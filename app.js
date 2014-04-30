// express and sockets setup
var express = require("express");
var app = express();
var port = 3700;

app.use(express.static(__dirname + '/assets'));
app.get('/', function(request, response) {
	response.sendfile('./assets/index.html');
});

var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

// custom modules
var client_module = require("./client_module");
var pipe_module = require("./pipe_module");

// third party modules
var moment = require('moment');

// sockets event listening
io.sockets.on('connection', function (socket) {
	socket.on('register-request', function (data) {
		socket.emit('register-response', client_module.add_new());
	});

    socket.on('pipe-request', function (data) {
    	socket.emit('pipe-response', pipe_module.get_pipe(data.index));
    });

    //asking for all the birds
    socket.on('sync-request', function(data) {
    	socket.emit('sync-response', client_module.generate_client_package(data));
    }); 

    //game start to initialize game start timestamp for bird
    socket.on('start-game', function(data) {
        if (client_module.all[data] == undefined) client_module.add_new(data);
        client_module.all[data].start_game_timestamp = new Date().getTime();
    });

    //on bird jump, re-emit
    socket.on('bird-jump', function(data){
    	io.sockets.emit('bird-jumped', data);
    });

    socket.on('bird-death-request', function(data){
    	io.sockets.emit('bird-death-response', data);
        client_module.all[data].start_game_timestamp = null;
    });

    socket.on('state-update', function(data){
        client_module.all[data.client_id].update_state(data.state);

        console.log("STATE: " + client_module.all[data.client_id].state);
    });

    socket.on('client-list-request', function() {
        socket.emit('client-list-response', client_module.all);
    });
});

var state_clean_up_service = setInterval(client_module.scan_states, 1000);