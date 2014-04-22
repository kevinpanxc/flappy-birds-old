var express = require("express");
var app = express();
var port = 3700;

app.use(express.static(__dirname + '/assets'));

app.get('/', function(request, response) {
	response.sendfile('./assets/index.html');
});

var io = require('socket.io').listen(app.listen(port));

console.log("Listening on port " + port);

var pipes = new Array();

var clients = {};

io.sockets.on('connection', function (socket) {
	socket.on('register-request', function (data) {
		//clients = {};
		//var clientId = addNewClient();
		//clients[clientId].time += 2000;
		socket.emit('register-response', addNewClient());

	});

    socket.on('pipe-request', function (data) {
    	socket.emit('pipe-response', getPipe(data.index));
    });

    //asking for all the birds
    socket.on('sync-request', function(data) {
    	var clientPackage = {};
    	for (client in clients) {
    		if (data != client) {
    			clients[client].timediff = clients[client].time - clients[data].time;
    			clientPackage[client] = clients[client];
    		}
    	}
    	socket.emit('sync-response', clientPackage)
    }); 

    //on bird jump, re-emit
    socket.on('bird-jump',function(data){
    	io.sockets.emit('bird-jumped',data);
    });

    socket.on('bird-death-request',function(data){
    	io.sockets.emit('bird-death-response',data);
    });
});

function generatePipes () {	
	var pipeheight = 90;
	var padding = 80;
	var constraint = 420 - pipeheight - (padding * 2); //double padding (for top and bottom)
	for (var i = 0; i < 50; i++) {
	   var topheight = Math.floor((Math.random()*constraint) + padding); //add lower padding
	   var bottomheight = (420 - pipeheight) - topheight;
	   pipes.push({topheight: topheight, bottomheight: bottomheight});
	}
}

function getPipe(index) {
	if (index >= pipes.length - 1) {
		generatePipes();
	}

	return pipes[index];
}

function addNewClient() {
	var clientId = randomString(16, 'aA');
	clients[clientId] = {clientId: clientId, velocity: 0, position:90, rotation: 0, time: new Date().getTime()};
	return clientId;
}

function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}