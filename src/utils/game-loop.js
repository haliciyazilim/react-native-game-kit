export default class GameLoop {
  loopID: number;

  constructor() {
    this.subscribers = [];
    this.loopID = null;

    this.loop = this.loop.bind(this);
  }

  loop() {
    const time = Date.now();
    this.subscribers.forEach((callback) => {
      callback && callback(time);
    });

    this.loopID = window.requestAnimationFrame(this.loop);
  }

  start() {
    if (!this.loopID) {
      this.loop();
    }
  }

  stop() {
    if (this.loopID) {
      window.cancelAnimationFrame(this.loopID);
      this.loopID = null;
    }
  }

  subscribe(callback) {
    return this.subscribers.push(callback);
  }

  unsubscribe(id) {
    delete this.subscribers[id - 1];
  }
}
