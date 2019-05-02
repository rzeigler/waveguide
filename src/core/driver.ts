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

import { Either } from "fp-ts/lib/Either";
import { Function1, Lazy } from "fp-ts/lib/function";
import { Completable } from "./completable";
import { Cause, Exit, Failed, Value } from "./exit";
import { IO, io } from "./io";
import { MutableStack } from "./mutable-stack";
import { defaultRuntime, Runtime } from "./runtime";

export type FrameType = Frame | FoldFrame | InterruptFrame;

class Frame {
  public readonly _tag: "frame" = "frame";
  constructor(public readonly apply: (u: unknown) => IO<unknown, unknown>) { }
}

class FoldFrame {
  public readonly _tag: "fold-frame" = "fold-frame";
  constructor(public readonly apply: (u: unknown) => IO<unknown, unknown>,
              public readonly recover: (e: Cause<unknown>) => IO<unknown, unknown>) { }
}

class InterruptFrame {
  public readonly _tag: "interrupt-frame" = "interrupt-frame";
  constructor(private readonly interruptStatus: MutableStack<boolean>) { }
  public apply(u: unknown): IO<unknown, unknown> {
    this.exitRegion();
    return io.succeed(u);
  }
  public exitRegion(): void {
    this.interruptStatus.pop();
  }
}

/**
 * The driver for executing IO actions.
 *
 * Provides a runtime and necessary state context to evaluate an IO
 */
export class Driver<E, A> {
  private started: boolean = false;
  private interrupted: boolean = false;
  private readonly result: Completable<Exit<E, A>> = new Completable();
  private readonly frameStack: MutableStack<FrameType> = new MutableStack();
  private readonly interruptRegionStack: MutableStack<boolean> = new MutableStack();
  private cancel: Lazy<void> | undefined;

  constructor(private readonly init: IO<E, A>, private readonly runtime: Runtime = defaultRuntime) {  }

  /**
   * Start executing this driver.
   *
   * This executes the runloop in a trampoline so start may unwind before IO begin evaluating depending on the
   * state of the stack
   */
  public start() {
    if (this.started) {
      throw new Error("Bug: Runtime may not be started multiple times");
    }
    this.runtime.dispatch(() => this.loop(this.init));
  }

  /**
   * Interrupt the execution of the fiber running on this driver
   */
  public interrupt(): void {
    if (this.interrupted) {
      return;
    }
  }

  public onExit(f: (exit: Exit<E, A>) => void): () => void {
    return this.result.listen(f);
  }

  private loop(next: IO<unknown, unknown>): void {
    let current: IO<unknown, unknown> | undefined = next;
    while (current && (!this.interruptibleState() || !this.interrupted)) {
      const step = current.step;
      try {
        if (step._tag === "succeed") {
          current = this.next(step.value);
        } else if (step._tag === "caused") {
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
          this.frameStack.push(new Frame(step.bind));
          current = step.left;
        } else if (step._tag === "fold") {
          this.frameStack.push(new FoldFrame(step.success, step.failure));
          current = step.left;
        } else if (step._tag === "interruptible-state") {
          this.frameStack.push(new InterruptFrame(this.interruptRegionStack));
          this.interruptRegionStack.push(step.state);
          current = step.inner;
        } else if (step._tag === "platform-interface") {
          if (step.platform._tag === "get-runtime") {
            current = io.succeed(this.runtime);
          } else if (step.platform._tag === "get-interruptible") {
            current = io.succeed(this.interruptibleState());
          } else {
            throw new Error(`Die: Unrecognized platform-interface tag ${step.platform}`);
          }
        } else {
          // This should never happen.
          // However, there is not great way of ensuring the above is total and its worth having during developments
          throw new Error(`Die: Unrecognized step type ${step}`);
        }
      } catch (e) {
        current = io.abort(e);
      }
    }
    // If !current then the interrupt came to late and we completed everything
    if (this.interrupted && current) {
      this.runtime.dispatch(() => this.loop(io.interrupted));
    }
  }

  private interruptibleState(): boolean {
    const result =  this.interruptRegionStack.peek();
    if (result === undefined) {
      return true;
    }
    return result;
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
      // TODO: Can we trap exceptions always?
      if (frame._tag === "fold-frame") {
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

  private contextSwitch(op: Function1<Function1<Either<unknown, unknown>, void>, Lazy<void>>): void {
    let complete = false;
    const cancelAsync = op((result) => {
      if (complete) {
        return;
      }
      complete = true;
      this.resume(result);
    });
    this.cancel = () => {
      complete = true;
      cancelAsync();
    };
  }

  private resume(result: Either<unknown, unknown>): void {
    this.cancel = undefined;
    this.runtime.dispatch(() => {
      result.fold(
        (cause) => {
          const next = this.handle(new Failed(cause));
          if (next) {
            this.loop(next);
          }
        },
        (value) => {
          const next = this.next(value);
          if (next) {
            this.loop(next);
          }
        }
      );
    });
  }
}
