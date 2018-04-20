class Cannonball {
	constructor(pos, cursorPos) {
		//console.log(pos);
		this.pos = pos;
		this.vx;
		this.vy;
		this.cursorPos = cursorPos;
		this.speed = 4;
		this.posx_pixels = (this.pos.x*TILE_SIZE-TILE_SIZE);
		this.posy_pixels = (this.pos.y*TILE_SIZE-TILE_SIZE);
	}

	update() {
		if (this.collision (this.posx_pixels, this.posy_pixels)) {
			return true;
		};

		const rad = Math.atan2(this.posy_pixels - this.cursorPos.y, this.posx_pixels - this.cursorPos.x);

		this.posx_pixels -= Math.cos(rad)*this.speed;
    this.posy_pixels -= Math.sin(rad)*this.speed;
	}

	collision(posx, posy) {
		if (posx-5 < this.cursorPos.x && posx+5 > this.cursorPos.x &&
				posy-5 < this.cursorPos.y && posy+5 > this.cursorPos.y) {

				// const posx_world = Math.floor(posx/TILE_SIZE)+1;
				// const posy_world = Math.floor(posy/TILE_SIZE)+1;
				return true;
			}
	}

	draw() {
      context.beginPath();
      context.arc(this.posx_pixels, this.posy_pixels, 2, 0, 2 * Math.PI, false);
      context.fillStyle = '#000000';
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = '#003300';
      context.stroke();
	}
}

module.exports = Cannonball;
