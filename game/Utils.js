
const Queue = require("./Queue");

const manhattan = exports.manhattan = (x1,x0, y1,y0) => {
	return Math.abs(x1-x0) + Math.abs(y1-y0);
}
const euclidean = exports.euclidean = (x1,x0, y1,y0) => {
	return Math.sqrt(Math.pow((x1-x0),2) + Math.pow((y1-y0),2));
}
const nthProp = exports.nthProp = (obj, n) => {
		let keys = Object.keys(obj);
		return obj[keys[n]];
};
const scaleBetween = exports.scaleBetween = (unscaledNum, minAllowed, maxAllowed, min, max) => {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}
const isEmpty = exports.isEmpty = (a) => {
	let res = true;
	for (let i=0; i<a.length; i++) {
		if (a[i].length > 0) {
			res = false;
		}
	}
	return res;
}
const clone = exports.clone = (o) => {
	let output, v, key;
	output = Array.isArray(o) ? [] : {};
	for (key in o) {
		v = o[key];
		output[key] = (typeof v === "object") ? clone(v) : v;
	}
	return output;
}
const getRandomArbitrary = exports.getRandomArbitrary = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
}


const floodFillStack = exports.floodFill4Stack = (startPoint, target, replacement, tiles, whatToCheck, minCoords, maxCoords) => {
  if(target == replacement) return;

  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
	let totalFlooded = 0;
  let stack=[];
	let tile;
	let asd = {};
  stack.push(tiles[startPoint.y][startPoint.x]);

  while(!!(tile = stack.pop())) {
		asd = {x: tile.x, y: tile.y};

		tiles[asd.y][asd.x][whatToCheck] = replacement;
		console.log("flooded: "+asd.x+", "+asd.y);
			totalFlooded++;

		  for(let i=0; i<4; i++) {
	      let nx = asd.x + dx[i];
	      let ny = asd.y + dy[i];
	      if (nx >= minCoords.x && nx <= maxCoords.x && ny >= minCoords.y && ny <= maxCoords.y && tiles[ny][nx][whatToCheck] == target) {
	        stack.push(tiles[ny][nx]);
	      }
    	}
  }
	return totalFlooded;
}

const floodFill = exports.floodFill = (startPoint, target, replacement, max, tiles, whatToCheck, minCoords, maxCoords, stopAtCenter, island) => {
  if (target == replacement) {
    return false;
  }

  if (tiles[startPoint.y][startPoint.x][whatToCheck] == target)
    //&& tiles[startPoint.y][startPoint.x].zone == islands[tiles[startPoint.y][startPoint.x].zone-1].id) ///t�n voi poistaa sit joskus
  {
    let q = new Queue();
    tiles[startPoint.y][startPoint.x][whatToCheck] = replacement;

    q.add(tiles[startPoint.y][startPoint.x]);
    let total = 1;
    while (!q.isEmpty()) {
      let t = q.remove();

      if (t.x-1 >= minCoords.x) {
        if (tiles[t.y][t.x-1][whatToCheck] == target ) {

          if (stopAtCenter) {
            if (t.y == island.center.y && t.x-1 == island.center.x) {break;}
          }

          tiles[t.y][t.x-1][whatToCheck] = replacement;
          q.add(tiles[t.y][t.x-1]);
          total++;
        }
      }
      if ( t.x+1 <= maxCoords.x) {
        if (tiles[t.y][t.x+1][whatToCheck] == target ) {

          if (stopAtCenter) {
            if (t.y == island.center.y && t.x+1 == island.center.x) {break;}
          }

          tiles[t.y][t.x+1][whatToCheck] = replacement;
          q.add(tiles[t.y][t.x+1]);
          total++;
        }

      }
      if (t.y-1 >= minCoords.y) {
        if (tiles[t.y-1][t.x][whatToCheck] == target ) {

          if (stopAtCenter) {
            if (t.y-1 == island.center.y && t.x == island.center.x) {break;}
          }

          tiles[t.y-1][t.x][whatToCheck] = replacement;
          q.add(tiles[t.y-1][t.x]);
          total++;
        }
      }
      if (t.y+1 <= maxCoords.y) {
        if (tiles[t.y+1][t.x][whatToCheck] == target ) {

          if (stopAtCenter) {
            if (t.y+1 == island.center.y && t.x == island.center.x) {break;}
          }

          tiles[t.y+1][t.x][whatToCheck] = replacement;
          q.add(tiles[t.y+1][t.x]);
          total++;
        }
      }

      if (total >= max) {
        return true;
      }

    }
    return total;
  }
}

module.exports = exports
