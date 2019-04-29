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

import { Either, right } from "fp-ts/lib/Either";
import { Driver } from "./driver";
import { defaultRuntime, Runtime } from "./runtime";

export type Exit<E, A> = Completed<A> | Cause<E>;

export class Completed<A> {
  public readonly _tag: "completed" = "completed";
  constructor(public readonly value: A) { }
}

export type Cause<E> = Failed<E> | Aborted | Interrupted;
export class Failed<E> {
  public readonly _tag: "failed" = "failed";
  constructor(public readonly error: E) { }
}

export class Aborted {
  public readonly _tag: "aborted" = "aborted";
  constructor(public readonly error: unknown) { }
}

export class Interrupted {
  public readonly _tag: "interrupted" = "interrupted";
}

export type Step<E, A> = Initial<E, A> |
  More<E, A> |
  AccessRuntimeGADT<E, A>;

export type More<E, A> = Chain<E, any, A> |
  Fold<any, E, any, A>;

export type AccessRuntimeGADT<E, A> = Runtime extends A ? AccessRuntime<E, A> : never;

export type Initial<E, A> = Succeeded<E, A> |
  Caused<E, A> |
  Complete<E, A> |
  Suspend<E, A> |
  Async<E, A>;

export class Succeeded<E, A> {
  public readonly _tag: "succeed" = "succeed";
  constructor(public readonly value: A) { }
}

export class Caused<E, A> {
  public readonly _tag: "caused" = "caused";
  constructor(public readonly cause: Cause<E>) { }
}

export class Complete<E, A> {
  public readonly _tag: "complete" = "complete";
  constructor(public readonly status: Exit<E, A>) { }
}

export class Suspend<E, A> {
  public readonly _tag: "suspend" = "suspend";
  constructor(public readonly thunk: () => IO<E, A>) { }
}

export class Async<E, A> {
  public readonly _tag: "async" = "async";
  constructor(public readonly op: (callback: (result: Either<E, A>) => void) => (() => void)) {  }
}

export class Chain<E, Z, A> {
  public readonly _tag: "chain" = "chain";
  constructor(public readonly left: IO<E, Z>,
              public readonly bind: (z: Z) => IO<E, A>) { }
}

export class Fold<E1, E2, A1, A2> {
  public readonly _tag: "fold" = "fold";
  constructor(public readonly left: IO<E1, A1>,
              public readonly success: (z: A1) => IO<E2, A2>,
              public readonly failure: (f: Cause<E1>) => IO<E2, A2>) { }
}

export class AccessRuntime<E, A> {
  public readonly _tag: "access_runtime" = "access_runtime";
}

export class IO<E, A> {
  constructor(public readonly step: Step<E, A>) { }

  public map<B>(f: (a: A)  => B): IO<E, B> {
    return this.chain((a) => succeed(f(a)));
  }

  public map2<B, C>(iob: IO<E, B>, f: (a: A, b: B) => C): IO<E, C> {
    return this.chain((a) => iob.map((b) => f(a, b)));
  }

  public ap<B>(iof: IO<E, (a: A) => B>): IO<E, B> {
    return this.map2(iof, (a, f) => f(a));
  }

  public chain<B>(f: (a: A) => IO<E, B>): IO<E, B> {
    return new IO(new Chain(this, f));
  }

  public chainError<E2>(f: (e: E) => IO<E2, A>): IO<E2, A> {
    return new IO(new Fold(
      this,
      succeed,
      (cause) => cause._tag === "failed" ? f(cause.error) : exitWith(cause)
    ));
  }

  public unsafeRun(onComplete: (exit: Exit<E, A>) => void, runtime: Runtime = defaultRuntime): () => void {
    const driver = new Driver(this, runtime);
    driver.onExit(onComplete);
    driver.start();
    return () => {};
  }

  public unsafeRunToPromise(runtime: Runtime = defaultRuntime): Promise<A> {
    return new Promise((resolve, reject) => {
      const driver = new Driver(this, runtime);
      driver.onExit((result) => {
        if (result._tag === "completed") {
          resolve(result.value);
        } else {
          reject(result);
        }
      });
      driver.start();
    });
  }

  public unsafeRunToPromiseTotal(runtime: Runtime = defaultRuntime): Promise<Exit<E, A>> {
    return new Promise((resolve) => {
      const driver = new Driver(this, runtime);
      driver.onExit((result) => {
        resolve(result);
      });
    });
  }
}

function succeed<A>(a: A): IO<never, A> {
  return new IO(new Succeeded(a));
}

function fail<E>(e: E): IO<E, never> {
  return new IO(new Caused(new Failed(e)));
}

function abort(e: unknown): IO<never, never> {
  return new IO(new Caused(new Aborted(e)));
}

function exitWith<E, A>(status: Exit<E, A>): IO<E, A> {
  return new IO(new Complete(status));
}

function effect<A>(thunk: () => A): IO<never, A> {
  return new IO(new Suspend(() => succeed(thunk())));
}

function suspend<E, A>(thunk: () => IO<E, A>): IO<E, A> {
  return new IO(new Suspend(thunk));
}

function delay<A>(op: (callback: (result: A) => void) => () => void): IO<never, A> {
  const adapted: (callback: (result: Either<never, A>) => void) => () => void =
    (callback) => op((v) => callback(right(v)));
  return async(adapted);
}

function async<E, A>(op: (callback: (result: Either<E, A>) => void) => () => void) {
  return new IO(new Async(op));
}

const accessRuntime: IO<never, Runtime> = new IO(new AccessRuntime());

const interrupted: IO<never, never> = new IO(new Caused(new Interrupted()));

export const io = {
  succeed,
  fail,
  abort,
  exitWith,
  interrupted,
  effect,
  suspend,
  delay,
  async
};
