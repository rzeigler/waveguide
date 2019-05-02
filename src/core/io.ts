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
import { Function1, Lazy, compose, Function2 } from "fp-ts/lib/function";
import { Driver } from "./driver";
import { Aborted, Cause, Exit, Failed, Interrupted, Value } from "./exit";
import { defaultRuntime, Runtime } from "./runtime";

export type Step<E, A> = 
  Succeeded<E, A> |
  Caused<E, A> |
  Complete<E, A> |
  Suspend<E, A> |
  Async<E, A> |
  Chain<E, any, A> |
  Fold<any, E, any, A> |
  PlatformInterface<E, A>;

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
  constructor(public readonly thunk: Lazy<IO<E, A>>) { }
}

export class Async<E, A> {
  public readonly _tag: "async" = "async";
  constructor(public readonly op: Function1<Function1<Either<E, A>, void>, Lazy<void>>) {  }
}

export class Chain<E, Z, A> {
  public readonly _tag: "chain" = "chain";
  constructor(public readonly left: IO<E, Z>,
              public readonly bind: Function1<Z, IO<E, A>>) { }
}

export class Fold<E1, E2, A1, A2> {
  public readonly _tag: "fold" = "fold";
  constructor(public readonly left: IO<E1, A1>,
              public readonly success: Function1<A1, IO<E2, A2>>,
              public readonly failure: Function1<Cause<E1>, IO<E2, A2>>) { }
}

export class PlatformInterface<E, A> {
  public readonly _tag: "platform-interface" = "platform-interface";
  constructor(public readonly platform: PlatformGADT<E, A>) { }
}

export type PlatformGADT<E, A> =
  Runtime extends A ? GetRuntime<A> : never;

export class GetRuntime<E> {
  public readonly _tag: "get-runtime" = "get-runtime";
}

export class IO<E, A> {
  constructor(public readonly step: Step<E, A>) { }

  public map<B>(f: Function1<A, B>): IO<E, B> {
    return this.chain(compose(succeed, f));
  }

  public mapError<E2>(f: Function1<E, E2>): IO<E2, A> {
    return this.chainError(compose(fail, f));
  }

  public map2<B, C>(iob: IO<E, B>, f: Function2<A, B, C>): IO<E, C> {
    return this.chain((a) => iob.map((b) => f(a, b)));
  }

  public ap<B>(iof: IO<E, Function1<A, B>>): IO<E, B> {
    return this.map2(iof, (a, f) => f(a));
  }

  public ap_<B, C>(this: IO<E, Function1<B, C>>, iob: IO<E, B>): IO<E, C> {
    return this.map2(iob, (f, b) => f(b));
  }

  public chain<B>(f: Function1<A, IO<E, B>>): IO<E, B> {
    return new IO(new Chain(this, f));
  }

  public chainError<E2>(f: Function1<E, IO<E2, A>>): IO<E2, A> {
    return new IO(new Fold(
      this,
      succeed,
      (cause) => cause._tag === "failed" ? f(cause.error) : completeWith(cause)
    ));
  }

  public flip(): IO<A, E> {
    return new IO(new Fold(
      this,
      (a) => io.fail(a),
      (e) => e._tag === "failed" ? io.succeed(e.error) : io.completeWith(e)
    ));
  }

  public run(): IO<never, Exit<E, A>> {
    // This could probably be a static property hwoever, for now,
    return new IO(new Fold(
      this,
      (a) => succeed(new Value(a) as Exit<E, A>),
      (cause) => succeed(cause)
    ));
  }

  public unsafeRun(onComplete: (exit: Exit<E, A>) => void, runtime: Runtime = defaultRuntime): Lazy<void> {
    const driver = new Driver(this, runtime);
    driver.onExit(onComplete);
    driver.start();
    return () => {
      // TODO: Implement the interrupt logic
    };
  }

  public unsafeRunToPromise(runtime: Runtime = defaultRuntime): Promise<A> {
    return new Promise((resolve, reject) => {
      const driver = new Driver(this, runtime);
      driver.onExit((result) => {
        if (result._tag === "value") {
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
      driver.start();
    });
  }
}

/**
 * A curried factory function for successful IOs
 * 
 * Usage: succeedC<number>()(5) : IO<string, number>
 * 
 * If you do not need an E parameter other than never, you may use succeed instead.
 */
const succeedC = <E = never>() => <A>(a: A): IO<E, A> => new IO(new Succeeded(a));

const succeed = succeedC();

/**
 * A curried factory function for failed IOs
 * 
 * Usage: failC<number>()("boom"): IO<string, number>
 * 
 * If you do not need an A paramter other than enver, you may use fail instead
 */
const failC = <A = never>() => <E>(e: E): IO<E, A> => new IO(new Caused(new Failed(e)));

const fail = failC();

function abort(e: unknown): IO<never, never> {
  return new IO(new Caused(new Aborted(e)));
}

function completeWith<E, A>(status: Exit<E, A>): IO<E, A> {
  return new IO(new Complete(status));
}

function effect<A>(thunk: Lazy<A>): IO<never, A> {
  return new IO(new Suspend(() => succeed(thunk())));
}

function suspend<E, A>(thunk: Lazy<IO<E, A>>): IO<E, A> {
  return new IO(new Suspend(thunk));
}

function delay<A>(op: Function1<Function1<A, void>, Lazy<void>>): IO<never, A> {
  const adapted: Function1<Function1<Either<never, A>, void>, Lazy<void>> =
    (callback) => op((v) => callback(right(v)));
  return async(adapted);
}

function async<E, A>(op: Function1<Function1<Either<E, A>, void>, Lazy<void>>) {
  return new IO(new Async(op));
}

const getRuntime: IO<never, Runtime> = new IO(new PlatformInterface(new GetRuntime()));

const interrupted: IO<never, never> = new IO(new Caused(new Interrupted()));

/**
 * An IO that never completes with a value.
 *
 * This does however, schedule a setInterval for 60s in the background.
 * This should, therefore, prevent node from exiting cleanly if not interrupted
 */
const never: IO<never, never> = new IO(new Async((_) => {
  // tslint:disable-next-line:no-empty
  const handle = setInterval(() => { }, 60000);
  return () => {
    clearInterval(handle);
  };
}));

export const io = {
  succeed,
  of: succeed,
  succeedC,
  fail,
  failC,
  abort,
  completeWith,
  interrupted,
  effect,
  suspend,
  delay,
  async
};
