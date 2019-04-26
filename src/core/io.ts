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

// export type Exit<E, A> = Success<A> | Cause<E>;
// export type Cause<E> = Failure<E> | Aborted | Interrupted;

// export class Success<A> {
//   public readonly _tag: "success" = "success";
//   constructor(public readonly value: A) { }
// }

// export class Failure<E> {
//   public readonly _tag: "failure" = "failure";
//   constructor(public readonly error: E, public readonly additional: ReadonlyArray<Cause<E>> = []) { }
// }

// export class Aborted {
//   public readonly _tag: "aborted" = "aborted";
//   constructor(public readonly additional: ReadonlyArray<Cause<unknown>> = []) { }
// }

// export class Interrupted {
//   public readonly _tag: "interrupted" = "interrupted";
//   constructor(public readonly additional: ReadonlyArray<Cause<unknown>> = []) { }
// }

export type Step<E, A> = Succeed<A> | Fail<E> | Abort | Interrupt | Suspend<E, A> | Chain<E, unknown, A>;

export class Succeed<A> {
  public readonly _tag: "succeed" = "succeed";
  constructor(public readonly value: A) { }
}

export class Fail<E> {
  public readonly _tag: "fail" = "fail";
  constructor(public readonly error: E) { }
}

export class Abort {
  public readonly _tag: "abort" = "abort";
  constructor(public readonly error: unknown) { }
}

export class Interrupt {
  public readonly _tag: "interrupt" = "interrupt";
}

export class Suspend<E, A> {
  public readonly _tag: "suspend" = "suspend";
  constructor(public readonly thunk: () => IO<E, A>) { }
}

export class Chain<E, A, B> {
  public readonly _tag: "chain" = "chain";
  constructor(public readonly left: IO<E, A>, f: (a: A) => IO<E, B>) { }
}

export class IO<E, A> {
  constructor(public readonly step: Step<E, A>) {  }

  public map<B>(f: (a: A) => B): IO<E, B> {
    return new IO(new Chain(this, (a) => success(f(a))));
  }

  public chain<B>(f: (a: A) => IO<E, B>): IO<E, B> {
    return new IO(new Chain(this, f));
  }
}

function success<A>(value: A): IO<never, A> {
  return new IO(new Succeed(value));
}

function failure<E>(error: E): IO<E, never> {
  return new IO(new Fail(error));
}

function abort(error: unknown): IO<never, never> {
  return new IO(new Abort(error));
}

function lazy<A>(f: () => A): IO<never, A> {
  return new IO(new Suspend(() => success(f())));
}

function suspended<E, A>(f: () => IO<E, A>): IO<E, A> {
  return new IO(new Suspend(f));
}

const interrupt: IO<never, never> = new IO(new Interrupt());

export const io = {
  success,
  failure,
  abort,
  interrupt,
  lazy,
  suspended
};
