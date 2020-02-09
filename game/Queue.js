class Queue {
    constructor() {
        this.data = new Array();
    }
    remove() {
        return this.data.pop();
    }
    add(item) {
        return this.data.unshift(item);
    }
    isEmpty() {
        return !(this.data.length > 0);
    }
}

module.exports = Queue;
