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

import { Do } from "fp-ts-contrib/lib/Do";
import { Either, left, right } from "fp-ts/lib/Either";
import { compose, constant, Function1, Function2, identity, Lazy } from "fp-ts/lib/function";
import { IO as SyncIO } from "fp-ts/lib/IO";
import { IOEither } from "fp-ts/lib/IOEither";
import { Monad2 } from "fp-ts/lib/Monad";
import { Task } from "fp-ts/lib/Task";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Deferred, deferred } from "../concurrent/deferred";
import { ref, Ref } from "../concurrent/ref";
import { Driver } from "./driver";
import { Aborted, Cause, Exit, Failed, Interrupted, Value } from "./exit";
import { fiber, Fiber } from "./fiber";
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
  constructor(public readonly inner: IO<E, Z>,
              public readonly bind: Function1<Z, IO<E, A>>) { }
}

export class Fold<E1, E2, A1, A2> {
  public readonly _tag: "fold" = "fold";
  constructor(public readonly inner: IO<E1, A1>,
              public readonly failure: Function1<Cause<E1>, IO<E2, A2>>,
              public readonly success: Function1<A1, IO<E2, A2>>) { }
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
  (Runtime extends A ? GetRuntime : never) |
  (boolean extends A ? GetInterruptible : never);

export class GetRuntime {
  public readonly _tag: "get-runtime" = "get-runtime";
}

export class GetInterruptible {
  public readonly _tag: "get-interruptible" = "get-interruptible";
}

export class GetDriver {
  public readonly _tag: "get-driver" = "get-driver";
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
   * Construct a new IO that discards the value this produces in favor of b
   * @param b the value the new IO should produce
   */
  public as<B>(b: B): IO<E, B> {
    return this.map(constant(b));
  }

  /**
   * Construct a new IOI that discards the value this produces in favor of void (undefined)
   */
  public unit(): IO<E, void> {
    return this.as(undefined);
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
  public zipWith<B, C>(iob: IO<E, B>, f: Function2<A, B, C>): IO<E, C> {
    return this.chain((a) => iob.map((b) => f(a, b)));
  }

  /**
   * Construct a new IO by forming a tuple from the values produced by this and iob
   * @param iob
   */
  public zip<B>(iob: IO<E, B>): IO<E, [A, B]> {
    return this.zipWith(iob, (a, b) => [a, b]);
  }

  /**
   * Construct a new IO that will first execute this and then execute iob and produce the value produced by this
   * @param iob
   */
  public applyFirst<B>(iob: IO<E, B>): IO<E, A> {
    return this.zipWith(iob, (a, _) => a);
  }

  /**
   * Construct a new IO that wil execute this and then iob and produce the value produced by iob
   * @param iob
   */
  public applySecond<B>(iob: IO<E, B>): IO<E, B> {
    return this.zipWith(iob, (_, b) => b);
  }

  /**
   * Construct a new IO that will execute the function produced by iof against the value produced by this
   * @param iof
   */
  public ap<B>(iof: IO<E, Function1<A, B>>): IO<E, B> {
    return this.zipWith(iof, (a, f) => f(a));
  }

  /**
   * Flipped version of ap
   * @param this
   * @param iob
   */
  public ap_<B, C>(this: IO<E, Function1<B, C>>, iob: IO<E, B>): IO<E, C> {
    return this.zipWith(iob, (f, b) => f(b));
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
      (cause) => cause._tag === "failed" ? f(cause.error) : completeWith(cause),
      succeed
    ));
  }

  public fold<B>(failed: Function1<E, IO<E, B>>, succeeded: Function1<A, IO<E, B>>): IO<E, B> {
    return new IO(new Fold(
      this,
      (cause) => cause._tag === "failed" ? failed(cause.error) : completeWith(cause),
      succeeded
    ));
  }

  public foldCause<B>(failed: Function1<Cause<E>, IO<E, B>>, succeeded: Function1<A, IO<E, B>>): IO<E, B> {
    return new IO(new Fold(
      this,
      failed,
      succeeded
    ));
  }

  /**
   * Construct a new IO that inverts the success and error channels of this
   */
  public flip(): IO<A, E> {
    return new IO(new Fold(
      this,
      (e) => e._tag === "failed" ? io.succeed(e.error) : io.completeWith(e),
      (a) => io.fail(a)
    ));
  }

  /**
   * Construct a new IO that will run this to completion and produce the resulting exit status
   *
   * Any error type may be set for easier integration into other chains
   */
  public run<EE = never>(): IO<EE, Exit<E, A>> {
    // This could probably be a static property hwoever, for now,
    return new IO(new Fold(
      this,
      (cause) => succeed(cause),
      (a) => succeed(new Value(a) as Exit<E, A>)
    ));
  }

  /**
   * Construct an IO like this only is encased in an interruptible region
   */
  public interruptible(): IO<E, A> {
    return interruptible(this);
  }

  /**
   * Cosntruct an IO like this only is encased in an uninterruptible region
   */
  public uninterruptible(): IO<E, A> {
    return uninterruptible(this);
  }

  /**
   * Construct an IO like this only is encased in a region where interruptibility is set to state
   * @param state
   */
  public interruptibleState(state: boolean): IO<E, A> {
    return interruptibleState(this, state);
  }

  /**
   * Allow downcasting the error type parameter.
   *
   * Most useful for introducing an error type when currently set to never
   * @param this
   */
  public widenError<EE>(this: IO<E extends EE ? EE : never, A>): IO<EE, A> {
    return this;
  }

  /**
   * Allow downcasting the value type parameter.
   *
   * Most useful for introducing a value when when currently set to never`
   * @param this
   */
  public widen<AA>(this: IO<E, A extends AA ? AA : never>): IO<E, AA> {
    return this;
  }

  public delay(ms: number): IO<E, A> {
    return delay(this, ms);
  }

  public bracketExit<B>(release: Function2<A, Exit<E, B>, IO<E, unknown>>, use: Function1<A, IO<E, B>>): IO<E, B> {
    return bracketExit(this, release, use);
  }

  public bracket<B>(release: Function1<A, IO<E, unknown>>, use: Function1<A, IO<E, B>>): IO<E, B> {
    return bracket(this, release, use);
  }

  public fork(name?: string): IO<never, Fiber<E, A>> {
    return getRuntime.chain((runtime) => io.shift.applySecond(fiber.create(this, runtime, name)));
  }

  public shift(): IO<E, A> {
    return shift.widenError<E>().applySecond(this);
  }

  public shiftAsync(): IO<E, A> {
    return shift.widenError<E>().applySecond(this);
  }

  public onCompleted(finalizer: IO<E, unknown>): IO<E, A> {
    return uninterruptibleMask((cutout) =>
      // TODO: Recover in the face of buggy finalizer...
      cutout(this).run<E>().chain((exit) => finalizer.applySecond(io.completeWith(exit)))
    );
  }

  public onInterrupted(finalizer: IO<E, unknown>): IO<E, A> {
    return uninterruptibleMask((cutout) =>
      cutout(this).run<E>().chain((exit) =>
        exit._tag === "interrupted" ? finalizer.applySecond(io.completeWith(exit)) : io.completeWith(exit)
      )
    );
  }

  public into(target: Deferred<E, A>): IO<never, void> {
    return target.from(this);
  }

  /**
   * Flatten an IO. This is equivalent to io.chain(identity) when applicable
   * @param this
   */
  public flatten<EE, AA>(this: IO<EE, IO<EE, AA>>): IO<EE, AA> {
    return this.chain(identity);
  }

  /**
   * Zip the results of 2 IOs that are evaluated in parallel
   * @param other
   * @param f
   */
  public parZipWith<B, C>(other: IO<E, B>, f: Function2<A, B, C>): IO<E, C> {
    return raceWith(this, other,
      (thisExit, otherFiber) => io.completeWith(thisExit).zipWith(otherFiber.join, f),
      (otherExit, thisFiber) => io.completeWith(otherExit).zipWith(thisFiber.join, (b, a) => f(a, b))
    );
  }

  /**
   * Evaluate the function produced by fio against the value produced by this
   *
   * Execution occurs in parallel.
   * @param other
   */
  public parAp<B>(fio: IO<E, Function1<A, B>>): IO<E, B> {
    return this.parZipWith(fio, (a, f) => f(a));
  }

  /**
   * Apply the function produced by this to the value produced by other.
   *
   * Execution occurs in parallel
   * @param this
   * @param other
   */
  public parAp_<B, C>(this: IO<E, Function1<B, C>>, other: IO<E, B>): IO<E, C> {
    return this.parZipWith(other, (f, b) => f(b));
  }

  /**
   * Evaluate both this and other in parallel taking the value produced by other
   */
  public parApplySecond<B>(other: IO<E, B>): IO<E, B> {
    return this.parZipWith(other, (a, b) => b);
  }

  /**
   * Evaluate both this and other in parallel, taking the value produced by this
   * @param other
   */
  public parApplyFirst(other: IO<E, unknown>): IO<E, A> {
    return this.parZipWith(other, (a, b) => a);
  }

  /**
   * Evaluate the race of this with other.
   *
   * Takes the first result, whether a success or a failure
   * @param other
   */
  public race(other: IO<E, A>): IO<E, A> {
    function interruptLoser(exit: Exit<E, A>, loser: Fiber<E, A>): IO<E, A> {
      // Interrupt the loser first, because if exit is a failure, we don't want to bail out on the interrupt
      return loser.interrupt.widenError<E>().applySecond(io.completeWith(exit));
    }
    return raceWith(this, other, interruptLoser, interruptLoser);
  }

  /**
   * Evaluate the race of this with other.
   *
   * Takes the first successful result. If both fail, will fail with one of the resulting errors
   */
  public raceSuccess(other: IO<E, A>): IO<E, A> {
    function consumeLoser(exit: Exit<E, A>, loser: Fiber<E, A>): IO<E, A> {
      return exit._tag === "value" ?
        succeed(exit.value).applyFirst(loser.interrupt) :
        loser.join;
    }
    return raceWith(this, other, consumeLoser, consumeLoser);
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
      driver.interrupt();
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
function asyncTotal<A>(op: Function1<Function1<A, void>, Lazy<void>>): IO<never, A> {
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
 * An IO that will access the current interruptible state of the fiber
 */
const getInterruptible: IO<never, boolean> = new IO(new PlatformInterface(new GetInterruptible()));

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
  .chain((runtime) => asyncTotal<void>((callback) => {
    runtime.dispatch(() => callback(undefined));
    // tslint:disable-next-line
    return () => { };
  }).uninterruptible());

/**
 * An IO that uses the runtime to introduce an asynchronous boundary
 *
 * This can be used to acheive fairness with other processes (i.e. the event loop)
 */
const shiftAsync: IO<never, void> = getRuntime
  .chain((runtime) =>
    asyncTotal<void>((callback) =>
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

const unit: IO<never, void> = succeed(undefined);

/**
 * Create an interruptible version of inner
 * @param inner
 */
function interruptible<E, A>(inner: IO<E, A>): IO<E, A> {
  return new IO(new InterruptibleState(inner, true));
}

/**
 * Create an uninterruptible version of inner
 * @param inner
 */
function uninterruptible<E, A>(inner: IO<E, A>): IO<E, A> {
  return new IO(new InterruptibleState(inner, false));
}

function interruptibleState<E, A>(inner: IO<E, A>, state: boolean): IO<E, A> {
  return new IO(new InterruptibleState(inner, state));
}

export type InterruptMaskCutout<E, A> = Function1<IO<E, A>, IO<E, A>>;

function makeInterruptMaskCutout<E, A>(state: boolean): InterruptMaskCutout<E, A> {
  return (inner) => inner.interruptibleState(state);
}

function uninterruptibleMask<E, A>(f: Function1<InterruptMaskCutout<E, A>, IO<E, A>>): IO<E, A> {
  return getInterruptible
    .widenError<E>()
    .chain((state) => f(makeInterruptMaskCutout<E, A>(state)).uninterruptible());
}

function interruptibleMask<E, A>(f: Function1<InterruptMaskCutout<E, A>, IO<E, A>>): IO<E, A> {
  return getInterruptible
    .widenError<E>()
    .chain((state) => f(makeInterruptMaskCutout<E, A>(state)).interruptible());
}

const bracketExitC = <E, A>(acquire: IO<E, A>) =>
  <B>(release: Function2<A, Exit<E, B>, IO<E, unknown>>, use: Function1<A, IO<E, B>>): IO<E, B> =>
    bracketExit(acquire, release, use);

function bracketExit<E, A, B>(acquire: IO<E, A>,
                              release: Function2<A, Exit<E, B>, IO<E, unknown>>,
                              use: Function1<A, IO<E, B>>): IO<E, B> {
  return uninterruptibleMask<E, B>((cutout) =>
    Do(monad)
      .bind("a", acquire)
      .bindL("e", ({a}) => cutout(use(a)).run().widenError<E>()
        // TODO: Recover in the face of buggy finalizer
        .chain((e) => release(a, e).as(e)))
      .bindL("b", ({e}) => io.completeWith(e))
      .return(({b}) => b)
  );
}

/**
 * A type curried version of bracket for better inference.
 * @param acquire
 */
const bracketC = <E, A>(acquire: IO<E, A>) =>
  <B>(release: Function1<A, IO<E, unknown>>, use: Function1<A, IO<E, B>>): IO<E, B> =>
    bracket(acquire, release, use);

function bracket<E, A, B>(acquire: IO<E, A>,
                          release: Function1<A, IO<E, unknown>>,
                          use: Function1<A, IO<E, B>>): IO<E, B> {
  return bracketExit(acquire, (a, _) => release(a), use);
}

/**
 * Create an IO that when executed will complete after a fixed amount of millisenconds
 * @param ms the wait duration
 */
function after<E = never>(ms: number): IO<E, void> {
  return getRuntime
    .chain((runtime) =>
      io.asyncTotal((callback) =>
        runtime.dispatchLater(() => callback(undefined), ms)
      )
    );
}

function raceWith<E1, E2, A, B, C>(first: IO<E1, A>, second: IO<E1, B>,
                                   onFirstWon: Function2<Exit<E1, A>, Fiber<E1, B>, IO<E2, C>>,
                                   onSecondWon: Function2<Exit<E1, B>, Fiber<E1, A>, IO<E2, C>>): IO<E2, C> {
  // tslint:disable-next-line:no-shadowed-variable
  function completeLatched<E1, E2, A, B, C>(latch: Ref<boolean>,
                                            channel: Deferred<E2, C>,
                                            fold: Function2<Exit<E1, A>, Fiber<E1, B>, IO<E2, C>>,
                                            other: Fiber<E1, B>): Function1<Exit<E1, A>, IO<never, void>> {
    return (exit) =>
      latch.modify((flag) =>
        flag ? [unit, flag] : [channel.from(fold(exit, other)), true]
      ).flatten();

  }
  return uninterruptibleMask((cutout) =>
      Do(monad)
      .bind("latch", ref.allocC<E2>()(false))
      .bind("channel", deferred.alloc<E2, C>())
      .bind("firstFiber", first.fork())
      .bind("secondFiber", second.fork())
      .doL(({latch, channel, firstFiber, secondFiber}) =>
        firstFiber.wait.chain(completeLatched(latch, channel, onFirstWon, secondFiber)).fork("first"))
      .doL(({latch, channel, firstFiber, secondFiber}) =>
        secondFiber.wait.chain(completeLatched(latch, channel, onSecondWon, firstFiber)).fork("second"))
      .bindL("result", ({channel, firstFiber, secondFiber}) =>
        cutout(channel.wait)
          .onInterrupted(firstFiber.interrupt.applySecond(secondFiber.interrupt)))
      .return(({result}) => result)
    );
}

/**
 * Construct an IO that delays the evaluation of inner by some duratino
 * @param inner the io to delay
 * @param ms how many ms to wait
 */
function delay<E, A>(inner: IO<E, A>, ms: number): IO<E, A> {
  return after<E>(ms).applySecond(inner);
}

/**
 * Create an IO from an already running promise
 *
 * The resulting IO is uninterruptible (due to the lack of cancellation semantics for es6 promises).
 * Note that this fits poorly with the execution model of IO which is lazy by nature.
 * Prefer fromPromiseL unless absolutely necessary.
 * @param promise
 */
function fromPromise<A>(promise: Promise<A>): IO<unknown, A> {
  return io.async<unknown, A>((callback) => {
    promise.then((v) => callback(right(v)), (e) => callback(left(e)));
    // tslint:disable-next-line
    return () => {};
  }).uninterruptible();
}

function fromPromiseL<A>(thunk: Lazy<Promise<A>>): IO<unknown, A> {
  return io.async<unknown, A>((callback) => {
    thunk().then((v) => callback(right(v)), (e) => callback(left(e)));
    // tslint:disable-next-line
    return () => {};
  }).uninterruptible();
}

function fromTask<A>(task: Task<A>): IO<never, A> {
  return io.asyncTotal<A>((callback) => {
    task.run().then((v) => callback(v));
    // tslint:disable-next-line
    return  () => {};
  }).uninterruptible();
}

function fromTaskEither<E, A>(task: TaskEither<E, A>): IO<E, A> {
  return io.async<E, A>((callback) => {
    task.run().then(callback);
    // tslint:disable-next-line
    return () => {};
  }).uninterruptible();
}

function fromSyncIO<A>(fpio: SyncIO<A>): IO<never, A> {
  return io.effect(() => fpio.run());
}

function fromSyncIOEither<E, A>(ioe: IOEither<E, A>): IO<E, A> {
  return io.suspend(() => ioe.run().fold(
    failC<A>(),
    succeedC<E>()
  ));
}

declare module "fp-ts/lib/HKT" {
  interface URI2HKT2<L, A> {
    IO: IO<L, A>;
  }
}

export const URI = "IO";
export type URI = typeof URI;

const of = <L, A>(a: A) => succeed(a);
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
  succeedC,
  fail,
  failC,
  abort,
  completeWith,
  interrupted,
  effect,
  suspend,
  asyncTotal,
  async,
  shift,
  shiftAsync,
  never,
  unit,
  after,
  delay,
  interruptible,
  uninterruptible,
  interruptibleMask,
  uninterruptibleMask,
  bracketExitC,
  bracketExit,
  bracketC,
  bracket,
  getInterruptible,
  fromPromise,
  fromPromiseL,
  fromTask,
  fromTaskEither,
  fromSyncIO,
  fromSyncIOEither,
  monad
} as const;
