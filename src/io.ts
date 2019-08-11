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
import { Applicative3 } from "fp-ts/lib/Applicative";
import { Either, left, right } from "fp-ts/lib/Either";
import * as either from "fp-ts/lib/Either";
import { constant, flow, FunctionN, identity, Lazy } from "fp-ts/lib/function";
import { Monad3 } from "fp-ts/lib/Monad";
import { none, some, Option } from "fp-ts/lib/Option";
import * as option from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { Deferred, makeDeferred } from "./deferred";
import { makeDriver } from "./driver";
import { Cause, Exit } from "./exit";
import * as ex from "./exit";
import { Fiber, makeFiber } from "./fiber";
import { makeRef, Ref } from "./ref";
import { Runtime } from "./runtime";
import { MonadThrow3 } from "fp-ts/lib/MonadThrow";

export type DefaultR = {}; // eslint-disable-line @typescript-eslint/prefer-interface

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
export type RIO<R, E, A> =
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

export type IO<E, A> = RIO<DefaultR, E, A>;

export interface Pure<A> {
    readonly _tag: "pure";
    readonly value: A;
}

/**
 * An IO has succeeded
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
 * An IO that is failed
 * 
 * Prefer raiseError or raiseAbort
 * @param e
 */
export function raised<E>(e: Cause<E>): Raised<E> {
    return { _tag: "raised", error: e };
}

/**
 * An IO that is failed with a checked error
 * @param e
 */
export function raiseError<E>(e: E): Raised<E> {
    return raised(ex.raise(e));
}

/**
 * An IO that is failed with an unchecked error
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
 * An IO that is completed with the given exit
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
    readonly thunk: Lazy<RIO<R, E, A>>;
}

/**
 * Wrap a block of impure code that returns an IO into an IO
 *
 * When evaluated this IO will run the given thunk to produce the next IO to execute.
 * @param thunk
 */
export function suspended<R, E, A>(thunk: Lazy<RIO<R, E, A>>): Suspended<R, E, A> {
    return {
        _tag: "suspended",
        thunk
    };
}

/**
 * Wrap a block of impure code in an IO
 *
 * When evaluated the this will produce a value or throw
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
 * This is a variant of async where the effect cannot fail with a checked exception.
 * @param op
 */
export function asyncTotal<A>(op: FunctionN<[FunctionN<[A], void>], Lazy<void>>): Async<never, A> {
    return async((callback) => op((a) => callback(right(a))));
}

export interface InterruptibleRegion<R, E, A> {
    readonly _tag: "interrupt-region";
    readonly inner: RIO<R, E, A>;
    readonly flag: boolean;
}

/**
 * Demarcate a region of interruptible state
 * @param inner
 * @param flag
 */
export function interruptibleRegion<R, E, A>(inner: RIO<R, E, A>, flag: boolean): InterruptibleRegion<R, E, A> {
    return {
        _tag: "interrupt-region",
        inner,
        flag
    };
}

export interface Chain<R, E, Z, A> {
    readonly _tag: "chain";
    readonly inner: RIO<R, E, Z>;
    readonly bind: FunctionN<[Z], RIO<R, E, A>>;
}

/**
 * Produce an new IO that will use the value produced by inner to produce the next IO to evaluate
 * @param inner
 * @param bind
 */
export function chain<R, E, Z, A>(inner: RIO<R, E, Z>, bind: FunctionN<[Z], RIO<R, E, A>>): Chain<R, E, Z, A> {
    return {
        _tag: "chain",
        inner,
        bind
    };
}

export interface AccessEnv<R> {
    readonly _tag: "read";
}

/**
 * Create an IO that accesses its environment
 */
export function accessEnv<R>(): RIO<R, never, R> {
    return { _tag: "read" }
}

export interface ProvideEnv<R, E, A> {
    readonly _tag: "provide";
    readonly r: R;
    readonly inner: RIO<R, E, A>;
}

/**
 * Lift a function from R => IO<E, A> to a RIO<R, E, A>
 * @param f 
 */
export function encaseRIO<R, E, A>(f: FunctionN<[R], IO<E, A>>): RIO<R, E, A> {
    return chain(accessEnv<R>(), f);
}

/**
 * Lift an Either into an IO
 * @param e 
 */
export function encaseEither<E, A>(e: Either<E, A>): IO<E, A> {
    return pipe(e, either.fold<E, A, IO<E, A>>(raiseError, pure));
}

/**
 * Lift an Option into an IO
 * @param o 
 * @param onError 
 */
export function encaseOption<E, A>(o: Option<A>, onError: Lazy<E>): IO<E, A> {
    return pipe(o, 
        option.map<A, IO<E, A>>(pure), 
        option.getOrElse<IO<E, A>>(() => raiseError(onError())));
}

/**
 * Provide an environment to an RIO. 
 * 
 * This eliminates the dependency on the specific R of the input. 
 * Instead, the resulting IO has an R parameter of DefaultR
 * @param r 
 * @param io 
 */
export function provideEnv<R, E, A>(r: R, io: RIO<R, E, A>): RIO<DefaultR, E, A> {
    return {
        _tag: "provide",
        r,
        inner: io
    };
}

/**
 * Manipulate an IO by producing its environment from an IO in different environment such that it may execute in that other environment
 * @param contra 
 * @param io 
 */
export function contramapEnvM<R1, R2, E, A>(contra: RIO<R1, E, R2>, io: RIO<R2, E, A>): RIO<R1, E, A> {
    return chain(contra, (r2) => provideEnv(r2, io));
}

/**
 * Manipulate an IO with by producing its environment from a different one
 * @param f 
 * @param io 
 */
export function contramapEnv<R1, R2, E, A>(f: FunctionN<[R1], R2>, io: RIO<R2, E, A>): RIO<R1, E, A> {
    return contramapEnvM(encaseRIO((r1) => pure(f(r1))), io);
}


/**
 * Flatten a nested IO
 *
 * @param inner
 */
export function flatten<R, E, A>(inner: RIO<R, E, RIO<R, E, A>>): RIO<R, E, A> {
    return chain(inner, identity);
}

/**
 * Curried function first form of chain
 * @param bind 
 */
export function chainWith<R, E, Z, A>(bind: FunctionN<[Z], RIO<R, E, A>>): FunctionN<[RIO<R, E, Z>], Chain<R, E, Z, A>> {
    return (io) => chain(io, bind);
}

export interface Collapse<R, E1, E2, A1, A2> {
    readonly _tag: "collapse";
    readonly inner: RIO<R, E1, A1>;
    readonly failure: FunctionN<[Cause<E1>], RIO<R, E2, A2>>;
    readonly success: FunctionN<[A1], RIO<R, E2, A2>>;
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
export function foldExit<R, E1, E2, A1, A2>(inner: RIO<R, E1, A1>,
    failure: FunctionN<[Cause<E1>], RIO<R, E2, A2>>,
    success: FunctionN<[A1], RIO<R, E2, A2>>): Collapse<R, E1, E2, A1, A2> {
    return {
        _tag: "collapse",
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
export function foldExitWith<R, E1, E2, A1, A2>(failure: FunctionN<[Cause<E1>], RIO<R, E2, A2>>,
    success: FunctionN<[A1], RIO<R, E2, A2>>):
    FunctionN<[RIO<R, E1, A1>], Collapse<R, E1, E2, A1, A2>> {
    return (io) => foldExit(io, failure, success);
}

export interface AccessInterruptible {
    readonly _tag: "access-interruptible";
}

/**
 * Get the interruptible state of the current fiber
 */
export const accessInterruptible: RIO<DefaultR, never, boolean> = { _tag: "access-interruptible" };

export interface AccessRuntime {
    readonly _tag: "access-runtime";
}

/**
 * Get the runtime of the current fiber
 */
export const accessRuntime: RIO<DefaultR, never, Runtime> = { _tag: "access-runtime" };

/**
 * Access the runtime then provide it to the provided function
 * @param f 
 */
export function withRuntime<R, E, A>(f: FunctionN<[Runtime], RIO<R, E, A>>): RIO<R, E, A> {
    return chain(accessRuntime, f);
}

/**
 * Map the value produced by an IO
 * @param io
 * @param f
 */
export function map<R, E, A, B>(io: RIO<R, E, A>, f: FunctionN<[A], B>): RIO<R, E, B> {
    return chain(io, flow(f, pure));
}

/**
 * Lift a function on values to a function on IOs
 * @param f
 */
export function lift<A, B>(f: FunctionN<[A], B>): <R, E>(io: RIO<R, E, A>) => RIO<R, E, B> {
    return <R, E>(io: RIO<R, E, A>) => map(io, f);
}

/**
 * Map the value produced by an IO to the constant b
 * @param io
 * @param b
 */
export function as<R, E, A, B>(io: RIO<R, E, A>, b: B): RIO<R, E, B> {
    return map(io, constant(b));
}

/**
 * Curried form of as
 * @param b
 */
export function liftAs<B>(b: B): <R, E, A>(io: RIO<R, E, A>) => RIO<R, E, B> {
    return <R, E, A>(io: RIO<R, E, A>) => as(io, b);
}

/**
 * Map the value produced by an IO to void
 * @param io
 */
export function asUnit<R, E, A>(io: RIO<R, E, A>): RIO<R, E, void> {
    return as<R, E, A, void>(io, undefined);
}

/**
 * An IO that succeeds immediately with void
 */
export const unit: RIO<DefaultR, never, void> = pure(undefined);

/**
 * Produce an new IO that will use the error produced by inner to produce a recovery program
 * @param io
 * @param f
 */
export function chainError<R, E1, E2, A>(io: RIO<R, E1, A>, f: FunctionN<[E1], RIO<R, E2, A>>): RIO<R, E2, A> {
    return foldExit(io,
        (cause) => cause._tag === "raise" ? f(cause.error) : completed(cause),
        pure
    );
}

/**
 * Curriend form of chainError
 * @param f
 */
export function chainErrorWith<R, E1, E2, A>(f: FunctionN<[E1], RIO<R, E2, A>>): FunctionN<[RIO<R, E1, A>], RIO<R, E2, A>> {
    return (io) => chainError(io, f);
}

/**
 * Map the error produced by an IO
 * @param io
 * @param f
 */
export function mapError<R, E1, E2, A>(io: RIO<R, E1, A>, f: FunctionN<[E1], E2>): RIO<R, E2, A> {
    return chainError(io, flow(f, raiseError));
}

/**
 * Curried form of mapError
 * @param f
 */
export function mapErrorWith<R, E1, E2>(f: FunctionN<[E1], E2>): <A>(io: RIO<R, E1, A>) => RIO<R, E2, A> {
    return <A>(io: RIO<R, E1, A>) => mapError(io, f);
}

/**
 * Map over either the error or value produced by an IO
 * @param io
 * @param leftMap
 * @param rightMap
 */
export function bimap<R, E1, E2, A, B>(io: RIO<R, E1, A>,
    leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): RIO<R, E2, B> {
    return foldExit(io,
        (cause) => cause._tag === "raise" ? raiseError(leftMap(cause.error)) : completed(cause),
        flow(rightMap, pure)
    );
}

/**
 * Curried form of bimap
 * @param leftMap
 * @param rightMap
 */
export function bimapWith<R, E1, E2, A, B>(leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): FunctionN<[RIO<R, E1, A>], RIO<R, E2, B>> {
    return (io) => bimap(io, leftMap, rightMap);
}

/**
 * Zip the result of two IOs together using the provided function
 * @param first
 * @param second
 * @param f
 */
export function zipWith<R, E, A, B, C>(first: RIO<R, E, A>, second: RIO<R, E, B>, f: FunctionN<[A, B], C>): RIO<R, E, C> {
    return chain(first, (a) =>
        map(second, (b) => f(a, b))
    );
}

/**
 * Zip the result of two IOs together into a tuple type
 * @param first
 * @param second
 */
export function zip<R, E, A, B>(first: RIO<R, E, A>, second: RIO<R, E, B>): RIO<R, E, readonly [A, B]> {
    return zipWith(first, second, tuple2);
}

/**
 * Evaluate two IOs in sequence and produce the value produced by the first
 * @param first
 * @param second
 */
export function applyFirst<R, E, A, B>(first: RIO<R, E, A>, second: RIO<R, E, B>): RIO<R, E, A> {
    return zipWith(first, second, fst);
}

/**
 * Curried form of applyFirst
 * @param first 
 */
export function applyThis<R, E, A>(first: RIO<R, E, A>): <B>(second: RIO<R, E, B>) => RIO<R, E, A> {
    return <B>(second: RIO<R, E, B>) => applyFirst(first, second);
}

/**
 * Evaluate two IOs in sequence and produce the value produced by the second
 * @param first 
 * @param second 
 */
export function applySecond<R, E, A, B>(first: RIO<R, E, A>, second: RIO<R, E, B>): RIO<R, E, B> {
    return zipWith(first, second, snd);
}

/**
 * Evaluate two IOs in sequence and produce the value of the second.
 * This is suitable for cases where second is recursively defined
 * @param first 
 * @param second 
 */
export function applySecondL<R, E, A, B>(first: RIO<R, E, A>, second: Lazy<RIO<R, E, B>>): RIO<R, E, B> {
    return chain(first, () => second());
}

/**
 * Curried form of applySecond
 * @param first
 */
export function applyOther<R, E, A>(first: RIO<R, E, A>): <B>(second: RIO<R, E, B>) => RIO<R, E, B> {
    return <B>(second: RIO<R, E, B>) => applySecond(first, second);
}

/**
 * Curried form of applySecondL
 * @param first 
 */
export function applyOtherL<R, E, A>(first: RIO<R, E, A>): <B>(second: Lazy<RIO<R, E, B>>) => RIO<R, E, B> {
    return <B>(second: Lazy<RIO<R, E, B>>) => applySecondL(first, second);
}

/**
 * Applicative ap
 * @param ioa 
 * @param iof 
 */
export function ap<R, E, A, B>(ioa: RIO<R, E, A>, iof: RIO<R, E, FunctionN<[A], B>>): RIO<R, E, B> {
    // Find the apply/thrush operator I'm sure exists in fp-ts somewhere
    return zipWith(ioa, iof, (a, f) => f(a));
}

/**
 * Curried form of ap
 * @param ioa 
 */
export function apWith<R, E, A>(ioa: RIO<R, E, A>): <B>(iof: RIO<R, E, FunctionN<[A], B>>) => RIO<R, E, B> {
    return <B>(iof: RIO<R, E, FunctionN<[A], B>>) => ap(ioa, iof);
}

/**
 * Flipped argument form of ap
 * @param iof 
 * @param ioa 
 */
export function ap_<R, E, A, B>(iof: RIO<R, E, FunctionN<[A], B>>, ioa: RIO<R, E, A>): RIO<R, E, B> {
    return zipWith(iof, ioa, (f, a) => f(a));
}

/**
 * Curried form of ap_
 * @param iof 
 */
export function apWith_<R, E, A, B>(iof: RIO<R, E, FunctionN<[A], B>>): FunctionN<[RIO<R, E, A>], RIO<R, E, B>> {
    return (io) => ap_(iof, io);
}

/**
 * Flip the error and success channels in an IO
 * @param io 
 */
export function flip<R, E, A>(io: RIO<R, E, A>): RIO<R, A, E> {
    return foldExit(
        io,
        (error) => error._tag === "raise" ? pure(error.error) : completed(error),
        raiseError
    );
}

/**
 * Create an IO that traps all exit states of io.
 * 
 * Note that interruption will not be caught unless in an uninterruptible region
 * @param io 
 */
export function result<R, E, A>(io: RIO<R, E, A>): RIO<R, never, Exit<E, A>> {
    return foldExit<R, E, never, A, Exit<E, A>>(
        io,
        pure,
        flow(ex.done, pure)
    );
}

/**
 * Create an interruptible region around the evalution of io
 * @param io 
 */
export function interruptible<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> {
    return interruptibleRegion(io, true);
}

/**
 * Create an uninterruptible region around the evaluation of io
 * @param io 
 */
export function uninterruptible<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> {
    return interruptibleRegion(io, false);
}

/**
 * Create an IO that produces void after ms milliseconds
 * @param ms 
 */
export function after(ms: number): RIO<DefaultR, never, void> {
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
export type InterruptMaskCutout<R, E, A> = FunctionN<[RIO<R, E, A>], RIO<R, E, A>>;

function makeInterruptMaskCutout<R, E, A>(state: boolean): InterruptMaskCutout<R, E, A> {
    return (inner) => interruptibleRegion(inner, state);
}

/**
 * Create an uninterruptible masked region
 * 
 * When the returned IO is evaluated an uninterruptible region will be created and , f will receive an InterruptMaskCutout that can be used to restore the 
 * interruptible status of the region above the one currently executing (which is uninterruptible)
 * @param f 
 */
export function uninterruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], RIO<R, E, A>>): RIO<R, E, A> {
    return chain(accessInterruptible,
        (flag) => uninterruptible(f(makeInterruptMaskCutout(flag)))
    );
}

/**
 * Create an interruptible masked region
 * 
 * Similar to uninterruptibleMask
 * @param f 
 */
export function interruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], RIO<R, E, A>>): RIO<R, E, A> {
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

/**
 * Resource acquisition and release construct.
 * 
 * Once acquire completes successfully, release is guaranteed to execute following the evaluation of the IO produced by use.
 * Release receives the exit state of use along with the resource.
 * @param acquire 
 * @param release 
 * @param use 
 */

export function bracketExit<R, E, A, B>(acquire: RIO<R, E, A>,
    release: FunctionN<[A, Exit<E, B>], RIO<R, E, unknown>>,
    use: FunctionN<[A], RIO<R, E, B>>): RIO<R, E, B> {
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

/**
 * Weaker form of bracketExit where release does not receive the exit status of use
 * @param acquire 
 * @param release 
 * @param use 
 */
export function bracket<R, E, A, B>(acquire: RIO<R, E, A>,
    release: FunctionN<[A], RIO<R, E, unknown>>,
    use: FunctionN<[A], RIO<R, E, B>>): RIO<R, E, B> {
    return bracketExit(acquire, (e) => release(e), use);
}

/**
 * Guarantee that once ioa begins executing the finalizer will execute.
 * @param ioa 
 * @param finalizer 
 */
export function onComplete<R, E, A>(ioa: RIO<R, E, A>, finalizer: RIO<R, E, unknown>): RIO<R, E, A> {
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

/**
 * Guarantee that once ioa begins executing if it is interrupted finalizer will execute
 * @param ioa 
 * @param finalizer 
 */
export function onInterrupted<R, E, A>(ioa: RIO<R, E, A>, finalizer: RIO<R, E, unknown>): RIO<R, E, A> {
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

/**
 * Introduce a gap in executing to allow other fibers to execute (if any are pending)
 */
export const shifted: RIO<DefaultR, never, void> =
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
export function shift<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> {
    return applySecond(shifted, io);
}

/**
 * Introduce an asynchronous gap that will suspend the runloop and return control to the javascript vm
 */
export const shiftedAsync: RIO<DefaultR, never, void> =
    uninterruptible(chain(accessRuntime, (runtime) =>
        asyncTotal<void>((callback) => {
            return runtime.dispatchLater(() => callback(undefined), 0);
        })
    ));

/**
 * Introduce an asynchronous gap before IO
 * @param io 
 */
export function shiftAsync<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> {
    return applySecond(shiftedAsync, io);
}

/**
 * An IO that never produces a value or an error.
 * 
 * This IO will however prevent a javascript runtime such as node from exiting by scheduling an interval for 60s
 */
export const never: RIO<DefaultR, never, never> = asyncTotal(() => {
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
export function delay<R, E, A>(inner: RIO<R, E, A>, ms: number): RIO<R, E, A> {
    return applySecond(after(ms), inner);
}

/**
 * Curried form of delay
 */
export function liftDelay(ms: number): <R, E, A>(io: RIO<R, E, A>) => RIO<R, E, A> {
    return (io) => delay(io, ms);
}

/**
 * Fork the program described by IO in a separate fiber.
 * 
 * This fiber will begin executing once the current fiber releases control of the runloop.
 * If you need to begin the fiber immediately you should use applyFirst(forkIO, shifted)
 * @param io 
 * @param name 
 */
export function fork<R, E, A>(io: RIO<R, E, A>, name?: string): RIO<R, never, Fiber<E, A>> {
    return withRuntime((runtime) => makeFiber(io, runtime, name));
}

function completeLatched<R, E1, E2, A, B, C>(latch: Ref<boolean>,
    channel: Deferred<E2, C>,
    combine: FunctionN<[Exit<E1, A>, Fiber<E1, B>], RIO<R, E2, C>>,
    other: Fiber<E1, B>): FunctionN<[Exit<E1, A>], RIO<R, never, void>> {
    return (exit) =>
        flatten(
            latch.modify((flag) => flag ?
                [unit, flag] as const :
                [channel.from(combine(exit, other)), true] as const)
        );
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
export function raceFold<R, E1, E2, A, B, C>(first: RIO<R, E1, A>, second: RIO<R, E1, B>,
    onFirstWon: FunctionN<[Exit<E1, A>, Fiber<E1, B>], RIO<R, E2, C>>,
    onSecondWon: FunctionN<[Exit<E1, B>, Fiber<E1, A>], RIO<R, E2, C>>): RIO<R, E2, C> {
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

/**
 * Execute an IO and produce the next IO to run based on whether it completed successfully in the alotted time or not
 * @param source 
 * @param ms 
 * @param onTimeout 
 * @param onCompleted 
 */
export function timeoutFold<R, E1, E2, A, B>(source: RIO<R, E1, A>,
    ms: number,
    onTimeout: FunctionN<[Fiber<E1, A>], RIO<R, E2, B>>,
    onCompleted: FunctionN<[Exit<E1, A>], RIO<R, E2, B>>): RIO<R, E2, B> {
    return raceFold(
        source,
        after(ms),
        (exit, delayFiber) => applySecond(delayFiber.interrupt, onCompleted(exit)),
        (_, fiber) => onTimeout(fiber)
    );
}

function interruptLoser<R, E, A>(exit: Exit<E, A>, loser: Fiber<E, A>): RIO<R, E, A> {
    return applySecond(loser.interrupt, completed(exit));
}

/**
 * Return the reuslt of the first IO to complete or error successfully
 * @param io1 
 * @param io2 
 */
export function raceFirst<R, E, A>(io1: RIO<R, E, A>, io2: RIO<R, E, A>): RIO<R, E, A> {
    return raceFold(io1, io2, interruptLoser, interruptLoser);
}


function fallbackToLoser<R, E, A>(exit: Exit<E, A>, loser: Fiber<E, A>): RIO<R, E, A> {
    return exit._tag === "value" ?
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
export function race<R, E, A>(io1: RIO<R, E, A>, io2: RIO<R, E, A>): RIO<R, E, A> {
    return raceFold(io1, io2, fallbackToLoser, fallbackToLoser);
}

/**
 * Zip the result of 2 ios executed in parallel together with the provided function.
 * @param ioa 
 * @param iob 
 * @param f 
 */
export function parZipWith<R, E, A, B, C>(ioa: RIO<R, E, A>, iob: RIO<R, E, B>, f: FunctionN<[A, B], C>): RIO<R, E, C> {
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
export function parZip<R, E, A, B>(ioa: RIO<R, E, A>, iob: RIO<R, E, B>): RIO<R, E, readonly [A, B]> {
    return parZipWith(ioa, iob, tuple2);
}

/**
 * Execute two ios in parallel and take the result of the first.
 * @param ioa 
 * @param iob 
 */
export function parApplyFirst<R, E, A, B>(ioa: RIO<R, E, A>, iob: RIO<R, E, B>): RIO<R, E, A> {
    return parZipWith(ioa, iob, fst);
}

/**
 * Exeute two IOs in parallel and take the result of the second
 * @param ioa 
 * @param iob 
 */
export function parApplySecond<R, E, A, B>(ioa: RIO<R, E, A>, iob: RIO<R, E, B>): RIO<R, E, B> {
    return parZipWith(ioa, iob, snd);
}

/**
 * Parallel form of ap
 * @param ioa 
 * @param iof 
 */
export function parAp<R, E, A, B>(ioa: RIO<R, E, A>, iof: RIO<R, E, FunctionN<[A], B>>): RIO<R, E, B> {
    return parZipWith(ioa, iof, (a, f) => f(a));
}

/**
 * Parallel form of ap_
 * @param iof 
 * @param ioa 
 */
export function parAp_<R, E, A, B>(iof: RIO<R, E, FunctionN<[A], B>>, ioa: RIO<R, E, A>): RIO<R, E, B> {
    return parZipWith(iof, ioa, (f, a) => f(a));
}

/**
 * Convert an error into an unchecked error.
 * @param io 
 */
export function orAbort<R, E, A>(io: RIO<R, E, A>): RIO<R, never, A> {
    return chainError(io, (e) => raiseAbort(e));
}

/**
 * Run source for a maximum amount of ms.
 * 
 * If it completes succesfully produce a some, if not interrupt it and produce none
 * @param source 
 * @param ms 
 */
export function timeoutOption<R, E, A>(source: RIO<R, E, A>, ms: number): RIO<R, E, Option<A>> {
    return timeoutFold(
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
export function fromPromise<A>(thunk: Lazy<Promise<A>>): RIO<DefaultR, unknown, A> {
    return uninterruptible(async<unknown, A>((callback) => {
        thunk().then((v) => callback(right(v))).catch((e) => callback(left(e)));
        // tslint:disable-next-line
        return () => { };
    }));
}

/**
 * Create an IO by lifting an Either
 * @param e 
 */
export function fromEither<E, A>(e: Either<E, A>): IO<E, A> {
    return either.fold<E, A, IO<E, A>>(raiseError, pure)(e);
}

/**
 * Create an IO from an Option, failing if it is none with the given error
 * @param o 
 * @param ifNone 
 */
export function fromOption<E, A>(o: Option<A>, ifNone: Lazy<E>): IO<E, A> {
    return option.fold<A, IO<E, A>>(() => raiseError(ifNone()), pure)(o);
}

/**
 * Curried form of fromOption
 * @param ifNone 
 */
export function fromOptionWith<E, A>(ifNone: Lazy<E>): FunctionN<[Option<A>], IO<E, A>> {
    return (o) => fromOption(o, ifNone);
}

export type Widen<A, B> = A extends B ? B : (B extends A ? A : A | B)
/**
 * Widen the error channel of an IO such that both E1 and E2 are acceptable as errors
 * If E1 or E2 are related this selects the ancestor, otherwise it selects E1 | E2
 * @param io 
 */
export function widenError<E2>(): <R, E1, A>(io: RIO<R, E1, A>) => RIO<R, Widen<E1, E2>, A> {
    return <R, E1, A>(io: RIO<R, E1, A>) => io as RIO<R, Widen<E1, E2>, A>
}


/**
 * Run the given IO with the provided environment.
 * @param io 
 * @param r 
 * @param callback 
 */
export function runR<R, E, A>(io: RIO<R, E, A>, r: R, callback: FunctionN<[Exit<E, A>], void>): Lazy<void> {
    const driver = makeDriver<R, E, A>();
    driver.onExit(callback);
    driver.start(r, io);
    return driver.interrupt;
}

/**
 * Run the given IO
 * @param io 
 * @param callback 
 */
export function run<E, A>(io: RIO<DefaultR, E, A>, callback: FunctionN<[Exit<E, A>], void>): Lazy<void> {
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
export function runToPromise<E, A>(io: RIO<DefaultR, E, A>): Promise<A> {
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
export function runToPromiseR<R, E, A>(io: RIO<R, E, A>, r: R): Promise<A> {
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
export function runToPromiseExit<E, A>(io: RIO<DefaultR, E, A>): Promise<Exit<E, A>> {
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
export function runToPromiseExitR<R, E, A>(io: RIO<R, E, A>, r: R): Promise<Exit<E, A>> {
    return new Promise((result) => runR(io, r, result))
}

export const URI = "IO";
export type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
    interface URItoKind3<R, E, A> {
        IO: RIO<R, E, A>;
    }
}

export const instances: Monad3<URI> & MonadThrow3<URI> = {
    URI,
    map,
    of: pure,
    ap: ap_,
    chain,
    throwError: <R, E, A>(e: E): RIO<R, E, A> => raiseError(e)
} as const;

export const parInstances: Applicative3<URI> = {
    URI,
    map,
    of: pure,
    ap: parAp_
} as const;

export function getSemigroup<R, E, A>(s: Semigroup<A>): Semigroup<RIO<R, E, A>> {
    return {
        concat(x: RIO<R, E, A>, y: RIO<R, E, A>): RIO<R, E, A> {
            return zipWith(x, y, s.concat)
        }
    };
}

export function getMonoid<R, E, A>(m: Monoid<A>): Monoid<RIO<R, E, A>> {
    return {
        ...getSemigroup(m),
        empty: pure(m.empty)
    }
}
