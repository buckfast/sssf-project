"use strict";
$(() => {


  let socket = io();
  let username = "";
  socket.on("onConnection", (name) => {
    username = name;
    document.getElementById("gamename").value = name+"'s game";
    document.getElementsByClassName("statusText")[0].innerHTML = name;

    // $("#createroom").click(() => {
    //   socket.emit("room_create", $('#gamename').val());
    // });
  })

  document.getElementById("createroom").addEventListener("click", (e) => {
    socket.emit("room_create", $('#gamename').val());
  })


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
    const chatbox = document.getElementsByClassName("lobby-chat")[0];
    const isBottom = chatbox.scrollHeight-chatbox.clientHeight<=chatbox.scrollTop;

    $('.lobby-chat').append($('<div class="chat-message"><p>'+msg+'</p></div>'));

    if (isBottom) {
      chatbox.scrollTop = chatbox.scrollHeight-chatbox.clientHeight;
    }
  }

  const addRoomToList = (roomId, roomName) => {
    $(".room-list").append($('<li class="list-room" id="'+roomId+'"><a href="/play/'+roomId+'"><i class="fa fa-rocket"></i><span>'+roomName+'</span><i class="fa pull-right"></i></a></li>'));
  }

  const leaveroom = (socket) => {
    socket.emit("leave_room");
    document.location.href = '/play'
  }




  socket.on("roomList", (list) => {
    console.log(list);
    for (let i=0; i<list.length; i++) {
      addRoomToList(list[i].roomId, list[i].roomName);
    }
  });



  socket.on("room_creating", (msg) => {
    console.log("room creating", msg);
    //addRoomToList(socket, msg);
    document.location.href = '/play/'+msg.roomNumber;
  });

  socket.on("room_created", (msg) => {
    console.log(msg);
    addRoomToList(msg.roomNumber, msg.roomName);
  })

  socket.on("room_delete", (room) => {
    console.log("room delete!!!!!!!!!!!!!!!!!!!!!!!", room);
    $(".room-list").find("#"+room).remove();
  })
});
