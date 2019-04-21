// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { boundMethod } from "autobind-decorator";
import { Option } from "fp-ts/lib/Option";
import { OneShot } from "./internal/oneshot";
import { IO } from "./io";
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

  public get: IO<never, A>;
  public tryGet: IO<never, Option<A>>;
  public isComplete: IO<never, boolean>;
  public isEmpty: IO<never, boolean>;
  private oneshot: OneShot<A>;

  private constructor() {
    this.oneshot = new OneShot<A>();
    this.isComplete = IO.eval(() => this.oneshot.isSet());
    this.isEmpty = IO.eval(() => !this.oneshot.isSet());
    this.get = IO.async<never, A>((contextSwitch) => {
      // types are weird between browser and node but we are only using it as an opaque handle
      const listener = (a: A) => {
        // Don't deliver the notification until the next tick.
        // This prevents stack overflows at the fill/wait rendezvous where one fiber's runloop
        // will drive another fiber's runloop above it on the stack
        // This behavior will cause the stack to grow.
        // Because one of the use cases of Deferred is for implementing racing we need to ensure
        // we can support an arbitrary number of such interactions.
        contextSwitch.resumeLater(new Value(a));
      };
      this.oneshot.listen(listener);
      contextSwitch.setAbort(() => {
        this.oneshot.unlisten(listener);
      });
    });
    this.tryGet = IO.eval(() => this.oneshot.get());
  }

  @boundMethod
  public complete(a: A): IO<never, void> {
    return IO.eval(() => {
      if (this.oneshot.isSet()) {
        throw new Error("Bug: Deferred has already been filled");
      }
      this.oneshot.set(a);
    });
  }

  @boundMethod
  public tryComplete(a: A): IO<never, boolean> {
    return IO.eval(() => {
      if (this.oneshot.isSet()) {
        return false;
      }
      this.oneshot.set(a);
      return true;
    });
  }
}
