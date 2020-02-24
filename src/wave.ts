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

import { Semigroup } from "fp-ts/lib/Semigroup"
import { Monoid } from "fp-ts/lib/Monoid";
import { Applicative2 } from "fp-ts/lib/Applicative";
import { Either, left, right } from "fp-ts/lib/Either";
import * as either from "fp-ts/lib/Either";
import { constant, flow, FunctionN, identity, Lazy } from "fp-ts/lib/function";
import { Monad2 } from "fp-ts/lib/Monad";
import { none, some, Option } from "fp-ts/lib/Option";
import * as option from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";

import { Deferred, makeDeferred } from "./deferred";
import { makeDriver, Driver } from "./driver";
import { Cause, Exit } from "./exit";
import * as ex from "./exit";
import { makeRef, Ref } from "./ref";
import { Runtime } from "./runtime";
import { fst, snd, tuple2 } from "./support/util";

export enum WaveTag {
  Pure,
  Raised,
  Completed,
  Suspended,
  Async,
  Chain,
  Collapse,
  InterruptibleRegion,
  AccessInterruptible,
  AccessRuntime
}

/**
 * A description of an effect to perform
 */
export type Wave<E, A> =
  Pure<E, A> |
  Raised<E, A> |
  Completed<E, A> |
  Suspended<E, A> |
  Async<E, A> |
  Chain<E, any, A> | // eslint-disable-line @typescript-eslint/no-explicit-any
  Collapse<any, E, any, A> | // eslint-disable-line @typescript-eslint/no-explicit-any
  InterruptibleRegion<E, A> |
  AccessInterruptible<E, A> |
  AccessRuntime<E, A>;


export type ReturnCovaryE<T, E2> =
  T extends Wave<infer E, infer A> ?
  (E extends E2 ? Wave<E2, A> : Wave<E | E2, A>) : never

/** 
 * Perform a widening of Wave<E1, A> such that the result includes E2.
 * 
 * This encapsulates normal subtype widening, but will also widen to E1 | E2 as a fallback
 * Assumes that this function (which does nothing when compiled to js) will be inlined in hot code
 */
export function covaryE<E1, A, E2>(wave: Wave<E1, A>): ReturnCovaryE<typeof wave, E2> {
  return wave as unknown as ReturnCovaryE<typeof wave, E2>;
}


/**
 * Type inference helper form of covaryToE
 */
export function covaryToE<E2>(): <E1, A>(wave: Wave<E1, A>) => ReturnCovaryE<Wave<E1, A>, E2> {
  return (w) => covaryE(w);
}

export interface Pure<E, A> {
  readonly _tag: WaveTag.Pure;
  readonly value: A;
}

/**
 * An IO has succeeded
 * @param a the value
 */
export function pure<A>(a: A): Wave<never, A> {
  return {
    _tag: WaveTag.Pure,
    value: a
  };
}

export interface Raised<E, A> {
  readonly _tag: WaveTag.Raised;
  readonly error: Cause<E>;
}

/**
 * An IO that is failed
 * 
 * Prefer raiseError or raiseAbort
 * @param e
 */
export function raised<E>(e: Cause<E>): Wave<E, never> {
  return { _tag: WaveTag.Raised, error: e };
}

/**
 * An IO that is failed with a checked error
 * @param e
 */
export function raiseError<E>(e: E): Wave<E, never> {
  return raised(ex.raise(e));
}

/**
 * An IO that is failed with an unchecked error
 * @param u
 */
export function raiseAbort(u: unknown): Wave<never, never> {
  return raised(ex.abort(u));
}

/**
 * An IO that is already interrupted
 */
export const raiseInterrupt: Wave<never, never> = raised(ex.interrupt);

export interface Completed<E, A> {
  readonly _tag: WaveTag.Completed;
  readonly exit: Exit<E, A>;
}

/**
 * An IO that is completed with the given exit
 * @param exit
 */
export function completed<E, A>(exit: Exit<E, A>): Wave<E, A> {
  return {
    _tag: WaveTag.Completed,
    exit
  };
}

export interface Suspended<E, A> {
  readonly _tag: WaveTag.Suspended;
  readonly thunk: Lazy<Wave<E, A>>;
}

/**
 * Wrap a block of impure code that returns an IO into an IO
 *
 * When evaluated this IO will run the given thunk to produce the next IO to execute.
 * @param thunk
 */
export function suspended<E, A>(thunk: Lazy<Wave<E, A>>): Wave<E, A> {
  return {
    _tag: WaveTag.Suspended,
    thunk
  };
}

/**
 * Wrap a block of impure code in an IO
 *
 * When evaluated the this will produce a value or throw
 * @param thunk
 */
export function sync<A>(thunk: Lazy<A>): Wave<never, A> {
  return suspended(() => pure(thunk()));
}

export interface Async<E, A> {
  readonly _tag: WaveTag.Async;
  readonly op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>;
}

/**
 * Wrap an impure callback in an IO
 *
 * The provided function must accept a callback to report results to and return a cancellation action.
 * If your action is uncancellable for some reason, you should return an empty thunk and wrap the created IO
 * in uninterruptible
 * @param op
 */
export function async<E, A>(op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>): Wave<E, A> {
  return {
    _tag: WaveTag.Async,
    op
  };
}

/**
 * Wrap an impure callback in IO
 *
 * This is a variant of async where the effect cannot fail with a checked exception.
 * @param op
 */
export function asyncTotal<A>(op: FunctionN<[FunctionN<[A], void>], Lazy<void>>): Wave<never, A> {
  return async((callback) => op((a) => callback(right(a))));
}

export interface InterruptibleRegion<E, A> {
  readonly _tag: WaveTag.InterruptibleRegion;
  readonly inner: Wave<E, A>;
  readonly flag: boolean;
}

/**
 * Demarcate a region of interruptible state
 * @param inner
 * @param flag
 */
export function interruptibleRegion<E, A>(inner: Wave<E, A>, flag: boolean): Wave<E, A> {
  return {
    _tag: WaveTag.InterruptibleRegion,
    inner,
    flag
  };
}

export interface Chain<E, Z, A> {
  readonly _tag: WaveTag.Chain;
  readonly inner: Wave<E, Z>;
  readonly bind: FunctionN<[Z], Wave<E, A>>;
}

/**
 * Produce an new IO that will use the value produced by inner to produce the next IO to evaluate
 * @param inner
 * @param bind
 */
export function chain<E, A, B>(inner: Wave<E, A>, bind: FunctionN<[A], Wave<E, B>>): Wave<E, B> {
  return {
    _tag: WaveTag.Chain,
    inner: inner,
    bind: bind
  };
}

/**
 * Lift an Either into an IO
 * @param e 
 */
export function encaseEither<E, A>(e: Either<E, A>): Wave<E, A> {
  return pipe(e, either.fold<E, A, Wave<E, A>>(raiseError, pure));
}

/**
 * Lift an Option into an IO
 * @param o 
 * @param onError 
 */
export function encaseOption<E, A>(o: Option<A>, onError: Lazy<E>): Wave<E, A> {
  return pipe(o,
    option.map<A, Wave<E, A>>(pure),
    option.getOrElse<Wave<E, A>>(() => raiseError(onError())));
}

/**
 * Flatten a nested IO
 *
 * @param inner
 */
export function flatten<E, A>(inner: Wave<E, Wave<E, A>>): Wave<E, A> {
  return chain(inner, identity);
}

/**
 * Curried function first form of chain
 * @param bind 
 */
export function chainWith<E, Z, A>(bind: FunctionN<[Z], Wave<E, A>>): (io: Wave<E, Z>) => Wave<E, A> {
  return (io) => chain(io, bind);
}

export interface Collapse<E1, E2, A1, A2> {
  readonly _tag: WaveTag.Collapse;
  readonly inner: Wave<E1, A1>;
  readonly failure: FunctionN<[Cause<E1>], Wave<E2, A2>>;
  readonly success: FunctionN<[A1], Wave<E2, A2>>;
}

/**
 * Fold the result of an IO into a new IO.
 * 
 * This can be thought of as a more powerful form of chain
 * where the computation continues with a new IO depending on the result of inner.
 * @param inner The IO to fold the exit of
 * @param failure 
 * @param success 
 */
export function foldExit<E1, E2, A1, A2>(inner: Wave<E1, A1>,
  failure: FunctionN<[Cause<E1>], Wave<E2, A2>>,
  success: FunctionN<[A1], Wave<E2, A2>>): Wave<E2, A2> {
  return {
    _tag: WaveTag.Collapse,
    inner,
    failure,
    success
  };
}

/**
 * Curried form of foldExit
 * @param failure 
 * @param success 
 */
export function foldExitWith<E1, E2, A1, A2>(failure: FunctionN<[Cause<E1>], Wave<E2, A2>>,
  success: FunctionN<[A1], Wave<E2, A2>>):
  FunctionN<[Wave<E1, A1>], Wave<E2, A2>> {
  return (io) => foldExit(io, failure, success);
}

export interface AccessInterruptible<E, A> {
  readonly _tag: WaveTag.AccessInterruptible;
  readonly f: FunctionN<[boolean], A>;
}

/**
 * Get the interruptible state of the current fiber
 */
export const accessInterruptible: Wave<never, boolean> = { _tag: WaveTag.AccessInterruptible, f: identity };

export interface AccessRuntime<E, A> {
  readonly _tag: WaveTag.AccessRuntime;
  readonly f: FunctionN<[Runtime], A>;
}

/**
 * Get the runtime of the current fiber
 */
export const accessRuntime: Wave<never, Runtime> = { _tag: WaveTag.AccessRuntime, f: identity };

/**
 * Access the runtime then provide it to the provided function
 * @param f 
 */
export function withRuntime<E, A>(f: FunctionN<[Runtime], Wave<E, A>>): Wave<E, A> {
  return chain(accessRuntime as Wave<E, Runtime>, f);
}

/**
 * Map the value produced by an IO
 * @param io
 * @param f
 */
export function map<E, A, B>(base: Wave<E, A>, f: FunctionN<[A], B>): Wave<E, B> {
  return chain<E, A, B>(base, flow(f, pure));
}

/**
 * Lift a function on values to a function on IOs
 * @param f
 */
export function lift<A, B>(f: FunctionN<[A], B>): <E>(io: Wave<E, A>) => Wave<E, B> {
  return <E>(io: Wave<E, A>) => map(io, f);
}

export const mapWith = lift;

/**
 * Map the value produced by an IO to the constant b
 * @param io
 * @param b
 */
export function as<E, A, B>(io: Wave<E, A>, b: B): Wave<E, B> {
  return map(io, constant(b));
}

/**
 * Curried form of as
 * @param b 
 */
export function to<B>(b: B): <E, A>(io: Wave<E, A>) => Wave<E, B> {
  return (io) => as(io, b);
}

/**
 * Sequence a Wave and then produce an effect based on the produced value for observation.
 * 
 * Produces the result of the iniital Wave
 * @param inner 
 * @param bind 
 */
export function chainTap<E, A>(inner: Wave<E, A>, bind: FunctionN<[A], Wave<E, unknown>>): Wave<E, A> {
  return chain(inner, (a) =>
    as(bind(a), a)
  );
}

export function chainTapWith<E, A>(bind: FunctionN<[A], Wave<E, unknown>>): (inner: Wave<E, A>) => Wave<E, A> {
  return (inner) => chainTap(inner, bind);
}

/**
 * Map the value produced by an IO to void
 * @param io
 */
export function asUnit<E, A>(io: Wave<E, A>): Wave<E, void> {
  return as(io, undefined);
}

/**
 * An IO that succeeds immediately with void
 */
export const unit: Wave<never, void> = pure(undefined);

/**
 * Produce an new IO that will use the error produced by inner to produce a recovery program
 * @param io
 * @param f
 */
export function chainError<E1, E2, A>(io: Wave<E1, A>, f: FunctionN<[E1], Wave<E2, A>>): Wave<E2, A> {
  return foldExit(io,
    (cause) => cause._tag === ex.ExitTag.Raise ? f(cause.error) : completed(cause),
    pure
  );
}

/**
 * Curriend form of chainError
 * @param f
 */
export function chainErrorWith<E1, E2, A>(f: FunctionN<[E1], Wave<E2, A>>): (rio: Wave<E1, A>) => Wave<E2, A> {
  return (io) => chainError(io, f);
}

/**
 * Map the error produced by an IO
 * @param io
 * @param f
 */
export function mapError<E1, E2, A>(io: Wave<E1, A>, f: FunctionN<[E1], E2>): Wave<E2, A> {
  return chainError(io, flow(f, raiseError));
}

/**
 * Curried form of mapError
 * @param f
 */
export function mapErrorWith<E1, E2>(f: FunctionN<[E1], E2>): <A>(io: Wave<E1, A>) => Wave<E2, A> {
  return <A>(io: Wave<E1, A>) => mapError(io, f);
}

/**
 * Map over either the error or value produced by an IO
 * @param io
 * @param leftMap
 * @param rightMap
 */
export function bimap<E1, E2, A, B>(io: Wave<E1, A>,
  leftMap: FunctionN<[E1], E2>,
  rightMap: FunctionN<[A], B>): Wave<E2, B> {
  return foldExit(io,
    (cause) => cause._tag === ex.ExitTag.Raise ? raiseError(leftMap(cause.error)) : completed(cause),
    flow(rightMap, pure)
  );
}

/**
 * Curried form of bimap
 * @param leftMap
 * @param rightMap
 */
export function bimapWith<E1, E2, A, B>(leftMap: FunctionN<[E1], E2>,
  rightMap: FunctionN<[A], B>): FunctionN<[Wave<E1, A>], Wave<E2, B>> {
  return (io) => bimap(io, leftMap, rightMap);
}

/**
 * Zip the result of two IOs together using the provided function
 * @param first
 * @param second
 * @param f
 */
export function zipWith<E, A, B, C>(first: Wave<E, A>, second: Wave<E, B>, f: FunctionN<[A, B], C>): Wave<E, C> {
  return chain(first, (a) =>
    map(second, (b) => f(a, b))
  );
}

/**
 * Zip the result of two IOs together into a tuple type
 * @param first
 * @param second
 */
export function zip<E, A, B>(first: Wave<E, A>, second: Wave<E, B>): Wave<E, readonly [A, B]> {
  return zipWith(first, second, tuple2);
}

/**
 * Evaluate two IOs in sequence and produce the value produced by the first
 * @param first
 * @param second
 */
export function applyFirst<E, A, B>(first: Wave<E, A>, second: Wave<E, B>): Wave<E, A> {
  return zipWith(first, second, fst);
}

/**
 * Evaluate two IOs in sequence and produce the value produced by the second
 * @param first 
 * @param second 
 */
export function applySecond<E, A, B>(first: Wave<E, A>, second: Wave<E, B>): Wave<E, B> {
  return zipWith(first, second, snd);
}

/**
 * Evaluate two IOs in sequence and produce the value of the second.
 * This is suitable for cases where second is recursively defined
 * @param first 
 * @param second 
 */
export function applySecondL<E, A, B>(first: Wave<E, A>, second: Lazy<Wave<E, B>>): Wave<E, B> {
  return chain(first, () => second());
}

/**
 * Applicative ap
 * @param ioa 
 * @param iof 
 */
export function ap<E, A, B>(ioa: Wave<E, A>, iof: Wave<E, FunctionN<[A], B>>): Wave<E, B> {
  // Find the apply/thrush operator I'm sure exists in fp-ts somewhere
  return zipWith(ioa, iof, (a, f) => f(a));
}


/**
 * Flipped argument form of ap
 * @param iof 
 * @param ioa 
 */
export function ap_<E, A, B>(iof: Wave<E, FunctionN<[A], B>>, ioa: Wave<E, A>): Wave<E, B> {
  return zipWith(iof, ioa, (f, a) => f(a));
}

/**
 * Flip the error and success channels in an IO
 * @param io 
 */
export function flip<E, A>(io: Wave<E, A>): Wave<A, E> {
  return foldExit(
    io,
    (error) => error._tag === ex.ExitTag.Raise ? pure(error.error) : completed(error),
    raiseError
  );
}

/**
 * Execute the provided IO forever (or until it errors)
 * @param io 
 */
export function forever<E, A>(io: Wave<E, A>): Wave<E, A> {
  return chain(io, () => forever(io));
}

/**
 * Create an IO that traps all exit states of io.
 * 
 * Note that interruption will not be caught unless in an uninterruptible region
 * @param io 
 */
export function result<E, A>(io: Wave<E, A>): Wave<never, Exit<E, A>> {
  return foldExit(io, (c) => pure(c) as Wave<never, Exit<E, A>>, (d) => pure(ex.done(d)));
}

/**
 * Create an interruptible region around the evalution of io
 * @param io 
 */
export function interruptible<E, A>(io: Wave<E, A>): Wave<E, A> {
  return interruptibleRegion(io, true);
}

/**
 * Create an uninterruptible region around the evaluation of io
 * @param io 
 */
export function uninterruptible<E, A>(io: Wave<E, A>): Wave<E, A> {
  return interruptibleRegion(io, false);
}

/**
 * Create an IO that produces void after ms milliseconds
 * @param ms 
 */
export function after(ms: number): Wave<never, void> {
  return chain(accessRuntime,
    (runtime) =>
      asyncTotal((callback) =>
        runtime.dispatchLater(() => callback(undefined), ms)
      )
  );
}

/**
 * The type of a function that can restore outer interruptible state
 */
export type InterruptMaskCutout<E, A> = FunctionN<[Wave<E, A>], Wave<E, A>>;

function makeInterruptMaskCutout<E, A>(state: boolean): InterruptMaskCutout<E, A> {
  return (inner: Wave<E, A>) => interruptibleRegion(inner, state);
}

/**
 * Create an uninterruptible masked region
 * 
 * When the returned IO is evaluated an uninterruptible region will be created and , f will receive an InterruptMaskCutout that can be used to restore the 
 * interruptible status of the region above the one currently executing (which is uninterruptible)
 * @param f 
 */
export function uninterruptibleMask<E, A>(f: FunctionN<[InterruptMaskCutout<E, A>], Wave<E, A>>): Wave<E, A> {
  return chain(accessInterruptible as Wave<E, boolean>,
    (flag) => {
      const cutout = makeInterruptMaskCutout<E, A>(flag);
      return uninterruptible(f(cutout));
    });
}

/**
 * Create an interruptible masked region
 * 
 * Similar to uninterruptibleMask
 * @param f 
 */
export function interruptibleMask<E, A>(f: FunctionN<[InterruptMaskCutout<E, A>], Wave<E, A>>): Wave<E, A> {
  return chain(accessInterruptible as Wave<E, boolean>,
    (flag) => interruptible(f(makeInterruptMaskCutout(flag)))
  );
}

function combineFinalizerExit<E, A>(fiberExit: Exit<E, A>, releaseExit: Exit<E, unknown>): Exit<E, A> {
  if (fiberExit._tag === ex.ExitTag.Done && releaseExit._tag === ex.ExitTag.Done) {
    return fiberExit;
  } else if (fiberExit._tag === ex.ExitTag.Done) {
    return releaseExit as Cause<E>;
  } else if (releaseExit._tag === ex.ExitTag.Done) {
    return fiberExit;
  } else {
    // TODO: Figure out how to sanely report both of these, we swallow them currently
    // This would affect chainError (i.e. assume multiples are actually an abort condition that happens to be typed)
    return fiberExit;
  }
}

/**
 * Resource acquisition and release construct.
 * 
 * Once acquire completes successfully, release is guaranteed to execute following the evaluation of the IO produced by use.
 * Release receives the exit state of use along with the resource.
 * @param acquire 
 * @param release 
 * @param use 
 */

export function bracketExit<E, A, B>(acquire: Wave<E, A>,
  release: FunctionN<[A, Exit<E, B>], Wave<E, unknown>>,
  use: FunctionN<[A], Wave<E, B>>): Wave<E, B> {

  return uninterruptibleMask((cutout) =>
    chain(acquire,
      (a) => chain(result(cutout(use(a))),
        (exit) => chain(result(release(a, exit)),
          (finalize) => completed(combineFinalizerExit(exit, finalize)))
      )
    )
  )
}

/**
 * Weaker form of bracketExit where release does not receive the exit status of use
 * @param acquire 
 * @param release 
 * @param use 
 */
export function bracket<E, A, B>(acquire: Wave<E, A>,
  release: FunctionN<[A], Wave<E, unknown>>,
  use: FunctionN<[A], Wave<E, B>>): Wave<E, B> {
  return bracketExit(acquire, (e) => release(e), use);
}

/**
 * Guarantee that once ioa begins executing the finalizer will execute.
 * @param ioa 
 * @param finalizer 
 */
export function onComplete<E, A>(ioa: Wave<E, A>, finalizer: Wave<E, unknown>): Wave<E, A> {
  return uninterruptibleMask((cutout) =>
    chain(result(cutout(ioa)),
      (exit) => chain(result(finalizer),
        (finalize) => completed(combineFinalizerExit(exit, finalize))
      )
    ));
}

/**
 * Guarantee that once ioa begins executing if it is interrupted finalizer will execute
 * @param ioa 
 * @param finalizer 
 */
export function onInterrupted<E, A>(ioa: Wave<E, A>, finalizer: Wave<E, unknown>): Wave<E, A> {
  return uninterruptibleMask((cutout) =>
    chain(result(cutout(ioa)),
      (exit) => exit._tag === ex.ExitTag.Interrupt ?
        chain(result(finalizer),
          (finalize) => completed(combineFinalizerExit(exit, finalize))) :
        completed(exit)
    )
  );
}

/**
 * Introduce a gap in executing to allow other fibers to execute (if any are pending)
 */
export const shifted: Wave<never, void> =
  uninterruptible(chain(accessRuntime, (runtime: Runtime) => // why does this not trigger noImplicitAny
    asyncTotal<void>((callback) => {
      runtime.dispatch(() => callback(undefined));
      // tslint:disable-next-line
      return () => { };
    })
  ));

/**
 * Introduce a synchronous gap before io that will allow other fibers to execute (if any are pending)
 * @param io 
 */
export function shiftBefore<E, A>(io: Wave<E, A>): Wave<E, A> {
  return applySecond(shifted as Wave<E, void>, io);
}

/**
 * Introduce a synchronous gap after an io that will allow other fibers to execute (if any are pending)
 * @param io 
 */
export function shiftAfter<E, A>(io: Wave<E, A>): Wave<E, A> {
  return applyFirst(io, shifted as Wave<E, void>);
}

/**
 * Introduce an asynchronous gap that will suspend the runloop and return control to the javascript vm
 */
export const shiftedAsync: Wave<never, void> =
  pipe(
    accessRuntime,
    chainWith((runtime: Runtime) =>
      asyncTotal<void>((callback) => {
        return runtime.dispatchLater(() => callback(undefined), 0);
      })
    ),
    uninterruptible
  );

/**
 * Introduce an asynchronous gap before IO
 * @param io 
 */
export function shiftAsyncBefore<E, A>(io: Wave<E, A>): Wave<E, A> {
  return applySecond(shiftedAsync as Wave<E, void>, io);
}

/**
 * Introduce asynchronous gap after an IO
 * @param io 
 */
export function shiftAsyncAfter<E, A>(io: Wave<E, A>): Wave<E, A> {
  return applyFirst(io, shiftedAsync as Wave<E, void>);
}

/**
 * An IO that never produces a value or an error.
 * 
 * This IO will however prevent a javascript runtime such as node from exiting by scheduling an interval for 60s
 */
export const never: Wave<never, never> = asyncTotal(() => {
  // tslint:disable-next-line:no-empty
  const handle = setInterval(() => { }, 60000);
  return () => {
    clearInterval(handle);
  };
});

/**
 * Delay evaluation of inner by some amount of time
 * @param inner 
 * @param ms 
 */
export function delay<E, A>(inner: Wave<E, A>, ms: number): Wave<E, A> {
  return applySecond(after(ms) as Wave<E, void>, inner);
}

/**
 * Curried form of delay
 */
export function liftDelay(ms: number): <E, A>(io: Wave<E, A>) => Wave<E, A> {
  return (io) => delay(io, ms);
}



export interface Fiber<E, A> {
  /**
 * The name of the fiber
 */
  readonly name: Option<string>;
  /**
 * Send an interrupt signal to this fiber.
 *
 * The this will complete execution once the target fiber has halted.
 * Does nothing if the target fiber is already complete
 */
  readonly interrupt: Wave<never, void>;
  /**
 * Await the result of this fiber
 */
  readonly wait: Wave<never, Exit<E, A>>;
  /**
 * Join with this fiber.
 * This is equivalent to fiber.wait.chain(io.completeWith)
 */
  readonly join: Wave<E, A>;
  /**
 * Poll for a fiber result
 */
  readonly result: Wave<E, Option<A>>;
  /**
 * Determine if the fiber is complete
 */
  readonly isComplete: Wave<never, boolean>;
}

function createFiber<E, A>(driver: Driver<E, A>, n?: string): Fiber<E, A> {
  const name = option.fromNullable(n);
  const sendInterrupt = sync(() => {
    driver.interrupt();
  });
  const wait = asyncTotal(driver.onExit);
  const interrupt = applySecond(sendInterrupt, asUnit(wait));
  const join = chain(wait, (exit) => completed(exit));
  const result =
    chain(sync(() => driver.exit()),
      (opt) => pipe(opt, option.fold(() => pure(none), (exit: Exit<E, A>) => map(completed(exit), some))));
  const isComplete = sync(() => option.isSome(driver.exit()));
  return {
    name,
    wait,
    interrupt,
    join,
    result,
    isComplete
  };
}

/**
 * Implementation of wave/waver fork. Creates an IO that will fork a fiber in the background
 * @param init 
 * @param name 
 */
export function makeFiber<E, A>(init: Wave<E, A>, name?: string): Wave<never, Fiber<E, A>> {
  return chain(
    accessRuntime as Wave<never, Runtime>,
    (runtime) =>
      sync(() => {
        const driver = makeDriver<E, A>(runtime);
        const fiber = createFiber(driver, name);
        driver.start(init);
        return fiber;
      }));
}


/**
 * Fork the program described by IO in a separate fiber.
 * 
 * This fiber will begin executing once the current fiber releases control of the runloop.
 * If you need to begin the fiber immediately you should use applyFirst(forkIO, shifted)
 * @param io 
 * @param name 
 */
export function fork<E, A>(io: Wave<E, A>, name?: string): Wave<never, Fiber<E, A>> {
  return makeFiber(io, name);
}

function completeLatched<E1, E2, A, B, C>(latch: Ref<boolean>,
  channel: Deferred<E2, C>,
  combine: FunctionN<[Exit<E1, A>, Fiber<E1, B>], Wave<E2, C>>,
  other: Fiber<E1, B>): FunctionN<[Exit<E1, A>], Wave<never, void>> {
  return (exit) => {
    const act: Wave<never, Wave<never, void>> = latch.modify((flag) => !flag ?
      [channel.from(combine(exit, other)), true] as const :
      [unit as Wave<never, void>, flag] as const
    )
    return flatten(act);
  }
}

/**
 * Race two fibers together and combine their results.
 * 
 * This is the primitive from which all other racing and timeout operators are built and you should favor those unless you have very specific needs.
 * @param first 
 * @param second 
 * @param onFirstWon 
 * @param onSecondWon 
 */
export function raceFold<E1, E2, A, B, C>(first: Wave<E1, A>, second: Wave<E1, B>,
  onFirstWon: FunctionN<[Exit<E1, A>, Fiber<E1, B>], Wave<E2, C>>,
  onSecondWon: FunctionN<[Exit<E1, B>, Fiber<E1, A>], Wave<E2, C>>): Wave<E2, C> {
  return uninterruptibleMask<E2, C>((cutout) =>
    chain<E2, Ref<boolean>, C>(makeRef<boolean>(false),
      (latch) => chain<E2, Deferred<E2, C>, C>(makeDeferred<E2, C>(),
        (channel) => chain(fork(first),
          (fiber1) => chain(fork(second),
            (fiber2) => chain(fork(chain(fiber1.wait as Wave<never, Exit<E1, A>>, completeLatched(latch, channel, onFirstWon, fiber2))),
              () => chain(fork(chain(fiber2.wait as Wave<never, Exit<E1, B>>, completeLatched(latch, channel, onSecondWon, fiber1))),
                () => onInterrupted(cutout(channel.wait), applySecond(fiber1.interrupt, fiber2.interrupt) as Wave<never, void>)
              )
            )
          )
        )
      )
    )
  );
}

/**
 * Execute an IO and produce the next IO to run based on whether it completed successfully in the alotted time or not
 * @param source 
 * @param ms 
 * @param onTimeout 
 * @param onCompleted 
 */
export function timeoutFold<E1, E2, A, B>(source: Wave<E1, A>,
  ms: number,
  onTimeout: FunctionN<[Fiber<E1, A>], Wave<E2, B>>,
  onCompleted: FunctionN<[Exit<E1, A>], Wave<E2, B>>): Wave<E2, B> {
  return raceFold<E1, E2, A, void, B>(
    source,
    after(ms),
    (exit, delayFiber) => applySecond(delayFiber.interrupt as Wave<never, void>, onCompleted(exit)),
    (_, fiber) => onTimeout(fiber)
  );
}

function interruptLoser<E, A>(exit: Exit<E, A>, loser: Fiber<E, A>): Wave<E, A> {
  return applySecond(loser.interrupt, completed(exit));
}

/**
 * Return the reuslt of the first IO to complete or error successfully
 * @param io1 
 * @param io2 
 */
export function raceFirst<E, A>(io1: Wave<E, A>, io2: Wave<E, A>): Wave<E, A> {
  return raceFold<E, E, A, A, A>(io1, io2, interruptLoser, interruptLoser);
}


function fallbackToLoser<E, A>(exit: Exit<E, A>, loser: Fiber<E, A>): Wave<E, A> {
  return exit._tag === ex.ExitTag.Done ?
    applySecond(loser.interrupt, completed(exit)) :
    loser.join;
}

/**
 * Return the result of the first IO to complete successfully. 
 * 
 * If an error occurs, fall back to the other IO.
 * If both error, then fail with the second errors
 * @param io1 
 * @param io2 
 */
export function race<E, A>(io1: Wave<E, A>, io2: Wave<E, A>): Wave<E, A> {
  return raceFold<E, E, A, A, A>(io1, io2, fallbackToLoser, fallbackToLoser);
}

/**
 * Zip the result of 2 ios executed in parallel together with the provided function.
 * @param ioa 
 * @param iob 
 * @param f 
 */
export function parZipWith<E, A, B, C>(ioa: Wave<E, A>, iob: Wave<E, B>, f: FunctionN<[A, B], C>): Wave<E, C> {
  return raceFold<E, E, A, B, C>(ioa, iob,
    (aExit, bFiber) => zipWith(completed(aExit), bFiber.join, f),
    (bExit, aFiber) => zipWith(aFiber.join, completed(bExit), f)
  );
}

/**
 * Tuple the result of 2 ios executed in parallel
 * @param ioa 
 * @param iob 
 */
export function parZip<E, A, B>(ioa: Wave<E, A>, iob: Wave<E, B>): Wave<E, readonly [A, B]> {
  return parZipWith(ioa, iob, tuple2);
}

/**
 * Execute two ios in parallel and take the result of the first.
 * @param ioa 
 * @param iob 
 */
export function parApplyFirst<E, A, B>(ioa: Wave<E, A>, iob: Wave<E, B>): Wave<E, A> {
  return parZipWith(ioa, iob, fst);
}

/**
 * Exeute two IOs in parallel and take the result of the second
 * @param ioa 
 * @param iob 
 */
export function parApplySecond<E, A, B>(ioa: Wave<E, A>, iob: Wave<E, B>): Wave<E, B> {
  return parZipWith(ioa, iob, snd);
}

/**
 * Parallel form of ap
 * @param ioa 
 * @param iof 
 */
export function parAp<E, A, B>(ioa: Wave<E, A>, iof: Wave<E, FunctionN<[A], B>>): Wave<E, B> {
  return parZipWith(ioa, iof, (a, f) => f(a));
}

/**
 * Parallel form of ap_
 * @param iof 
 * @param ioa 
 */
export function parAp_<E, A, B>(iof: Wave<E, FunctionN<[A], B>>, ioa: Wave<E, A>): Wave<E, B> {
  return parZipWith(iof, ioa, (f, a) => f(a));
}

/**
 * Convert an error into an unchecked error.
 * @param io 
 */
export function orAbort<E, A>(io: Wave<E, A>): Wave<never, A> {
  return chainError(io, (e) => raiseAbort(e) as Wave<never, never>);
}

/**
 * Run source for a maximum amount of ms.
 * 
 * If it completes succesfully produce a some, if not interrupt it and produce none
 * @param source 
 * @param ms 
 */
export function timeoutOption<E, A>(source: Wave<E, A>, ms: number): Wave<E, Option<A>> {
  return timeoutFold<E, E, A, Option<A>>(
    source,
    ms,
    (actionFiber) => applySecond(actionFiber.interrupt, pure(none)),
    (exit) => map(completed(exit), some)
  );
}

/**
 * Create an IO from a Promise factory.
 * @param thunk 
 */
export function fromPromise<A>(thunk: Lazy<Promise<A>>): Wave<unknown, A> {
  return uninterruptible(async<unknown, A>((callback) => {
    thunk().then((v) => callback(right(v))).catch((e) => callback(left(e)));
    // tslint:disable-next-line
    return () => { };
  }));
}

/**
 * Run the given IO with the provided environment.
 * @param io 
 * @param r 
 * @param callback 
 */
export function run<E, A>(io: Wave<E, A>, callback?: FunctionN<[Exit<E, A>], void>): Lazy<void> {
  const driver = makeDriver<E, A>();
  if (callback) {
    driver.onExit(callback);
  }
  driver.start(io);
  return driver.interrupt;
}

/**
 * Run an IO and return a Promise of its result
 * 
 * Allows providing an environment parameter directly
 * @param io 
 * @param r 
 */
export function runToPromise<E, A>(io: Wave<E, A>): Promise<A> {
  return new Promise((resolve, reject) =>
    run(io, (exit) => {
      if (exit._tag === ex.ExitTag.Done) {
        resolve(exit.value);
      } else if (exit._tag === ex.ExitTag.Abort) {
        reject(exit.abortedWith);
      } else if (exit._tag === ex.ExitTag.Raise) {
        reject(exit.error);
      } else if (exit._tag === ex.ExitTag.Interrupt) {
        reject();
      }
    })
  );
}

/**
 * Run an IO returning a promise of an Exit. 
 * 
 * The Promise will not reject.
 * Allows providing an environment parameter directly
 * @param io 
 * @param r 
 */
export function runToPromiseExit<E, A>(io: Wave<E, A>): Promise<Exit<E, A>> {
  return new Promise((result) => run(io, result))
}


export const URI = "Wave";
export type URI = typeof URI;
declare module "fp-ts/lib/HKT" {
  interface URItoKind2<E, A> {
    Wave: Wave<E, A>;
  }
}

export const instances: Monad2<URI> = {
  URI,
  map,
  of: <E, A>(a: A): Wave<E, A> => pure(a),
  ap: ap_,
  chain,
} as const;

export const wave = instances;

export const parInstances: Applicative2<URI> = {
  URI,
  map,
  of: <E, A>(a: A): Wave<E, A> => pure(a),
  ap: parAp_
} as const;

export const parWave = parInstances

export function getSemigroup<E, A>(s: Semigroup<A>): Semigroup<Wave<E, A>> {
  return {
    concat(x: Wave<E, A>, y: Wave<E, A>): Wave<E, A> {
      return zipWith(x, y, s.concat)
    }
  };
}

export function getMonoid<E, A>(m: Monoid<A>): Monoid<Wave<E, A>> {
  return {
    ...getSemigroup(m),
    empty: pure(m.empty)
  }
}

export function getRaceMonoid<E, A>(): Monoid<Wave<E, A>> {
  return {
    concat: race,
    empty: never
  }
}
