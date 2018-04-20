const PlaceableTypes = require("./PlaceableTypes");

class Placeables {
	constructor(startBlock, island, tiles) {
		this.island = island;
		this.wallBlockTypes = [];
		this.cannonTypes = [];
		this.currentWallBlock = startBlock;
    this.tiles = tiles;

    this.placeableTypes = new PlaceableTypes(island.id);
    this.wallBlockTypes.push(this.placeableTypes.block2);
    this.wallBlockTypes.push(this.placeableTypes.block1);
    this.wallBlockTypes.push(this.placeableTypes.block3);
    this.wallBlockTypes.push(this.placeableTypes.block4);
    this.wallBlockTypes.push(this.placeableTypes.block5);
    this.wallBlockTypes.push(this.placeableTypes.block6);
    this.wallBlockTypes.push(this.placeableTypes.block7);
    this.wallBlockTypes.push(this.placeableTypes.block8);
    this.wallBlockTypes.push(this.placeableTypes.block9);
    this.wallBlockTypes.push(this.placeableTypes.block10);
    this.cannonTypes.push(this.placeableTypes.cannon);
	}

	placeWallBlock() {
		const blockTiles = this.wallBlockTypes[this.currentWallBlock].place(cursorPos, this.tiles);
		if (blockTiles != undefined) {
		//	console.log(blockTiles);
			this.island.updateTilePlaceableStatus(blockTiles, "wall", true, true);
			this.island.updateFloodBoundary(blockTiles, this.tiles);
			this.island.findInnerAreas(this.tiles);
			//colorais(this.tiles);
			this.currentWallBlock = this.getRandomBlock();
		}
	}
	placeCannon() {
		const cannonTiles = this.cannonTypes[0].place(cursorPos, this.tiles);
		//console.log(cannonTiles);
		if (cannonTiles != undefined) {
			this.island.placeCannon({type: 0, tiles: cannonTiles});
		}
	}
	drawWallBlock() {
		this.wallBlockTypes[this.currentWallBlock].draw(context, cursorPos);
	}
	drawCannon() {
		this.cannonTypes[0].draw(context, cursorPos);
	}

	rotate(dir) {
		this.wallBlockTypes[this.currentWallBlock].rotate(dir);
	}
	getRandomBlock() {
		return getRandomArbitrary(0,this.wallBlockTypes.length-1);
	}
}

module.exports = Placeables;
