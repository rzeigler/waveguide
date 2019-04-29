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
import { Runtime } from "./runtime";

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
  Continue<E, A> |
  (Runtime extends A ? AccessRuntime<E, A> : never);

export type Continue<E, A> = Chain<E, unknown, A> |
  Fold<unknown, E, unknown, A>;

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

function exit<E, A>(status: Exit<E, A>): IO<E, A> {
  return new IO(new Complete(status));
}

function delay<A>(thunk: () => A): IO<never, A> {
  return new IO(new Suspend(() => succeed(thunk())));
}

function suspend<E, A>(thunk: () => IO<E, A>): IO<E, A> {
  return new IO(new Suspend(thunk));
}

function later<A>(op: (callback: (result: A) => void) => () => void): IO<never, A> {
  const adapted: (callback: (result: Either<never, A>) => void) => () => void =
    (callback) => op((result) => callback(right(result)));
  return async(adapted);
}

function async<E, A>(op: (callback: (result: Either<E, A>) => void) => () => void) {
  return new IO(new Async(op));
}

const accessRuntime: IO<never, Runtime> = new IO(new AccessRuntime());

export const io = {
  succeed,
  fail,
  abort,
  exit,
  delay,
  suspend,
  later,
  async
};
