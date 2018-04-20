const Placeable = require("./Placeable");

class Cannon extends Placeable {

	place(cursorPosition, tiles) {
		this.currentTiles = [];
		for (let i=0; i<this.coords[this.currentRotation].length; i++) {
				let tilePos = this.calculateTileWorldPosition(i, cursorPosition);
				tilePos.x /= TILE_SIZE ;
				tilePos.y /= TILE_SIZE ;
				tilePos.x+=1;
				tilePos.y+=1;

				if (tiles[tilePos.y][tilePos.x].inner[this.islandID-1] == false || tiles[tilePos.y][tilePos.x].zone != this.islandID
				|| tiles[tilePos.y][tilePos.x].placeable != undefined) {
					return undefined;
				}
				this.currentTiles.push(tiles[tilePos.y][tilePos.x]);
		}

		return this.currentTiles;
	}


}

module.exports = Cannon;
