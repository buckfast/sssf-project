"use strict";
let hPressed = false;
let gPressed = false;


let cursorPos = {};
let canvas = undefined;
let context = undefined;

let canvasbg = undefined;
let contextbg = undefined;

let canvasfg = undefined;
let contextfg = undefined;

let canvasuibg = undefined;
let contextuibg = undefined;

let canvasui = undefined;
let contextui = undefined;


const TILE_SIZE = 18;
const HEIGHT = 540/TILE_SIZE+2;
const WIDTH = 900/TILE_SIZE+2;
let currentPlaceableCoords = undefined;

let islandCenters;

let currentState = 1;

const run = (centers) => {
  islandCenters = centers;

  const getCursorPosition = (event) => {
  	const rect = canvasui.getBoundingClientRect();
  	return {x: event.clientX - rect.left,
  		y: event.clientY - rect.top,
  		};
  }


  canvasui.addEventListener('mousemove', (event) => {
  	cursorPos = getCursorPosition(event);
  }, false);


  document.addEventListener("keydown", (e) => {
  if (e.repeat) {return;}
  		if(e.keyCode == 71 && !hPressed ) {
  				hPressed = true;
  		}
  		if(e.keyCode == 72 && !gPressed ) {
  				gPressed = true;
  		}
  	}, false);

  document.addEventListener("keyup", (e) => {
      if(e.keyCode == 71) {
          hPressed = false;
      }
      if(e.keyCode == 72) {
          gPressed = false;
      }
  }, false);
}

const changeStateTo = (state) => {
  currentState = state;
}

const drawCountdown = (count) => {
  contextui.clearRect(0, 0, canvasui.width, canvasui.height);

  contextui.font = "bold 32px Courier New";
  contextui.fillStyle = 'black';
  contextui.fillText(count, canvasui.width/2-24, 42);

  contextui.font = 'bold 32px Courier New';
  contextui.fillStyle = 'white';
  contextui.fillText(count, canvasui.width/2-24, 40);
}
const clearCountdown = () => {
  contextui.clearRect(0, 0, canvasui.width, canvasui.height);
}


const drawCannonballs=(balls)=> {
  contextfg.clearRect(0, 0, canvasfg.width, canvasfg.height);

  for (let s=0; s<balls.length; s++) {
    //if (balls[i] != undefined) {
    for (let i=0; i<balls[s].length; i++) {
      contextfg.beginPath();
      contextfg.arc(balls[s][i].posx_pixels, balls[s][i].posy_pixels, 3, 0, 2 * Math.PI, false);
      contextfg.fillStyle = '#000000';
      contextfg.fill();
      contextfg.lineWidth = 5;
      contextfg.strokeStyle = '#003300';
      contextfg.stroke();
      contextfg.closePath();

    }
    //}
  }
}
const drawPlaced = (drawables) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i=0; i<drawables.length; i++) {
    drawWallShadows(drawables[i]["walls"]);
    drawCannons(drawables[i]["cannons"]);
    drawWalls(drawables[i]["walls"]);
  }
}

const drawWallShadows = (walls) => {
  if (currentState == 2) {
    for (let i=0; i<walls.length; i++) {
      context.fillStyle = "rgba(139, 139, 139, 1)";
      context.fillRect(walls[i].x*TILE_SIZE+1-TILE_SIZE, walls[i].y*TILE_SIZE+1-TILE_SIZE+5, TILE_SIZE, TILE_SIZE);
    }
  }
}
const drawWalls = (walls) => {
  if (currentState != 2) {
    for (let i=0; i<walls.length; i++) {
      context.fillStyle = "rgba(221, 217, 214, 1)";
      context.fillRect(walls[i].x*TILE_SIZE+1-TILE_SIZE, walls[i].y*TILE_SIZE+1-TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  } else {
    for (let i=0; i<walls.length; i++) {
      context.fillStyle = "rgba(221, 217, 214, 1)";
      context.fillRect(walls[i].x*TILE_SIZE+1-TILE_SIZE, walls[i].y*TILE_SIZE+1-TILE_SIZE-5, TILE_SIZE, TILE_SIZE);
    }
  }
}
const drawCannons = (cannons) => {
  if (currentState == 2) {
    for (let key in cannons) {
      let t = cannons[key].tiles[3];

      context.beginPath();
      context.arc(t.x*TILE_SIZE-TILE_SIZE+1, t.y*TILE_SIZE-TILE_SIZE+2, 12, 0, 2 * Math.PI, false);
      context.fillStyle = '#45454a';
      context.fill();
      context.lineWidth = 4;
      context.strokeStyle = '#45454a';
      context.stroke();
      context.closePath();

        context.beginPath();
        context.arc(t.x*TILE_SIZE-TILE_SIZE+1, t.y*TILE_SIZE-TILE_SIZE-2, 12, 0, 2 * Math.PI, false);
        context.fillStyle = '#6a6a73';
        context.fill();
        context.lineWidth = 4;
        context.strokeStyle = '#616167';
        context.stroke();
        context.closePath();
    }
  } else {
    for (let key in cannons) {
      let t = cannons[key].tiles[3];
        context.beginPath();
        context.arc(t.x*TILE_SIZE-TILE_SIZE+1, t.y*TILE_SIZE-TILE_SIZE+1, 12, 0, 2 * Math.PI, false);
        context.fillStyle = '#6a6a73';
        context.fill();
        context.lineWidth = 4;
        context.strokeStyle = '#616167';
        context.stroke();
        context.closePath();
    }
  }
}

const setCurrentPlaceable = (wallBlock) => {
  currentPlaceableCoords = wallBlock;
}

const banner = (text, ms) => {

  let y = -16;
  let speed = canvas.height/(ms/1000)+20;
  let deltaTime;
  let then = Date.now();
  let animationFrameLoop;

  const update = () => {
  	let vel = speed * deltaTime;
  	y += vel;
    contextui.clearRect(0, 0, canvas.width, canvas.height);

    contextui.fillStyle = "rgba(159, 172, 115, 1)";
    contextui.fillRect(0, y-45, WIDTH*TILE_SIZE, 64);
    contextui.fillStyle = "rgba(133, 144, 94, 1)";
    contextui.fillRect(0, y+22, WIDTH*TILE_SIZE, 2);
    contextui.fillRect(0, y-50, WIDTH*TILE_SIZE, 2);

    contextui.fillStyle = "#000000";
    contextui.font = "bold 45px Courier New";
    let padding = (canvas.width-contextui.measureText(text).width)/2;

    contextui.fillText(text, padding, y+2);

    contextui.fillStyle = "#ffffff";
    contextui.font = "bold 45px Courier New";
    padding = (canvas.width-contextui.measureText(text).width)/2;


    contextui.fillText(text, padding, y);
  };

  const frame = () => {
      let now = Date.now();
      let delta = now - then;
      deltaTime = delta / 1000;
      then = now;
      update();
      loop();
  }

  const loop = () => {
      animationFrameLoop = requestAnimationFrame(frame);
  };

  const pause = () => {

  	cancelAnimationFrame(animationFrameLoop);
    contextui.clearRect(0, 0, canvas.width, canvas.height);

  };

  loop();
  setTimeout(()=>{
    pause();
  },ms);
}

const drawPlaceable = (coords) => {
  contextfg.clearRect(0, 0, canvasfg.width, canvasfg.height);

  if (coords != undefined) {
    for (let i=0; i<coords.length; i++) {
      // contextfg.beginPath();
      // contextfg.rect(
      // coords[i].x,
      // coords[i].y,
      // TILE_SIZE,
      // TILE_SIZE);
      //
       contextfg.fillStyle = "rgba(255, 255, 255, 0.77)";
      // contextfg.fill();
      // contextfg.closePath();
      contextfg.fillRect(coords[i].x, coords[i].y, TILE_SIZE, TILE_SIZE);
      //console.log(JSON.stringify(coords));
    }
  }

  //console.log("\n");
}

const init = (host) => {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  canvasbg = document.getElementById("background-canvas");
  contextbg = canvasbg.getContext("2d");

  canvasfg = document.getElementById("foreground-canvas");
  contextfg = canvasfg.getContext("2d");

  canvasuibg = document.getElementById("uibg-canvas");
  contextuibg = canvasuibg.getContext("2d");

  canvasui = document.getElementById("ui-canvas");
  contextui = canvasui.getContext("2d");

  canvasui.onmousedown = () => {
    return false;
  };

  contextbg.clearRect(0, 0, canvas.width, canvas.height);
  const colors = ["#cecfc5","#d0ccc6","#c1c9c0","#dadada"];
  for (let i=0; i<HEIGHT; i++) {
      for (let j=0; j<WIDTH; j++) {

        contextbg.fillStyle = colors[((i*j)+j)%4];
        contextbg.fillRect(j*TILE_SIZE, i*TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
  }
  let text ="";
  if (host) {
    text= "press 'start game' to start the game (min. 2 players)";
  } else {
    text="waiting for the host to start the game...";
  }
  contextbg.fillStyle = "#000000";
  contextbg.font = "bold 27px Courier New";
  let padding = (canvas.width-contextbg.measureText(text).width)/2;

  contextbg.fillText(text, padding, ((HEIGHT*TILE_SIZE)/2)+2-5);

  contextbg.fillStyle = "#ffffff";
  contextbg.font = "bold 27px Courier New";
  padding = (canvas.width-contextbg.measureText(text).width)/2;
  contextbg.fillText(text, padding, ((HEIGHT*TILE_SIZE)/2)-5);
  // contextbg.clearRect(0, 0, canvas.width, canvas.height);
  // contextbg.fillStyle = "#c5cd65";
  // contextbg.fillRect(0, 0, canvas.width, canvas.height);

  banner("sföfglh welcome", 5000);
}

const initPlaceables = (drawables) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i=0; i<drawables.length; i++) {
    drawWalls(drawables[i]["walls"]);
    drawCannons(drawables[i]["cannons"]);
  }
}
const colorize = (tiles, players, borders, deadIslands, centers) => {
  contextuibg.clearRect(0, 0, canvas.width, canvas.height);
  for (let i=0; i<centers.length; i++) {


        contextuibg.font = "bold 18px Courier New";
        contextuibg.lineWidth = 2;
        contextuibg.strokeStyle = "rgba(0, 0, 0, 0.44)";
        let padding = (contextuibg.measureText(centers[i].name).width)/2;
        contextuibg.strokeText(centers[i].name,centers[i].center.x*TILE_SIZE-padding, centers[i].center.y*TILE_SIZE-(12));

    contextuibg.fillStyle = "rgba(255, 255, 255, 0.66)";
    contextuibg.font = "bold 18px Courier New";
     padding = (contextuibg.measureText(centers[i].name).width)/2;
    contextuibg.fillText(centers[i].name,centers[i].center.x*TILE_SIZE-padding, centers[i].center.y*TILE_SIZE-(12));

  }

  contextbg.clearRect(0, 0, canvas.width, canvas.height);

  console.log("borders", borders);

  let odd = [];
  for (let i=0; i<players.length; i++) {
    odd.push({row: 0, tile: 0});
  }
  console.log("deadislands",deadIslands);
  let c1_1 = "#629a56";
  let c1_2 = "#5c8f51";
  if (deadIslands.includes(0)) {
    c1_1 = "#777777";
    c1_2 = "#707070";
  }

  let c2_1 = "#a85785";
  let c2_2 = "#945478";
  if (deadIslands.includes(1)) {
    c2_1 = "#777777";
    c2_2 = "#707070";
  }

  let c3_1 = "#83afaf";
  let c3_2 = "#78a1a1";
  if (deadIslands.includes(2)) {
    c3_1 = "#777777";
    c3_2 = "#707070";
  }

  let c4_1 = "#c5cd65";
  let c4_2 = "#b2b95c";
  if (deadIslands.includes(3)) {
    c4_1 = "#777777";
    c4_2 = "#707070";
  }

  let c5_1 = "#615faf";
  let c5_2 = "#585699";
  if (deadIslands.includes(4)) {
    c5_1 = "#777777";
    c5_2 = "#707070";
  }



  for (let i=0; i<HEIGHT; i++) {
      for (let j=0; j<WIDTH; j++) {
        if (tiles[i][j].zone === 1) {
              (odd[0].tile%2==0 && i%2==0) ? contextbg.fillStyle = c1_1 : contextbg.fillStyle = c1_2;
              odd[0].tile++;
              contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);

            } else if (tiles[i][j].zone === 2) {
              if (odd[1] != undefined) {
                (odd[1].tile%2==0&& i%2==0) ? contextbg.fillStyle = c2_1 : contextbg.fillStyle = c2_2;
                odd[1].tile++;
                contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
              }

            } else if (tiles[i][j].zone === 3) {
              if (odd[2] != undefined) {
                (odd[2].tile%2==0&& i%2==0) ? contextbg.fillStyle = c3_1 : contextbg.fillStyle = c3_2;
                odd[2].tile++;
                contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
              }
            }  else if (tiles[i][j].zone === 4) {
              if (odd[3] != undefined) {
                (odd[3].tile%2==0&& i%2==0) ? contextbg.fillStyle = c4_1 : contextbg.fillStyle = c4_2;
                odd[3].tile++;
                contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
              }
            } else if (tiles[i][j].zone === 5) {
              if (odd[4] != undefined) {
                (odd[4].tile%2==0&& i%2==0) ? contextbg.fillStyle = c5_1 : contextbg.fillStyle = c5_2;
                odd[4].tile++;
                contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
              }

            }


              if (tiles[i][j].inner.some((e) => {return e==true})) {
                //if (tiles[i][j].zone == 1) {
                  contextbg.fillStyle = "#e0a33a";
                  contextbg.fillRect(j*TILE_SIZE-TILE_SIZE+2, i*TILE_SIZE-TILE_SIZE+2, j+TILE_SIZE-2, i+TILE_SIZE-2);
              }


            if (tiles[i][j].castle == true) {
              // for (let p=0; p<players.length; p++) {
              //   if (tiles[i][j].zone == (p+1) && players[p].nameTagDrawn==false) {
              //     contextuibg.fillStyle = "#ffffff";
              //     contextuibg.font = "20px Arial";
              //     console.log(players[p][Object.keys(players[p])[0]])
              //     contextuibg.fillText(players[p][Object.keys(players[p])[0]],j*TILE_SIZE-(TILE_SIZE*3), i*TILE_SIZE-TILE_SIZE);
              //     players[p].nameTagDrawn = true;
              //   }
              // }
              contextbg.fillStyle = "#404040";
              contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
            }
            // contextbg.beginPath();
            // contextbg.rect(j*TILE_SIZE, 0, 1, HEIGHT*TILE_SIZE);
            // contextbg.fillStyle = "rgb(0, 0, 0)";
            // contextbg.fill();
            // contextbg.closePath();
      }
      // contextbg.beginPath();
      // contextbg.rect(0, i*TILE_SIZE-TILE_SIZE, WIDTH*TILE_SIZE, 1);
      // contextbg.fillStyle = "rgb(0, 0, 0)";
      // contextbg.fill();
      // contextbg.closePath();
    }

    for (let i=0; i<Object.keys(borders).length; i++) {
      for (let key in borders[i]) {
      	for (let k=0; k<borders[i][key].length; k++) {
      		contextbg.beginPath();
      		contextbg.rect(borders[i][key][k].x*TILE_SIZE+2-TILE_SIZE, borders[i][key][k].y*TILE_SIZE+2-TILE_SIZE,TILE_SIZE-3,TILE_SIZE-3);
      		contextbg.fillStyle = "rgba(2, 50, 51, 0.27)";
      		contextbg.fill();
      		contextbg.closePath();

      	}
      }
    }


}


const drawInnerTiles = (tiles) => {
  //contextbg.clearRect(0, 0, canvasbg.width, canvasbg.height);
  for (let i=0; i<tiles.length; i++) {
    if (tiles[i].castle != true) {
        contextbg.fillStyle = "#e0a33a";
        contextbg.fillRect(tiles[i].x*TILE_SIZE-TILE_SIZE+2, tiles[i].y*TILE_SIZE-TILE_SIZE+2, TILE_SIZE-2, TILE_SIZE-2);
      }
  }
}

const sendInput = (socket) => {
    const FPS = 30;
    setInterval(() => {
      //console.log(cursorPos);
      socket.emit("control", {g: gPressed, h: hPressed, cursorPos: cursorPos});
    }, 1000/FPS);
}
const clicked = (socket) => {
  socket.emit("click", cursorPos);
}
