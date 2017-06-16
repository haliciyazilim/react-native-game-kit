export default class GameLoop {
  loop = () => {
    this.subscribers.forEach((callback) => {
      callback && callback.call();
    });

    this.loopID = window.requestAnimationFrame(this.loop);
  }
  constructor() {
    this.subscribers = [];
    this.loopID = null;
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
