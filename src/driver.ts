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
import { Either, fold as foldEither } from "fp-ts/lib/Either";
import { Option } from "fp-ts/lib/Option";
import { Cause, Exit, Failed, Interrupted, Value } from "./exit";
import { abort, IO, succeed } from "./io";
import { defaultRuntime, Runtime } from "./runtime";
import { Completable, completable } from "./support/completable";
import { MutableStack } from "./support/mutable-stack";
import { Fn0, Fn1 } from "./support/types";

export type FrameType = Frame | FoldFrame | InterruptFrame;

interface Frame {
  readonly _tag: "frame";
  apply(u: unknown): IO<unknown, unknown>;
}

const makeFrame = (f: Fn1<unknown, IO<unknown, unknown>>): Frame => ({
  _tag: "frame",
  apply: f
});

interface FoldFrame {
  readonly _tag: "fold-frame";
  apply(u: unknown): IO<unknown, unknown>;
  recover(cause: Cause<unknown>): IO<unknown, unknown>;
}

const makeFoldFrame = (f: Fn1<unknown, IO<unknown, unknown>>,
                       r: Fn1<Cause<unknown>, IO<unknown, unknown>>): FoldFrame => ({
  _tag: "fold-frame",
  apply: f,
  recover: r
});

interface InterruptFrame {
  readonly _tag: "interrupt-frame";
  apply(u: unknown): IO<unknown, unknown>;
  exitRegion(): void;
}

const makeInterruptFrame = (interruptStatus: MutableStack<boolean>): InterruptFrame => {
  return {
    _tag: "interrupt-frame",
    apply(u: unknown) {
      interruptStatus.pop();
      return succeed(u);
    },
    exitRegion() {
      interruptStatus.pop();
    }
  };
};

/**
 * The driver for executing IO actions.
 *
 * Provides a runtime and necessary state context to evaluate an IO
 */
export class Driver<E, A> {
  private started: boolean = false;
  private interrupted: boolean = false;
  private readonly result: Completable<Exit<E, A>> = completable();
  private readonly frameStack: MutableStack<FrameType> = new MutableStack();
  private readonly interruptRegionStack: MutableStack<boolean> = new MutableStack();
  private cancelAsync: Fn0<void> | undefined;

  constructor(private readonly init: IO<E, A>, private readonly runtime: Runtime = defaultRuntime) {  }

  /**
   * Start executing this driver.
   *
   * This executes the runloop in a trampoline so start may unwind before IO begin evaluating depending on the
   * state of the stack
   */
  @boundMethod
  public start() {
    if (this.started) {
      throw new Error("Bug: Runtime may not be started multiple times");
    }
    this.runtime.dispatch(() => this.loop(this.init));
  }

  /**
   * Interrupt the execution of the fiber running on this driver
   */
  @boundMethod
  public interrupt(): void {
    if (this.interrupted) {
      return;
    }
    this.interrupted = true;
    if (this.cancelAsync && this.isInterruptible()) {
      this.cancelAsync();
      this.resumeInterrupt();
    }
  }

  @boundMethod
  public onExit(f: Fn1<Exit<E, A>, void>): Fn0<void> {
    return this.result.listen(f);
  }

  @boundMethod
  public exit(): Option<Exit<E, A>> {
    return this.result.value();
  }

  private loop(next: IO<unknown, unknown>): void {
    let current: IO<unknown, unknown> | undefined = next;
    while (current && (!this.isInterruptible() || !this.interrupted)) {
      const step = current.step;
      try {
        if (step._tag === "succeed") {
          current = this.next(step.value);
        } else if (step._tag === "caused") {
          if (step.cause._tag === "interrupted") {
            this.interrupted = true;
          }
          current = this.handle(step.cause);
        } else if (step._tag === "complete") {
          if (step.status._tag === "value") {
            current = this.next(step.status.value);
          } else {
            current = this.handle(step.status);
          }
        } else if (step._tag === "suspend") {
          current = step.thunk();
        } else if (step._tag === "async") {
          this.contextSwitch(step.op);
          current = undefined;
        } else if (step._tag === "chain") {
          this.frameStack.push(makeFrame(step.bind));
          current = step.inner;
        } else if (step._tag === "fold") {
          this.frameStack.push(makeFoldFrame(step.success, step.failure));
          current = step.inner;
        } else if (step._tag === "interruptible-state") {
          this.interruptRegionStack.push(step.state);
          this.frameStack.push(makeInterruptFrame(this.interruptRegionStack));
          current = step.inner;
        } else if (step._tag === "platform-interface") {
          if (step.platform._tag === "get-runtime") {
            current = succeed(this.runtime);
          } else if (step.platform._tag === "get-interruptible") {
            current = succeed(this.isInterruptible());
          } else {
            throw new Error(`Die: Unrecognized platform-interface tag ${step.platform}`);
          }
        } else {
          // This should never happen.
          // However, there is not great way of ensuring the above is total and its worth having during developments
          throw new Error(`Die: Unrecognized step type ${step}`);
        }
      } catch (e) {
        current = abort(e);
      }
    }
    // If !current then the interrupt came to late and we completed everything
    if (this.interrupted && current) {
      this.resumeInterrupt();
    }
  }

  /**
   * Resume the runloop with an interrupted
   */
  private resumeInterrupt(): void {
    this.runtime.dispatch(() => {
      const next = this.handle(new Interrupted());
      if (next) {
        this.loop(next);
      }
    });
  }

  private isInterruptible(): boolean {
    const result =  this.interruptRegionStack.peek();
    if (result === undefined) {
      return true;
    }
    return result;
  }

  /**
   * Recovering from a failure is allowed when that failure is not interrupted or we are in an uninterruptible region
   * @param cause
   */
  private canRecover(cause: Cause<unknown>): boolean {
    // it is always possible to recovery from fiber internal interrupts
    if (cause._tag === "interrupted") {
      return !this.isInterruptible();
    }
    return true;
  }

  private next(value: unknown): IO<unknown, unknown> | undefined {
    const frame = this.frameStack.pop();
    if (frame) {
      return frame.apply(value);
    }
    this.done(new Value(value) as Value<A>);
    return;
  }

  private handle(e: Cause<unknown>): IO<unknown, unknown> | undefined {
    let frame = this.frameStack.pop();
    while (frame) {
      if (frame._tag === "fold-frame" && this.canRecover(e)) {
        return frame.recover(e);
      }
      // We need to make sure we leave an interrupt region while unwinding on errors
      if (frame._tag === "interrupt-frame") {
        frame.exitRegion();
      }
      frame = this.frameStack.pop();
    }
    // At the end... so we have failed
    this.done(e as Cause<E>);
    return;
  }

  private done(exit: Exit<E, A>): void {
    this.result.complete(exit);
  }

  private contextSwitch(op: Fn1<Fn1<Either<unknown, unknown>, void>, Fn0<void>>): void {
    let complete = false;
    const cancelAsync = op((result) => {
      if (complete) {
        return;
      }
      complete = true;
      this.resume(result);
    });
    this.cancelAsync = () => {
      complete = true;
      cancelAsync();
    };
  }

  private resume(result: Either<unknown, unknown>): void {
    this.cancelAsync = undefined;
    this.runtime.dispatch(() => {
      foldEither(
        (cause: unknown) => {
          const next = this.handle(new Failed(cause));
          if (next) {
            this.loop(next);
          }
        },
        (value: unknown) => {
          const next = this.next(value);
          if (next) {
            this.loop(next);
          }
        }
      )(result);
    });
  }
}
