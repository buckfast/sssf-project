"use strict";

const openInNewTab = (user) => {
  console.log("ehh",user);
  const w = window.open("/users/"+user, '_blank');
}

$(() => {
  let socket = io();
  let username = "";
  const url = window.location.pathname;
  socket.emit("room_join", url.substr(url.lastIndexOf('/') + 1));


  document.getElementById("leaveroom").addEventListener("click", (e) => {
    leaveroom();
  })

  socket.on("room_joined", (data) => {
    if (data.error == 0 ) {
      $("#gamecontent").hide();
      $(".content").append("<br/><p>"+data.message+"</p>");
      setTimeout(() => {
        document.location.href = '/play'
      }, 2000);
    } else if (data.error == 1) {
      $("#gamecontent").hide();
      $(".content").append("<br/><p>"+data.message+"</p>");
      setTimeout(() => {
        document.location.href = '/play'
      }, 2000);
    } else if (data.error == 2) {
      $("#gamecontent").hide();
      $(".content").append("<br/><p>"+data.message+"</p>");
      setTimeout(() => {
        document.location.href = '/play'
      }, 2000);
    } else if (data.error == 3) {
      $("#gamecontent").hide();
      $(".content").append("<br/><p>"+data.message+"</p>");
      setTimeout(() => {
        document.location.href = '/play'
      }, 2000);
    } else if (data.error == undefined) {
      $(".gamestage").find(".lobby-head").append('<h4>'+data.roomName+'</h4>');
      username = data.username;
      init();
    }
  });

  socket.on("room_joined_and_created", (data) => {
    //addRoomToList(socket, msg);
      $("#buttons").append($("<button>", {
        text: "start game",
        id: "startgame",
        "class": "btn btn-sm btn-primary rounded-0",
        click: () => {
          start();
        }
      }));
      username = data.username;


      $(".gamestage").find(".lobby-head").append("<h4>"+data.roomName+"</h4>");

      addUserToList(data.username, true);
      init(true);
  });



  const addUserToList = (username, you) => {
    $(".players-list").append($('<li class="list-player"><a href="/users/'+username+'" id="avatar-'+username+'"><img class="small-avatar" src="/images/avatar.png"></img><span>'+username+(you ?' (you)' : '')+'</span><i class="fa pull-right"></i></a></li>'));

    fetch("/api/users/"+username, {
      method: 'GET'
    }).then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
        console.log('Success:', response)
        if (response.user != undefined) {
          $("#avatar-"+username).empty();
          $("#avatar-"+username).append('<img class="small-avatar" src="/images/'+response.user.avatar+'"><span>'+username+(you ?' (you)' : '')+'</span><i class="fa pull-right"></i>');
        }
    });
  }
  const emptyUsersList = () => {
    $('.players-list').empty();
  }

  socket.on("room_users_update", (msg) => {
    emptyUsersList();
    if (msg!=null) {
    for (let i=0; i<msg.length; i++) {
      addUserToList(msg[i], (msg[i] == username ? true : false));
    }
  }
  });

  document.addEventListener('keydown', function onEvent(event) {
      if (event.key === "Enter") {
        if ($('#chat-input').val().length > 0) {
          socket.emit("message", $('#chat-input').val());
          addMessage(username+": "+$('#chat-input').val());
        }
      }
  });
  document.getElementById("chat-send").addEventListener("click", (e) => {
    if ($('#chat-input').val().length > 0) {
      socket.emit("message", $('#chat-input').val());
      addMessage(username+": "+$('#chat-input').val());
      $('#chat-input').val('');

    }
  })
  socket.on('message', (msg) => {
    addMessage(msg);
  });

  const addMessage = (msg) => {
    const chatbox = document.getElementsByClassName("game-chat")[0];
    const isBottom = chatbox.scrollHeight-chatbox.clientHeight<=chatbox.scrollTop;

    let $m = ($('<div class="chat-message"></div>'));
    $m.append($('<p></p>').text(msg));
    $('.game-chat').append($m);

    if (isBottom) {
      chatbox.scrollTop = chatbox.scrollHeight-chatbox.clientHeight;
    }
  }

  socket.on("game_start", (data) => {
    $("#startgame").hide();

    console.log("jou",data.centers);
    run(data.centers);
    colorize(data.tiles, data.players, data.borders, data.deadIslands, data.centers, username);
    initPlaceables(data.drawables);
    sendInput(socket);
    canvasui.addEventListener("click", () => {
      clicked(socket);
    });
    banner("Get ready!",5000);
    setTimeout(()=> {
      banner(data.stateText,5000);
    }, 5000);
  })

  socket.on("gameEnd", (data) => {
    banner(data.text,5000);
    setTimeout(()=> {
      showScores(data.scores, data.centers);
    }, 5000);
  });

  socket.on("drawPlaced", (drawables) => {
    drawPlaced(drawables);
  })

  socket.on("updateDrawable", (obj) => { //todo: rename stuff
    if (obj != null) {
      drawPlaced(obj.drawables);
      if (obj.innerTiles != undefined) {
        drawInnerTiles(obj.innerTiles);
      }
    }
  });

  socket.on("roundCountdown", (count) => {
    drawCountdown(count);
  })
  socket.on("stateChanger", (data) => {
    clearCountdown();
    banner(data.stateText, 5000);
    changeStateTo(data.state);
  })

  socket.on("drawPlaceable", (placeable) => {
    drawPlaceable(placeable);
  })

  socket.on("drawCannonballs", (balls) => {
    drawCannonballs(balls);
  })

  socket.on("tiles", (data) => {
    //console.log("players",data.players);
    clearCountdown();
    colorize(data.tiles, data.players, data.borders,data.deadIslands, data.centers, username);
  });

  const start = () => {
    socket.emit("start_game");
  }
  const leaveroom = () => {
    socket.emit("leave_room");
    document.location.href = '/play'
  }
});
