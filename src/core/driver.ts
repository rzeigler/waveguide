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
import { Completable } from "./completable";
import { Cause, Exit, Failed, IO, io, Value } from "./io";
import { MutableStack } from "./mutable-stack";
import { defaultRuntime, Runtime } from "./runtime";

export type FrameType = Frame | FoldFrame;

class Frame {
  public readonly _tag: "frame" = "frame";
  constructor(public readonly apply: (u: unknown) => IO<unknown, unknown>) { }
}

class FoldFrame {
  public readonly _tag: "fold" = "fold";
  constructor(public readonly apply: (u: unknown) => IO<unknown, unknown>,
              public readonly recover: (e: Cause<unknown>) => IO<unknown, unknown>) { }
}

/**
 * The driver for executing IO actions.
 *
 * Provides a runtime and necessary state context to evaluate an IO
 */
export class Driver<E, A> {
  private started: boolean = false;
  private readonly result: Completable<Exit<E, A>> = new Completable();
  private readonly stack: MutableStack<FrameType> = new MutableStack();
  private cancel: (() => void) | undefined;

  constructor(private readonly init: IO<E, A>, private readonly runtime: Runtime = defaultRuntime) {  }

  public start() {
    if (this.started) {
      throw new Error("Bug: Runtime may not be started multiple times");
    }
    this.runtime.dispatch(() => this.loop(this.init));
  }

  public onExit(f: (exit: Exit<E, A>) => void): () => void {
    return this.result.listen(f);
  }

  private loop(next: IO<unknown, unknown>): void {
    let current: IO<unknown, unknown> | undefined = next;
    while (current) {
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
          this.stack.push(new Frame(step.bind));
          current = step.left;
        } else if (step._tag === "fold") {
          this.stack.push(new FoldFrame(step.success, step.failure));
          current = step.left;
        } else if (step._tag === "get-runtime") {
          current = io.succeed(this.runtime);
        } else {
          // This should never happen.
          // However, there is not great way of ensuring the above is total and its worth having during developments
          throw new Error(`Die: Unrecognized step type ${step}`);
        }
      } catch (e) {
        current = io.abort(e);
      }
    }
  }

  private next(value: unknown): IO<unknown, unknown> | undefined {
    const frame = this.stack.pop();
    if (frame) {
      return frame.apply(value);
    }
    this.done(new Value(value) as Value<A>);
    return;
  }

  private handle(e: Cause<unknown>): IO<unknown, unknown> | undefined {
    let frame = this.stack.pop();
    while (frame) {
      if (frame._tag === "fold") {
        return frame.recover(e);
      }
      frame = this.stack.pop();
    }
    // At the end... so we have failed
    this.done(e as Cause<E>);
    return;
  }

  private done(exit: Exit<E, A>): void {
    this.result.complete(exit);
  }

  private contextSwitch(op: (callback: (result: Either<unknown, unknown>) => void) => (() => void)): void {
    let complete = false;
    this.cancel = op((result) => {
      if (complete) {
        throw new Error("Die: Multiple async operation resumes");
      }
      complete = true;
      this.resume(result);
    });
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
