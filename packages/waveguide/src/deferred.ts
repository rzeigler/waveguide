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
  /**
   * Allocate a new deferred cell.
   * The optional autoyield parameter controls the behavior of the read side of the deferred.
   * Because of the nature of callbacks and the fact that a set is a fundamentally synchronous action
   * that may occur at some time in the future, it is possible that the fiber setting the deferred
   * may pause and drive all the fibers reading from the deferred until their first asynchronous boundary.
   * If this is undesirable, then set autoyield to true which will insert an asynchronous boundary on the read side
   * @param autoyield
   */
  public static alloc<A>(autoyield: boolean = false): IO<never, Deferred<A>> {
    return IO.eval(() => Deferred.unsafeAlloc<A>(autoyield));
  }

  public static unsafeAlloc<A>(autoyield: boolean = false): Deferred<A> {
    return new Deferred(autoyield);
  }

  public get: IO<never, A>;
  public isSet: IO<never, boolean>;
  public isUnset: IO<never, boolean>;
  private oneshot: OneShot<A>;

  private constructor(autoyield: boolean) {
    this.oneshot = new OneShot<A>();
    this.isSet = IO.eval(() => this.oneshot.isSet());
    this.isUnset = IO.eval(() => !this.oneshot.isSet());
    const get = IO.async<never, A>((resume) => {
      function listener(a: A) {
        resume(new Value(a));
      }
      this.oneshot.listen(listener);
      return () => {
        this.oneshot.unlisten(listener);
      };
    });
    this.get = autoyield ? get.yield_() : get;
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
