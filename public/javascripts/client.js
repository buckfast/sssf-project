
  let hPressed = false;
  let gPressed = false;
  let ctrl = 1;
    let cursorPos = {};
    let canvas = undefined;
    let context = undefined;

    let canvasbg = undefined;
    let contextbg = undefined;

    let canvasfg = undefined;
    let contextfg = undefined;

    let canvasui = undefined;
    let contextui = undefined;

    const TILE_SIZE = 18;
    const HEIGHT = 540/TILE_SIZE+2;
    const WIDTH = 900/TILE_SIZE+2;
    let currentPlaceableCoords = undefined;

const run = () => {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  canvasbg = document.getElementById("background-canvas");
  contextbg = canvasbg.getContext("2d");

  canvasfg = document.getElementById("foreground-canvas");
  contextfg = canvasfg.getContext("2d");

  canvasui = document.getElementById("ui-canvas");
  contextui = canvasui.getContext("2d");

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

const banner = () => {

}

const drawCountdown = (count) => {
  contextui.clearRect(0, 0, canvasui.width, canvasui.height);
  contextui.font = '32px arial';
  contextui.fillStyle = 'white';
  contextui.fillText(count, canvasui.width/2-32, 40);
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
      contextfg.arc(balls[s][i].posx_pixels, balls[s][i].posy_pixels, 2, 0, 2 * Math.PI, false);
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
    drawWalls(drawables[i]["walls"]);
    drawCannons(drawables[i]["cannons"]);
  }
}

const drawWalls = (walls) => {
    for (let i=0; i<walls.length; i++) {
      context.fillStyle = "rgba(255, 255, 255, 0.7)";
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

const setCurrentPlaceable = (wallBlock) => {
  currentPlaceableCoords = wallBlock;
}

const banner = () => {
  contextfg.clearRect(0, 0, canvasfg.width, canvasfg.height);
  // 
  // const FPS = 30;
  // setInterval(() => {
  //
  // }, 1000/FPS);
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
       contextfg.fillStyle = "#FFFFFF";
      // contextfg.fill();
      // contextfg.closePath();
      contextfg.fillRect(coords[i].x, coords[i].y, TILE_SIZE, TILE_SIZE);
      //console.log(JSON.stringify(coords));
    }
  }

  //console.log("\n");
}

const initPlaceables = (drawables) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i=0; i<drawables.length; i++) {
    drawWalls(drawables[i]["walls"]);
    drawCannons(drawables[i]["cannons"]);
  }
}
const colorize = (tiles, players) => {
  contextbg.clearRect(0, 0, canvas.width, canvas.height);

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
                  contextbg.fillRect(j*TILE_SIZE-TILE_SIZE+2, i*TILE_SIZE-TILE_SIZE+2, j+TILE_SIZE-2, i+TILE_SIZE-2);
              }
            }
            if (tiles[i][j].castle == true) {
              contextbg.fillStyle = "#404040";
              contextbg.fillRect(j*TILE_SIZE-TILE_SIZE+2, i*TILE_SIZE-TILE_SIZE+2, j+TILE_SIZE-2, i+TILE_SIZE-2);
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
