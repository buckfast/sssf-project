"use strict";


const u = require("./Utils");
const Tile = require("./Tile");
const Island = require("./Island");
const Queue = require("./Queue");
const Placeables = require("./Placeables");

class Game {
	constructor(players) {
		this.POINTS = players.length;

		this.islandIndexofSocket = {};

		for (let i=0; i<players.length; i++) {
			this.islandIndexofSocket[players[i]] = i;
		}
		console.log(this.islandIndexofSocket);


		this.TILE_SIZE = 18;
		this.WIDTH = /*canvas.width*/900/this.TILE_SIZE;
		this.HEIGHT = /*canvas.height*/540/this.TILE_SIZE;

		this.state = 0;
		this.tiles = null;

		this.islands = [];
		this.placeables = [];
		this.controls = [];

	}

	colorais (tiles) {
		context.clearRect(0, 0, canvas.width, canvas.height);

		for (let i=0; i<this.HEIGHT+2; i++) {
				for (let j=0; j<this.WIDTH+2; j++) {
					if (tiles[i][j].zone === 1) {
								contextbg.fillStyle = "#629a56";
								contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
							} else if (tiles[i][j].zone === 2) {
								contextbg.fillStyle = "#5250a8";
								contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
							} else if (tiles[i][j].zone === 3) {
								contextbg.fillStyle = "#83afaf";
								contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
							}  else if (tiles[i][j].zone === 4) {
								contextbg.fillStyle = "#a85785";
								contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
							} else if (tiles[i][j].zone === 5) {
								contextbg.fillStyle = "#c5cd65";
								contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
							}else if (tiles[i][j].zone === 6) {
								contextbg.fillStyle = "#896646";
								contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
							}

							for (let k=0; k<this.islands.length; k++) {
								if (tiles[i][j].inner[k] === true ) {
									//if (tiles[i][j].zone == 1) {
										contextbg.fillStyle = "#e0a33a";
										contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
									// } else if (tiles[i][j].zone == 2) {
									// 	contextbg.fillStyle = "#e0a33a";
									// 	contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
									// }
									// else if (tiles[i][j].zone == 3) {
									// 	contextbg.fillStyle = "#e0a33a";
									// 	contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
									// }
									// else if (tiles[i][j].zone == 4) {
									// 	contextbg.fillStyle = "#e0a33a";
									// 	contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
									// }
									// else if (tiles[i][j].zone == 5) {
									// 	contextbg.fillStyle = "#e0a33a";
									// 	contextbg.fillRect(j*this.TILE_SIZE-this.TILE_SIZE, i*this.TILE_SIZE-this.TILE_SIZE, j+this.TILE_SIZE, i+this.TILE_SIZE);
									// }
								}
							}
							contextbg.beginPath();
							contextbg.rect(j*this.TILE_SIZE, 0, 1, this.HEIGHT*this.TILE_SIZE);
							contextbg.fillStyle = "rgb(0, 0, 0)";
							contextbg.fill();
							contextbg.closePath();
				}
				contextbg.beginPath();
				contextbg.rect(0, i*this.TILE_SIZE-this.TILE_SIZE, this.WIDTH*this.TILE_SIZE, 1);
			  contextbg.fillStyle = "rgb(0, 0, 0)";
				contextbg.fill();
				contextbg.closePath();
			}
	}

	generateTiles (width, height) {
		let tiles = [];

		for (let i=0; i<height+2; i++) {
			tiles[i] = []
			for (let j=0; j<width+2; j++) {
				let t = new Tile(i,j,0);
				for (let k=0; k<this.POINTS; k++) {
					t.inner.push(false);
				}
				tiles[i][j] = t;
			}
		}

		return tiles;
	}

	//let blocks = [];




	floodCheckNeighbours (startPoint, target, replacement, max, tiles) {
		if (target == replacement) {
			return false;
		}

		let tiless = [];
		for (var i=0; i<tiles.length; i++) {
			 tiless[i] = tiles[i].map(a => Object.assign({}, a));
		}

		if (tiless[startPoint.y][startPoint.x].zone == target) {
			//&& tiless[startPoint.y][startPoint.x].zone == islands[tiless[startPoint.y][startPoint.x].zone-1].id) { //t�n voi poistaa sit joskus

			let q = new Queue();
			tiless[startPoint.y][startPoint.x].zone = replacement;

			q.add(tiless[startPoint.y][startPoint.x]);
			let total = 1;
			while (!q.isEmpty()) {
				let t = q.remove();

				if (t.x-1 >= 0) {
					if (tiless[t.y][t.x-1].zone == target ) {

						//console.log(t.x-1+", "+t.y);
						tiless[t.y][t.x-1].zone = replacement;
						q.add(tiless[t.y][t.x-1]);
						total++;

					} else {
						if (tiless[t.y][t.x-1].zone != replacement) {
							this.islands[target-1].neighbours.add(tiless[t.y][t.x-1].zone);
							//islands[target-1].borders.push(tiles[t.y][t.x]);
							tiles[t.y][t.x].border = tiless[t.y][t.x-1].zone;


							if (this.islands[target-1].superBorders[tiless[t.y][t.x-1].zone] == undefined) {
								this.islands[target-1].superBorders[tiless[t.y][t.x-1].zone] = [];
								this.islands[target-1].superBorders[tiless[t.y][t.x-1].zone].push(tiles[t.y][t.x]);
							} else {
								if (!this.islands[target-1].superBorders[tiless[t.y][t.x-1].zone].includes(tiles[t.y][t.x])) {
									this.islands[target-1].superBorders[tiless[t.y][t.x-1].zone].push(tiles[t.y][t.x]);
								}
							}

							//console.log(target+" islandil "+"tammossii: ("+tiless[t.y][t.x].x+", "+tiless[t.y][t.x].y+")");
						}
					}
				}
				if ( t.x+1 < this.WIDTH+2) {
					if (tiless[t.y][t.x+1].zone == target ) {

						//console.log(t.x+1+", "+t.y);
						tiless[t.y][t.x+1].zone = replacement;
						q.add(tiless[t.y][t.x+1]);
						total++;
					} else {
						if (tiless[t.y][t.x+1].zone != replacement) {
							this.islands[target-1].neighbours.add(tiless[t.y][t.x+1].zone);
							//islands[target-1].borders.push(tiles[t.y][t.x]);
							tiles[t.y][t.x].border = tiless[t.y][t.x+1].zone;

							if (this.islands[target-1].superBorders[tiless[t.y][t.x+1].zone] == undefined) {
								this.islands[target-1].superBorders[tiless[t.y][t.x+1].zone] = [];
								this.islands[target-1].superBorders[tiless[t.y][t.x+1].zone].push(tiles[t.y][t.x]);
							} else {
								if (!this.islands[target-1].superBorders[tiless[t.y][t.x+1].zone].includes(tiles[t.y][t.x])) {
									this.islands[target-1].superBorders[tiless[t.y][t.x+1].zone].push(tiles[t.y][t.x]);
								}
							}
							//console.log(target+" islandil "+"tammossii: ("+tiless[t.y][t.x].x+", "+tiless[t.y][t.x].y+")");
						}
					}

				}
				if (t.y-1 >= 0) {
					if (tiless[t.y-1][t.x].zone == target ) {

						//console.log(t.x+", "+t.y-1);
						tiless[t.y-1][t.x].zone = replacement;
						q.add(tiless[t.y-1][t.x]);
						total++;
					} else {
						if (tiless[t.y-1][t.x].zone != replacement) {
							this.islands[target-1].neighbours.add(tiless[t.y-1][t.x].zone);
							//islands[target-1].borders.push(tiles[t.y][t.x]);
							tiles[t.y][t.x].border = tiless[t.y-1][t.x].zone;

							if ( this.islands[target-1].superBorders[tiless[t.y-1][t.x].zone] == undefined) {
								this.islands[target-1].superBorders[tiless[t.y-1][t.x].zone] = [];
								this.islands[target-1].superBorders[tiless[t.y-1][t.x].zone].push(tiles[t.y][t.x]);
							} else {
								if (!this.islands[target-1].superBorders[tiless[t.y-1][t.x].zone].includes(tiles[t.y][t.x])) {
									this.islands[target-1].superBorders[tiless[t.y-1][t.x].zone].push(tiles[t.y][t.x]);
								}
							}
							//console.log(target+" islandil "+"tammossii: ("+tiless[t.y][t.x].x+", "+tiless[t.y][t.x].y+")");
						}
					}
				}
				if (t.y+1 < this.HEIGHT+2) {
					if (tiless[t.y+1][t.x].zone == target ) {

						//console.log(t.x+", "+t.y+1);
						tiless[t.y+1][t.x].zone = replacement;
						q.add(tiless[t.y+1][t.x]);
						total++;
					} else {
						if (tiless[t.y+1][t.x].zone != replacement) {
							this.islands[target-1].neighbours.add(tiless[t.y+1][t.x].zone);
							//islands[target-1].borders.push(tiles[t.y][t.x]);
							tiles[t.y][t.x].border = tiless[t.y+1][t.x].zone;

							if ( this.islands[target-1].superBorders[tiless[t.y+1][t.x].zone] == undefined) {
								this.islands[target-1].superBorders[tiless[t.y+1][t.x].zone] = [];
								this.islands[target-1].superBorders[tiless[t.y+1][t.x].zone].push(tiles[t.y][t.x]);
							} else {
								if (!this.islands[target-1].superBorders[tiless[t.y+1][t.x].zone].includes(tiles[t.y][t.x])) {
									this.islands[target-1].superBorders[tiless[t.y+1][t.x].zone].push(tiles[t.y][t.x]);
								}
							}
							//console.log(target+" islandil "+"tammossii: ("+tiless[t.y][t.x].x+", "+tiless[t.y][t.x].y+")");
						}
					}
				}


				if (total >= /*islands[target-1].totalTiles*/ max) {
					return true;
				}


			}

			//islands[target-1].neighbours.delete(replacement);
			return total;
		}
	}



	centerCenters() {
		let points_x = this.islands[0].center.x;
		let points_y = this.islands[0].center.y;
		let points_w = this.islands[0].center.x;
		let points_h = this.islands[0].center.y;
		for (let i=1; i<this.islands.length; i++) {
			if (this.islands[i].center.x < points_x) {
				points_x = this.islands[i].center.x;
			}
			if (this.islands[i].center.y < points_y) {
				points_y = this.islands[i].center.y;

			}
			if (this.islands[i].center.x > points_w) {
				points_w = this.islands[i].center.x;
			}
			if (this.islands[i].center.y > points_h) {
				points_h = this.islands[i].center.y;
			}
		}
	//laske kuin paljon pitää boksin liikkua ja lisää centtereihin
		let area_w = ((points_w-points_x)+1);
		let area_h = ((points_h-points_y)+1);

		let shift_x = Math.floor(((this.WIDTH-area_w)/2)-points_x);
		let shift_y = Math.floor(((this.HEIGHT-area_h)/2)-points_y);
		//console.log("shifts: "+shift_x+",  "+shift_y)

		for (let i=0; i<this.islands.length; i++) {
			this.islands[i].center.x += shift_x;
			this.islands[i].center.y += shift_y;
			if (this.islands[i].center.x-3 <= 2) {
				console.log(this.islands[i].id+": x0 "+(this.islands[i].center.x-4));
				this.islands[i].center.x = 6;
				//console.log(islands[i].id+": x0");
			}
			if (this.islands[i].center.x+4 > this.WIDTH) {
				console.log(this.islands[i].id+": x1 "+(this.islands[i].center.x+5));
				this.islands[i].center.x = this.WIDTH-6;
				//console.log(islands[i].id+": x1");
			}
			if (this.islands[i].center.y-3 <= 2) {
				console.log(this.islands[i].id+": y0 "+(this.islands[i].center.y-4));
				this.islands[i].center.y = 6;
				//console.log(islands[i].id+": y0");
			}
			if (this.islands[i].center.y+4 > this.HEIGHT) {
				console.log(this.islands[i].id+": y1 "+(this.islands[i].center.y+5));
				this.islands[i].center.y = this.HEIGHT-6;
				//console.log(islands[i].id+": y1");
			}
		}
	}

	sortZonesBySize() {
		let tempZoneInfo = [];
		for (let i=0; i<this.islands.length; i++) {
			tempZoneInfo.push({
				'id': this.islands[i].id,
				'amount': this.islands[i].totalTiles
			});
		}

		tempZoneInfo.sort((a,b) => {
			return a.amount - b.amount;
		});
		//console.log("\n");

		//let smallestZone = tempZoneInfo[0].id;
		//let largestZone = tempZoneInfo[islands.length-1].id
		//console.log("smalset: "+smallestZone+"  largest: "+largestZone);

		return tempZoneInfo;
	}

	findBorders(tiles) {
		//console.log("toka");
		for (let i=0; i<this.islands.length; i++) {
			this.islands[i].superBorders = {};
			this.islands[i].totalTiles = this.floodCheckNeighbours(this.islands[i].center, this.islands[i].id, 'F', 5000, tiles);

			let x = this.islands[i].center['x'];
			let y = this.islands[i].center['y'];
			tiles[y][x].zone = this.islands[i].id;
			// contextbg.font = "14px Arial";
			// contextbg.fillStyle = "white";
			// contextbg.fillText(" "+this.islands[i].id,x*this.TILE_SIZE-this.TILE_SIZE,y*this.TILE_SIZE-2-this.TILE_SIZE);
			// contextbg.fillText(" "+this.islands[i].id,x*this.TILE_SIZE-this.TILE_SIZE+this.TILE_SIZE,y*this.TILE_SIZE-2-this.TILE_SIZE);
			// contextbg.fillText(" "+this.islands[i].id,x*this.TILE_SIZE-this.TILE_SIZE,y*this.TILE_SIZE-2-this.TILE_SIZE+this.TILE_SIZE);
			// contextbg.fillText(" "+this.islands[i].id,x*this.TILE_SIZE-this.TILE_SIZE+this.TILE_SIZE,y*this.TILE_SIZE-2-this.TILE_SIZE+this.TILE_SIZE);
			//
			// contextbg.fillText(" "+this.islands[i].totalTiles,x*this.TILE_SIZE-this.TILE_SIZE,y*this.TILE_SIZE+(this.TILE_SIZE*2)-2-this.TILE_SIZE);

			// for (let key in this.islands[i].superBorders) {
			// 	for (let k=0; k<this.islands[i].superBorders[key].length; k++) {
			//
			// 		contextbg.beginPath();
			// 		contextbg.rect(this.islands[i].superBorders[key][k].x*this.TILE_SIZE+2-this.TILE_SIZE, this.islands[i].superBorders[key][k].y*this.TILE_SIZE+2-this.TILE_SIZE,this.TILE_SIZE-3,this.TILE_SIZE-3);
			// 		contextbg.fillStyle = "#023233";
			// 		contextbg.fill();
			// 		contextbg.closePath();
			//
			// 		contextbg.font = "13px Arial";
			// 		contextbg.fillStyle = "white";
			// 		contextbg.fillText(
			// 		"  "+this.islands[i].superBorders[key][k].border,
			// 		this.islands[i].superBorders[key][k].x*this.TILE_SIZE-this.TILE_SIZE,
			// 		this.islands[i].superBorders[key][k].y*this.TILE_SIZE+this.TILE_SIZE-4-this.TILE_SIZE);
			// 	}
			// }
		}
	}


	createIslands (points, tiles) {
		let a = [];

		for (let i=5; i<this.HEIGHT-5; i+=5) {
			for (let j=5; j<this.WIDTH-5; j+=5) {
				//console.log("aaah: x: "+(j)+" y: "+(i));
				a.push({x: (j), y: (i)});
			}
		}

		for (let i=1; i<=points; i++) {
			let island = new Island(i, tiles);
			this.islands.push(island);
			this.controls.push({});
			// let y = getRandomArbitrary(0,this.HEIGHT-1);
			// let x = getRandomArbitrary(0,this.WIDTH-1);
			//{'x': x, 'y': y}
			let index = u.getRandomArbitrary(0,a.length-1);
			this.islands[i-1].center = a[index];
			console.log(a[index]);
			a.splice(index, 1);
			// const x = index % (this.WIDTH-10);
			// const y = index / (this.WIDTH-10);
			// let neighbours = [];
			// neighbours.push((x+5) + (this.WIDTH-10)*y);
			// neighbours.push((x-5) + (this.WIDTH-10)*y);
			// neighbours.push((x) + (this.WIDTH-10)*(y-5));
			// neighbours.push((x) + (this.WIDTH-10)*(y+5));
			// console.log("sssaa");
			// for (let n=0; n<neighbours.length; n++) {
			// 	console.log(a[neighbours[n]]);
			// 	if (a[neighbours[n]] != undefined) {
			// 		a.splice(neighbours[n], 1);
			//
			// 	}
			// }

			//console.log("createisland:");
			//console.log(islands[i-1].center);

		}

	}

	centerIslands(points) {
		for (let i=0; i<points; i++) {
			//console.log(tempZoneInfo[i].id);
			if (points > 2) {
				this.islands[i].calculateNewCenter();
			}
		}

		for (let i=0; i<points; i++) {
			this.islands[i].totalTiles = 0;
			this.islands[i].sumx = 0;
			this.islands[i].sumy = 0;
			this.islands[i].neighbours.clear();
			this.islands[i].superBorders = {};
			this.islands[i].floodCheckName = "wallCheck"+(i+1);
		}

		this.centerCenters();
	}

	fluffIslandsUp(tiles) {

		this.findBorders(tiles);
		//console.log(islands);
		let sortedNeighbours = this.sortNeighboursBySize();
		let visitedBorders = [];
		//console.log(sortedNeighbours);
		for (let i=0; i<sortedNeighbours.length-1; i++) {
			let island = Object.entries(sortedNeighbours[i])[0][0];
			let neighbours = Object.entries(sortedNeighbours[i])[0][1];
			//console.log(island+": "+neighbours)
			for (let j=neighbours.length-1; j>=0; j--) {
				if (!visitedBorders.includes(neighbours[j])) {

						let borderIslandID = neighbours[j];
						let borderIsland, currentIslandBorder;
						borderIsland = this.islands[borderIslandID-1];
						currentIslandBorder = borderIsland.superBorders[island];

						if (borderIsland.totalTiles > this.islands[island-1].totalTiles) {

						//console.log("border: "+island+": "+borderIsland.id);
						for (var k=0; k<u.getRandomArbitrary(1,4); k++) {
							let randomBorderIndex = u.getRandomArbitrary(0,currentIslandBorder.length-1);

							u.floodFill(
								{x: currentIslandBorder[randomBorderIndex].x,y: currentIslandBorder[randomBorderIndex].y},
								currentIslandBorder[randomBorderIndex].zone,
								currentIslandBorder[randomBorderIndex].border,
								u.getRandomArbitrary(10,50),
								tiles,
								"zone",
								{x: 0, y: 0},
								{x: this.WIDTH+1, y: this.HEIGHT+1},
								true,
								this.islands[currentIslandBorder[randomBorderIndex].zone-1],
							);
						}

						//console.log(borderIsland.id);
						visitedBorders.push(borderIslandID);
						//break;
						}
				}
			}

		}
	}


	determineZones(points) {
		let tiles = this.generateTiles(this.WIDTH,this.HEIGHT);

		this.createIslands(points, tiles);

		let distanceFunctions = [];
		distanceFunctions.push(u.manhattan);
		distanceFunctions.push(u.euclidean);

		for (let s=0; s<4; s++) {
			if (s==1) {
				this.centerIslands(points);
			}

			if (s==2) {
				this.fluffIslandsUp(tiles);
			}

			if (s==3) {

					for (let i=0; i<points; i++) {
						// for (let j=0; j<points; j++) {
						// 	if (j!=i) {
						// 		if (eukliidean(islands[i].center.x, islands[j].center.x, islands[i].center.y, islands[j].center.y) < 10) {
						// 				console.log("ficcccccccclllllll "+islands[i].id+": "+islands[j].id);
						// 				//islands[i].center.x+=3; islands[i].center.y+=3; islands[j].center.x -=3; islands[j].center.y-=3;
						// 		}
						// 	}
						//
						// }



						// (() => {
						// for (let j=islands[i].center.y-4; j<islands[i].center.y+3; j++) {
						// 	for (let k=islands[i].center.x-3; k<islands[i].center.x+4; k++) {
						//
						// 		if (j>=0 && j<this.HEIGHT+2 && k>=0 && k<this.WIDTH+2) {
						// 			if (tiles[j][k].zone != islands[i].id) {
						// 				let x = islands[i].center.x - k;
						// 				let y = islands[i].center.y - j;
						// 				islands[i].center.x += x;
						// 				islands[i].center.y += y;
						//
						//
						// 				console.log((i+1)+": "+x+", "+y);
						// 				return;
						// 			}
						// 		}
						//
						// 	}
						// }
						// })();

						this.islands[i].initWalls(tiles);
					}

	// 				for (let i=0; i<points; i++) {
	// islands[i].initWalls(tiles);
	// }

				// for (let i=0; i<points; i++) {
				// 	let center = islands[i].center;
				//
				// }
			}

			if (s<2) {
				const distancefunction = points>2?0:1;
				for (let i=0; i<this.HEIGHT+2; i++) {
					for (let j=0; j<this.WIDTH+2; j++) {
						let distance = distanceFunctions[distancefunction](j, this.islands[0].center["x"], i, this.islands[0].center["y"]);

						tiles[i][j].zone = this.islands[0].id;

						let id = 1;
						for (let k=1; k<points; k++) {
							let newDistance = distanceFunctions[distancefunction](j, this.islands[k].center["x"], i, this.islands[k].center["y"]);

							if ( newDistance < distance) {
								distance = newDistance;
								id = this.islands[k].id;
							}
						}
						tiles[i][j].zone = id;
						tiles[i][j].x = j; tiles[i][j].y = i;

						this.islands[id - 1].sumCoords(j,i);
						this.islands[id - 1].totalTiles++;
					}
				}
			}
		}

		return tiles;
	}


	sortNeighboursBySize() {
		let sorted = this.sortZonesBySize();

		let IDarray = sorted.map(function(e) {return e["id"]; });

		let sortedNeighbours = [];

		for (let is = 0; is<sorted.length; is++)  {
			let borders = this.islands[sorted[is].id-1].superBorders;
			let sortedBorders = Object.keys(borders).sort((a, b) => {
				return this.islands[a-1].totalTiles - this.islands[b-1].totalTiles;
			})

			let obj = {};
			obj[IDarray[is]] = sortedBorders.map(Number);
			sortedNeighbours.push(obj);
		}
		return sortedNeighbours;
	}

	createPlaceableContainers(tiles) {
		for (let i=0; i<this.islands.length; i++) {
			//this.placeableTypes.push(new PlaceableTypes());
			this.placeables.push(new Placeables(u.getRandomArbitrary(0,9), this.islands[i], tiles));
		}
	}



	update(i) {
		if (gPressed) {
			this.placeables[i].rotate(0);
			gPressed = false;
		}
		if (hPressed) {
			this.placeables[i].rotate(1);
			hPressed = false;
		}
		if (this.state == 2) {
			this.islands[i].updateCannonballs((hitTile) => {
				//console.log(hitTile.placeable);
				if (hitTile.placeable.type == "wall") {
					this.islands[hitTile.zone-1].removeWallTile(hitTile);
				} else if (hitTile.placeable.type == "cannon") {
					this.islands[hitTile.zone-1].removeCannon(hitTile);
				}
			});
		}
	}

	setDrawables(drawables) {

	//	context.clearRect(0, 0, canvas.width, canvas.height);
		for (let i=0; i<this.islands.length; i++) {
			//this.islands[i].drawWalls();
			//this.islands[i].drawCannons();
			drawables[i]["walls"] = this.islands[i].walls;
			drawables[i]["cannons"] = this.islands[i].cannons;
		}
	}

	drawPlaceable(index) {

		if (this.state == 0) {
			this.placeables[index].drawWallBlock(this.controls[index]);
		} else if (this.state == 1) {
			this.placeables[index].drawCannon();
		} else if (this.state == 2) {
			this.islands[index].drawCannonballs();
		}
	}

	clicked(i) {
		if (this.state == 0) {
			this.placeables[i].placeWallBlock();
			//this.colorais(this.tiles);
		} else if (this.state == 1) {
			this.placeables[i].placeCannon();
		} else if (this.state == 2) {
			this.islands[i].fireCannon();
		}
	}

	updateUserControls(socketid, newControls) {
		this.controls[this.islandIndexofSocket[socketid]] = newControls;
	}

	run(drawCallback) {
		this.tiles = this.determineZones(this.POINTS);
		this.createPlaceableContainers(this.tiles);
		//this.colorais(this.tiles);
		this.findBorders(this.tiles);

		let drawables = [];
		for (let i=0; i<this.POINTS; i++) {
			drawables[i] = {};
		}

		const FPS = 60;
		setInterval(() => {
			//this.update(0);
			this.setDrawables(drawables);
			drawCallback(drawables);
			//this.drawPlaceable(0);
			for (let i=0; i<this.POINTS; i++) {
				//this.drawPlaceable(i);
				//console.log("controls "+i+": ", this.controls[i]);
			}
		}, 1000/FPS);
	}
}

//const game = new Game();
//game.run();
module.exports = Game;