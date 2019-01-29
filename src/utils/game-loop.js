type Callback = (tick: number) => mixed;

export default class GameLoop {
  subscribers: Array<Callback>;
  loopID: number;

  constructor() {
    this.subscribers = [];
    this.loopID = null;

    this.loop = this.loop.bind(this);
  }

  loop() {
    const tick = Date.now();
    this.subscribers.forEach((callback) => {
      callback && callback(tick);
    });

    this.loopID = requestAnimationFrame(this.loop);
  }

  start() {
    if (!this.loopID) {
      this.loop();
    }
  }

  stop() {
    if (this.loopID) {
      cancelAnimationFrame(this.loopID);
      this.loopID = null;
    }
  }

  subscribe(callback: Callback): number {
    return this.subscribers.push(callback);
  }

  unsubscribe(id: number) {
    delete this.subscribers[id - 1];
  }
}
