import { boundMethod } from "autobind-decorator";
import { IO } from "./io";
import { OneShot } from "./oneshot";
import { Value } from "./result";

/**
 * An asynchronous value cell that starts empty and may be filled at most one time.
 */
export class Deferred<A> {

  public static alloc<A>(): IO<never, Deferred<A>> {
    return IO.eval(() => Deferred.unsafeAlloc<A>());
  }

  public static unsafeAlloc<A>(): Deferred<A> {
    return new Deferred();
  }

  public wait: IO<never, A>;
  public isFull: IO<never, boolean>;
  public isEmpty: IO<never, boolean>;
  private oneshot: OneShot<A>;

  private constructor() {
    this.oneshot = new OneShot<A>();
    this.isFull = IO.eval(() => this.oneshot.isSet());
    this.isEmpty = IO.eval(() => !this.oneshot.isSet());
    this.wait = IO.async<never, A>((resume) => {
      let id: number | undefined;
      function listener(a: A) {
        // Don't deliver the notification until the next tick.
        // This prevents stack overflows at the fill/wait rendezvous where one fiber's runloop
        // will drive another fiber's runloop above it on the stack
        // This behavior will cause the stack to grow.
        // Because one of the use cases of Deferred is for implementing racing we need to ensure
        // we can support an arbitrary number of such interactions.
        id = setTimeout(() => {
          resume(new Value(a));
        }, 0);
      }
      this.oneshot.listen(listener);
      return () => {
        this.oneshot.unlisten(listener);
        if (id) {
          clearTimeout(id);
        }
      };
    });
  }

  @boundMethod
  public fill(a: A): IO<never, void> {
    return IO.eval(() => {
      if (this.oneshot.isSet()) {
        throw new Error("Bug: Deferred has already been filled");
      }
      this.oneshot.set(a);
    });
  }
}
