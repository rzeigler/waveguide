import { IO } from "./io";
import { Abort, FiberResult, Result, Value } from "./result";
import { Runtime } from "./runtime";

export class Fiber<E, A> {
  /**
   * Join on the fiber.
   * This will block the current fiber and await the result of the target
   */
  public readonly join: IO<E, A>;
  /**
   * Wait for fiber completion by complete, failure, or termination
   */
  public readonly wait: IO<never, void>;
  /**
   * Interrupt the fiber
   */
  public readonly interrupt: IO<never, void>;
  constructor(public readonly runtime: Runtime<E, A>) {
    this.join = IO.async((callback) => {
      function listener(result: FiberResult<E, A>) {
        if (result._tag === "completed") {
          callback(result.result);
        }
        // Is this the correct way to handle this?
        callback(new Abort(new Error("Bug: Join on interrupted fiber")));
      }
      runtime.result.listen(listener);
      return () => {
        runtime.result.unlisten(listener);
      };
    });

    this.wait = IO.async((callback) => {
      function listener(_: FiberResult<E, A>) {
        callback(new Value(undefined));
      }
      runtime.result.listen(listener);
      return () => {
        runtime.result.unlisten(listener);
      };
    });

    // Implementation of kill signals the kill then awaits a result to confirm
    this.interrupt = IO.eval(() => {
      this.runtime.interrupt();
    }).applyFirst(this.wait);
  }
}
