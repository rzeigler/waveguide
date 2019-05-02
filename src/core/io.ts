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
import { compose, Function1, Function2, Lazy } from "fp-ts/lib/function";
import { Monad2 } from "fp-ts/lib/Monad";
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
  InterruptibleState<E, A> |
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

export class InterruptibleState<E, A> {
  public readonly _tag: "interruptible-state" = "interruptible-state";
  constructor(public readonly inner: IO<E, A>, public readonly state: boolean) { }
}

export class PlatformInterface<E, A> {
  public readonly _tag: "platform-interface" = "platform-interface";
  constructor(public readonly platform: PlatformGADT<E, A>) { }
}

export type PlatformGADT<E, A> =
  (Runtime extends A ? GetRuntime<A> : never) |
  (boolean extends A ? GetInterruptible<A> : never);

export class GetRuntime<A> {
  public readonly _tag: "get-runtime" = "get-runtime";
}

export class GetInterruptible<A> {
  public readonly _tag: "get-interruptible" = "get-interruptible";
}

export class IO<E, A> {
  constructor(public readonly step: Step<E, A>) { }

  /**
   * Construct a new IO by applying f to the value produced by this
   * @param f the function to apply
   */
  public map<B>(f: Function1<A, B>): IO<E, B> {
    return this.chain(compose(succeed, f));
  }

  /**
   * Construct a new IO by applying f to the error produced by this
   * @param f the function to apply
   */
  public mapError<E2>(f: Function1<E, E2>): IO<E2, A> {
    return this.chainError(compose(fail, f));
  }

  /**
   * Construct a new IO by applying f to the results of this and iob together
   * @param iob an io to produce the second argument to f
   * @param f the function to apply
   */
  public map2<B, C>(iob: IO<E, B>, f: Function2<A, B, C>): IO<E, C> {
    return this.chain((a) => iob.map((b) => f(a, b)));
  }

  /**
   * Construct a new IO by forming a tuple from the values produced by this and iob
   * @param iob
   */
  public product<B>(iob: IO<E, B>): IO<E, [A, B]> {
    return this.map2(iob, (a, b) => [a, b]);
  }

  /**
   * Construct a new IO that will first execute this and then execute iob and produce the value produced by this
   * @param iob
   */
  public applyFirst<B>(iob: IO<E, B>): IO<E, A> {
    return this.map2(iob, (a, _) => a);
  }

  /**
   * Construct a new IO that wil execute this and then iob and produce the value produced by iob
   * @param iob
   */
  public applySecond<B>(iob: IO<E, B>): IO<E, B> {
    return this.map2(iob, (_, b) => b);
  }

  /**
   * Construct a new IO that will execute the function produced by iof against the value produced by this
   * @param iof
   */
  public ap<B>(iof: IO<E, Function1<A, B>>): IO<E, B> {
    return this.map2(iof, (a, f) => f(a));
  }

  /**
   * Flipped version of ap
   * @param this
   * @param iob
   */
  public ap_<B, C>(this: IO<E, Function1<B, C>>, iob: IO<E, B>): IO<E, C> {
    return this.map2(iob, (f, b) => f(b));
  }

  /**
   * Construct a new IO that will evaluate this for its value and if successful then evaluate the IO produced by f
   * applied to that value
   * @param f
   */
  public chain<B>(f: Function1<A, IO<E, B>>): IO<E, B> {
    return new IO(new Chain(this, f));
  }

  /**
   * Construct a new IO that will evaluate this for  its value and if unsuccessful then evaluate the IO produced by f
   * applied to that error
   * @param f
   */
  public chainError<E2>(f: Function1<E, IO<E2, A>>): IO<E2, A> {
    return new IO(new Fold(
      this,
      succeed,
      (cause) => cause._tag === "failed" ? f(cause.error) : completeWith(cause)
    ));
  }

  /**
   * Construct a new IO that inverts the success and error channels of this
   */
  public flip(): IO<A, E> {
    return new IO(new Fold(
      this,
      (a) => io.fail(a),
      (e) => e._tag === "failed" ? io.succeed(e.error) : io.completeWith(e)
    ));
  }

  /**
   * Construct a new IO that will run this to completion and produce the resulting exit status
   */
  public run(): IO<never, Exit<E, A>> {
    // This could probably be a static property hwoever, for now,
    return new IO(new Fold(
      this,
      (a) => succeed(new Value(a) as Exit<E, A>),
      (cause) => succeed(cause)
    ));
  }

  /**
   * Begin executing this for its side effects and value.
   *
   * Returns a function that can be used to interrupt execution.
   *
   * @param onComplete a callback to invoke with the exit status of the execution
   * @param runtime  the runtime to use
   */
  public unsafeRun(onComplete: Function1<Exit<E, A>, void>, runtime: Runtime = defaultRuntime): Lazy<void> {
    const driver = new Driver(this, runtime);
    driver.onExit(onComplete);
    driver.start();
    return () => {
      // TODO: Implement the interrupt logic
    };
  }

  /**
   * Begin executing this for its side effects and value
   *
   * Returns a promise that will resolve with an A or reject with a Cause<E> depending on the exit status
   * @param runtime the runtime to use
   */
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

  /**
   * Begin executing this for its side effects and value
   *
   * Returns a promise that will resolve with an Exit<E, A> and will not reject
   * @param runtime  the runtime to use
   */
  public unsafeRunExitToPromise(runtime: Runtime = defaultRuntime): Promise<Exit<E, A>> {
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
 * Construct an IO that succeeds with the provided value
 * @param a
 */
function succeed<A>(a: A): IO<never, A> {
  return new IO(new Succeeded(a));
}

/**
 * Create an IO that is successful with the provided value.
 *
 * Variant of succeed for cases when the E needs to be inferred instead of locked to never
 * @param a
 */
function succeed_<E, A>(a: A): IO<E, A> {
  return succeed(a);
}

/**
 * Construct an IO that has failed with the provided error
 * @param e
 */
function fail<E>(e: E): IO<E, never> {
  return new IO(new Caused(new Failed(e)));
}

/**
 * Create an IO that has failed with the provided value
 *
 * Variant of fail for cases when A needs to be inferred instead of never
 * @param e
 */
function fail_<E, A>(e: E): IO<E, A> {
  return fail(e);
}

/**
 * Create an IO that has aborted with the provided error
 *
 * @param e
 */
function abort(e: unknown): IO<never, never> {
  return new IO(new Caused(new Aborted(e)));
}

/**
 * Create an IO that has exited with the provided status
 * @param status
 */
function completeWith<E, A>(status: Exit<E, A>): IO<E, A> {
  return new IO(new Complete(status));
}

/**
 * Create an IO that will execute the function (and its side effects) synchronously to produce an A
 * @param thunk
 */
function effect<A>(thunk: Lazy<A>): IO<never, A> {
  return new IO(new Suspend(() => succeed(thunk())));
}

/**
 * Create an IO that will execute the function (and its side effects) synchronously to produce the next IO to execute
 * @param thunk
 */
function suspend<E, A>(thunk: Lazy<IO<E, A>>): IO<E, A> {
  return new IO(new Suspend(thunk));
}

/**
 * Create an IO that will execute asynchronously and not produce a failure
 *
 * @param op the asynchronous operation.
 * op will receive a callback to resume execution when the async op is done and must return a cancellation action
 */
function delay<A>(op: Function1<Function1<A, void>, Lazy<void>>): IO<never, A> {
  const adapted: Function1<Function1<Either<never, A>, void>, Lazy<void>> =
    (callback) => op((v) => callback(right(v)));
  return async(adapted);
}

/**
 * Create an IO that will execute asynchronously and maybe produce a failure of type E
 *
 * @param op the asynchronous operation.
 * op will receive a callback to resume execution when the async op is done and must return a cancellation action
 */
function async<E, A>(op: Function1<Function1<Either<E, A>, void>, Lazy<void>>) {
  return new IO(new Async(op));
}

/**
 * An IO that will access the Runtime being used to execute the IO
 */
const getRuntime: IO<never, Runtime> = new IO(new PlatformInterface(new GetRuntime()));

/**
 * An IO that has been interrupted
 */
const interrupted: IO<never, never> = new IO(new Caused(new Interrupted()));

/**
 * An IO that uses the runtime to introduce a trampoline boundary
 *
 * This can be used to acheive fairness between multiple cooperating synchronous fibers
 */
const shift: IO<never, void> = getRuntime
  .chain((runtime) => delay<void>((callback) => {
    runtime.dispatch(() => callback(undefined));
    // tslint:disable-next-line
    return () => {

    };
  })); // TODO: Mark this as uninterruptible

/**
 * An IO that uses the runtime to introduce an asynchronous boundary
 *
 * This can be used to acheive fairness with other processes (i.e. the event loop)
 */
const shiftAsync: IO<never, void> = getRuntime
  .chain((runtime) =>
    delay<void>((callback) =>
      runtime.dispatchLater(() => callback(undefined), 0)
    ));

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

declare module "fp-ts/lib/HKT" {
  interface URI2HKT2<L, A> {
    IO: IO<L, A>;
  }
}

export const URI = "IO";
export type URI = typeof URI;

const of = <L, A>(a: A) => succeed_<L, A>(a);
const map = <L, A, B>(fa: IO<L, A>, f: (a: A) => B): IO<L, B> => fa.map(f);
const ap = <L, A, B >(fab: IO<L, Function1<A, B>> , fa: IO<L, A>) => fab.ap_(fa);
const chain = <L, A, B>(fa: IO<L, A>, f: Function1<A, IO<L, B>>) => fa.chain(f);
const monad: Monad2<URI> = {
  URI,
  map,
  ap,
  chain,
  of
};

export const io = {
  succeed,
  of: succeed,
  succeed_,
  fail,
  fail_,
  abort,
  completeWith,
  interrupted,
  effect,
  suspend,
  delay,
  async,
  shift,
  shiftAsync,
  never,
  monad
};
