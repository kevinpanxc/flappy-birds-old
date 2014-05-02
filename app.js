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
        return_package = { client_id : client_module.add_new(), clients : client_module.all }
		socket.emit('register-response', return_package);
	});

    socket.on('pipe-request', function (data) {
    	socket.emit('pipe-response', { pipe : pipe_module.get_pipe(data), pipe_id : data } );
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
        var temp = pipe_module.get_pipe(data.client_score).death_counter++;
        client_module.all[data.client_id].start_game_timestamp = null;
    	io.sockets.emit('bird-death-response', { client_id : data.client_id, pipe : { index : data.client_score, death_counter : temp + 1 }});
    });

    socket.on('state-update', function(data){
        if (client_module.all[data.client_id] == undefined) client_module.add_new(data.client_id);

        if (typeof data.state !== "undefined") client_module.all[data.client_id].update_state(data.state);
        else client_module.all[data.client_id].update_state();

        console.log("STATE: " + client_module.all[data.client_id].state);
    });

    socket.on('client-list-request', function() {
        socket.emit('client-list-response', client_module.all);
    });
});

var state_clean_up_service = setInterval(client_module.scan_states, 1000);