import { boundMethod } from "autobind-decorator";
import { IO } from "./io";
import { OneShot } from "./oneshot";
import { Value } from "./result";

/**
 * A deferred structure.
 * A deferred may be set at most one time.;
 * Additional attempts to set will cause an Abort with a Bug message from OneShot
 * A deferred may be awaited on for a value
 */
export class Deferred<A> {
  public static alloc<A>(): IO<never, Deferred<A>> {
    return IO.eval(() => Deferred.unsafeAlloc<A>());
  }

  public static unsafeAlloc<A>(): Deferred<A> {
    return new Deferred();
  }

  public get: IO<never, A>;
  public isSet: IO<never, boolean>;
  public isUnset: IO<never, boolean>;
  private oneshot: OneShot<A>;

  private constructor() {
    this.oneshot = new OneShot<A>();
    this.isSet = IO.eval(() => this.oneshot.isSet());
    this.isUnset = IO.eval(() => !this.oneshot.isSet());
    this.get = IO.async((resume) => {
      function listener(a: A) {
        resume(new Value(a));
      }
      this.oneshot.listen(listener);
      return () => {
        this.oneshot.unlisten(listener);
      };
    });
  }

  @boundMethod
  public set(a: A): IO<never, void> {
    return IO.eval(() => {
      if (this.oneshot.isSet()) {
        throw new Error("Bug: Deferred has already been set");
      }
      this.oneshot.set(a);
    });
  }
}
