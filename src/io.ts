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

import { Applicative3 } from "fp-ts/lib/Applicative";
import { Either, left, right } from "fp-ts/lib/Either";
import { constant, flow, FunctionN, identity, Lazy } from "fp-ts/lib/function";
import { Monad3 } from "fp-ts/lib/Monad";
import { none, some, Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { Deferred, makeDeferred } from "./deferred";
import { makeDriver } from "./driver";
import { Cause, Exit } from "./exit";
import * as ex from "./exit";
import { Fiber, makeFiber } from "./fiber";
import { makeRef, Ref } from "./ref";
import { Runtime } from "./runtime";

export type DefaultR = {}

// Some utilities
function tuple2<A, B>(a: A, b: B): readonly [A, B] {
    return [a, b] as const;
}

function fst<A>(a: A): A { // eslint-disable-line no-unused-vars
    return a;
}

function snd<A, B>(_: A, b: B): B {
    return b;
}

/**
 * A description of an effect to perform
 */
export type IO<R, E, A> =
  Pure<A> |
  Raised<E> |
  Completed<E, A> |
  Suspended<R, E, A> |
  Async<E, A> |
  Chain<R, E, any, A> | // eslint-disable-line @typescript-eslint/no-explicit-any
  AccessEnv<R> |
  ProvideEnv<any, E, A> | // eslint-disable-line @typescript-eslint/no-explicit-any
  Collapse<R, any, E, any, A> | // eslint-disable-line @typescript-eslint/no-explicit-any
  InterruptibleRegion<R, E, A> |
  (boolean extends A ? AccessInterruptible : never) |
  (Runtime extends A ? AccessRuntime : never);

export interface Pure<A> {
    readonly _tag: "pure";
    readonly value: A;
}

/**
 * Create an IO that succeeds immediately with a value
 * @param a the value
 */
export function pure<A>(a: A): Pure<A> {
    return {
        _tag: "pure",
        value: a
    };
}

export interface Raised<E> {
    readonly _tag: "raised";
    readonly error: Cause<E>;
}

/**
 * Create an IO that fails immediately with some Cause
 * @param e
 */
export function raised<E>(e: Cause<E>): Raised<E> {
    return {_tag: "raised", error: e};
}

/**
 * Create an IO that fails immediately with an error
 * @param e
 */
export function raiseError<E>(e: E): Raised<E> {
    return raised(ex.raise(e));
}

/**
 * Creates an IO that fails immediately with an abort
 * @param u
 */
export function raiseAbort(u: unknown): Raised<never> {
    return raised(ex.abort(u));
}

/**
 * An IO that is already interrupted
 */
export const raiseInterrupt: Raised<never> = raised(ex.interrupt);

export interface Completed<E, A> {
    readonly _tag: "completed";
    readonly exit: Exit<E, A>;
}

/**
 * Create an IO that completes immediately with the provided exit status
 * @param exit
 */
export function completed<E, A>(exit: Exit<E, A>): Completed<E, A> {
    return {
        _tag: "completed",
        exit
    };
}

export interface Suspended<R, E, A> {
    readonly _tag: "suspended";
    readonly thunk: Lazy<IO<R, E, A>>;
}

/**
 * Wrap a block of impure code in an IO.
 *
 * When evaluated this IO will run thunk to produce the next IO to execute.
 * @param thunk
 */
export function suspended<R, E, A>(thunk: Lazy<IO<R, E, A>>): Suspended<R, E, A> {
    return {
        _tag: "suspended",
        thunk
    };
}

/**
 * Wrap a block of impure code in an IO
 *
 * When evaluated the created IO will produce the value produced by the thunk
 * @param thunk
 */
export function sync<A>(thunk: Lazy<A>): Suspended<DefaultR, never, A> {
    return suspended(() => pure(thunk()));
}

export interface Async<E, A> {
    readonly _tag: "async";
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
export function async<E, A>(op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>): Async<E, A> {
    return {
        _tag: "async",
        op
    };
}

/**
 * Wrap an impure callback in IO
 *
 * This is a variant of async where the effect cannot fail.
 * @param op
 */
export function asyncTotal<A>(op: FunctionN<[FunctionN<[A], void>], Lazy<void>>): Async<never, A> {
    return async((callback) => op((a) => callback(right(a))));
}

export interface InterruptibleRegion<R, E, A> {
    readonly _tag: "interrupt-region";
    readonly inner: IO<R, E, A>;
    readonly flag: boolean;
}

/**
 * Demarcate a region of interruptible state
 * @param inner
 * @param flag
 */
export function interruptibleRegion<R, E, A>(inner: IO<R, E, A>, flag: boolean): InterruptibleRegion<R, E, A> {
    return {
        _tag: "interrupt-region",
        inner,
        flag
    };
}

export interface Chain<R, E, Z, A> {
    readonly _tag: "chain";
    readonly inner: IO<R, E, Z>;
    readonly bind: FunctionN<[Z], IO<R, E, A>>;
}

/**
 * Produce an new IO that will use the value produced by inner to produce the next IO to evaluate
 * @param inner
 * @param bind
 */
export function chain<R, E, Z, A>(inner: IO<R, E, Z>, bind: FunctionN<[Z], IO<R, E, A>>): Chain<R, E, Z, A> {
    return {
        _tag: "chain",
        inner,
        bind
    };
}

export interface AccessEnv<R> {
    readonly _tag: "read";
}

export function accessEnv<R>(): IO<R, never, R> {
    return { _tag: "read" }
}

export interface ProvideEnv<R, E, A> {
    readonly _tag: "provide";
    readonly r: R;
    readonly inner: IO<R, E, A>
}

export function provideEnv<R, E, A>(r: R, io: IO<R, E, A>): IO<DefaultR, E, A> {
    return {
        _tag: "provide",
        r,
        inner: io
    } as ProvideEnv<R, E, A>;
}

/**
 * Flatten a nested IO
 *
 * @param inner
 */
export function flatten<R, E, A>(inner: IO<R, E, IO<R, E, A>>): IO<R, E, A> {
    return chain(inner, identity);
}

export function chainWith<R, E, Z, A>(bind: FunctionN<[Z], IO<R, E, A>>): FunctionN<[IO<R, E, Z>], Chain<R, E, Z, A>> {
    return (io) => chain(io, bind);
}

export interface Collapse<R, E1, E2, A1, A2> {
    readonly _tag: "collapse";
    readonly inner: IO<R, E1, A1>;
    readonly failure: FunctionN<[Cause<E1>], IO<R, E2, A2>>;
    readonly success: FunctionN<[A1], IO<R, E2, A2>>;
}

export function foldExit<R, E1, E2, A1, A2>(inner: IO<R, E1, A1>,
    failure: FunctionN<[Cause<E1>], IO<R, E2, A2>>,
    success: FunctionN<[A1], IO<R, E2, A2>>): Collapse<R, E1, E2, A1, A2> {
    return {
        _tag: "collapse",
        inner,
        failure,
        success
    };
}

export function foldExitWith<R, E1, E2, A1, A2>(failure: FunctionN<[Cause<E1>], IO<R, E2, A2>>,
    success: FunctionN<[A1], IO<R, E2, A2>>):
    FunctionN<[IO<R, E1, A1>], Collapse<R, E1, E2, A1, A2>> {
    return (io) => foldExit(io, failure, success);
}

export interface AccessInterruptible {
    readonly _tag: "access-interruptible";
}

// These must be typed to IO or we end up with an IO<never, any>
export const accessInterruptible: IO<DefaultR, never, boolean> = { _tag: "access-interruptible" };

export interface AccessRuntime {
    readonly _tag: "access-runtime";
}

// These must be typed to IO or we end up with an IO<never, any>
export const accessRuntime: IO<DefaultR, never, Runtime> = { _tag: "access-runtime" };

export function withRuntime<R, E, A>(f: FunctionN<[Runtime], IO<R, E, A>>): IO<R, E, A> {
    return chain(accessRuntime, f);
}

/**
 * Map the value produced by an IO
 * @param io
 * @param f
 */
export function map<R, E, A, B>(io: IO<R, E, A>, f: FunctionN<[A], B>): IO<R, E, B> {
    return chain(io, flow(f, pure));
}

/**
 * Lift a function on values to a function on IOs
 * @param f
 */
export function lift<A, B>(f: FunctionN<[A], B>): <R, E>(io: IO<R, E, A>) => IO<R, E, B> {
    return <R, E>(io: IO<R, E, A>) => map(io, f);
}

/**
 * Map the value produced by an IO to the constant b
 * @param io
 * @param b
 */
export function as<R, E, A, B>(io: IO<R, E, A>, b: B): IO<R, E, B> {
    return map(io, constant(b));
}

/**
 * @param b
 */
export function liftAs<B>(b: B): <R, E, A>(io: IO<R, E, A>) => IO<R, E, B> {
    return <R, E, A>(io: IO<R, E, A>) => as(io, b);
}

/**
 * Map the value produced by an IO to undefined
 * @param io
 */
export function asUnit<R, E, A>(io: IO<R, E, A>): IO<R, E, void> {
    return as<R, E, A, void>(io, undefined);
}

/**
 * An IO that succeeds immediately with undefineds
 */
export const unit: IO<DefaultR, never, void> = pure(undefined);

/**
 * Produce an new IO that will use the error produced by inner to produce a recovery program
 * @param io
 * @param f
 */
export function chainError<R, E1, E2, A>(io: IO<R, E1, A>, f: FunctionN<[E1], IO<R, E2, A>>): IO<R, E2, A> {
    return foldExit(io,
        (cause) => cause._tag === "raise" ? f(cause.error) : completed(cause),
        pure
    );
}

/**
 * Data last form of chainError
 * @param f
 */
export function chainErrorWith<R, E1, E2, A>(f: FunctionN<[E1], IO<R, E2, A>>): FunctionN<[IO<R, E1, A>], IO<R, E2, A>> {
    return (io) => chainError(io, f);
}

/**
 * Map the error produced by an IO
 * @param io
 * @param f
 */
export function mapError<R, E1, E2, A>(io: IO<R, E1, A>, f: FunctionN<[E1], E2>): IO<R, E2, A> {
    return chainError(io, flow(f, raiseError));
}

/**
 * Lift a function on error values to a function on IOs
 * @param f
 */
export function mapErrorWith<R, E1, E2>(f: FunctionN<[E1], E2>): <A>(io: IO<R, E1, A>) => IO<R, E2, A> {
    return <A>(io: IO<R, E1, A>) => mapError(io, f);
}

/**
 * Map over either the error or value produced by an IO
 * @param io
 * @param leftMap
 * @param rightMap
 */
export function bimap<R, E1, E2, A, B>(io: IO<R, E1, A>,
    leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): IO<R, E2, B> {
    return foldExit(io,
        (cause) => cause._tag === "raise" ? raiseError(leftMap(cause.error)) : completed(cause),
        flow(rightMap, pure)
    );
}

/**
 * Data last form of bimap
 * @param leftMap
 * @param rightMap
 */
export function bimapWith<R, E1, E2, A, B>(leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): FunctionN<[IO<R, E1, A>], IO<R, E2, B>> {
    return (io) => bimap(io, leftMap, rightMap);
}

/**
 * Zip the result of two IOs together using the provided function
 * @param first
 * @param second
 * @param f
 */
export function zipWith<R, E, A, B, C>(first: IO<R, E, A>, second: IO<R, E, B>, f: FunctionN<[A, B], C>): IO<R, E, C> {
    return chain(first, (a) =>
        map(second, (b) => f(a, b))
    );
}

/**
 * Zip the result of two IOs together into a tuple type
 * @param first
 * @param second
 */
export function zip<R, E, A, B>(first: IO<R, E, A>, second: IO<R, E, B>): IO<R, E, readonly [A, B]> {
    return zipWith(first, second, tuple2);
}

/**
 * Evaluate two IOs in sequence and produce the value produced by the first
 * @param first
 * @param second
 */
export function applyFirst<R, E, A, B>(first: IO<R, E, A>, second: IO<R, E, B>): IO<R, E, A> {
    return zipWith(first, second, fst);
}

/**
 * Curried form of applyFirst.
 * @param first 
 */
export function applyThis<R, E, A>(first: IO<R, E, A>): <B>(second: IO<R, E, B>) => IO<R, E, A> {
    return <B>(second: IO<R, E, B>) => applyFirst(first, second);
}

/**
 * Evaluate two IOs in sequence and produce the value produced by the second
 * @param first 
 * @param second 
 */
export function applySecond<R, E, A, B>(first: IO<R, E, A>, second: IO<R, E, B>): IO<R, E, B> {
    return zipWith(first, second, snd);
}

/**
 * Curried form of applySecond
 * @param first
 */
export function applyOther<R, E, A>(first: IO<R, E, A>): <B>(second: IO<R, E, B>) => IO<R, E, B> {
    return <B>(second: IO<R, E, B>) => applySecond(first, second);
}

/**
 * Applicative ap
 * @param ioa 
 * @param iof 
 */
export function ap<R, E, A, B>(ioa: IO<R, E, A>, iof: IO<R, E, FunctionN<[A], B>>): IO<R, E, B> {
    // Find the apply/thrush operator I'm sure exists in fp-ts somewhere
    return zipWith(ioa, iof, (a, f) => f(a));
}

/**
 * Curried form of ap
 * @param ioa 
 */
export function apWith<R, E, A>(ioa: IO<R, E, A>): <B>(iof: IO<R, E, FunctionN<[A], B>>) => IO<R, E, B> {
    return <B>(iof: IO<R, E, FunctionN<[A], B>>) => ap(ioa, iof);
}

export function ap_<R, E, A, B>(iof: IO<R, E, FunctionN<[A], B>>, ioa: IO<R, E, A>): IO<R, E, B> {
    return zipWith(iof, ioa, (f, a) => f(a));
}

export function apWith_<R, E, A, B>(iof: IO<R, E, FunctionN<[A], B>>): FunctionN<[IO<R, E, A>], IO<R, E, B>> {
    return (io) => ap_(iof, io);
}

/**
 * Flip the error and success channels in an IO
 * @param io 
 */
export function flip<R, E, A>(io: IO<R, E, A>): IO<R, A, E> {
    return foldExit(
        io,
        (error) => error._tag === "raise" ? pure(error.error) : completed(error),
        raiseError
    );
}

/**
 * Create an IO that takes does not fail with a checked exception but produces an exit status.
 * @param io 
 */
export function result<R, E, A>(io: IO<R, E, A>): IO<R, never, Exit<E, A>> {
    return foldExit<R, E, never, A, Exit<E, A>>(
        io,
        pure,
        flow(ex.done, pure)
    );
}

export function resultE<R, E, A>(io: IO<R, E, A>): IO<R, E, Exit<E, A>> {
    return result(io);
}

export function interruptible<R, E, A>(io: IO<R, E, A>): IO<R, E, A> {
    return interruptibleRegion(io, true);
}

export function uninterruptible<R, E, A>(io: IO<R, E, A>): IO<R, E, A> {
    return interruptibleRegion(io, false);
}

export function after(ms: number): IO<DefaultR, never, void> {
    return chain(accessRuntime,
        (runtime) =>
            asyncTotal((callback) =>
                runtime.dispatchLater(() => callback(undefined), ms)
            )
    );
}

export type InterruptMaskCutout<R, E, A> = FunctionN<[IO<R, E, A>], IO<R, E, A>>;

function makeInterruptMaskCutout<R, E, A>(state: boolean): InterruptMaskCutout<R, E, A> {
    return (inner) => interruptibleRegion(inner, state);
}

export function uninterruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], IO<R, E, A>>): IO<R, E, A> {
    return chain(accessInterruptible,
        (flag) => uninterruptible(f(makeInterruptMaskCutout(flag)))
    );
}

export function interruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], IO<R, E, A>>): IO<R, E, A> {
    return chain(accessInterruptible,
        (flag) => interruptible(f(makeInterruptMaskCutout(flag)))
    );
}

function combineFinalizerExit<E, A>(fiberExit: Exit<E, A>, releaseExit: Exit<E, unknown>): Exit<E, A> {
    if (fiberExit._tag === "value" && releaseExit._tag === "value") {
        return fiberExit;
    } else if (fiberExit._tag === "value") {
        return releaseExit as Cause<E>;
    } else if (releaseExit._tag === "value") {
        return fiberExit;
    } else {
    // TODO: Figure out how to sanely report both of these, we swallow them currently
    // This would affect chainError (i.e. assume multiples are actually an abort condition that happens to be typed)
        return fiberExit;
    }
}

export function bracketExit<R, E, A, B>(acquire: IO<R, E, A>,
    release: FunctionN<[A, Exit<E, B>], IO<R, E, unknown>>,
    use: FunctionN<[A], IO<R, E, B>>): IO<R, E, B> {
    return uninterruptibleMask<R, E, B>((cutout) =>
        chain(acquire,
            (a) => pipe(a, use, cutout, result, chainWith(
                (exit) => pipe(release(a, exit), result, chainWith(
                    (finalize) => completed(combineFinalizerExit(exit, finalize))
                ))
            ))
        )
    );
}

export function bracket<R, E, A, B>(acquire: IO<R, E, A>,
    release: FunctionN<[A], IO<R, E, unknown>>,
    use: FunctionN<[A], IO<R, E, B>>): IO<R, E, B> {
    return bracketExit(acquire, (e) => release(e), use);
}

export function onComplete<R, E, A>(ioa: IO<R, E, A>, finalizer: IO<R, E, unknown>): IO<R, E, A> {
    return uninterruptibleMask((cutout) =>
        pipe(
            result(cutout(ioa)),
            chainWith((exit) =>
                pipe(
                    finalizer,
                    result,
                    chainWith((finalize) =>
                        completed(combineFinalizerExit(exit, finalize))
                    )
                )
            )
        )
    );
}

export function onInterrupted<R, E, A>(ioa: IO<R, E, A>, finalizer: IO<R, E, unknown>): IO<R, E, A> {
    return uninterruptibleMask((cutout) =>
        pipe(
            result(cutout(ioa)),
            chainWith((exit) =>
                exit._tag === "interrupt" ?
                    pipe(
                        finalizer,
                        result,
                        chainWith((finalize) =>
                            completed(combineFinalizerExit(exit, finalize))
                        )
                    ) :
                    completed(exit)
            )
        )
    );
}

export const shifted: IO<DefaultR, never, void> =
  uninterruptible(chain(accessRuntime, (runtime: Runtime) => // why does this not trigger noImplicitAny
      asyncTotal<void>((callback) => {
          runtime.dispatch(() => callback(undefined));
          // tslint:disable-next-line
          return () => { };
      })
  ));

export function shift<R, E, A>(io: IO<R, E, A>): IO<R, E, A> {
    return applySecond(shifted, io);
}

export const shiftedAsync: IO<DefaultR, never, void> =
  uninterruptible(chain(accessRuntime, (runtime) =>
      asyncTotal<void>((callback) => {
          return runtime.dispatchLater(() => callback(undefined), 0);
      })
  ));

export function shiftAsync<R, E, A>(io: IO<R, E, A>): IO<R, E, A> {
    return applySecond(shiftedAsync, io);
}

export const never: IO<DefaultR, never, never> = asyncTotal(() => {
    // tslint:disable-next-line:no-empty
    const handle = setInterval(() => { }, 60000);
    return () => {
        clearInterval(handle);
    };
});

export function delay<R, E, A>(inner: IO<R, E, A>, ms: number): IO<R, E, A> {
    return applySecond(after(ms), inner);
}

export function liftDelay(ms: number): <R, E, A>(io: IO<R, E, A>) => IO<R, E, A> {
    return (io) => delay(io, ms);
}

export function fork<R, E, A>(io: IO<R, E, A>, name?: string): IO<R, never, Fiber<E, A>> {
    return withRuntime((runtime) => shift(makeFiber(io, runtime, name)));
}

function completeLatched<R, E1, E2, A, B, C>(latch: Ref<boolean>,
    channel: Deferred<E2, C>,
    combine: FunctionN<[Exit<E1, A>, Fiber<E1, B>], IO<R, E2, C>>,
    other: Fiber<E1, B>): FunctionN<[Exit<E1, A>], IO<R, never, void>> {
    return (exit) =>
        flatten(
            latch.modify((flag) => flag ?
                [unit, flag] as const :
                [channel.from(combine(exit, other)), true] as const)
        );
}

export function raceFold<R, E1, E2, A, B, C>(first: IO<R, E1, A>, second: IO<R, E1, B>,
    onFirstWon: FunctionN<[Exit<E1, A>, Fiber<E1, B>], IO<R, E2, C>>,
    onSecondWon: FunctionN<[Exit<E1, B>, Fiber<E1, A>], IO<R, E2, C>>): IO<R, E2, C> {
    return uninterruptibleMask((cutout) =>
        chain(makeRef<E2>()(false),
            (latch) => chain(makeDeferred<E2, C>(),
                (channel) => chain(fork(first),
                    (fiber1) => chain(fork(second),
                        (fiber2) => chain(fork(chain(fiber1.wait, completeLatched(latch, channel, onFirstWon, fiber2))),
                            () => chain(fork(chain(fiber2.wait, completeLatched(latch, channel, onSecondWon, fiber1))),
                                () => onInterrupted(cutout(channel.wait), applySecond(fiber1.interrupt, fiber2.interrupt))
                            )
                        )
                    )
                )
            )
        )
    );
}

export function timeoutFold<R, E1, E2, A, B>(source: IO<R, E1, A>,
    ms: number,
    onTimeout: FunctionN<[Fiber<E1, A>], IO<R, E2, B>>,
    onCompleted: FunctionN<[Exit<E1, A>], IO<R, E2, B>>): IO<R, E2, B> {
    return raceFold(
        source,
        after(ms),
        (exit, delayFiber) => applySecond(delayFiber.interrupt, onCompleted(exit)),
        (_, fiber) => onTimeout(fiber)
    );
}

function interruptLoser<R, E, A>(exit: Exit<E, A>, loser: Fiber<E, A>): IO<R, E, A> {
    return applySecond(loser.interrupt, completed(exit));
}

export function raceFirst<R, E, A>(io1: IO<R, E, A>, io2: IO<R, E, A>): IO<R, E, A> {
    return raceFold(io1, io2, interruptLoser, interruptLoser);
}


function fallbackToLoser<R, E, A>(exit: Exit<E, A>, loser: Fiber<E, A>): IO<R, E, A> {
    return exit._tag === "value" ?
        applySecond(loser.interrupt, completed(exit)) :
        loser.join;
}

export function race<R, E, A>(io1: IO<R, E, A>, io2: IO<R, E, A>): IO<R, E, A> {
    return raceFold(io1, io2, fallbackToLoser, fallbackToLoser);
}

/**
 * Zip the result of 2 ios executed in parallel together with the provided function.
 * @param ioa 
 * @param iob 
 * @param f 
 */
export function parZipWith<R, E, A, B, C>(ioa: IO<R, E, A>, iob: IO<R, E, B>, f: FunctionN<[A, B], C>): IO<R, E, C> {
    return raceFold(ioa, iob,
        (aExit, bFiber) => zipWith(completed(aExit), bFiber.join, f),
        (bExit, aFiber) => zipWith(aFiber.join, completed(bExit), f)
    );
}

/**
 * Tuple the result of 2 ios executed in parallel
 * @param ioa 
 * @param iob 
 */
export function parZip<R, E, A, B>(ioa: IO<R, E, A>, iob: IO<R, E, B>): IO<R, E, readonly [A, B]> {
    return parZipWith(ioa, iob, tuple2);
}

/**
 * Execute two ios in parallel and take the result of the first.
 * @param ioa 
 * @param iob 
 */
export function parApplyFirst<R, E, A, B>(ioa: IO<R, E, A>, iob: IO<R, E, B>): IO<R, E, A> {
    return parZipWith(ioa, iob, fst);
}

export function parApplySecond<R, E, A, B>(ioa: IO<R, E, A>, iob: IO<R, E, B>): IO<R, E, B> {
    return parZipWith(ioa, iob, snd);
}

export function parAp<R, E, A, B>(ioa: IO<R, E, A>, iof: IO<R, E, FunctionN<[A], B>>): IO<R, E, B> {
    return parZipWith(ioa, iof, (a, f) => f(a));
}

export function parAp_<R, E, A, B>(iof: IO<R, E, FunctionN<[A], B>>, ioa: IO<R, E, A>): IO<R, E, B> {
    return parZipWith(iof, ioa, (f, a) => f(a));
}

export function timeoutOption<R, E, A>(source: IO<R, E, A>, ms: number): IO<R, E, Option<A>> {
    return timeoutFold(
        source,
        ms,
        (actionFiber) => applySecond(actionFiber.interrupt, pure(none)),
        (exit) => map(completed(exit), some)
    );
}

export function fromPromise<A>(thunk: Lazy<Promise<A>>): IO<DefaultR, unknown, A> {
    return uninterruptible(async<unknown, A>((callback) => {
        thunk().then((v) => callback(right(v))).catch((e) => callback(left(e)));
        // tslint:disable-next-line
        return () => { };
    }));
}

export function runR<R, E, A>(io: IO<R, E, A>, r: R, callback: FunctionN<[Exit<E, A>], void>): Lazy<void> {
    const driver = makeDriver<R, E, A>();
    driver.onExit(callback);
    driver.start(r, io);
    return driver.interrupt;
}

export function run<E, A>(io: IO<DefaultR, E, A>, callback: FunctionN<[Exit<E, A>], void>): Lazy<void> {
    return runR(io, {}, callback);
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
export function runToPromise<E, A>(io: IO<DefaultR, E, A>): Promise<A> {
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
 * Run an IO and return a Promise of its result
 * 
 * Allows providing an environment parameter directly
 * @param io 
 * @param r 
 */
export function runToPromiseR<R, E, A>(io: IO<R, E, A>, r: R): Promise<A> {
    return new Promise((resolve, reject) =>
        runR(io, r, (exit) => {
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
export function runToPromiseExit<E, A>(io: IO<DefaultR, E, A>): Promise<Exit<E, A>> {
    return new Promise((resolve) => run(io, resolve));
}

/**
 * Run an IO returning a promise of an Exit. 
 * 
 * The Promise will not reject.
 * Allows providing an environment parameter directly
 * @param io 
 * @param r 
 */
export function runToPromiseExitR<R, E, A>(io: IO<R, E, A>, r: R): Promise<Exit<E, A>> {
    return new Promise((result) => runR(io, r, result))
}

export const URI = "IO";
export type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
    interface URItoKind3<R, E, A> {
        IO: IO<R, E, A>;
    }
}

export const instances: Monad3<URI> = {
    URI,
    map,
    of: pure,
    ap: ap_,
    chain
} as const;

export const parInstances: Applicative3<URI> = {
    URI,
    map,
    of: pure,
    ap: parAp_
} as const;
