class Placeable {
	constructor(name, coords, width, rotations, center, id) {
		this.name=name;
		this.coords = coords;
		this.currentRotation = 0;
		this.width = width;
		this.rotations = rotations;
		this.center =  center;
		this.currentTiles = [];
    this.islandID = id;
	}


	draw(context,cursorPosition) {
		for (let i=0; i<this.coords[this.currentRotation].length; i++) {
			if (this.coords[this.currentRotation][i] == 1) {
				let pos = this.calculateTileWorldPosition(i, cursorPosition);

				context.beginPath();
				context.rect(
				pos.x,
				pos.y,
				TILE_SIZE,
				TILE_SIZE);

				context.fillStyle = "#FFFFFF";
				context.fill();
				context.closePath();
			}
		}
	}

	calculateTileWorldPosition(i, cursorPosition) {
		let x = i % this.width;
		let y = Math.floor(i / this.width);

		let w = (this.center.x - x) * -1;
		let h = (this.center.y - y) * -1;

		let posx = Math.floor(cursorPosition.x/TILE_SIZE)*TILE_SIZE+(w*TILE_SIZE);
		let posy = Math.floor(cursorPosition.y/TILE_SIZE)*TILE_SIZE+(h*TILE_SIZE);
		return {x: posx, y:posy};
	}
}

module.exports = Placeable;
