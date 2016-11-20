var http        = require('http');
var express		= require('express');
var fs			= require('fs');
var io			= require('socket.io');
var crypto		= require('crypto');
var path = require('path');

var app       	= express();
var staticDir 	= express.static;
var server    	= http.createServer(app);

var VoteCounter = require('./plugin/multiplex-vote/vote-classes.js');
var voteCounter = new VoteCounter();

io = io(server);


var opts = {
	port: process.env.PORT || 1989,
};

io.on( 'connection', function( socket ) {

	//Check if it's the master coonnecting
	var socketType = socket.handshake.query.name || null;
	if (socketType === 'master') {
		socket.join('realtime-vote');
	} else if (socketType === 'client') {
		socket.join('client');
	}

	//Send current state on connection!
	socket.on('multiplex-statechanged', function(data) {
		if (typeof data.secret == 'undefined' || data.secret == null || data.secret === '') return;
		if (createHash(data.secret) === data.socketId) {
			data.secret = null;
			socket.broadcast.emit(data.socketId, data);
		};
	});
});

app.use('/node_modules', staticDir(path.join(__dirname, 'node_modules')));
app.use('/bower_components', staticDir(path.join(__dirname, 'bower_components')));
app.use('/plugin', staticDir(path.join(__dirname, 'plugin')));
app.use('/static', staticDir(path.join(__dirname, 'static')));

app.get('/master', function(req, res) {
	res.sendFile('master.html', {
		root: path.join(__dirname, '/static/'),
	});
});

app.get('/client', function(req, res) {
	res.sendFile('client.html', {
		root: path.join(__dirname, '/static/'),
	});
});

app.get('/vote/:voteId/:option', function(req, res) {
	var voteId = req.params.voteId;
	var option = req.params.option;
	voteCounter.handleVote(voteId, option);
	res.status(200).send('Vote received');

	//Todo - setup another channel for server -> master
	io.to('realtime-vote').emit('vote-update', {
		votes: voteCounter.getVoteTally(voteId)
	});

});

app.get("/token", function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});

	var stream = fs.createReadStream(path.join(__dirname, '/index.html'));
	stream.on('error', function( error ) {
		res.write('<style>body{font-family: sans-serif;}</style><h2>reveal.js multiplex server.</h2><a href="/token">Generate token</a>');
		res.end();
	});
	stream.on('readable', function() {
		stream.pipe(res);
	});
});

app.get("/gettoken", function(req,res) {
	var ts = new Date().getTime();
	var rand = Math.floor(Math.random()*9999999);
	var secret = ts.toString() + rand.toString();
	res.send({secret: secret, socketId: createHash(secret)});
});

var createHash = function(secret) {
	var cipher = crypto.createCipher('blowfish', secret);
	return(cipher.final('hex'));
};

// Actually listen
server.listen( opts.port || null );

var brown = '\033[33m',
	green = '\033[32m',
	reset = '\033[0m';

console.log( brown + "reveal.js:" + reset + " Multiplex running on port " + green + opts.port + reset );
