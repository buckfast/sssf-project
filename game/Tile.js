class Tile {
    constructor(x, y, zone) {
        this.x = x;
        this.y = y;
        this.zone = zone;
        this.placeable = undefined;

        this.wallCheck1 = 0;
        this.wallCheck2 = 0;
        this.wallCheck3 = 0;
        this.wallCheck4 = 0;
        this.wallCheck5 = 0;
        this.border = false;
        this.inner = [];
    }
}

module.exports = Tile;
