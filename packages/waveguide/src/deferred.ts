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
