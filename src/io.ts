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

import { Applicative2 } from "fp-ts/lib/Applicative";
import { Either, left, right } from "fp-ts/lib/Either";
import { constant, FunctionN, identity, Lazy, pipe, pipeOp } from "fp-ts/lib/function";
import { Monad2 } from "fp-ts/lib/Monad";
import { none, some } from "fp-ts/lib/Option";
import { Deferred, makeDeferred } from "./deferred";
import { Error, Exit } from "./exit";
import * as ex from "./exit";
import { Fiber, makeFiber } from "./fiber";
import { makeRef, Ref } from "./ref";
import { Runtime } from "./runtime";
import { makeDriver } from "./driver";

export type IO<E, A> =
  Pure<A> |
  Raised<E> |
  Completed<E, A> |
  Suspended<E, A> |
  Async<E, A> |
  Chain<E, any, A> |
  Collapse<any, E, any, A> |
  InterruptibleRegion<E, A> |
  (boolean extends A ? AccessInterruptible : never) |
  (Runtime extends A ? AccessRuntime : never);

export interface Pure<A> {
  readonly _tag: "pure";
  readonly value: A;
}

export function pure<A>(a: A): Pure<A> {
  return {
    _tag: "pure",
    value: a
  };
}

export interface Raised<E> {
  readonly _tag: "raised";
  readonly error: Error<E>;
}

export function raised<E>(e: Error<E>): Raised<E> {
  return {_tag: "raised", error: e};
}

export function raiseError<E>(e: E): Raised<E> {
  return raised(ex.raise(e));
}

export function raiseAbort(u: unknown): Raised<never> {
  return raised(ex.abort(u));
}

export const raiseInterrupt: Raised<never> = raised(ex.interrupt);

export interface Completed<E, A> {
  readonly _tag: "completed";
  readonly exit: Exit<E, A>;
}

export function completed<E, A>(exit: Exit<E, A>): Completed<E, A> {
  return {
    _tag: "completed",
    exit
  };
}

export interface Suspended<E, A> {
  readonly _tag: "suspended";
  readonly thunk: Lazy<IO<E, A>>;
}

export function suspended<E, A>(thunk: Lazy<IO<E, A>>): Suspended<E, A> {
  return {
    _tag: "suspended",
    thunk
  };
}

export function sync<A>(thunk: Lazy<A>): Suspended<never, A> {
  return suspended(() => pure(thunk()));
}

export interface Async<E, A> {
  readonly _tag: "async";
  readonly op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>;
}

export function async<E, A>(op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>): Async<E, A> {
  return {
    _tag: "async",
    op
  };
}

export function asyncTotal<A>(op: FunctionN<[FunctionN<[A], void>], Lazy<void>>): Async<never, A> {
  return async((callback) => op((a) => callback(right(a))));
}

export interface InterruptibleRegion<E, A> {
  readonly _tag: "interrupt-region";
  readonly inner: IO<E, A>;
  readonly flag: boolean;
}

export function interruptibleRegion<E, A>(inner: IO<E, A>, flag: boolean): InterruptibleRegion<E, A> {
  return {
    _tag: "interrupt-region",
    inner,
    flag
  };
}

export interface Chain<E, Z, A> {
  readonly _tag: "chain";
  readonly inner: IO<E, Z>;
  readonly bind: FunctionN<[Z], IO<E, A>>;
}

export function chain<E, Z, A>(inner: IO<E, Z>, bind: FunctionN<[Z], IO<E, A>>): Chain<E, Z, A> {
  return {
    _tag: "chain",
    inner,
    bind
  };
}

export function flatten<E, A>(inner: IO<E, IO<E, A>>): IO<E, A> {
  return chain(inner, identity);
}

export function liftChain<E, Z, A>(bind: FunctionN<[Z], IO<E, A>>): FunctionN<[IO<E, Z>], Chain<E, Z, A>> {
  return (io) => chain(io, bind);
}

export interface Collapse<E1, E2, A1, A2> {
  readonly _tag: "collapse";
  readonly inner: IO<E1, A1>;
  readonly failure: FunctionN<[Error<E1>], IO<E2, A2>>;
  readonly success: FunctionN<[A1], IO<E2, A2>>;
}

export function collapse<E1, E2, A1, A2>(inner: IO<E1, A1>,
                                         failure: FunctionN<[Error<E1>], IO<E2, A2>>,
                                         success: FunctionN<[A1], IO<E2, A2>>): Collapse<E1, E2, A1, A2> {
  return {
    _tag: "collapse",
    inner,
    failure,
    success
  };
}

export function liftCollapse<E1, E2, A1, A2>(failure: FunctionN<[Error<E1>], IO<E2, A2>>,
                                             success: FunctionN<[A1], IO<E2, A2>>):
                                             FunctionN<[IO<E1, A1>], Collapse<E1, E2, A1, A2>> {
  return (io) => collapse(io, failure, success);
}

export interface AccessInterruptible {
  readonly _tag: "access-interruptible";
}

// These must be typed to IO or we end up with an IO<never, any>
export const accessInterruptible: IO<never, boolean> = { _tag: "access-interruptible" };

export interface AccessRuntime {
  readonly _tag: "access-runtime";
}

// These must be typed to IO or we end up with an IO<never, any>
export const accessRuntime: IO<never, Runtime> = { _tag: "access-runtime" };

export function withRuntime<E, A>(f: FunctionN<[Runtime], IO<E, A>>): IO<E, A> {
  return chain(accessRuntime, f);
}

export function map<E, A, B>(io: IO<E, A>, f: FunctionN<[A], B>): IO<E, B> {
  return chain(io, pipe(f, pure));
}

export function lift<E, A, B>(f: FunctionN<[A], B>): FunctionN<[IO<E, A>], IO<E, B>> {
  return (io) => map(io, f);
}

export function as<E, A, B>(io: IO<E, A>, b: B): IO<E, B> {
  return map(io, constant(b));
}

export function liftAs<B>(b: B): <E, A>(io: IO<E, A>) => IO<E, B> {
  return <E, A>(io: IO<E, A>) => as(io, b);
}

export function asUnit<E, A>(io: IO<E, A>): IO<E, void> {
  return as<E, A, void>(io, undefined);
}

export const unit: IO<never, void> = pure(undefined);

export function chainError<E1, E2, A>(io: IO<E1, A>, f: FunctionN<[E1], IO<E2, A>>): IO<E2, A> {
  return collapse(io,
    (cause) => cause._tag === "raise" ? f(cause.error) : completed(cause),
    pure
  );
}

export function liftChainError<E1, E2, A>(f: FunctionN<[E1], IO<E2, A>>): FunctionN<[IO<E1, A>], IO<E2, A>> {
  return (io) => chainError(io, f);
}

export function mapError<E1, E2, A>(io: IO<E1, A>, f: FunctionN<[E1], E2>): IO<E2, A> {
  return chainError(io, pipe(f, raiseError));
}

export function liftMapError<E1, E2>(f: FunctionN<[E1], E2>): <A>(io: IO<E1, A>) => IO<E2, A> {
  return <A>(io: IO<E1, A>) => mapError(io, f);
}

export function bimap<E1, E2, A, B>(io: IO<E1, A>,
                                    leftMap: FunctionN<[E1], E2>,
                                    rightMap: FunctionN<[A], B>): IO<E2, B> {
  return collapse(io,
    (cause) => cause._tag === "raise" ? raiseError(leftMap(cause.error)) : completed(cause),
    pipe(rightMap, pure)
  );
}

export function liftBimap<E1, E2, A, B>(leftMap: FunctionN<[E1], E2>,
                                        rightMap: FunctionN<[A], B>): FunctionN<[IO<E1, A>], IO<E2, B>> {
  return (io) => bimap(io, leftMap, rightMap);
}

export function zipWith<E, A, B, C>(first: IO<E, A>, second: IO<E, B>, f: FunctionN<[A, B], C>): IO<E, C> {
  return chain(first, (a) =>
    map(second, (b) => f(a, b))
  );
}

export function zip<E, A, B>(first: IO<E, A>, second: IO<E, B>): IO<E, readonly [A, B]> {
  return zipWith(first, second, tuple2);
}

export function applyFirst<E, A, B>(first: IO<E, A>, second: IO<E, B>): IO<E, A> {
  return zipWith(first, second, fst);
}

export function applyThis<E, A>(first: IO<E, A>): <B>(second: IO<E, B>) => IO<E, A> {
  return <B>(second: IO<E, B>) => applyFirst(first, second);
}

export function applySecond<E, A, B>(first: IO<E, A>, second: IO<E, B>): IO<E, B> {
  return zipWith(first, second, snd);
}

export function applyOther<E, A>(first: IO<E, A>): <B>(second: IO<E, B>) => IO<E, B> {
  return <B>(second: IO<E, B>) => applySecond(first, second);
}

export function ap<E, A, B>(ioa: IO<E, A>, iof: IO<E, FunctionN<[A], B>>): IO<E, B> {
  // Find the apply/thrush operator I'm sure exists in fp-ts somewhere
  return zipWith(ioa, iof, (a, f) => f(a));
}

export function liftAp<E, A>(ioa: IO<E, A>): <B>(iof: IO<E, FunctionN<[A], B>>) => IO<E, B> {
  return <B>(iof: IO<E, FunctionN<[A], B>>) => ap(ioa, iof);
}

export function ap_<E, A, B>(iof: IO<E, FunctionN<[A], B>>, ioa: IO<E, A>): IO<E, B> {
  return zipWith(iof, ioa, (f, a) => f(a));
}

export function liftAp_<E, A, B>(iof: IO<E, FunctionN<[A], B>>): FunctionN<[IO<E, A>], IO<E, B>> {
  return (io) => ap_(iof, io);
}

export function flip<E, A>(io: IO<E, A>): IO<A, E> {
  return collapse(
    io,
    (error) => error._tag === "raise" ? pure(error.error) : completed(error),
    raiseError
  );
}

export function result<E, A>(io: IO<E, A>): IO<never, Exit<E, A>> {
  return collapse<E, never, A, Exit<E, A>>(
    io,
    pure,
    pipe(ex.done, pure)
  );
}

export function resultE<E, A>(io: IO<E, A>): IO<E, Exit<E, A>> {
  return result(io);
}

export function interruptible<E, A>(io: IO<E, A>): IO<E, A> {
  return interruptibleRegion(io, true);
}

export function uninterruptible<E, A>(io: IO<E, A>): IO<E, A> {
  return interruptibleRegion(io, false);
}

export function after(ms: number): IO<never, void> {
  return chain(accessRuntime,
      (runtime) =>
        asyncTotal((callback) =>
          runtime.dispatchLater(() => callback(undefined), ms)
        )
    );
}

export type InterruptMaskCutout<E, A> = FunctionN<[IO<E, A>], IO<E, A>>;

function makeInterruptMaskCutout<E, A>(state: boolean): InterruptMaskCutout<E, A> {
  return (inner) => interruptibleRegion(inner, state);
}

export function uninterruptibleMask<E, A>(f: FunctionN<[InterruptMaskCutout<E, A>], IO<E, A>>): IO<E, A> {
  return chain(accessInterruptible,
      (flag) => uninterruptible(f(makeInterruptMaskCutout(flag)))
  );
}

export function interruptibleMask<E, A>(f: FunctionN<[InterruptMaskCutout<E, A>], IO<E, A>>): IO<E, A> {
  return chain(accessInterruptible,
      (flag) => interruptible(f(makeInterruptMaskCutout(flag)))
  );
}

export function bracketExit<E, A, B>(acquire: IO<E, A>,
                                     release: FunctionN<[A, Exit<E, B>], IO<E, unknown>>,
                                     use: FunctionN<[A], IO<E, B>>): IO<E, B> {
  return uninterruptibleMask<E, B>((cutout) =>
    chain(acquire,
      (a) => pipeOp(a, use, cutout, result, liftChain(
        (exit) => pipeOp(release(a, exit), result, liftChain(
          (finalize) => completed(combineFinalizerExit(exit, finalize))
        ))
      ))
    )
  );
}

export function bracketExitC<E, A>(acquire: IO<E, A>):
  <B>(release: FunctionN<[A, Exit<E, B>], IO<E, unknown>>, use: FunctionN<[A], IO<E, B>>) => IO<E, B> {
  return <B>(release: FunctionN<[A, Exit<E, B>], IO<E, unknown>>, use: FunctionN<[A], IO<E, B>>) =>
    bracketExit(acquire, release, use);
}

function combineFinalizerExit<E, A>(fiberExit: Exit<E, A>, releaseExit: Exit<E, unknown>): Exit<E, A> {
  if (fiberExit._tag === "value" && releaseExit._tag === "value") {
    return fiberExit;
  } else if (fiberExit._tag === "value") {
    return releaseExit as Error<E>;
  } else if (releaseExit._tag === "value") {
    return fiberExit;
  } else {
    // TODO: Figure out how to sanely report both of these, we swallow them currently
    // This would affect chainError (i.e. assume multiples are actually an abort condition that happens to be typed)
    return fiberExit;
  }
}

export function bracket<E, A, B>(acquire: IO<E, A>,
                                 release: FunctionN<[A], IO<E, unknown>>,
                                 use: FunctionN<[A], IO<E, B>>): IO<E, B> {
  return bracketExit(acquire, (e, _) => release(e), use);
}

export function bracketC<E, A>(acquire: IO<E, A>):
<B>(release: FunctionN<[A], IO<E, unknown>>, use: FunctionN<[A], IO<E, B>>) => IO<E, B> {
  return <B>(release: FunctionN<[A], IO<E, unknown>>, use: FunctionN<[A], IO<E, B>>) => bracket(acquire, release, use);
}

export function onComplete<E, A>(ioa: IO<E, A>, finalizer: IO<E, unknown>): IO<E, A> {
  return uninterruptibleMask((cutout) =>
    pipeOp(
      result(cutout(ioa)),
      liftChain((exit) =>
        pipeOp(
          finalizer,
          result,
          liftChain((finalize) =>
            completed(combineFinalizerExit(exit, finalize))
          )
        )
      )
    )
  );
}

export function onInterrupted<E, A>(ioa: IO<E, A>, finalizer: IO<E, unknown>): IO<E, A> {
  return uninterruptibleMask((cutout) =>
    pipeOp(
      result(cutout(ioa)),
      liftChain((exit) =>
        exit._tag === "interrupt" ?
          pipeOp(
            finalizer,
            result,
            liftChain((finalize) =>
              completed(combineFinalizerExit(exit, finalize))
            )
          ) :
          completed(exit)
      )
    )
  );
}

export const shifted: IO<never, void> =
  uninterruptible(chain(accessRuntime, (runtime: Runtime) => // why does this not trigger noImplicitAny
    asyncTotal<void>((callback) => {
      runtime.dispatch(() => callback(undefined));
      // tslint:disable-next-line
      return () => { };
    })
  ));

export function shift<E, A>(io: IO<E, A>): IO<E, A> {
  return applySecond(shifted, io);
}

export const shiftedAsync: IO<never, void> =
  uninterruptible(chain(accessRuntime, (runtime) =>
    asyncTotal<void>((callback) => {
      return runtime.dispatchLater(() => callback(undefined), 0);
    })
  ));

export function shiftAsync<E, A>(io: IO<E, A>): IO<E, A> {
  return applySecond(shiftedAsync, io);
}

export const never: IO<never, never> = asyncTotal((callback) => {
  // tslint:disable-next-line:no-empty
  const handle = setInterval(() => { }, 60000);
  return () => {
    clearInterval(handle);
  };
});

export function delay<E, A>(inner: IO<E, A>, ms: number): IO<E, A> {
  return applySecond(after(ms), inner);
}

export function liftDelay(ms: number): <E, A>(io: IO<E, A>) => IO<E, A> {
  return (io) => delay(io, ms);
}

export function fork<E, A>(io: IO<E, A>, name?: string): IO<never, Fiber<E, A>> {
  return withRuntime((runtime) => shift(makeFiber(io, runtime, name)));
}

export function raceFold<E1, E2, A, B, C>(first: IO<E1, A>, second: IO<E1, B>,
                                          onFirstWon: FunctionN<[Exit<E1, A>, Fiber<E1, B>], IO<E2, C>>,
                                          onSecondWon: FunctionN<[Exit<E1, B>, Fiber<E1, A>], IO<E2, C>>): IO<E2, C> {
  return uninterruptibleMask((cutout) =>
    chain(makeRef<E2>()(false),
      (latch) => chain(makeDeferred<E2, C>(),
        (channel) => chain(fork(first),
          (fiber1) => chain(fork(second),
            (fiber2) => chain(fork(chain(fiber1.wait, completeLatched(latch, channel, onFirstWon, fiber2))),
              (f1_) => chain(fork(chain(fiber2.wait, completeLatched(latch, channel, onSecondWon, fiber1))),
                (f2_) => onInterrupted(cutout(channel.wait), applySecond(fiber1.interrupt, fiber2.interrupt))
              )
            )
          )
        )
      )
    )
  );
}

function completeLatched<E1, E2, A, B, C>(latch: Ref<boolean>,
                                          channel: Deferred<E2, C>,
                                          combine: FunctionN<[Exit<E1, A>, Fiber<E1, B>], IO<E2, C>>,
                                          other: Fiber<E1, B>): FunctionN<[Exit<E1, A>], IO<never, void>> {
  return (exit) =>
    flatten(
      latch.modify((flag) => flag ?
        [unit, flag] as const :
        [channel.from(combine(exit, other)), true] as const)
    );
}

export function timeoutFold<E1, E2, A, B>(source: IO<E1, A>,
                                          ms: number,
                                          onTimeout: FunctionN<[Fiber<E1, A>], IO<E2, B>>,
                                          onCompleted: FunctionN<[Exit<E1, A>], IO<E2, B>>): IO<E2, B> {
  return raceFold(
    source,
    after(ms),
    (exit, delayFiber) => applySecond(delayFiber.interrupt, onCompleted(exit)),
    (_, fiber) => onTimeout(fiber)
  );
}

export function raceFirst<E, A>(io1: IO<E, A>, io2: IO<E, A>): IO<E, A> {
  return raceFold(io1, io2, interruptLoser, interruptLoser);
}

function interruptLoser<E, A>(exit: Exit<E, A>, loser: Fiber<E, A>): IO<E, A> {
  return applySecond(loser.interrupt, completed(exit));
}

export function race<E, A>(io1: IO<E, A>, io2: IO<E, A>): IO<E, A> {
  return raceFold(io1, io2, fallbackToLoser, fallbackToLoser);
}

export function parZipWith<E, A, B, C>(ioa: IO<E, A>, iob: IO<E, B>, f: FunctionN<[A, B], C>): IO<E, C> {
  return raceFold(ioa, iob,
    (aExit, bFiber) => zipWith(completed(aExit), bFiber.join, f),
    (bExit, aFiber) => zipWith(aFiber.join, completed(bExit), f)
  );
}

export function parZip<E, A, B>(ioa: IO<E, A>, iob: IO<E, B>): IO<E, readonly [A, B]> {
  return parZipWith(ioa, iob, tuple2);
}

export function parApplyFirst<E, A, B>(ioa: IO<E, A>, iob: IO<E, B>): IO<E, A> {
  return parZipWith(ioa, iob, fst);
}

export function parApplySecond<E, A, B>(ioa: IO<E, A>, iob: IO<E, B>): IO<E, B> {
  return parZipWith(ioa, iob, snd);
}

export function parAp<E, A, B>(ioa: IO<E, A>, iof: IO<E, FunctionN<[A], B>>): IO<E, B> {
  return parZipWith(ioa, iof, (a, f) => f(a));
}

export function parAp_<E, A, B>(iof: IO<E, FunctionN<[A], B>>, ioa: IO<E, A>): IO<E, B> {
  return parZipWith(iof, ioa, (f, a) => f(a));
}

function fallbackToLoser<E, A>(exit: Exit<E, A>, loser: Fiber<E, A>): IO<E, A> {
  return exit._tag === "value" ?
    applySecond(loser.interrupt, completed(exit)) :
    loser.join;
}

export function timeoutOption<E, A>(source: IO<E, A>, ms: number) {
  return timeoutFold(
    source,
    ms,
    (actionFiber) => applySecond(actionFiber.interrupt, pure(none)),
    (exit) => map(completed(exit), some)
  );
}

export function fromPromise<A>(thunk: Lazy<Promise<A>>): IO<unknown, A> {
  return uninterruptible(async<unknown, A>((callback) => {
    thunk().then((v) => callback(right(v))).catch((e) => callback(left(e)));
    // tslint:disable-next-line
    return () => { };
  }));
}

export function run<E, A>(io: IO<E, A>, callback: FunctionN<[Exit<E, A>], void>): Lazy<void> {
  const driver = makeDriver(io);
  driver.onExit(callback);
  driver.start();
  return driver.interrupt;
}

/**
 * Run an IO returning a promise of the result.
 *
 * The returned promise will resolve with a success value.
 * The returned promies will reject with an E, and unknown, or undefined in the case of raise, abort, or interrupt
 * respectively.
 * The returned promise may never complete if the provided IO never produces a value or error.
 * @param io
 */
export function runToPromise<E, A>(io: IO<E, A>): Promise<A> {
  return new Promise((resolve, reject) =>
    run(io, (exit) => {
      if (exit._tag === "value") {
        resolve(exit.value);
      } else if (exit._tag === "abort") {
        reject(exit.abortedWith);
      } else if (exit._tag === "raise") {
        reject(exit.error);
      } else if (exit._tag === "interrupt") {
        reject();
      }
    })
  );
}

/**
 * Run an IO returning a promise of the Exit
 *
 * The returned promise will never reject.
 * @param io
 */
export function runToPromiseExit<E, A>(io: IO<E, A>): Promise<Exit<E, A>> {
  return new Promise((resolve) => run(io, resolve));
}

function tuple2<A, B>(a: A, b: B): readonly [A, B] {
  return [a, b] as const;
}

function fst<A, B>(a: A, _: B): A {
  return a;
}

function snd<A, B>(_: A, b: B): B {
  return b;
}

export const URI = "IO";
export type URI = typeof URI;
declare module "fp-ts/lib/HKT" {
  interface URI2HKT2<L, A> {
    IO: IO<L, A>;
  }
}
export const instances: Monad2<URI> = {
  URI,
  map,
  of: pure,
  ap: ap_,
  chain
} as const;

export const parInstances: Applicative2<URI> = {
  URI,
  map,
  of: pure,
  ap: parAp_
} as const;
