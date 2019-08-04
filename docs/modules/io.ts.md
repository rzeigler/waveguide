---
title: io.ts
nav_order: 6
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [AccessEnv (interface)](#accessenv-interface)
- [AccessInterruptible (interface)](#accessinterruptible-interface)
- [AccessRuntime (interface)](#accessruntime-interface)
- [Async (interface)](#async-interface)
- [Chain (interface)](#chain-interface)
- [Collapse (interface)](#collapse-interface)
- [Completed (interface)](#completed-interface)
- [InterruptibleRegion (interface)](#interruptibleregion-interface)
- [ProvideEnv (interface)](#provideenv-interface)
- [Pure (interface)](#pure-interface)
- [Raised (interface)](#raised-interface)
- [Suspended (interface)](#suspended-interface)
- [DefaultR (type alias)](#defaultr-type-alias)
- [InterruptMaskCutout (type alias)](#interruptmaskcutout-type-alias)
- [RIO (type alias)](#rio-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI (constant)](#uri-constant)
- [accessInterruptible (constant)](#accessinterruptible-constant)
- [accessRuntime (constant)](#accessruntime-constant)
- [instances (constant)](#instances-constant)
- [never (constant)](#never-constant)
- [parInstances (constant)](#parinstances-constant)
- [raiseInterrupt (constant)](#raiseinterrupt-constant)
- [shifted (constant)](#shifted-constant)
- [shiftedAsync (constant)](#shiftedasync-constant)
- [unit (constant)](#unit-constant)
- [accessEnv (function)](#accessenv-function)
- [after (function)](#after-function)
- [ap (function)](#ap-function)
- [apWith (function)](#apwith-function)
- [apWith\_ (function)](#apwith_-function)
- [ap\_ (function)](#ap_-function)
- [applyFirst (function)](#applyfirst-function)
- [applyOther (function)](#applyother-function)
- [applySecond (function)](#applysecond-function)
- [applyThis (function)](#applythis-function)
- [as (function)](#as-function)
- [asUnit (function)](#asunit-function)
- [async (function)](#async-function)
- [asyncTotal (function)](#asynctotal-function)
- [bimap (function)](#bimap-function)
- [bimapWith (function)](#bimapwith-function)
- [bracket (function)](#bracket-function)
- [bracketExit (function)](#bracketexit-function)
- [chain (function)](#chain-function)
- [chainError (function)](#chainerror-function)
- [chainErrorWith (function)](#chainerrorwith-function)
- [chainWith (function)](#chainwith-function)
- [completed (function)](#completed-function)
- [delay (function)](#delay-function)
- [flatten (function)](#flatten-function)
- [flip (function)](#flip-function)
- [foldExit (function)](#foldexit-function)
- [foldExitWith (function)](#foldexitwith-function)
- [fork (function)](#fork-function)
- [fromPromise (function)](#frompromise-function)
- [interruptible (function)](#interruptible-function)
- [interruptibleMask (function)](#interruptiblemask-function)
- [interruptibleRegion (function)](#interruptibleregion-function)
- [lift (function)](#lift-function)
- [liftAs (function)](#liftas-function)
- [liftDelay (function)](#liftdelay-function)
- [map (function)](#map-function)
- [mapError (function)](#maperror-function)
- [mapErrorWith (function)](#maperrorwith-function)
- [onComplete (function)](#oncomplete-function)
- [onInterrupted (function)](#oninterrupted-function)
- [parAp (function)](#parap-function)
- [parAp\_ (function)](#parap_-function)
- [parApplyFirst (function)](#parapplyfirst-function)
- [parApplySecond (function)](#parapplysecond-function)
- [parZip (function)](#parzip-function)
- [parZipWith (function)](#parzipwith-function)
- [provideEnv (function)](#provideenv-function)
- [pure (function)](#pure-function)
- [race (function)](#race-function)
- [raceFirst (function)](#racefirst-function)
- [raceFold (function)](#racefold-function)
- [raiseAbort (function)](#raiseabort-function)
- [raiseError (function)](#raiseerror-function)
- [raised (function)](#raised-function)
- [result (function)](#result-function)
- [resultE (function)](#resulte-function)
- [run (function)](#run-function)
- [runR (function)](#runr-function)
- [runToPromise (function)](#runtopromise-function)
- [runToPromiseExit (function)](#runtopromiseexit-function)
- [runToPromiseExitR (function)](#runtopromiseexitr-function)
- [runToPromiseR (function)](#runtopromiser-function)
- [shift (function)](#shift-function)
- [shiftAsync (function)](#shiftasync-function)
- [suspended (function)](#suspended-function)
- [sync (function)](#sync-function)
- [timeoutFold (function)](#timeoutfold-function)
- [timeoutOption (function)](#timeoutoption-function)
- [uninterruptible (function)](#uninterruptible-function)
- [uninterruptibleMask (function)](#uninterruptiblemask-function)
- [withRuntime (function)](#withruntime-function)
- [zip (function)](#zip-function)
- [zipWith (function)](#zipwith-function)

---

# AccessEnv (interface)

**Signature**

```ts
export interface AccessEnv<R> {
  readonly _tag: 'read'
}
```

# AccessInterruptible (interface)

**Signature**

```ts
export interface AccessInterruptible {
  readonly _tag: 'access-interruptible'
}
```

# AccessRuntime (interface)

**Signature**

```ts
export interface AccessRuntime {
  readonly _tag: 'access-runtime'
}
```

# Async (interface)

**Signature**

```ts
export interface Async<E, A> {
  readonly _tag: 'async'
  readonly op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>
}
```

# Chain (interface)

**Signature**

```ts
export interface Chain<R, E, Z, A> {
  readonly _tag: 'chain'
  readonly inner: RIO<R, E, Z>
  readonly bind: FunctionN<[Z], RIO<R, E, A>>
}
```

# Collapse (interface)

**Signature**

```ts
export interface Collapse<R, E1, E2, A1, A2> {
  readonly _tag: 'collapse'
  readonly inner: RIO<R, E1, A1>
  readonly failure: FunctionN<[Cause<E1>], RIO<R, E2, A2>>
  readonly success: FunctionN<[A1], RIO<R, E2, A2>>
}
```

# Completed (interface)

**Signature**

```ts
export interface Completed<E, A> {
  readonly _tag: 'completed'
  readonly exit: Exit<E, A>
}
```

# InterruptibleRegion (interface)

**Signature**

```ts
export interface InterruptibleRegion<R, E, A> {
  readonly _tag: 'interrupt-region'
  readonly inner: RIO<R, E, A>
  readonly flag: boolean
}
```

# ProvideEnv (interface)

**Signature**

```ts
export interface ProvideEnv<R, E, A> {
  readonly _tag: 'provide'
  readonly r: R
  readonly inner: RIO<R, E, A>
}
```

# Pure (interface)

**Signature**

```ts
export interface Pure<A> {
  readonly _tag: 'pure'
  readonly value: A
}
```

# Raised (interface)

**Signature**

```ts
export interface Raised<E> {
  readonly _tag: 'raised'
  readonly error: Cause<E>
}
```

# Suspended (interface)

**Signature**

```ts
export interface Suspended<R, E, A> {
  readonly _tag: 'suspended'
  readonly thunk: Lazy<RIO<R, E, A>>
}
```

# DefaultR (type alias)

**Signature**

```ts
export type DefaultR = {}
```

# InterruptMaskCutout (type alias)

**Signature**

```ts
export type InterruptMaskCutout<R, E, A> = FunctionN<[RIO<R, E, A>], RIO<R, E, A>>
```

# RIO (type alias)

A description of an effect to perform

**Signature**

```ts
export type RIO<R, E, A> =
  | Pure<A>
  | Raised<E>
  | Completed<E, A>
  | Suspended<R, E, A>
  | Async<E, A>
  | Chain<R, E, any, A> // eslint-disable-line @typescript-eslint/no-explicit-any
  | AccessEnv<R>
  | ProvideEnv<any, E, A> // eslint-disable-line @typescript-eslint/no-explicit-any
  | Collapse<R, any, E, any, A> // eslint-disable-line @typescript-eslint/no-explicit-any
  | InterruptibleRegion<R, E, A>
  | (boolean extends A ? AccessInterruptible : never)
  | (Runtime extends A ? AccessRuntime : never)
```

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# URI (constant)

**Signature**

```ts
export const URI = ...
```

# accessInterruptible (constant)

Get the interruptible state of the current fiber

**Signature**

```ts
export const accessInterruptible: RIO<DefaultR, never, boolean> = ...
```

# accessRuntime (constant)

Get the runtime of the current fiber

**Signature**

```ts
export const accessRuntime: RIO<DefaultR, never, Runtime> = ...
```

# instances (constant)

**Signature**

```ts
export const instances: Monad3<URI> = ...
```

# never (constant)

**Signature**

```ts
export const never: RIO<DefaultR, never, never> = ...
```

# parInstances (constant)

**Signature**

```ts
export const parInstances: Applicative3<URI> = ...
```

# raiseInterrupt (constant)

An IO that is already interrupted

**Signature**

```ts
export const raiseInterrupt: Raised<never> = ...
```

# shifted (constant)

**Signature**

```ts
export const  = ...
```

# shiftedAsync (constant)

**Signature**

```ts
export const  = ...
```

# unit (constant)

An IO that succeeds immediately with void

**Signature**

```ts
export const unit: RIO<DefaultR, never, void> = ...
```

# accessEnv (function)

Create an IO that accesses its environment

**Signature**

```ts
export function accessEnv<R>(): RIO<R, never, R> { ... }
```

# after (function)

**Signature**

```ts
export function after(ms: number): RIO<DefaultR, never, void> { ... }
```

# ap (function)

Applicative ap

**Signature**

```ts
export function ap<R, E, A, B>(ioa: RIO<R, E, A>, iof: RIO<R, E, FunctionN<[A], B>>): RIO<R, E, B> { ... }
```

# apWith (function)

Curried form of ap

**Signature**

```ts
export function apWith<R, E, A>(ioa: RIO<R, E, A>): <B>(iof: RIO<R, E, FunctionN<[A], B>>) => RIO<R, E, B> { ... }
```

# apWith\_ (function)

**Signature**

```ts
export function apWith_<R, E, A, B>(iof: RIO<R, E, FunctionN<[A], B>>): FunctionN<[RIO<R, E, A>], RIO<R, E, B>> { ... }
```

# ap\_ (function)

**Signature**

```ts
export function ap_<R, E, A, B>(iof: RIO<R, E, FunctionN<[A], B>>, ioa: RIO<R, E, A>): RIO<R, E, B> { ... }
```

# applyFirst (function)

Evaluate two IOs in sequence and produce the value produced by the first

**Signature**

```ts
export function applyFirst<R, E, A, B>(first: RIO<R, E, A>, second: RIO<R, E, B>): RIO<R, E, A> { ... }
```

# applyOther (function)

Curried form of @see{@link applySecond}

**Signature**

```ts
export function applyOther<R, E, A>(first: RIO<R, E, A>): <B>(second: RIO<R, E, B>) => RIO<R, E, B> { ... }
```

# applySecond (function)

Evaluate two IOs in sequence and produce the value produced by the second

**Signature**

```ts
export function applySecond<R, E, A, B>(first: RIO<R, E, A>, second: RIO<R, E, B>): RIO<R, E, B> { ... }
```

# applyThis (function)

Curried form of @see{@link applyFirst}

**Signature**

```ts
export function applyThis<R, E, A>(first: RIO<R, E, A>): <B>(second: RIO<R, E, B>) => RIO<R, E, A> { ... }
```

# as (function)

Map the value produced by an IO to the constant b

**Signature**

```ts
export function as<R, E, A, B>(io: RIO<R, E, A>, b: B): RIO<R, E, B> { ... }
```

# asUnit (function)

Map the value produced by an IO to void

**Signature**

```ts
export function asUnit<R, E, A>(io: RIO<R, E, A>): RIO<R, E, void> { ... }
```

# async (function)

Wrap an impure callback in an IO

The provided function must accept a callback to report results to and return a cancellation action.
If your action is uncancellable for some reason, you should return an empty thunk and wrap the created IO
in uninterruptible

**Signature**

```ts
export function async<E, A>(op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>): Async<E, A> { ... }
```

# asyncTotal (function)

Wrap an impure callback in IO

This is a variant of async where the effect cannot fail with a checked exception.

**Signature**

```ts
export function asyncTotal<A>(op: FunctionN<[FunctionN<[A], void>], Lazy<void>>): Async<never, A> { ... }
```

# bimap (function)

Map over either the error or value produced by an IO

**Signature**

```ts
export function bimap<R, E1, E2, A, B>(io: RIO<R, E1, A>,
    leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): RIO<R, E2, B> { ... }
```

# bimapWith (function)

Curried form of @see{@link bimap}

**Signature**

```ts
export function bimapWith<R, E1, E2, A, B>(leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): FunctionN<[RIO<R, E1, A>], RIO<R, E2, B>> { ... }
```

# bracket (function)

**Signature**

```ts
export function bracket<R, E, A, B>(acquire: RIO<R, E, A>,
    release: FunctionN<[A], RIO<R, E, unknown>>,
    use: FunctionN<[A], RIO<R, E, B>>): RIO<R, E, B> { ... }
```

# bracketExit (function)

**Signature**

```ts
export function bracketExit<R, E, A, B>(acquire: RIO<R, E, A>,
    release: FunctionN<[A, Exit<E, B>], RIO<R, E, unknown>>,
    use: FunctionN<[A], RIO<R, E, B>>): RIO<R, E, B> { ... }
```

# chain (function)

Produce an new IO that will use the value produced by inner to produce the next IO to evaluate

**Signature**

```ts
export function chain<R, E, Z, A>(inner: RIO<R, E, Z>, bind: FunctionN<[Z], RIO<R, E, A>>): Chain<R, E, Z, A> { ... }
```

# chainError (function)

Produce an new IO that will use the error produced by inner to produce a recovery program

**Signature**

```ts
export function chainError<R, E1, E2, A>(io: RIO<R, E1, A>, f: FunctionN<[E1], RIO<R, E2, A>>): RIO<R, E2, A> { ... }
```

# chainErrorWith (function)

Curriend form of @see{@link chainError}

**Signature**

```ts
export function chainErrorWith<R, E1, E2, A>(f: FunctionN<[E1], RIO<R, E2, A>>): FunctionN<[RIO<R, E1, A>], RIO<R, E2, A>> { ... }
```

# chainWith (function)

Curried function first form of @see{@link chain}

**Signature**

```ts
export function chainWith<R, E, Z, A>(bind: FunctionN<[Z], RIO<R, E, A>>): FunctionN<[RIO<R, E, Z>], Chain<R, E, Z, A>> { ... }
```

# completed (function)

An IO that is completed with the given exit

**Signature**

```ts
export function completed<E, A>(exit: Exit<E, A>): Completed<E, A> { ... }
```

# delay (function)

**Signature**

```ts
export function delay<R, E, A>(inner: RIO<R, E, A>, ms: number): RIO<R, E, A> { ... }
```

# flatten (function)

Flatten a nested IO

**Signature**

```ts
export function flatten<R, E, A>(inner: RIO<R, E, RIO<R, E, A>>): RIO<R, E, A> { ... }
```

# flip (function)

Flip the error and success channels in an IO

**Signature**

```ts
export function flip<R, E, A>(io: RIO<R, E, A>): RIO<R, A, E> { ... }
```

# foldExit (function)

Fold the result of an IO into a new IO.

This can be thought of as a more powerful form of @see{@link chain}
where the computation continues with a new IO depending on the result of inner.

**Signature**

```ts
export function foldExit<R, E1, E2, A1, A2>(inner: RIO<R, E1, A1>,
    failure: FunctionN<[Cause<E1>], RIO<R, E2, A2>>,
    success: FunctionN<[A1], RIO<R, E2, A2>>): Collapse<R, E1, E2, A1, A2> { ... }
```

# foldExitWith (function)

Curried form of @see{@link @foldExit}

**Signature**

```ts
export function foldExitWith<R, E1, E2, A1, A2>(failure: FunctionN<[Cause<E1>], RIO<R, E2, A2>>,
    success: FunctionN<[A1], RIO<R, E2, A2>>):
    FunctionN<[RIO<R, E1, A1>], Collapse<R, E1, E2, A1, A2>> { ... }
```

# fork (function)

**Signature**

```ts
export function fork<R, E, A>(io: RIO<R, E, A>, name?: string): RIO<R, never, Fiber<E, A>> { ... }
```

# fromPromise (function)

**Signature**

```ts
export function fromPromise<A>(thunk: Lazy<Promise<A>>): RIO<DefaultR, unknown, A> { ... }
```

# interruptible (function)

**Signature**

```ts
export function interruptible<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# interruptibleMask (function)

**Signature**

```ts
export function interruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], RIO<R, E, A>>): RIO<R, E, A> { ... }
```

# interruptibleRegion (function)

Demarcate a region of interruptible state

**Signature**

```ts
export function interruptibleRegion<R, E, A>(inner: RIO<R, E, A>, flag: boolean): InterruptibleRegion<R, E, A> { ... }
```

# lift (function)

Lift a function on values to a function on IOs

**Signature**

```ts
export function lift<A, B>(f: FunctionN<[A], B>): <R, E>(io: RIO<R, E, A>) => RIO<R, E, B> { ... }
```

# liftAs (function)

Curried form of @see{@link as}

**Signature**

```ts
export function liftAs<B>(b: B): <R, E, A>(io: RIO<R, E, A>) => RIO<R, E, B> { ... }
```

# liftDelay (function)

**Signature**

```ts
export function liftDelay(ms: number): <R, E, A>(io: RIO<R, E, A>) => RIO<R, E, A> { ... }
```

# map (function)

Map the value produced by an IO

**Signature**

```ts
export function map<R, E, A, B>(io: RIO<R, E, A>, f: FunctionN<[A], B>): RIO<R, E, B> { ... }
```

# mapError (function)

Map the error produced by an IO

**Signature**

```ts
export function mapError<R, E1, E2, A>(io: RIO<R, E1, A>, f: FunctionN<[E1], E2>): RIO<R, E2, A> { ... }
```

# mapErrorWith (function)

Curried form of @see{@link mapError}

**Signature**

```ts
export function mapErrorWith<R, E1, E2>(f: FunctionN<[E1], E2>): <A>(io: RIO<R, E1, A>) => RIO<R, E2, A> { ... }
```

# onComplete (function)

**Signature**

```ts
export function onComplete<R, E, A>(ioa: RIO<R, E, A>, finalizer: RIO<R, E, unknown>): RIO<R, E, A> { ... }
```

# onInterrupted (function)

**Signature**

```ts
export function onInterrupted<R, E, A>(ioa: RIO<R, E, A>, finalizer: RIO<R, E, unknown>): RIO<R, E, A> { ... }
```

# parAp (function)

**Signature**

```ts
export function parAp<R, E, A, B>(ioa: RIO<R, E, A>, iof: RIO<R, E, FunctionN<[A], B>>): RIO<R, E, B> { ... }
```

# parAp\_ (function)

**Signature**

```ts
export function parAp_<R, E, A, B>(iof: RIO<R, E, FunctionN<[A], B>>, ioa: RIO<R, E, A>): RIO<R, E, B> { ... }
```

# parApplyFirst (function)

Execute two ios in parallel and take the result of the first.

**Signature**

```ts
export function parApplyFirst<R, E, A, B>(ioa: RIO<R, E, A>, iob: RIO<R, E, B>): RIO<R, E, A> { ... }
```

# parApplySecond (function)

**Signature**

```ts
export function parApplySecond<R, E, A, B>(ioa: RIO<R, E, A>, iob: RIO<R, E, B>): RIO<R, E, B> { ... }
```

# parZip (function)

Tuple the result of 2 ios executed in parallel

**Signature**

```ts
export function parZip<R, E, A, B>(ioa: RIO<R, E, A>, iob: RIO<R, E, B>): RIO<R, E, readonly [A, B]> { ... }
```

# parZipWith (function)

Zip the result of 2 ios executed in parallel together with the provided function.

**Signature**

```ts
export function parZipWith<R, E, A, B, C>(ioa: RIO<R, E, A>, iob: RIO<R, E, B>, f: FunctionN<[A, B], C>): RIO<R, E, C> { ... }
```

# provideEnv (function)

Provide an environment to an RIO.

This eliminates the dependency on the specific R of the input.
Instead, the resulting IO has an R parameter of @see{@link DefaultR}

**Signature**

```ts
export function provideEnv<R, E, A>(r: R, io: RIO<R, E, A>): RIO<DefaultR, E, A> { ... }
```

# pure (function)

An IO has succeeded

**Signature**

```ts
export function pure<A>(a: A): Pure<A> { ... }
```

# race (function)

**Signature**

```ts
export function race<R, E, A>(io1: RIO<R, E, A>, io2: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# raceFirst (function)

**Signature**

```ts
export function raceFirst<R, E, A>(io1: RIO<R, E, A>, io2: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# raceFold (function)

**Signature**

```ts
export function raceFold<R, E1, E2, A, B, C>(first: RIO<R, E1, A>, second: RIO<R, E1, B>,
    onFirstWon: FunctionN<[Exit<E1, A>, Fiber<E1, B>], RIO<R, E2, C>>,
    onSecondWon: FunctionN<[Exit<E1, B>, Fiber<E1, A>], RIO<R, E2, C>>): RIO<R, E2, C> { ... }
```

# raiseAbort (function)

An IO that is failed with an unchecked error

**Signature**

```ts
export function raiseAbort(u: unknown): Raised<never> { ... }
```

# raiseError (function)

An IO that is failed with a checked error

**Signature**

```ts
export function raiseError<E>(e: E): Raised<E> { ... }
```

# raised (function)

An IO that is failed

Prefer @see{@link raiseError} or @see{@link raiseAbort}.

**Signature**

```ts
export function raised<E>(e: Cause<E>): Raised<E> { ... }
```

# result (function)

Create an IO that takes does not fail with a checked exception but produces an exit status.

**Signature**

```ts
export function result<R, E, A>(io: RIO<R, E, A>): RIO<R, never, Exit<E, A>> { ... }
```

# resultE (function)

**Signature**

```ts
export function resultE<R, E, A>(io: RIO<R, E, A>): RIO<R, E, Exit<E, A>> { ... }
```

# run (function)

**Signature**

```ts
export function run<E, A>(io: RIO<DefaultR, E, A>, callback: FunctionN<[Exit<E, A>], void>): Lazy<void> { ... }
```

# runR (function)

**Signature**

```ts
export function runR<R, E, A>(io: RIO<R, E, A>, r: R, callback: FunctionN<[Exit<E, A>], void>): Lazy<void> { ... }
```

# runToPromise (function)

Run an IO returning a promise of the result.

The returned promise will resolve with a success value.
The returned promies will reject with an E, and unknown, or undefined in the case of raise, abort, or interrupt
respectively.
The returned promise may never complete if the provided IO never produces a value or error.

**Signature**

```ts
export function runToPromise<E, A>(io: RIO<DefaultR, E, A>): Promise<A> { ... }
```

# runToPromiseExit (function)

Run an IO returning a promise of the Exit

The returned promise will never reject.

**Signature**

```ts
export function runToPromiseExit<E, A>(io: RIO<DefaultR, E, A>): Promise<Exit<E, A>> { ... }
```

# runToPromiseExitR (function)

Run an IO returning a promise of an Exit.

The Promise will not reject.
Allows providing an environment parameter directly

**Signature**

```ts
export function runToPromiseExitR<R, E, A>(io: RIO<R, E, A>, r: R): Promise<Exit<E, A>> { ... }
```

# runToPromiseR (function)

Run an IO and return a Promise of its result

Allows providing an environment parameter directly

**Signature**

```ts
export function runToPromiseR<R, E, A>(io: RIO<R, E, A>, r: R): Promise<A> { ... }
```

# shift (function)

**Signature**

```ts
export function shift<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# shiftAsync (function)

**Signature**

```ts
export function shiftAsync<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# suspended (function)

Wrap a block of impure code that returns an IO into an IO

When evaluated this IO will run the given thunk to produce the next IO to execute.

**Signature**

```ts
export function suspended<R, E, A>(thunk: Lazy<RIO<R, E, A>>): Suspended<R, E, A> { ... }
```

# sync (function)

Wrap a block of impure code in an IO

When evaluated the this will produce a value or throw

**Signature**

```ts
export function sync<A>(thunk: Lazy<A>): Suspended<DefaultR, never, A> { ... }
```

# timeoutFold (function)

**Signature**

```ts
export function timeoutFold<R, E1, E2, A, B>(source: RIO<R, E1, A>,
    ms: number,
    onTimeout: FunctionN<[Fiber<E1, A>], RIO<R, E2, B>>,
    onCompleted: FunctionN<[Exit<E1, A>], RIO<R, E2, B>>): RIO<R, E2, B> { ... }
```

# timeoutOption (function)

**Signature**

```ts
export function timeoutOption<R, E, A>(source: RIO<R, E, A>, ms: number): RIO<R, E, Option<A>> { ... }
```

# uninterruptible (function)

**Signature**

```ts
export function uninterruptible<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# uninterruptibleMask (function)

**Signature**

```ts
export function uninterruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], RIO<R, E, A>>): RIO<R, E, A> { ... }
```

# withRuntime (function)

Access the runtime then provide it to the provided function

**Signature**

```ts
export function withRuntime<R, E, A>(f: FunctionN<[Runtime], RIO<R, E, A>>): RIO<R, E, A> { ... }
```

# zip (function)

Zip the result of two IOs together into a tuple type

**Signature**

```ts
export function zip<R, E, A, B>(first: RIO<R, E, A>, second: RIO<R, E, B>): RIO<R, E, readonly [A, B]> { ... }
```

# zipWith (function)

Zip the result of two IOs together using the provided function

**Signature**

```ts
export function zipWith<R, E, A, B, C>(first: RIO<R, E, A>, second: RIO<R, E, B>, f: FunctionN<[A, B], C>): RIO<R, E, C> { ... }
```
