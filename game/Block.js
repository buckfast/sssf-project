const Placeable = require("./Placeable");

class Block extends Placeable {
	place(cursorPosition, tiles) {
		this.currentTiles = [];
		for (let i=0; i<this.coords[this.currentRotation].length; i++) {
			if (this.coords[this.currentRotation][i] == 1) {
				let tilePos = this.calculateTileWorldPosition(i, cursorPosition);
				tilePos.x /= this.tileSize;
				tilePos.y /= this.tileSize;
				tilePos.x+=1;
				tilePos.y+=1;
				//console.log(tilePos.x+", "+tilePos.y);
				//console.log(tiles[tilePos.y][tilePos.x].placeable);

				if (tiles[tilePos.y][tilePos.x].placeable != undefined || tiles[tilePos.y][tilePos.x].zone != this.islandID
				|| tilePos.x<1 || tilePos.x > this.mWidth || tilePos.y <1 || tilePos.y > this.mHeight
				|| tiles[tilePos.y][tilePos.x].castle == true) {
					return undefined;
				}

				this.currentTiles.push(tiles[tilePos.y][tilePos.x]);
			}
		}
		//console.log(this.currentTiles);
	//	console.log(islands[0].minCoords);
	//	console.log(islands[0].maxCoords);
		return this.currentTiles;
	}

	rotate(direction) {
		if (direction == 0)
			this.currentRotation = Math.abs((this.currentRotation-1+this.rotations) % this.rotations);
		else if (direction == 1)
			this.currentRotation = Math.abs((this.currentRotation+1) % this.rotations);
	};
}

module.exports = Block;
