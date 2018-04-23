const SocketServer = require('socket.io');
const Game = require("./game/Game");


module.exports.listen = (http) => {
  const io = new SocketServer(http);

  let games = {};
  let roomNumber = 0;


  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('message', (msg) => {
      //console.log('message: ' + msg);
      socket.broadcast.to(getRoom(socket)).emit('message', msg);
      console.log(socket.rooms);
    });

    socket.on("room_create", (msg) => {
          io.emit('room_created', {roomNumber: roomNumber, name: msg});
          joinRoom(socket, roomNumber);
          console.log("created new room: "+roomNumber);
          socket.emit("room_joined", {roomNumber: roomNumber, name: msg, host: true});
          roomNumber++;
    });

    socket.on("room_join", (msg) => {

      joinRoom(socket, msg.roomNumber);
      socket.emit('room_joined', msg);

    });

    socket.on("start_game", () => {
    usersInRoom(getRoom(socket), (err, players) => {
        if (err == null) {
          //console.log("data: ",data);
          const game = new Game(players, 900, 540, 18);
          games[getRoom(socket)] = game;

          game.run(
            (err, socketid, placeable) => {
              if (err == null) {
                //console.log(socketid);
                io.to(socketid).emit("drawPlaceable", placeable);
              }
            },
            (cannonballs) => {
              if (cannonballs != null) {
                io.in(getRoom(socket)).emit("drawCannonballs", cannonballs);
              }
            },
            (drawable) => {
                io.in(getRoom(socket)).emit("updateDrawable", drawable);
            }
          );
          //socket.emit("game_start", game.tiles);
          io.in(getRoom(socket)).emit("game_start", {'tiles': game.tiles, 'drawables': game.drawables, 'playerCount': players.length});
        }
      });

    })

    socket.on("control", (controls) => {
      //console.log(control);
      if (games[getRoom(socket)]!=undefined) {

        games[getRoom(socket)].updateUserControls(socket.id, controls);
      }
    })

    socket.on("click", (pos) => {
      if (games[getRoom(socket)] != undefined) {
        let obj = games[getRoom(socket)].clicked(socket.id, pos);
          io.in(getRoom(socket)).emit("updateDrawable", obj);
          //io.in(getRoom(socket)).emit("tiles", {"tiles":games[getRoom(socket)].tiles, "playerCount":games[getRoom(socket)].POINTS});

      }
    })
  });


  const usersInRoom = (room, cb) => {
    io.of('/').in(room).clients( (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, data);
      }
    });
  }

  return io;
}




let leaveRoom = (socket) => {
  for (let key in socket.rooms) {
      if (key != socket.id) {
        socket.leave(key);
      }
  }
}
let getRoom = (socket) => {
  for (let key in socket.rooms) {
      if (key != socket.id) {
        return key;
      }
  }
}

const joinRoom = (socket, roomNumber) => {
  leaveRoom(socket);
  socket.join(roomNumber);


}
