// Copyright 2019 Ryan Zeigler
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Runtime } from "./internal/runtime";
import { IO } from "./io";
import { Abort, FiberResult, Value } from "./result";

export class Fiber<E, A> {
  /**
   * Join on this fiber.
   *
   * Logically blocks calling fiber until a result is ready.
   * If the target fiber is interrupted this will trigger an abort.
   */
  public readonly join: IO<E, A>;

  /**
   * Wait for fiber completion by complete, failure, or interruption
   */
  public readonly wait: IO<never, FiberResult<E, A>>;

  /**
   * Interrupt the fiber
   *
   * This immediately returns (there are performance considerations when interrupting many fibers and waiting on them)
   * If you need to ensure that the target fiber has finished its cleanup use interruptAndWait
   */
  public readonly interrupt: IO<never, void>;

  /**
   * Interrupt the fiber and then await for its finalizers to run
   */
  public readonly interruptAndWait: IO<never, FiberResult<E, A>>;

  public readonly result: IO<never, FiberResult<E, A> | undefined>;

  constructor(public readonly runtime: Runtime<E, A>) {
    this.join = IO.async((callback) => {
      function listener(result: FiberResult<E, A>) {
        if (result._tag !== "interrupted") {
          callback(result);
        }
        // Is this the correct way to handle this?
        callback(new Abort(new Error("Join on interrupted fiber")));
      }
      runtime.result.listen(listener);
      return () => {
        runtime.result.unlisten(listener);
      };
    });

    this.wait = IO.async((callback) => {
      function listener(r: FiberResult<E, A>) {
        callback(new Value(r));
      }
      runtime.result.listen(listener);
      return () => {
        runtime.result.unlisten(listener);
      };
    });

    // Implementation of kill signals the kill then awaits a result to confirm
    this.interrupt = IO.eval(() => {
      this.runtime.interrupt();
    });

    this.interruptAndWait = this.interrupt.applySecond(this.wait);

    this.result = IO.eval(() => {
      return runtime.result.get();
    });
  }
}
