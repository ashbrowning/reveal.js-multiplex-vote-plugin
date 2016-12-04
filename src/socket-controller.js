var crypto = require('crypto');
var io = require('socket.io');

class SocketController {
  constructor(expressApp) {
    this.presentationState = {};
    this.io = io(expressApp);
    this.initialiseSocketIO();
  }

  initialiseSocketIO() {

    var _this = this;
    this.io.on('connection', function (socket) {

      _this.addNewSocketToRooms(socket);

      //send current slide
      if (Object.keys(_this.presentationState).length !== 0) {
        socket.emit(_this.presentationState.socketId, _this.presentationState);
      }

      _this.setupMultiplexing(socket);

    });
  }

  addNewSocketToRooms(socket) {
    //Check if it's the master coonnecting
    var socketType = socket.handshake.query.name || null;
    if (socketType === 'master') {
      socket.join('realtime-vote');
    } else if (socketType === 'client') {
      socket.join('client');
    }
  }

  setupMultiplexing(socket) {
    //Send current state on connection!
    socket.on('multiplex-statechanged', this.onMultiplexStateChange.bind(this, socket));
  }

  onMultiplexStateChange(socket, data) {
    if (typeof data.secret == 'undefined' || data.secret == null || data.secret === '') return;
    if (this.createHash(data.secret) === data.socketId) {
      data.secret = null;
      this.presentationState = data;
      socket.broadcast.emit(data.socketId, data);
    };
  }

  createHash(secret) {
    var cipher = crypto.createCipher('blowfish', secret);
    return (cipher.final('hex'));
  }

  sendRealtimeVoteUpdate(votes) {
    //Todo - setup another channel for server -> master
    this.io.to('realtime-vote').emit('vote-update', {
      votes: votes
    });
  }
}

module.exports = SocketController;

