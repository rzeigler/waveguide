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
import { MonadThrow3 } from "fp-ts/lib/MonadThrow";
import { Functor3 } from "fp-ts/lib/Functor";
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
import { fst, snd, tuple2 } from "./support/util";

// We don't care about the environment so we assignment between
export type DefaultR = {}; // eslint-disable-line @typescript-eslint/prefer-interface

export enum RIOTag {
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
export type RIO<R, E, A> =
    Pure<R, E, A> |
    Raised<R, E, A> |
    Completed<R, E, A> |
    Suspended<R, E, A> |
    Async<E, A> |
    Chain<R, E, any, A> | // eslint-disable-line @typescript-eslint/no-explicit-any
    Collapse<R, any, E, any, A> | // eslint-disable-line @typescript-eslint/no-explicit-any
    InterruptibleRegion<R, E, A> |
    AccessInterruptible<R, E, A> |
    AccessRuntime<R, E, A>;

export type IO<E, A> = RIO<DefaultR, E, A>;

export type ParamCovaryE<T, E2> = 
    T extends RIO<infer R, never, infer A> ? T : 
        T extends RIO<infer R, infer E, infer A> ? (E extends E2 ? T : never) : never
export type ReturnCovaryE<T, E2> =
    T extends RIO<infer R, never, infer A> ? RIO<R, E2, A> : 
        T extends RIO<infer R, infer E, infer A> ? (E extends E2 ? RIO<R, E2, A> : never) : never

/**
 * Perform a safe widening of the E parameter of an RIO.
 * 
 * A witness of the encoded covariance of the E parameter.
 */
export function covaryE<T, E2>(input: ParamCovaryE<T, E2>): ReturnCovaryE<T, E2> {
    return input as unknown as ReturnCovaryE<T, E2>
}

export type ParamContravaryR<T, R2> = T extends RIO<infer R, infer E, infer A> ? (R2 extends R ? T : never) : never;
export type ReturnContravaryR<T, R2> = T extends RIO<infer R, infer E, infer A> ? (R2 extends R ? RIO<R2, E, A> : never) : never;

/**
 * Perform a safe widening of the R parameter of a RIO
 * 
 * Witness of the encoded contravariance of the R parameter.
 * Bypasses the fact that only functions are normally contravariant in their inputs
 * @param input 
 * 
 * @example
    const p: IO<string, number> = raiseAbort("boom");
    const p2: RIO<string, string, number> = contravaryR<typeof p, string>(p)
 */
export function contravaryR<T, R2>(input: ParamContravaryR<T, R2>): ReturnContravaryR<T, R2> {
    return input as unknown as ReturnContravaryR<T, R2>;
}

export type ParamBivary<T, R2, E2> = T extends ParamContravaryR<T, R2> ? (T extends ParamCovaryE<T, E2> ? T : never) : never;
export type ReturnBivary<T, R2, E2> = never;

export function bivary<T, R2, E2>(input: ParamBivary<T, R2, E2>): ReturnBivary<T, R2, E2> {
    return input as unknown as ReturnBivary<T, R2, E2>;
}


export interface Pure<R, E, A> {
    readonly _tag: RIOTag.Pure;
    readonly value: A;
}

/**
 * An IO has succeeded
 * @param a the value
 */
export function pure<A>(a: A): RIO<DefaultR, never, A> {
    return {
        _tag: RIOTag.Pure,
        value: a
    };
}

export interface Raised<R, E, A> {
    readonly _tag: RIOTag.Raised;
    readonly error: Cause<E>;
}

/**
 * An IO that is failed
 * 
 * Prefer raiseError or raiseAbort
 * @param e
 */
export function raised<E>(e: Cause<E>): RIO<DefaultR, E, never> {
    return { _tag: RIOTag.Raised, error: e };
}

/**
 * An IO that is failed with a checked error
 * @param e
 */
export function raiseError<E>(e: E): RIO<DefaultR, E, never> {
    return raised(ex.raise(e));
}

/**
 * An IO that is failed with an unchecked error
 * @param u
 */
export function raiseAbort(u: unknown): RIO<DefaultR, never, never> {
    return raised(ex.abort(u));
}

/**
 * An IO that is already interrupted
 */
export const raiseInterrupt: RIO<DefaultR, never, never> = raised(ex.interrupt);

export interface Completed<R, E, A> {
    readonly _tag: RIOTag.Completed;
    readonly exit: Exit<E, A>;
}

/**
 * An IO that is completed with the given exit
 * @param exit
 */
export function completed<E, A>(exit: Exit<E, A>): RIO<DefaultR, E, A> {
    return {
        _tag: RIOTag.Completed,
        exit
    };
}

export interface Suspended<R, E, A> {
    readonly _tag: RIOTag.Suspended;
    readonly thunk: Lazy<RIO<R, E, A>>;
}

/**
 * Wrap a block of impure code that returns an IO into an IO
 *
 * When evaluated this IO will run the given thunk to produce the next IO to execute.
 * @param thunk
 */
export function suspended<R, E, A>(thunk: Lazy<RIO<R, E, A>>): RIO<R, E, A> {
    return {
        _tag: RIOTag.Suspended,
        thunk
    };
}

/**
 * Wrap a block of impure code in an IO
 *
 * When evaluated the this will produce a value or throw
 * @param thunk
 */
export function sync<A>(thunk: Lazy<A>): RIO<DefaultR, never, A> {
    return suspended(() => pure(thunk()));
}

export interface Async<E, A> {
    readonly _tag: RIOTag.Async;
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
export function async<E, A>(op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>): RIO<DefaultR, E, A> {
    return {
        _tag: RIOTag.Async,
        op
    };
}

/**
 * Wrap an impure callback in IO
 *
 * This is a variant of async where the effect cannot fail with a checked exception.
 * @param op
 */
export function asyncTotal<A>(op: FunctionN<[FunctionN<[A], void>], Lazy<void>>): RIO<DefaultR, never, A> {
    return async((callback) => op((a) => callback(right(a))));
}

export interface InterruptibleRegion<R, E, A> {
    readonly _tag: RIOTag.InterruptibleRegion;
    readonly inner: RIO<R, E, A>;
    readonly flag: boolean;
}

/**
 * Demarcate a region of interruptible state
 * @param inner
 * @param flag
 */
export function interruptibleRegion<R, E, A>(inner: RIO<R, E, A>, flag: boolean): RIO<R, E, A> {
    return {
        _tag: RIOTag.InterruptibleRegion,
        inner,
        flag
    };
}

export interface Chain<R, E, Z, A> {
    readonly _tag: RIOTag.Chain;
    readonly inner: RIO<R, E, Z>;
    readonly bind: FunctionN<[Z], RIO<R, E, A>>;
}

/**
 * Produce an new IO that will use the value produced by inner to produce the next IO to evaluate
 * @param inner
 * @param bind
 */
export function chain<R, E, A, B>(inner: RIO<R, E, A>, bind: FunctionN<[A], RIO<R, E, B>>): RIO<R, E, B> {
    return {
        _tag: RIOTag.Chain,
        inner: inner,
        bind: bind
    };
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
export function chainWith<R, E, Z, A>(bind: FunctionN<[Z], RIO<R, E, A>>): (io: RIO<R, E, Z>) => RIO<R, E, A> {
    return (io) => chain(io, bind);
}

export interface Collapse<R, E1, E2, A1, A2> {
    readonly _tag: RIOTag.Collapse;
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
        _tag: RIOTag.Collapse,
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

export interface AccessInterruptible<R, E, A> {
    readonly _tag: RIOTag.AccessInterruptible;
    readonly f: FunctionN<[boolean], A>;
}

/**
 * Get the interruptible state of the current fiber
 */
export const accessInterruptible: RIO<DefaultR, never, boolean> = { _tag: RIOTag.AccessInterruptible, f: identity };

export interface AccessRuntime<R, E, A> {
    readonly _tag: RIOTag.AccessRuntime;
    readonly f: FunctionN<[Runtime], A>;
}

/**
 * Get the runtime of the current fiber
 */
export const accessRuntime: RIO<DefaultR, never, Runtime> = { _tag: RIOTag.AccessRuntime, f: identity };

/**
 * Access the runtime then provide it to the provided function
 * @param f 
 */
export function withRuntime<R, E, A>(f: FunctionN<[Runtime], RIO<R, E, A>>): RIO<R, E, A> {
    return chain(accessRuntime as RIO<R, E, Runtime>, f);
}

/**
 * Map the value produced by an IO
 * @param io
 * @param f
 */
export function map<R, E, A, B>(base: RIO<R, E, A>, f: FunctionN<[A], B>): RIO<R, E, B> {
    return chain<R, E, A, B>(base, flow(f, pure));
}

/**
 * Lift a function on values to a function on IOs
 * @param f
 */
export function lift<A, B>(f: FunctionN<[A], B>): <R, E>(io: RIO<R, E, A>) => RIO<R, E, B> {
    return <R, E>(io: RIO<R, E, A>) => map(io, f);
}

export const mapWith = lift;

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
export function to<B>(b: B): <R, E, A>(io: RIO<R, E, A>) => RIO<R, E, B> {
    return (io) => as(io, b);
}

export function chainTap<R, E, A>(inner: RIO<R, E, A>, bind: FunctionN<[A], RIO<R, E, unknown>>): RIO<R, E, A> {
    return chain(inner, (a) =>
        as(bind(a), a)
    );
}

export function chainTapWith<R, E, A>(bind: FunctionN<[A], RIO<R, E, unknown>>): (inner: RIO<R, E, A>) => RIO<R, E, A> {
    return (inner) => chainTap(inner, bind);
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
        (cause) => cause._tag === ex.ExitTag.Raise ? f(cause.error) : completed(cause),
        pure
    );
}

/**
 * Curriend form of chainError
 * @param f
 */
export function chainErrorWith<R, E1, E2, A>(f: FunctionN<[E1], RIO<R, E2, A>>): (rio: RIO<R, E1, A>) => RIO<R, E2, A> {
    return (io) => chainError(io, f);
}

/**
 * Map the error produced by an IO
 * @param io
 * @param f
 */
export function mapError<R, E1, E2, A>(io: RIO<R, E1, A>, f: FunctionN<[E1], E2>): RIO<R, E2, A> {
    return chainError<R, E1, E2, A>(io, flow(f, raiseError));
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
    return foldExit<R, E1, E2, A, B>(io,
        (cause) => cause._tag === ex.ExitTag.Raise ? raiseError(leftMap(cause.error)) : completed(cause),
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
    return foldExit<R, E, A, A, E>(
        io,
        (error) => error._tag === ex.ExitTag.Raise ? pure(error.error) : completed(error),
        raiseError
    );
}

/**
 * Execute the provided IO forever (or until it errors)
 * @param io 
 */
export function forever<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> {
    return chain(io, () => forever(io));
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
    return (inner: RIO<R, E, A>) => interruptibleRegion(inner, state);
}

/**
 * Create an uninterruptible masked region
 * 
 * When the returned IO is evaluated an uninterruptible region will be created and , f will receive an InterruptMaskCutout that can be used to restore the 
 * interruptible status of the region above the one currently executing (which is uninterruptible)
 * @param f 
 */
export function uninterruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], RIO<R, E, A>>): RIO<R, E, A> {
    return chain(accessInterruptible as RIO<R, E, boolean>,
        (flag) => {
            const cutout = makeInterruptMaskCutout<R, E, A>(flag);
            return uninterruptible(f(cutout));
        });
}

/**
 * Create an interruptible masked region
 * 
 * Similar to uninterruptibleMask
 * @param f 
 */
export function interruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], RIO<R, E, A>>): RIO<R, E, A> {
    return chain(accessInterruptible as RIO<R, E, boolean>,
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

export function bracketExit<R, E, A, B>(acquire: RIO<R, E, A>,
    release: FunctionN<[A, Exit<E, B>], RIO<R, E, unknown>>,
    use: FunctionN<[A], RIO<R, E, B>>): RIO<R, E, B> {

    return uninterruptibleMask<R, E, B>((cutout) =>
        chain(acquire,
            (a) => chain<R, E, Exit<E, B>, B>(result(cutout(use(a))),
                (exit) => chain<R, E, Exit<E, unknown>, B>(result(release(a, exit)),
                    (finalize) => completed(combineFinalizerExit(exit, finalize)))
            )
        )
    )
    // return uninterruptibleMask((cutout) => {
    //     return chain(acquire,
    //         (a) => pipe(a, use, cutout, result, chainWith(
    //             (exit) => pipe(release(a, exit), (finExit) => result(finExit) as RIO<R, E, Exit<E, unknown>, chainWith(
    //                 (finalize) => completed(combineFinalizerExit(exit, finalize))
    //             ))
    //         ))
    //     )
    // });
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
    return uninterruptibleMask<R, E, A>((cutout) =>
        chain<R, E, Exit<E, A>, A>(result(cutout(ioa)),
            (exit) => chain<R, E, Exit<E, unknown>, A>(result(finalizer),
                (finalize) => completed(combineFinalizerExit(exit, finalize))
            )
        ));
}

/**
 * Guarantee that once ioa begins executing if it is interrupted finalizer will execute
 * @param ioa 
 * @param finalizer 
 */
export function onInterrupted<R, E, A>(ioa: RIO<R, E, A>, finalizer: RIO<R, E, unknown>): RIO<R, E, A> {
    return uninterruptibleMask<R, E, A>((cutout) =>
        chain<R, E, Exit<E, A>, A>(result(cutout(ioa)),
            (exit) => exit._tag === ex.ExitTag.Interrupt ?
                chain<R, E, Exit<E, unknown>, A>(result(finalizer),
                    (finalize) => completed(combineFinalizerExit(exit, finalize))) :
                completed(exit)
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
export function shiftBefore<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> {
    return applySecond(shifted as RIO<R, E, void>, io);
}

/**
 * Introduce a synchronous gap after an io that will allow other fibers to execute (if any are pending)
 * @param io 
 */
export function shiftAfter<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> {
    return applyFirst(io, shifted as RIO<R, E, void>);
}

/**
 * Introduce an asynchronous gap that will suspend the runloop and return control to the javascript vm
 */
export const shiftedAsync: RIO<DefaultR, never, void> =
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
export function shiftAsyncBefore<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> {
    return applySecond(shiftedAsync as RIO<R, E, void>, io);
}

/**
 * Introduce asynchronous gap after an IO
 * @param io 
 */
export function shiftAsyncAfter<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> {
    return applyFirst(io, shiftedAsync as RIO<R, E, void>);
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
    return applySecond(after(ms) as RIO<R, E, void>, inner);
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
    return makeFiber(io, name);
}

function completeLatched<R, E1, E2, A, B, C>(latch: Ref<boolean>,
    channel: Deferred<E2, C>,
    combine: FunctionN<[Exit<E1, A>, Fiber<E1, B>], RIO<R, E2, C>>,
    other: Fiber<E1, B>): FunctionN<[Exit<E1, A>], RIO<R, never, void>> {
    return (exit) => {
        const act: RIO<R, never, RIO<R, never, void>> = latch.modify((flag) => !flag ?
            [channel.from<R>(combine(exit, other)), true] as const :
            [unit as RIO<R, never, void>, flag] as const
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
export function raceFold<R, E1, E2, A, B, C>(first: RIO<R, E1, A>, second: RIO<R, E1, B>,
    onFirstWon: FunctionN<[Exit<E1, A>, Fiber<E1, B>], RIO<R, E2, C>>,
    onSecondWon: FunctionN<[Exit<E1, B>, Fiber<E1, A>], RIO<R, E2, C>>): RIO<R, E2, C> {
    return uninterruptibleMask<R, E2, C>((cutout) =>
        chain<R, E2, Ref<boolean>, C>(makeRef<boolean>(false),
            (latch) => chain<R, E2, Deferred<E2, C>, C>(makeDeferred<E2, C>(),
                (channel) => chain(fork(first),
                    (fiber1) => chain(fork(second),
                        (fiber2) => chain(fork(chain(fiber1.wait as RIO<R, never, Exit<E1, A>>, completeLatched(latch, channel, onFirstWon, fiber2))),
                            () => chain(fork(chain(fiber2.wait as RIO<R, never, Exit<E1, B>>, completeLatched(latch, channel, onSecondWon, fiber1))),
                                () => onInterrupted(cutout(channel.wait), applySecond(fiber1.interrupt, fiber2.interrupt) as RIO<R, never, void>)
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
    return raceFold<R, E1, E2, A, void, B>(
        source,
        after(ms),
        (exit, delayFiber) => applySecond(delayFiber.interrupt as RIO<R, never, void>, onCompleted(exit)),
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
    return raceFold<R, E, E, A, A, A>(io1, io2, interruptLoser, interruptLoser);
}


function fallbackToLoser<R, E, A>(exit: Exit<E, A>, loser: Fiber<E, A>): RIO<R, E, A> {
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
export function race<R, E, A>(io1: RIO<R, E, A>, io2: RIO<R, E, A>): RIO<R, E, A> {
    return raceFold<R, E, E, A, A, A>(io1, io2, fallbackToLoser, fallbackToLoser);
}

/**
 * Zip the result of 2 ios executed in parallel together with the provided function.
 * @param ioa 
 * @param iob 
 * @param f 
 */
export function parZipWith<R, E, A, B, C>(ioa: RIO<R, E, A>, iob: RIO<R, E, B>, f: FunctionN<[A, B], C>): RIO<R, E, C> {
    return raceFold<R, E, E, A, B, C>(ioa, iob,
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
    return chainError(io, (e) => raiseAbort(e) as RIO<R, never, never>);
}

/**
 * Run source for a maximum amount of ms.
 * 
 * If it completes succesfully produce a some, if not interrupt it and produce none
 * @param source 
 * @param ms 
 */
export function timeoutOption<R, E, A>(source: RIO<R, E, A>, ms: number): RIO<R, E, Option<A>> {
    return timeoutFold<R, E, E, A, Option<A>>(
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

export type WidenErrFrom<T, E2> = T extends RIO<infer R, infer E, infer A> ? (E extends E2 ? RIO<R, E, A> : never) : never;
export type WidenErrTo<T, E2> = T extends RIO<infer R, infer E, infer A> ? (E extends E2 ? RIO<R, E2, A> : never) : never;

/**
 * Using WidenErrFrom and WidenErrTo to encode covariance of the E type param
 * RIO<R, E1, A> => RIO<R, E2, A> iff. E1 extends E2
 * 
 * Degenerates to never => never in the case the widening is invalid
 * Assumes that if this is in a hot code path it will be inlined as it is only type manipulation
 */
export function widenErr<T, E2>(input: WidenErrFrom<T, E2>): WidenErrTo<T, E2> {
    return input as unknown as WidenErrTo<T, E2>
}

export type WidenEnvFrom<T, R2> = T extends RIO<infer R, infer E, infer A> ? (R2 extends R ? RIO<R, E, A> : never) : never
export type WidenEnvTo<T, R2> = T extends RIO<infer R, infer E, infer A> ? (R2 extends R ? RIO<R2, E, A> : never) : never

/**
 * Using WidenEnvFrom and WidenEnvTo encode contravariance of the R type param
 * RIO<R1, E, A> => RIO<R2, E, A> iff R2 extends R1
 * Degenerates from
 */
export function widenEnv<T, R2>(input: WidenEnvFrom<T, R2>): WidenEnvTo<T, R2> {
    return input as unknown as WidenEnvTo<T, R2>
}


// const p = pure(1);
// const p2: RIO<string, never, number> = widenEnv<typeof p, string>(p);

/**
 * Run the given IO with the provided environment.
 * @param io 
 * @param r 
 * @param callback 
 */
export function runR<R, E, A>(io: RIO<R, E, A>, callback?: FunctionN<[Exit<E, A>], void>): Lazy<void> {
    const driver = makeDriver<R, E, A>();
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
export function runToPromise<R, E, A>(io: RIO<R, E, A>): Promise<A> {
    return new Promise((resolve, reject) =>
        runR(io, (exit) => {
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
export function runToPromiseExit<R, E, A>(io: RIO<R, E, A>): Promise<Exit<E, A>> {
    return new Promise((result) => runR(io, result))
}

export const URI = "RIO";
export type URI = typeof URI;
declare module "fp-ts/lib/HKT" {
    interface URItoKind3<R, E, A> {
        RIO: RIO<R, E, A>;
    }
}

export const instances: Functor3<URI> & Applicative3<URI> & Monad3<URI> & MonadThrow3<URI> = {
    URI,
    map,
    of: pure,
    ap: ap_,
    chain,
    throwError: <R, E, A>(e: E): RIO<R, E, A> => raiseError(e)
} as const;

export const parInstances: Functor3<URI> & Applicative3<URI> = {
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
