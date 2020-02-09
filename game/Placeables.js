const PlaceableTypes = require("./PlaceableTypes");
const u = require("./Utils");

class Placeables {
    constructor(startBlock, island, tiles, tileSize, WIDTH, HEIGHT) {
        this.island = island;
        this.wallBlockTypes = [];
        this.cannonTypes = [];
        this.currentWallBlock = startBlock;
        this.tiles = tiles;

        this.placeableTypes = new PlaceableTypes(island.id, tileSize, WIDTH, HEIGHT);
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

    placeWallBlock(cursorPos) {
        let innerAreaFound = false;
        const blockTiles = this.wallBlockTypes[this.currentWallBlock].place(cursorPos, this.tiles);
        if (blockTiles != undefined) {
            //	console.log(blockTiles);
            this.island.updateTilePlaceableStatus(blockTiles, "wall", true, true);
            this.island.updateFloodBoundary(blockTiles, this.tiles);
            innerAreaFound = this.island.findInnerAreas(this.tiles);
            //colorais(this.tiles);
            this.currentWallBlock = this.getRandomBlock();
            this.island.score += 15;
        }
        return innerAreaFound;
    }

    placeCannon(cursorPos) {
        if (this.island.cannonsAvailable > 0) {
            const cannonTiles = this.cannonTypes[0].place(cursorPos, this.tiles);
            //console.log(cannonTiles);
            if (cannonTiles != undefined) {
                this.island.placeCannon({ type: 0, tiles: cannonTiles, timer: 0, health: 6 });
                this.island.score += 40;
                this.island.cannonsAvailable--;
            }
        }
    }

    //drawWallBlock() {
    getWallBlock(cursorPos) {
        //this.wallBlockTypes[this.currentWallBlock].draw(context, cursorPos);
        return this.wallBlockTypes[this.currentWallBlock].getBlockTilePositions(cursorPos);

    }
    //drawCannon() {
    getCannon(cursorPos) {
        return this.cannonTypes[0].getBlockTilePositions(cursorPos);
    }

    rotate(dir) {
        this.wallBlockTypes[this.currentWallBlock].rotate(dir);
    }
    getRandomBlock() {
        return u.getRandomArbitrary(0, this.wallBlockTypes.length - 1);
    }
}

module.exports = Placeables;
