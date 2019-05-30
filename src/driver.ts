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
import { FunctionN, Lazy } from "fp-ts/lib/function";
import { Option } from "fp-ts/lib/Option";
import { Done, done, Cause, Exit, interrupt as interruptExit, raise } from "./exit";
import { IO } from "./io";
import * as io from "./io";
import { defaultRuntime, Runtime } from "./runtime";
import { Completable, completable } from "./support/completable";
import { MutableStack, mutableStack } from "./support/mutable-stack";

export type FrameType = Frame | FoldFrame | InterruptFrame;

interface Frame {
  readonly _tag: "frame";
  apply(u: unknown): IO<unknown, unknown>;
}

const makeFrame = (f: FunctionN<[unknown], IO<unknown, unknown>>): Frame => ({
  _tag: "frame",
  apply: f
});

interface FoldFrame {
  readonly _tag: "fold-frame";
  apply(u: unknown): IO<unknown, unknown>;
  recover(cause: Cause<unknown>): IO<unknown, unknown>;
}

const makeFoldFrame = (f: FunctionN<[unknown], IO<unknown, unknown>>,
                       r: FunctionN<[Cause<unknown>], IO<unknown, unknown>>): FoldFrame => ({
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
      return io.pure(u);
    },
    exitRegion() {
      interruptStatus.pop();
    }
  };
};

export interface Driver<E, A> {
  start(): void;
  interrupt(): void;
  onExit(f: FunctionN<[Exit<E, A>], void>): Lazy<void>;
  exit(): Option<Exit<E, A>>;
}

export function makeDriver<E, A>(run: IO<E, A>, runtime: Runtime = defaultRuntime): Driver<E, A> {
  let started: boolean = false;
  let interrupted: boolean = false;
  const result: Completable<Exit<E, A>> = completable();
  const frameStack: MutableStack<FrameType> = mutableStack();
  const interruptRegionStack: MutableStack<boolean> = mutableStack();
  let cancelAsync: Lazy<void> | undefined;

  function start(): void {
    if (started) {
      throw new Error("Bug: Runtime may not be started multiple times");
    }
    started = true;
    runtime.dispatch(() => loop(run));
  }

  function interrupt(): void {
    if (interrupted) {
      return;
    }
    interrupted = true;
    if (cancelAsync && isInterruptible()) {
      cancelAsync();
      resumeInterrupt();
    }
  }

  function onExit(f: FunctionN<[Exit<E, A>], void>): Lazy<void> {
    return result.listen(f);
  }

  function exit(): Option<Exit<E, A>> {
    return result.value();
  }

  function loop(go: IO<unknown, unknown>): void {
    let current: IO<unknown, unknown> | undefined = go;
    while (current && (!isInterruptible() || !interrupted)) {
      try {
        if (current._tag === "pure") {
          current = next(current.value);
        } else if (current._tag === "raised") {
          if (current.error._tag === "interrupt") {
            interrupted = true;
          }
          current = handle(current.error);
        } else if (current._tag === "completed") {
          if (current.exit._tag === "value") {
            current = next(current.exit.value);
          } else {
            current = handle(current.exit);
          }
        } else if (current._tag === "suspended") {
          current = current.thunk();
        } else if (current._tag === "async") {
          contextSwitch(current.op);
          current = undefined;
        } else if (current._tag === "chain") {
          frameStack.push(makeFrame(current.bind));
          current = current.inner;
        } else if (current._tag === "collapse") {
          frameStack.push(makeFoldFrame(current.success, current.failure));
          current = current.inner;
        } else if (current._tag === "interrupt-region") {
          interruptRegionStack.push(current.flag);
          frameStack.push(makeInterruptFrame(interruptRegionStack));
          current = current.inner;
        } else if (current._tag === "access-runtime") {
          current = io.pure(runtime);
        } else if (current._tag === "access-interruptible") {
          current = io.pure(isInterruptible());
        } else {
          // This should never happen.
          // However, there is not great way of ensuring the above is total and its worth having during developments
          throw new Error(`Die: Unrecognized current type ${current}`);
        }
      } catch (e) {
        current = io.raiseAbort(e);
      }
    }
    // If !current then the interrupt came to late and we completed everything
    if (interrupted && current) {
      resumeInterrupt();
    }
  }

  function resumeInterrupt(): void {
    runtime.dispatch(() => {
      const go = handle(interruptExit);
      if (go) {
        loop(go);
      }
    });
  }

  function isInterruptible(): boolean {
    const flag =  interruptRegionStack.peek();
    if (flag === undefined) {
      return true;
    }
    return flag;
  }

  function canRecover(cause: Cause<unknown>): boolean {
    // It is only possible to recovery from interrupts in an uninterruptible region
    if (cause._tag === "interrupt") {
      return !isInterruptible();
    }
    return true;
  }

  function next(value: unknown): IO<unknown, unknown> | undefined {
    const frame = frameStack.pop();
    if (frame) {
      return frame.apply(value);
    }
    result.complete(done(value) as Done<A>);
    return;
  }

  function handle(e: Cause<unknown>): IO<unknown, unknown> | undefined {
    let frame = frameStack.pop();
    while (frame) {
      if (frame._tag === "fold-frame" && canRecover(e)) {
        return frame.recover(e);
      }
      // We need to make sure we leave an interrupt region while unwinding on errors
      if (frame._tag === "interrupt-frame") {
        frame.exitRegion();
      }
      frame = frameStack.pop();
    }
    // At the end... so we have failed
    result.complete(e as Cause<E>);
    return;
  }

  function contextSwitch(op: FunctionN<[FunctionN<[Either<unknown, unknown>], void>], Lazy<void>>): void {
    let complete = false;
    const wrappedCancel = op((status) => {
      if (complete) {
        return;
      }
      complete = true;
      resume(status);
    });
    cancelAsync = () => {
      complete = true;
      wrappedCancel();
    };
  }

  function resume(status: Either<unknown, unknown>): void {
    cancelAsync = undefined;
    runtime.dispatch(() => {
      foldEither(
        (cause: unknown) => {
          const go = handle(raise(cause));
          if (go) {
            loop(go);
          }
        },
        (value: unknown) => {
          const go = next(value);
          if (go) {
            loop(go);
          }
        }
      )(status);
    });
  }

  return {
    start,
    interrupt,
    onExit,
    exit
  };
}
