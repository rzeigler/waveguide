import { left, right } from "fp-ts/lib/Either";
import { async, sync, IO } from "./io";
import { Result } from "./result";
import { Runtime } from "./runtime";

export class Fiber<E, A> {
  public readonly join: IO<E, A>;
  public readonly kill: IO<never, void>;
  constructor(public readonly runtime: Runtime<E, A>) {
    this.join = async((callback) => {
      function listener(result: Result<E, A>) {
        if (result._tag === "completed") {
          callback(right(result.value));
        } else if (result._tag === "failed") {
          callback(left(result.value));
        }
        // Join on terminated fiber is a hang
      }
      runtime.result.listen(listener);
      return () => {
        runtime.result.unlisten(listener);
      };
    });

    // Implementation of kill signals the kill then awaits a result to confirm
    this.kill = sync<never, void>(() => {
      this.runtime.halt();
    }).applySecond(async<never, void>((callback) => {
      function listener(_: Result<E, A>) {
        callback(right(undefined));
      }
      this.runtime.result.listen(listener);
      return () => {
        this.runtime.result.unlisten(listener);
      };
    }));
  }
}
