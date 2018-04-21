
  let hPressed = false;
  let gPressed = false;
  let ctrl = 0;
    let cursorPos = {};
    let canvas = undefined;
    let context = undefined;

    let canvasbg = undefined;
    let contextbg = undefined;
    const TILE_SIZE = 18;

    let tempPlaceable = undefined;

const run = () => {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  canvasbg = document.getElementById("background-canvas");
  contextbg = canvasbg.getContext("2d");


  canvas.addEventListener('mousemove', (event) => {
  	cursorPos = getCursorPosition(canvas, event);
  }, false);

  const getCursorPosition = (canvas, event) => {
  	const rect = canvas.getBoundingClientRect();
  	return {x: event.clientX - rect.left,
  		y: event.clientY - rect.top,
  		};
  }





  document.addEventListener("keydown", (e) => {
  if (e.repeat) {return;}
  		if(e.keyCode == 71 && !hPressed) {
  				hPressed = true;
  		}

  		if (e.keyCode == 17) {
  			//game.state+=1;
  			//game.state = game.state%3;
        ctrl += 1;
        ctrl = ctrl%3;
  		}

  		if(e.keyCode == 72 && !gPressed) {
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


const draw = (drawables) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i=0; i<drawables.length; i++) {
    drawWalls(drawables[i]["walls"]);
    drawCannons(drawables[i]["cannons"]);
  }
  if (tempPlaceable != undefined) {
    drawPlaceable(tempPlaceable);
  }
}

const drawWalls = (walls) => {
    for (let i=0; i<walls.length; i++) {
      context.fillStyle = "rgba(223, 0, 0, 0.7)";
      context.fillRect(walls[i].x*TILE_SIZE+1-TILE_SIZE, walls[i].y*TILE_SIZE+1-TILE_SIZE, TILE_SIZE-2, TILE_SIZE-2);
    }
}
const drawCannons = (cannons) => {
  for (let key in cannons) {
    for (let j=0; j<cannons[key].tiles.length; j++) {
      let t = cannons[key].tiles[j];
      context.fillStyle = "rgba(255, 255, 255, 1.0)";
      context.fillRect(t.x*TILE_SIZE-TILE_SIZE, t.y*TILE_SIZE-TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

const setTempPlaceable = (wallBlock) => {
  tempPlaceable = wallBlock;
}

const drawPlaceable = (coords) => {
  for (let i=0; i<coords.length; i++) {
    context.beginPath();
    context.rect(
    coords[i].x,
    coords[i].y,
    TILE_SIZE,
    TILE_SIZE);

    context.fillStyle = "#FFFFFF";
    context.fill();
    context.closePath();
    //console.log(JSON.stringify(coords));

  }
  //console.log("\n");
}


const colorize = (tiles, players) => {
  console.log("kutsuttu colorize");
  context.clearRect(0, 0, canvas.width, canvas.height);
  const HEIGHT = 540/TILE_SIZE+2;
  const WIDTH = 900/TILE_SIZE+2;
  const PLAYERS = players;

  for (let i=0; i<HEIGHT; i++) {
      for (let j=0; j<WIDTH; j++) {
        if (tiles[i][j].zone === 1) {
              contextbg.fillStyle = "#629a56";
              contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
            } else if (tiles[i][j].zone === 2) {
              contextbg.fillStyle = "#5250a8";
              contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
            } else if (tiles[i][j].zone === 3) {
              contextbg.fillStyle = "#83afaf";
              contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
            }  else if (tiles[i][j].zone === 4) {
              contextbg.fillStyle = "#a85785";
              contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
            } else if (tiles[i][j].zone === 5) {
              contextbg.fillStyle = "#c5cd65";
              contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
            }else if (tiles[i][j].zone === 6) {
              contextbg.fillStyle = "#896646";
              contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
            }

            for (let k=0; k<PLAYERS; k++) {
              if (tiles[i][j].inner[k] === true ) {
                //if (tiles[i][j].zone == 1) {
                  contextbg.fillStyle = "#e0a33a";
                  contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
                // } else if (tiles[i][j].zone == 2) {
                // 	contextbg.fillStyle = "#e0a33a";
                // 	contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
                // }
                // else if (tiles[i][j].zone == 3) {
                // 	contextbg.fillStyle = "#e0a33a";
                // 	contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
                // }
                // else if (tiles[i][j].zone == 4) {
                // 	contextbg.fillStyle = "#e0a33a";
                // 	contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
                // }
                // else if (tiles[i][j].zone == 5) {
                // 	contextbg.fillStyle = "#e0a33a";
                // 	contextbg.fillRect(j*TILE_SIZE-TILE_SIZE, i*TILE_SIZE-TILE_SIZE, j+TILE_SIZE, i+TILE_SIZE);
                // }
              }
            }
            contextbg.beginPath();
            contextbg.rect(j*TILE_SIZE, 0, 1, HEIGHT*TILE_SIZE);
            contextbg.fillStyle = "rgb(0, 0, 0)";
            contextbg.fill();
            contextbg.closePath();
      }
      contextbg.beginPath();
      contextbg.rect(0, i*TILE_SIZE-TILE_SIZE, WIDTH*TILE_SIZE, 1);
      contextbg.fillStyle = "rgb(0, 0, 0)";
      contextbg.fill();
      contextbg.closePath();
    }
}
const sendInput = (socket) => {
    const FPS = 60;
    setInterval(() => {
      socket.emit("control", {g: gPressed, h: hPressed, ctrl: ctrl, cursorPos: cursorPos});
    }, 1000/FPS);
}
const clicked = (socket) => {
  socket.emit("click", cursorPos); // TODO: maybe server position rather than client?
}
