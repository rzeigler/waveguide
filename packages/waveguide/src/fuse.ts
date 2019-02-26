import { ForwardProxy } from "./forwardproxy";

/**
 * Implementation to abstract over defending against buggy callback code.
 * Accepts a continuation (function accepting a callback) and produces a
 * new continuation that is guaranteed to only call the received callback once.
 * Invoking the downstream callback can also be halted by calling trip
 * which will prevent the downstream calllback from being invoked
 */
export class Fuse<A> {
  public tripped: boolean = false;
  public passed: boolean = false;
  public adapted: (callback: (a: A) => void) => void;
  public proxy: ForwardProxy;

  constructor(async: (callback: (a: A) => void) => (() => void)) {
    this.proxy = new ForwardProxy();
    this.adapted = (callback: (a: A) => void) => {
      this.proxy.fill(async((a: A) => {
        if (this.passed) {
          throw new Error("Bug: Fuse passed more than once");
        }
        this.passed = true;
        if (!this.tripped) {
          this.tripped = true;
          callback(a);
        }
      }));
    };
  }

  public block(): void {
    this.tripped = true;
    this.proxy.invoke();
  }
}
