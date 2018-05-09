const socketio = require('socket.io')
const Game = require("./game/Game");
const shortid = require('shortid');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const sharedsession = require("express-socket.io-session");
const User = require('./models/user');

module.exports.listen = (http, session) => {
  const io = socketio.listen(http);

  io.use(sharedsession(session));

  let games = {};


  const usersInRoom = (io, room, cb) => {
    io.of('/').in(room).clients( (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, data);
      }
    });
  }

  const removePlayerOnLeave = (socket) => {
    const room = getRoom(socket);
    if (room != "lobby" && games[room] != undefined) {
      const playerIndex = games[room].players.findIndex((obj) => {
        return Object.values(obj)[0] == socket.handshake.session.username;
      })
      if (playerIndex!=-1) {
        games[room].players.splice(playerIndex, 1);
      }
    }
  }


  let leaveRoom = (socket, cb) => {
    removePlayerOnLeave(socket);
    for (let key in socket.rooms) {
        if (key != socket.id) {
          socket.leave(key, () => {
            console.log("left "+key);
            //socket.handshake.session.roomId=undefined;

            typeof cb === 'function' && cb(key);
          });
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

  const getRoomUsernames = (room) => {
    if (games[room] != undefined) {
      return games[room].players.map((obj) => Object.values(obj)[0]);
    }
  }

  const joinRoom = (socket, roomNumber, cb) => {
    //console.log("joinroom roombnumer: "+games[roomNumber]);
    leaveRoom(socket);
    socket.join(roomNumber, (err) => {
      if (err && typeof cb === 'function') {
        cb(err);
      }
      if (err== null) {
        //console.log("username",socket.handshake.session.username);
        if (roomNumber != "lobby" && games[roomNumber] != undefined) {
          let obj = {};
          obj[socket.id] = socket.handshake.session.username;
          games[roomNumber].players.push(obj);
          socket.handshake.session.roomId=roomNumber;
          socket.handshake.session.save();

          typeof cb === 'function' && cb(null, roomNumber);
        }
      }
    });
  }

  const getAllRooms = (io) => {
    let gameRooms = [];
    // for(let key in io.sockets.adapter.rooms) {
    //   if (key.substring(0, 4) == 'room') {
    //     let obj = {};
    //     obj[key] = io.sockets.adapter.rooms[key];
    //     gameRooms.push(obj);
    //   }
    // }
    for (let key in games) {
      let obj = {};
      obj.roomName = games[key].name;
      obj.roomId = key;
      gameRooms.push(obj);
    }
    return gameRooms;
  }


  io.on('connection', (socket) => {
    //console.log("connection", socket.handshake.session.username);

    //if (socket.handshake.session.passport == undefined || Object.keys(socket.handshake.session.passport).length == 0) {
    if (socket.handshake.session.passport != undefined && Object.keys(socket.handshake.session.passport).length > 0) {
      //logged in
      User.findById(socket.handshake.session.passport.user, (err, user) => {
        if (err) {return err};
        socket.handshake.session.roomId = undefined;
        socket.handshake.session.username = user.username;
        socket.handshake.session.save();
        socket.emit("onConnection", { name: user.username});
      });
    } else {
      if (socket.handshake.session.username == undefined) {
        let name = "anon_"+shortid.generate().substring(0,5);
        socket.handshake.session.roomId = undefined;
        socket.handshake.session.username = name;
        socket.handshake.session.save();
        socket.emit("onConnection", { name: name});
      }
    }

    socket.emit("onConnection", {name: socket.handshake.session.username});






    console.log('a user connected');
    joinRoom(socket, "lobby");
    socket.handshake.session.roomId = "lobby";

    socket.emit("roomList", getAllRooms(io));

    socket.on("disconnecting", () => { // TODO: check if host disconects
      //console.log("use disconnecting");
      const room = getRoom(socket);
      if (games[room] != undefined) {
        if (games[room].game != undefined) {
          games[room].game.killPlayer(socket.id);
        }
      }

      leaveRoom(socket, (room) => {
        io.in(room).emit("room_users_update", getRoomUsernames(room));
      });
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
              else {
                delete games[room];
                console.log("delete room: "+room);
              }
              io.emit("room_delete", room);

            }
          }
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('message', (msg) => {
      console.log(socket.handshake.session.roomId);
      socket.to(socket.handshake.session.roomId).emit("message", socket.handshake.session.username+": "+msg);


    });

    socket.on("room_create", (msg) => {
        const id = "room_"+shortid.generate();

        socket.handshake.session.host = true;
        socket.handshake.session.roomId = id;
        socket.handshake.session.roomName = msg;
        socket.handshake.session.save();

          socket.emit('room_creating', {roomNumber: id, name: msg});



          games[id] = {game: undefined, players: [], name: msg, started: false};

          //roomNumber++;
    });

    socket.on("room_join", (room) => {
        if (socket.handshake.session.host) {
          socket.handshake.session.host = false;
          socket.handshake.session.save();

          joinRoom(socket, room, (err, room) => {
            if (err == null) {
              console.log("created new room: "+socket.handshake.session.roomId);
              const data = {roomNumber: socket.handshake.session.roomId, roomName: socket.handshake.session.roomName, username: socket.handshake.session.username};
              io.emit('room_created', data);
              socket.emit("room_joined_and_created", data);
            }

          });


        } else {
          if (games[room]!=undefined) {
              if (!games[room].started) {
               if (!getRoomUsernames(room).includes(socket.handshake.session.username)) {
                usersInRoom(io, room, (err, users) => {
                  if (err==null) {
                    if (users.length > 0) {
                      joinRoom(socket, room, (err, room) => {
                        if (err == null) {
                          console.log(getRoomUsernames(room));
                          socket.handshake.session.roomId = room;
                          const data = {roomNumber: socket.handshake.session.roomId, roomName: games[room].name, username: socket.handshake.session.username};
                          socket.emit('room_joined', data);
                          io.in(room).emit("room_users_update", getRoomUsernames(room));
                        }
                      });
                    }
                  }
                });
              }
            }
          }
        }

    });

    socket.on("start_game", () => {
          const room = getRoom(socket);

          if (games[room].players.length < 2 || games[room].started) {
            return -1;
          }

          games[room].started=true;
          let players = JSON.parse(JSON.stringify(games[room].players));
          const game = new Game(players, 900, 540, 18);
          games[room].game = game;

          game.run(
            (err, socketid, placeable) => {
              if (err == null) {
                //console.log(socketid);
                if (game.alive[socketid] == true) {
                  io.to(socketid).emit("drawPlaceable", placeable);
                }
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
                io.in(room).emit("tiles", {"tiles":game.tiles, "players":game.players, 'borders': game.borders, 'deadIslands': game.deadIslandIds, "centers": game.centers}); // TODO: "omit socketid in game.players"

              }
              io.in(room).emit("updateDrawable", {drawables:game.drawables});
            },
            (stateText, state) => {
                io.in(room).emit("drawPlaceable", undefined);
                io.in(room).emit("stateChanger", {stateText: stateText, state: state});

            },
            (count) => {
                io.in(room).emit("roundCountdown", count);
            },
            () => {
              io.in(room).emit("drawPlaceable", undefined);

            }

          );

          io.in(room).emit("game_start", {'tiles': game.tiles, 'drawables': game.drawables, 'players': game.players, 'borders': game.borders, 'deadIslands':game.deadIslandIds, "stateText": game.stateTexts[game.state], "centers": game.centers});
    })


    socket.on("leave_room", () => {
      removePlayerOnLeave(socket);
    })

    socket.on("control", (controls) => {
      //console.log(control);
      if (games[getRoom(socket)] != undefined && games[getRoom(socket)].game!=undefined) {
        if (games[getRoom(socket)].game.alive[socket.id]) {
          games[getRoom(socket)].game.updateUserControls(socket.id, controls);
        }
      }
    })

    const updateAllDrawables = (room, socket) => {
      if (games[room] != undefined) {
        if (games[room].game.alive[socket.id]) {
          let obj = games[room].game.clicked(socket.id/*, pos*/);
          io.in(room).emit("updateDrawable", obj);
          //io.in(getRoom(socket)).emit("tiles", {"tiles":games[getRoom(socket)].tiles, "playerCount":games[getRoom(socket)].POINTS});
        }
      }
    }

    socket.on("click", (pos) => {
      updateAllDrawables(getRoom(socket), socket);
    })
  });


  return io;
}
