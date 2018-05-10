const u = require("./Utils");
const Cannonball = require("./Cannonball");

class Island {
	constructor(id, tiles, tileSize) {

    this.tiles = tiles;
		this.id = id;
		this.center = {};
		//this.extraCenters = [];
		this.superBorders = {};
		this.neighbours = new Set();
		this.sumx =0;
		this.sumy = 0;
		this.totalTiles =0;
		this.minCoords = {};
		this.maxCoords = {};
		this.walls = [];
		this.cannons = {};
		this.innerTiles = new Set();
		this.floodCheckName = "";
		this.tileSize = tileSize;

		this.tilePlaceableIdCounter = {"wall": 0, "cannon": 0};
		this.cannonToFire = 0;
		this.cannonballs = [];

		this.cannonsAvailable = 0;

		this.score = 0;

	}

	static sortBySize(a, b) {
			return a.totalTiles - b.totalTiles;
	}





	updateTilePlaceableStatus(tile, type, multi, multiWithOwnIds) {
		if (multi) {
			this.tilePlaceableIdCounter[type]++;
			for (let i=0; i<tile.length; i++) {
				tile[i].placeable = {type: type, id: this.tilePlaceableIdCounter[type]};
				if (multiWithOwnIds && i<tile.length-1) {
					this.tilePlaceableIdCounter[type]++;
				}
			}
		} else {
			this.tilePlaceableIdCounter[type]++;
			tile.placeable = {type: type, id: this.tilePlaceableIdCounter[type]};
		}
		return this.tilePlaceableIdCounter[type];
	}

	initWalls(tiles) {
		let initialWallTiles = [];

		for (let h=this.center.y-4; h<=this.center.y+3; h++) {
			for (let w=this.center.x-3; w<=this.center.x+4; w++) {
				//tiles[h][w].zone = this.id;

				tiles[h+1][w].zone = this.id;
				tiles[h-1][w].zone = this.id;
				tiles[h][w+1].zone = this.id;
				tiles[h][w-1].zone = this.id;

				tiles[h+1][w+1].zone = this.id;
				tiles[h-1][w+1].zone = this.id;
				tiles[h+1][w-1].zone = this.id;
				tiles[h-1][w-1].zone = this.id;


				if(h==this.center.y-4 || w==this.center.x-3 || h==this.center.y+3 || w==this.center.x+4){

					this.updateTilePlaceableStatus(tiles[h][w], "wall");
					initialWallTiles.push(tiles[h][w]);
				}

			}
		}
		//console.log(initialWallTiles);
		this.updateFloodBoundary(initialWallTiles, tiles);
		this.findInnerAreas(tiles);
	}

	drawWalls() {
			for (let i=0; i<this.walls.length; i++) {
				//islands[0].walls[i].wallCheck == 0 ? context.fillStyle = "#cccccc" : context.fillStyle = "#638342";
				context.fillStyle = "rgba(255, 255, 255, 0.7)";
				context.fillRect(this.walls[i].x*TILE_SIZE+1-TILE_SIZE, this.walls[i].y*TILE_SIZE+1-TILE_SIZE, TILE_SIZE-2, TILE_SIZE-2);
			}
	}
	drawCannons() {
		//for (let i=0; i<this.cannons.length; i++) {
		for (let key in this.cannons) {
			for (let j=0; j<this.cannons[key].tiles.length; j++) {
				let t = this.cannons[key].tiles[j];
				context.fillStyle = "rgba(255, 255, 255, 1.0)";
				context.fillRect(t.x*TILE_SIZE-TILE_SIZE, t.y*TILE_SIZE-TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}

	isCastleInInnerArea() {
		return this.tiles[this.center.y][this.center.x].inner[(this.id-1)];
	}


	fireCannon(cursorPos) {
		const cannons = Object.keys(this.cannons).length;
		if (cannons > 0) {
			//console.log(nthProp(this.cannons, this.cannonToFire));

			let currentCannon = u.nthProp(this.cannons, this.cannonToFire);
			if (currentCannon != undefined) {
				while (this.tiles[currentCannon.tiles[0].y][currentCannon.tiles[0].x].inner[(this.id-1)] == false) {
					this.cannonToFire++;
					this.cannonToFire = this.cannonToFire%cannons;
					currentCannon = u.nthProp(this.cannons, this.cannonToFire);
				}
			}
      if (currentCannon != undefined && currentCannon.timer == 0) {
			    let ball = new Cannonball({x:currentCannon.tiles[3].x, y:currentCannon.tiles[3].y}, u.clone(cursorPos), this.tileSize);
			   this.cannonballs.push(ball);
				 currentCannon.timer = 120;
      }
			this.cannonToFire++;
			this.cannonToFire = this.cannonToFire%cannons;
		}
	}

	drawCannonballs() {
		for (let i=0; i<this.cannonballs.length; i++) {
			this.cannonballs[i].draw();
		}
	}
	getCannonballs() {
		return this.cannonballs;
	}

	updateCannonballs(hit_cb) {
		let i = this.cannonballs.length
		while (i--) {
		    if (this.cannonballs[i].update() == true) {
						const posx_world = Math.floor(this.cannonballs[i].posx_pixels/this.tileSize)+1;
						const posy_world = Math.floor(this.cannonballs[i].posy_pixels/this.tileSize)+1;

						const hitTile = this.tiles[posy_world][posx_world];
						this.cannonballs.splice(i, 1);

						if (hitTile.placeable != undefined) {
							//if (hitTile.placeable.type == "wall") {
							  // islands[hitTile.zone-1].removeWallTile(hitTile);
                hit_cb(hitTile);
              // }else if (hitTile.placeable.type == "cannon") {
              //   //islands[hitTile.zone-1].removeCannon(hitTile);
              //   hit_cb({type: "cannon", tile: hitTile});
              // }
						}
		    }
		}
	}

	removeWallTile(tile) {
		const index = this.walls.findIndex((e) => {
			return e.placeable.id == tile.placeable.id;
		});
		this.walls.splice(index,1);
		tile[this.floodCheckName] = 0;
		tile.placeable = undefined;
	}

  removeCannon(tile) {
		this.cannons[tile.placeable.id].health--;
		if (this.cannons[tile.placeable.id].health == 0) {
	    const tiles = this.cannons[tile.placeable.id].tiles;
	    delete this.cannons[tile.placeable.id];
	    for (let i=0; i<tiles.length; i++) {
	      tiles[i].placeable = undefined;
	    }
			return true;
		} else {
			return false;
		}
  }

	setCastleTiles() {
		this.tiles[this.center.y][this.center.x].castle = true;
		this.tiles[this.center.y-1][this.center.x].castle = true;
		this.tiles[this.center.y-1][this.center.x+1].castle = true;
		this.tiles[this.center.y][this.center.x+1].castle = true;
	}
	// getCastleTiles() {
	// 	let castleTiles = [];
	// 	castleTiles.push(this.tiles[this.center.y][this.center.x]);
	// 	this.tiles[this.center.y-1][this.center.x].castle = true;
	// 	this.tiles[this.center.y-1][this.center.x+1].castle = true;
	// 	this.tiles[this.center.y][this.center.x+1].castle = true;
	// }

	isTileOnCastle(tiles, tile) {
			let castleTiles = [];
			castleTiles.push(tiles[this.center.y][this.center.x]);
			castleTiles.push(tiles[this.center.y][this.center.x+1]);
			castleTiles.push(tiles[this.center.y+1][this.center.x]);
			castleTiles.push(tiles[this.center.y+1][this.center.x+1]);

		for (let i=0; i<castleTiles.length; i++) {
			if (tile === castleTiles[i]) {
				return true;
			}
		}
		return false;
	}

	updateFloodBoundary(currentTiles, tiles) { //tätä funkkaria vois hajottaa pienemmäksi
		let updateMinMax = (currentCoords, minCoords, maxCoords) => {
			if (currentCoords.x > maxCoords.x) {
				maxCoords.x = currentCoords.x;
			} else if (currentCoords.x < minCoords.x) {
				 minCoords.x = currentCoords.x;
			}
			if (currentCoords.y > maxCoords.y) {
				maxCoords.y = currentCoords.y;
			} else if (currentCoords.y < minCoords.y) {
				 minCoords.y = currentCoords.y;
			}
		}

		if (Object.keys(this.minCoords).length==0 || Object.keys(this.maxCoords).length==0) {
			this.minCoords = {x: currentTiles[0].x, y: currentTiles[0].y};
			this.maxCoords = {x: currentTiles[0].x, y: currentTiles[0].y};

			for (let i=1; i<currentTiles.length; i++) {
				updateMinMax(currentTiles[i], this.minCoords, this.maxCoords);
			}
			//console.log("updateFloodBoundary: x: "+this.minCoords.x+", y:"+this.minCoords.y);
			//console.log("updateFloodBoundary: x: "+this.maxCoords.x+", y:"+this.maxCoords.y);
		}

		for (let i=0; i<currentTiles.length; i++) {
			//this.updateTilePlaceableStatus(tiles[currentTiles[i].y][currentTiles[i].x], "wall");
			tiles[currentTiles[i].y][currentTiles[i].x][this.floodCheckName] = 2;

			this.walls.push(tiles[currentTiles[i].y][currentTiles[i].x]);

			updateMinMax({x: currentTiles[i].x, y: currentTiles[i].y}, this.minCoords, this.maxCoords);
		}
	}



	placeCannon(obj) {
		const id = this.updateTilePlaceableStatus(obj.tiles, "cannon", true, false);
		this.cannons[id] = obj;

	}

	clearInnerAreas() {
		 		//this happens on state 0
				this.innerTiles.forEach((e) => {
				e.inner[(this.id-1)] = false;
				})
				this.innerTiles = new Set();
	}

	findInnerAreas(tiles) {


		// let totalFlooded = u.floodFill(
		// 	{x: this.minCoords.x-1, y: this.minCoords.y-1},
		// 	0,
		// 	1,
		// 	5000,
		// 	tiles,
		// 	this.floodCheckName,
		// 	{x: this.minCoords.x-1, y: this.minCoords.y-1},
		// 	{x: this.maxCoords.x+1, y: this.maxCoords.y+1},
		// );

		let totalFlooded = u.floodFill(
			{x: this.minCoords.x-1, y: this.minCoords.y-1},
			0,
			1,
			5000,
			tiles,
			this.floodCheckName,
			{x: this.minCoords.x-1, y: this.minCoords.y-1},
			{x: this.maxCoords.x+1, y: this.maxCoords.y+1},
		);
		console.log("totalfoolde: "+totalFlooded);

		//console.log(totalFlooded);
		let ylength = (this.maxCoords.y+2) - (this.minCoords.y-1);
		let xlength = (this.maxCoords.x+2) - (this.minCoords.x-1);
		let innerAreaFound = (totalFlooded+this.walls.length) < (ylength*xlength);

		for (let i=this.minCoords.y-1; i<this.maxCoords.y+2; i++) {
			for (let j=this.minCoords.x-1; j<this.maxCoords.x+2; j++) {
				if (tiles[i][j][this.floodCheckName] == 1) {
					tiles[i][j][this.floodCheckName] = 0;
				} else if (innerAreaFound) {
					if (tiles[i][j][this.floodCheckName] == 0 && tiles[i][j].inner[(this.id-1)] == false) {
						tiles[i][j].inner[(this.id-1)] = true;
						this.innerTiles.add(tiles[i][j]);
					}
				}
			}
		}

		//tän takia +2:
		/*
		console.log("totalflooded: "+totalFlooded+" ::  walls: "+this.walls.length+"  ::  "+"alue: ");
		console.log({x: this.minCoords.x-1, y: this.minCoords.y-1});
		console.log({x: this.maxCoords.x+1, y: this.maxCoords.y+1});
		*/
		return innerAreaFound;
	}

	sumCoords(x,y) {
		this.sumx+=x;
		this.sumy+=y;
	}
	calculateNewCenter () {

			this.center.x = Math.round(this.sumx/this.totalTiles);
			this.center.y = Math.round(this.sumy/this.totalTiles);
	}

}

module.exports = Island;
