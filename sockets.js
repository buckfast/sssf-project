const SocketServer = require('socket.io');
const Game = require("./game/Game");
const shortid = require('shortid');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const sharedsession = require("express-socket.io-session");
const User = require('./models/user');

module.exports.listen = (http, session) => {
  const io = new SocketServer(http);

  io.use(sharedsession(session));

  let games = {};
  //let roomNumber = 0;


  const usersInRoom = (io, room, cb) => {
    io.of('/').in(room).clients( (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, data);
      }
    });
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


  io.on('connection', (socket) => {

    if (socket.handshake.session.passport == undefined || Object.keys(socket.handshake.session.passport).length == 0) {
      let name = "anon_"+shortid.generate();
      socket.emit("onConnection", name);
      socket["username"] = name;
    } else {
      User.findById(socket.handshake.session.passport.user, (err, user) => {
        if (err) {return err};
        socket.emit("onConnection", user.username);
        socket["username", user.username];
      });
    }



    const getAllRooms = () => {
      let gameRooms = [];
      for(let key in io.sockets.adapter.rooms) {
        if (key.substring(0, 4) == 'room') {
          let obj = {};
          obj[key] = io.sockets.adapter.rooms[key];
          gameRooms.push(obj);
        }
      }
      return gameRooms;
    }

    console.log('a user connected');
    joinRoom(socket, "lobby");
    socket.emit("roomList", getAllRooms());

    socket.on("disconnecting", () => {
      //console.log("use disconnecting");
      const room = getRoom(socket);
      leaveRoom(socket);
      usersInRoom(io,room, (err, users)=>{
        if (err == null) {
          if (users.length == 0) {
            if (games[room] != undefined) {
              games[room].killGameLoop();
              games[room] = undefined;
            }
            delete games[room];
            console.log("delete game: "+room);
          }
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');

    });

    socket.on('message', (msg) => {
      //console.log('message: ' + msg);
      socket.broadcast.to(getRoom(socket)).emit('message', msg);
      console.log(socket.rooms);
    });

    socket.on("room_create", (msg) => {
        const id = "room_"+shortid.generate();

          io.emit('room_created', {roomNumber: id, name: msg});
          joinRoom(socket, id);
          console.log("created new room: "+id);
          socket.emit("room_joined", {roomNumber: id, name: msg, host: true});
          //roomNumber++;
    });

    socket.on("room_join", (msg) => {
      //socket["username"] = name;
      joinRoom(socket, msg.roomNumber);
      socket.emit('room_joined', msg);
      console.log(socket["username"]+" joining room");
    });

    socket.on("start_game", () => {
    usersInRoom(io, getRoom(socket), (err, players) => {
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
            },
            (state) => {
              if (state == 0) {
                io.in(getRoom(socket)).emit("tiles", {"tiles":game.tiles, "playerCount":game.POINTS, 'borders': game.getBorders()});
              }
            },
            () => {
                io.in(getRoom(socket)).emit("drawPlaceable", undefined);
                io.in(getRoom(socket)).emit("clearCountdown");
            },
            (count) => {
                io.in(getRoom(socket)).emit("roundCountdown", count);
            },

          );
          //socket.emit("game_start", game.tiles);
          io.in(getRoom(socket)).emit("game_start", {'tiles': game.tiles, 'drawables': game.drawables, 'playerCount': players.length, 'borders': game.getBorders()});
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




  return io;
}
