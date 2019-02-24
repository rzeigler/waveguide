import { IO } from "./io";

export interface Scheduler {
  schedule<E, A>(afterMillis: number, action: IO<E, A>): IO<E, A>;
}

class TimeoutScheduler implements Scheduler {
  public schedule<E, A>(afterMillis: number, action: IO<E, A>): IO<E, A> {
    return IO.later((cont) => {
      const handle = setTimeout(() => {
        cont({});
      }, afterMillis);
      return () => {
        clearTimeout(handle);
      };
    }).widenError<E>().applySecond(action);
  }
}

export default new TimeoutScheduler();

export class TestScheduler implements Scheduler {
  private now: number;
  private pending: Array<[number, (v: {}) => void]> = [];
  constructor() {
    this.now = 0;
  }

  public advance(millis: number): void {
    this.now += millis;
    const exec = this.pending.filter((t) => t[0] <= this.now);
    this.pending = this.pending.filter((t) => t[0] > this.now);
    exec.forEach((t) => t[1]({}));
  }

  public schedule<E, A>(afterMillis: number, action: IO<E, A>): IO<E, A> {
    return IO.later((cont) => {
      function go(v: {}) {
        cont(v);
      }
      this.pending.push([afterMillis, go]);
      return () => {
        this.pending = this.pending.filter((f) => f[1] !== go);
      };
    }).widenError<E>().applySecond(action);
  }
}
