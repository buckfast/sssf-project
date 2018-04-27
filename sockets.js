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
    socket.join(roomNumber, (err) => {
      if (err== null) {
        if (roomNumber != "lobby") {
          let obj = {};
          obj[socket.id] = socket["username"];
          games[roomNumber].players.push(obj);
        }
      }
    });
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
        socket["username"] = user.username;
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
      if (room!="lobby") {
        usersInRoom(io,room, (err, users)=>{
          if (err == null) {
            if (users.length == 0) {
              if (games[room].game != undefined) {
                games[room].game.killGameLoop();
                games[room] = undefined;
                delete games[room];
                console.log("delete game: "+room);
              }
            }
          }
        });
      }
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

          games[id] = {game: undefined, players: []};
          joinRoom(socket, id);
          //games[id].players[socket.id]=socket["username"];
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
      const room = getRoom(socket);
      // usersInRoom(io, room, (err, players) => {
      //   if (err == null) {
          //console.log("data: ",data);
          const game = new Game(games[room].players, 900, 540, 18);
          games[room].game = game;

          game.run(
            (err, socketid, placeable) => {
              if (err == null) {
                //console.log(socketid);
                io.to(socketid).emit("drawPlaceable", placeable);
              }
            },
            (cannonballs) => {
              if (cannonballs != null) {
                io.in(room).emit("drawCannonballs", cannonballs);
              }
            },
            (drawable) => {
                io.in(room).emit("updateDrawable", drawable);
            },
            (state) => {
              if (state == 0) {
                io.in(room).emit("tiles", {"tiles":game.tiles, "players":games[room].players, 'borders': game.getBorders()});
              }
            },
            () => {
                io.in(room).emit("drawPlaceable", undefined);
                io.in(room).emit("clearCountdown");
            },
            (count) => {
                io.in(room).emit("roundCountdown", count);
            },

          );
          //socket.emit("game_start", game.tiles);
          io.in(room).emit("game_start", {'tiles': game.tiles, 'drawables': game.drawables, 'players': games[room].players, 'borders': game.getBorders()});
        //}
      //});

    })

    socket.on("control", (controls) => {
      //console.log(control);
      if (games[getRoom(socket)] != undefined && games[getRoom(socket)].game!=undefined) {

        games[getRoom(socket)].game.updateUserControls(socket.id, controls);
      }
    })

    socket.on("click", (pos) => {
      if (games[getRoom(socket)].game != undefined) {
        let obj = games[getRoom(socket)].game.clicked(socket.id, pos);
          io.in(getRoom(socket)).emit("updateDrawable", obj);
          //io.in(getRoom(socket)).emit("tiles", {"tiles":games[getRoom(socket)].tiles, "playerCount":games[getRoom(socket)].POINTS});

      }
    })
  });




  return io;
}
