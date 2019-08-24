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
- [IO (type alias)](#io-type-alias)
- [InterruptMaskCutout (type alias)](#interruptmaskcutout-type-alias)
- [RIO (type alias)](#rio-type-alias)
- [SuitableFor (type alias)](#suitablefor-type-alias)
- [URI (type alias)](#uri-type-alias)
- [Widen (type alias)](#widen-type-alias)
- [WidenEnvFrom (type alias)](#widenenvfrom-type-alias)
- [WidenEnvTo (type alias)](#widenenvto-type-alias)
- [WidenErrFrom (type alias)](#widenerrfrom-type-alias)
- [WidenErrTo (type alias)](#widenerrto-type-alias)
- [URI (constant)](#uri-constant)
- [accessInterruptible (constant)](#accessinterruptible-constant)
- [accessRuntime (constant)](#accessruntime-constant)
- [instances (constant)](#instances-constant)
- [mapWith (constant)](#mapwith-constant)
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
- [applySecond (function)](#applysecond-function)
- [applySecondL (function)](#applysecondl-function)
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
- [chainTap (function)](#chaintap-function)
- [chainTapWith (function)](#chaintapwith-function)
- [chainWith (function)](#chainwith-function)
- [completed (function)](#completed-function)
- [contramapEnv (function)](#contramapenv-function)
- [contramapEnvM (function)](#contramapenvm-function)
- [delay (function)](#delay-function)
- [encaseEither (function)](#encaseeither-function)
- [encaseOption (function)](#encaseoption-function)
- [encaseReader (function)](#encasereader-function)
- [flatten (function)](#flatten-function)
- [flip (function)](#flip-function)
- [foldExit (function)](#foldexit-function)
- [foldExitWith (function)](#foldexitwith-function)
- [forever (function)](#forever-function)
- [fork (function)](#fork-function)
- [fromEither (function)](#fromeither-function)
- [fromOption (function)](#fromoption-function)
- [fromOptionWith (function)](#fromoptionwith-function)
- [fromPromise (function)](#frompromise-function)
- [getMonoid (function)](#getmonoid-function)
- [getSemigroup (function)](#getsemigroup-function)
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
- [orAbort (function)](#orabort-function)
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
- [runR (function)](#runr-function)
- [runToPromiseExitR (function)](#runtopromiseexitr-function)
- [runToPromiseR (function)](#runtopromiser-function)
- [shiftAfter (function)](#shiftafter-function)
- [shiftAsyncAfter (function)](#shiftasyncafter-function)
- [shiftAsyncBefore (function)](#shiftasyncbefore-function)
- [shiftBefore (function)](#shiftbefore-function)
- [suspended (function)](#suspended-function)
- [sync (function)](#sync-function)
- [timeoutFold (function)](#timeoutfold-function)
- [timeoutOption (function)](#timeoutoption-function)
- [to (function)](#to-function)
- [uninterruptible (function)](#uninterruptible-function)
- [uninterruptibleMask (function)](#uninterruptiblemask-function)
- [widenEnv (function)](#widenenv-function)
- [widenErr (function)](#widenerr-function)
- [widenError (function)](#widenerror-function)
- [withRuntime (function)](#withruntime-function)
- [zip (function)](#zip-function)
- [zipWith (function)](#zipwith-function)

---

# AccessEnv (interface)

**Signature**

```ts
export interface AccessEnv<R, E, A> {
  readonly _tag: RIOTag.AccessEnv
  readonly f: FunctionN<[R], A>
}
```

# AccessInterruptible (interface)

**Signature**

```ts
export interface AccessInterruptible<R, E, A> {
  readonly _tag: RIOTag.AccessInterruptible
  readonly f: FunctionN<[boolean], A>
}
```

# AccessRuntime (interface)

**Signature**

```ts
export interface AccessRuntime<R, E, A> {
  readonly _tag: RIOTag.AccessRuntime
  readonly f: FunctionN<[Runtime], A>
}
```

# Async (interface)

**Signature**

```ts
export interface Async<E, A> {
  readonly _tag: RIOTag.Async
  readonly op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>
}
```

# Chain (interface)

**Signature**

```ts
export interface Chain<R, E, Z, A> {
  readonly _tag: RIOTag.Chain
  readonly inner: RIO<R, E, Z>
  readonly bind: FunctionN<[Z], RIO<R, E, A>>
}
```

# Collapse (interface)

**Signature**

```ts
export interface Collapse<R, E1, E2, A1, A2> {
  readonly _tag: RIOTag.Collapse
  readonly inner: RIO<R, E1, A1>
  readonly failure: FunctionN<[Cause<E1>], RIO<R, E2, A2>>
  readonly success: FunctionN<[A1], RIO<R, E2, A2>>
}
```

# Completed (interface)

**Signature**

```ts
export interface Completed<R, E, A> {
  readonly _tag: RIOTag.Completed
  readonly exit: Exit<E, A>
}
```

# InterruptibleRegion (interface)

**Signature**

```ts
export interface InterruptibleRegion<R, E, A> {
  readonly _tag: RIOTag.InterruptibleRegion
  readonly inner: RIO<R, E, A>
  readonly flag: boolean
}
```

# ProvideEnv (interface)

**Signature**

```ts
export interface ProvideEnv<R, E, A> {
  readonly _tag: RIOTag.ProvideEnv
  readonly r: R
  readonly inner: RIO<R, E, A>
}
```

# Pure (interface)

**Signature**

```ts
export interface Pure<R, E, A> {
  readonly _tag: RIOTag.Pure
  readonly value: A
}
```

# Raised (interface)

**Signature**

```ts
export interface Raised<R, E, A> {
  readonly _tag: RIOTag.Raised
  readonly error: Cause<E>
}
```

# Suspended (interface)

**Signature**

```ts
export interface Suspended<R, E, A> {
  readonly _tag: RIOTag.Suspended
  readonly thunk: Lazy<RIO<R, E, A>>
}
```

# DefaultR (type alias)

**Signature**

```ts
export type DefaultR = {}
```

# IO (type alias)

**Signature**

```ts
export type IO<E, A> = RIO<DefaultR, E, A>
```

# InterruptMaskCutout (type alias)

The type of a function that can restore outer interruptible state

**Signature**

```ts
export type InterruptMaskCutout<R, E, A> = FunctionN<[RIO<R, E, A>], RIO<R, E, A>>
```

# RIO (type alias)

A description of an effect to perform

**Signature**

```ts
export type RIO<R, E, A> =
  | Pure<R, E, A>
  | Raised<R, E, A>
  | Completed<R, E, A>
  | Suspended<R, E, A>
  | Async<E, A>
  | Chain<R, E, any, A> // eslint-disable-line @typescript-eslint/no-explicit-any
  | AccessEnv<R, E, A>
  | ProvideEnv<any, E, A> // eslint-disable-line @typescript-eslint/no-explicit-any
  | Collapse<R, any, E, any, A> // eslint-disable-line @typescript-eslint/no-explicit-any
  | InterruptibleRegion<R, E, A>
  | AccessInterruptible<R, E, A>
  | AccessRuntime<R, E, A>
```

# SuitableFor (type alias)

**Signature**

```ts
export type SuitableFor<J extends RIOTag, K extends RIOTag, V> = J extends K ? (K extends J ? V : never) : never
```

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# Widen (type alias)

**Signature**

```ts
export type Widen<A, B> = A extends B ? B : (B extends A ? A : A | B)
```

# WidenEnvFrom (type alias)

**Signature**

```ts
export type WidenEnvFrom<T, R2> = T extends RIO<infer R, infer E, infer A>
  ? (R2 extends R ? RIO<R, E, A> : never)
  : never
```

# WidenEnvTo (type alias)

**Signature**

```ts
export type WidenEnvTo<T, R2> = T extends RIO<infer R, infer E, infer A>
  ? (R2 extends R ? RIO<R2, E, A> : never)
  : never
```

# WidenErrFrom (type alias)

**Signature**

```ts
export type WidenErrFrom<T, E2> = T extends RIO<infer R, infer E, infer A>
  ? (E extends E2 ? RIO<R, E, A> : never)
  : never
```

# WidenErrTo (type alias)

**Signature**

```ts
export type WidenErrTo<T, E2> = T extends RIO<infer R, infer E, infer A>
  ? (E extends E2 ? RIO<R, E2, A> : never)
  : never
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
export const instances: Functor3<URI> & Applicative3<URI> & Monad3<URI> & MonadThrow3<URI> = ...
```

# mapWith (constant)

**Signature**

```ts
export const mapWith = ...
```

# never (constant)

An IO that never produces a value or an error.

This IO will however prevent a javascript runtime such as node from exiting by scheduling an interval for 60s

**Signature**

```ts
export const never: RIO<DefaultR, never, never> = ...
```

# parInstances (constant)

**Signature**

```ts
export const parInstances: Functor3<URI> & Applicative3<URI> = ...
```

# raiseInterrupt (constant)

An IO that is already interrupted

**Signature**

```ts
export const raiseInterrupt: RIO<DefaultR, never, never> = ...
```

# shifted (constant)

Introduce a gap in executing to allow other fibers to execute (if any are pending)

**Signature**

```ts
export const  = ...
```

# shiftedAsync (constant)

Introduce an asynchronous gap that will suspend the runloop and return control to the javascript vm

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

Create an IO that produces void after ms milliseconds

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

Curried form of ap\_

**Signature**

```ts
export function apWith_<R, E, A, B>(iof: RIO<R, E, FunctionN<[A], B>>): FunctionN<[RIO<R, E, A>], RIO<R, E, B>> { ... }
```

# ap\_ (function)

Flipped argument form of ap

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

# applySecond (function)

Evaluate two IOs in sequence and produce the value produced by the second

**Signature**

```ts
export function applySecond<R, E, A, B>(first: RIO<R, E, A>, second: RIO<R, E, B>): RIO<R, E, B> { ... }
```

# applySecondL (function)

Evaluate two IOs in sequence and produce the value of the second.
This is suitable for cases where second is recursively defined

**Signature**

```ts
export function applySecondL<R, E, A, B>(first: RIO<R, E, A>, second: Lazy<RIO<R, E, B>>): RIO<R, E, B> { ... }
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
export function async<E, A>(op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>): RIO<DefaultR, E, A> { ... }
```

# asyncTotal (function)

Wrap an impure callback in IO

This is a variant of async where the effect cannot fail with a checked exception.

**Signature**

```ts
export function asyncTotal<A>(op: FunctionN<[FunctionN<[A], void>], Lazy<void>>): RIO<DefaultR, never, A> { ... }
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

Curried form of bimap

**Signature**

```ts
export function bimapWith<R, E1, E2, A, B>(leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): FunctionN<[RIO<R, E1, A>], RIO<R, E2, B>> { ... }
```

# bracket (function)

Weaker form of bracketExit where release does not receive the exit status of use

**Signature**

```ts
export function bracket<R, E, A, B>(acquire: RIO<R, E, A>,
    release: FunctionN<[A], RIO<R, E, unknown>>,
    use: FunctionN<[A], RIO<R, E, B>>): RIO<R, E, B> { ... }
```

# bracketExit (function)

Resource acquisition and release construct.

Once acquire completes successfully, release is guaranteed to execute following the evaluation of the IO produced by use.
Release receives the exit state of use along with the resource.

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
export function chain<R, E, A, B>(inner: RIO<R, E, A>, bind: FunctionN<[A], RIO<R, E, B>>): RIO<R, E, B> { ... }
```

# chainError (function)

Produce an new IO that will use the error produced by inner to produce a recovery program

**Signature**

```ts
export function chainError<R, E1, E2, A>(io: RIO<R, E1, A>, f: FunctionN<[E1], RIO<R, E2, A>>): RIO<R, E2, A> { ... }
```

# chainErrorWith (function)

Curriend form of chainError

**Signature**

```ts
export function chainErrorWith<R, E1, E2, A>(f: FunctionN<[E1], RIO<R, E2, A>>): (rio: RIO<R, E1, A>) => RIO<R, E2, A> { ... }
```

# chainTap (function)

**Signature**

```ts
export function chainTap<R, E, A>(inner: RIO<R, E, A>, bind: FunctionN<[A], RIO<R, E, unknown>>): RIO<R, E, A> { ... }
```

# chainTapWith (function)

**Signature**

```ts
export function chainTapWith<R, E, A>(bind: FunctionN<[A], RIO<R, E, unknown>>): (inner: RIO<R, E, A>) => RIO<R, E, A> { ... }
```

# chainWith (function)

Curried function first form of chain

**Signature**

```ts
export function chainWith<R, E, Z, A>(bind: FunctionN<[Z], RIO<R, E, A>>): (io: RIO<R, E, Z>) => RIO<R, E, A> { ... }
```

# completed (function)

An IO that is completed with the given exit

**Signature**

```ts
export function completed<E, A>(exit: Exit<E, A>): RIO<DefaultR, E, A> { ... }
```

# contramapEnv (function)

Manipulate an IO with by producing its environment from a different one

**Signature**

```ts
export function contramapEnv<R1, R2, E, A>(f: FunctionN<[R1], R2>, io: RIO<R2, E, A>): RIO<R1, E, A> { ... }
```

# contramapEnvM (function)

Manipulate an IO by producing its environment from an IO in different environment such that it may execute in that other environment

**Signature**

```ts
export function contramapEnvM<R1, R2, E, A>(contra: RIO<R1, E, R2>, io: RIO<R2, E, A>): RIO<R1, E, A> { ... }
```

# delay (function)

Delay evaluation of inner by some amount of time

**Signature**

```ts
export function delay<R, E, A>(inner: RIO<R, E, A>, ms: number): RIO<R, E, A> { ... }
```

# encaseEither (function)

Lift an Either into an IO

**Signature**

```ts
export function encaseEither<E, A>(e: Either<E, A>): IO<E, A> { ... }
```

# encaseOption (function)

Lift an Option into an IO

**Signature**

```ts
export function encaseOption<E, A>(o: Option<A>, onError: Lazy<E>): IO<E, A> { ... }
```

# encaseReader (function)

Lift a function from R => IO<E, A> to a RIO<R, E, A>

**Signature**

```ts
export function encaseReader<R, E, A>(f: FunctionN<[R], IO<E, A>>): RIO<R, E, A> { ... }
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

This can be thought of as a more powerful form of chain
where the computation continues with a new IO depending on the result of inner.

**Signature**

```ts
export function foldExit<R, E1, E2, A1, A2>(inner: RIO<R, E1, A1>,
    failure: FunctionN<[Cause<E1>], RIO<R, E2, A2>>,
    success: FunctionN<[A1], RIO<R, E2, A2>>): Collapse<R, E1, E2, A1, A2> { ... }
```

# foldExitWith (function)

Curried form of foldExit

**Signature**

```ts
export function foldExitWith<R, E1, E2, A1, A2>(failure: FunctionN<[Cause<E1>], RIO<R, E2, A2>>,
    success: FunctionN<[A1], RIO<R, E2, A2>>):
    FunctionN<[RIO<R, E1, A1>], Collapse<R, E1, E2, A1, A2>> { ... }
```

# forever (function)

Execute the provided IO forever (or until it errors)

**Signature**

```ts
export function forever<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# fork (function)

Fork the program described by IO in a separate fiber.

This fiber will begin executing once the current fiber releases control of the runloop.
If you need to begin the fiber immediately you should use applyFirst(forkIO, shifted)

**Signature**

```ts
export function fork<R, E, A>(io: RIO<R, E, A>, name?: string): RIO<R, never, Fiber<E, A>> { ... }
```

# fromEither (function)

Create an IO by lifting an Either

**Signature**

```ts
export function fromEither<E, A>(e: Either<E, A>): IO<E, A> { ... }
```

# fromOption (function)

Create an IO from an Option, failing if it is none with the given error

**Signature**

```ts
export function fromOption<E, A>(o: Option<A>, ifNone: Lazy<E>): IO<E, A> { ... }
```

# fromOptionWith (function)

Curried form of fromOption

**Signature**

```ts
export function fromOptionWith<E, A>(ifNone: Lazy<E>): FunctionN<[Option<A>], IO<E, A>> { ... }
```

# fromPromise (function)

Create an IO from a Promise factory.

**Signature**

```ts
export function fromPromise<A>(thunk: Lazy<Promise<A>>): RIO<DefaultR, unknown, A> { ... }
```

# getMonoid (function)

**Signature**

```ts
export function getMonoid<R, E, A>(m: Monoid<A>): Monoid<RIO<R, E, A>> { ... }
```

# getSemigroup (function)

**Signature**

```ts
export function getSemigroup<R, E, A>(s: Semigroup<A>): Semigroup<RIO<R, E, A>> { ... }
```

# interruptible (function)

Create an interruptible region around the evalution of io

**Signature**

```ts
export function interruptible<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# interruptibleMask (function)

Create an interruptible masked region

Similar to uninterruptibleMask

**Signature**

```ts
export function interruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], RIO<R, E, A>>): RIO<R, E, A> { ... }
```

# interruptibleRegion (function)

Demarcate a region of interruptible state

**Signature**

```ts
export function interruptibleRegion<R, E, A>(inner: RIO<R, E, A>, flag: boolean): RIO<R, E, A> { ... }
```

# lift (function)

Lift a function on values to a function on IOs

**Signature**

```ts
export function lift<A, B>(f: FunctionN<[A], B>): <R, E>(io: RIO<R, E, A>) => RIO<R, E, B> { ... }
```

# liftAs (function)

Curried form of as

**Signature**

```ts
export function liftAs<B>(b: B): <R, E, A>(io: RIO<R, E, A>) => RIO<R, E, B> { ... }
```

# liftDelay (function)

Curried form of delay

**Signature**

```ts
export function liftDelay(ms: number): <R, E, A>(io: RIO<R, E, A>) => RIO<R, E, A> { ... }
```

# map (function)

Map the value produced by an IO

**Signature**

```ts
export function map<R, E, A, B>(base: RIO<R, E, A>, f: FunctionN<[A], B>): RIO<R, E, B> { ... }
```

# mapError (function)

Map the error produced by an IO

**Signature**

```ts
export function mapError<R, E1, E2, A>(io: RIO<R, E1, A>, f: FunctionN<[E1], E2>): RIO<R, E2, A> { ... }
```

# mapErrorWith (function)

Curried form of mapError

**Signature**

```ts
export function mapErrorWith<R, E1, E2>(f: FunctionN<[E1], E2>): <A>(io: RIO<R, E1, A>) => RIO<R, E2, A> { ... }
```

# onComplete (function)

Guarantee that once ioa begins executing the finalizer will execute.

**Signature**

```ts
export function onComplete<R, E, A>(ioa: RIO<R, E, A>, finalizer: RIO<R, E, unknown>): RIO<R, E, A> { ... }
```

# onInterrupted (function)

Guarantee that once ioa begins executing if it is interrupted finalizer will execute

**Signature**

```ts
export function onInterrupted<R, E, A>(ioa: RIO<R, E, A>, finalizer: RIO<R, E, unknown>): RIO<R, E, A> { ... }
```

# orAbort (function)

Convert an error into an unchecked error.

**Signature**

```ts
export function orAbort<R, E, A>(io: RIO<R, E, A>): RIO<R, never, A> { ... }
```

# parAp (function)

Parallel form of ap

**Signature**

```ts
export function parAp<R, E, A, B>(ioa: RIO<R, E, A>, iof: RIO<R, E, FunctionN<[A], B>>): RIO<R, E, B> { ... }
```

# parAp\_ (function)

Parallel form of ap\_

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

Exeute two IOs in parallel and take the result of the second

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
Instead, the resulting IO has an R parameter of DefaultR

**Signature**

```ts
export function provideEnv<R, E, A>(io: RIO<R, E, A>, r: R): RIO<DefaultR, E, A> { ... }
```

# pure (function)

An IO has succeeded

**Signature**

```ts
export function pure<A>(a: A): RIO<DefaultR, never, A> { ... }
```

# race (function)

Return the result of the first IO to complete successfully.

If an error occurs, fall back to the other IO.
If both error, then fail with the second errors

**Signature**

```ts
export function race<R, E, A>(io1: RIO<R, E, A>, io2: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# raceFirst (function)

Return the reuslt of the first IO to complete or error successfully

**Signature**

```ts
export function raceFirst<R, E, A>(io1: RIO<R, E, A>, io2: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# raceFold (function)

Race two fibers together and combine their results.

This is the primitive from which all other racing and timeout operators are built and you should favor those unless you have very specific needs.

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
export function raiseAbort(u: unknown): RIO<DefaultR, never, never> { ... }
```

# raiseError (function)

An IO that is failed with a checked error

**Signature**

```ts
export function raiseError<E>(e: E): RIO<DefaultR, E, never> { ... }
```

# raised (function)

An IO that is failed

Prefer raiseError or raiseAbort

**Signature**

```ts
export function raised<E>(e: Cause<E>): RIO<DefaultR, E, never> { ... }
```

# result (function)

Create an IO that traps all exit states of io.

Note that interruption will not be caught unless in an uninterruptible region

**Signature**

```ts
export function result<R, E, A>(io: RIO<R, E, A>): RIO<R, never, Exit<E, A>> { ... }
```

# runR (function)

Run the given IO with the provided environment.

**Signature**

```ts
export function runR<R, E, A>(io: RIO<R, E, A>, r: R, callback?: FunctionN<[Exit<E, A>], void>): Lazy<void> { ... }
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

# shiftAfter (function)

Introduce a synchronous gap after an io that will allow other fibers to execute (if any are pending)

**Signature**

```ts
export function shiftAfter<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# shiftAsyncAfter (function)

Introduce asynchronous gap after an IO

**Signature**

```ts
export function shiftAsyncAfter<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# shiftAsyncBefore (function)

Introduce an asynchronous gap before IO

**Signature**

```ts
export function shiftAsyncBefore<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# shiftBefore (function)

Introduce a synchronous gap before io that will allow other fibers to execute (if any are pending)

**Signature**

```ts
export function shiftBefore<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# suspended (function)

Wrap a block of impure code that returns an IO into an IO

When evaluated this IO will run the given thunk to produce the next IO to execute.

**Signature**

```ts
export function suspended<R, E, A>(thunk: Lazy<RIO<R, E, A>>): RIO<R, E, A> { ... }
```

# sync (function)

Wrap a block of impure code in an IO

When evaluated the this will produce a value or throw

**Signature**

```ts
export function sync<A>(thunk: Lazy<A>): RIO<DefaultR, never, A> { ... }
```

# timeoutFold (function)

Execute an IO and produce the next IO to run based on whether it completed successfully in the alotted time or not

**Signature**

```ts
export function timeoutFold<R, E1, E2, A, B>(source: RIO<R, E1, A>,
    ms: number,
    onTimeout: FunctionN<[Fiber<E1, A>], RIO<R, E2, B>>,
    onCompleted: FunctionN<[Exit<E1, A>], RIO<R, E2, B>>): RIO<R, E2, B> { ... }
```

# timeoutOption (function)

Run source for a maximum amount of ms.

If it completes succesfully produce a some, if not interrupt it and produce none

**Signature**

```ts
export function timeoutOption<R, E, A>(source: RIO<R, E, A>, ms: number): RIO<R, E, Option<A>> { ... }
```

# to (function)

Curried form of as

**Signature**

```ts
export function to<B>(b: B): <R, E, A>(io: RIO<R, E, A>) => RIO<R, E, B> { ... }
```

# uninterruptible (function)

Create an uninterruptible region around the evaluation of io

**Signature**

```ts
export function uninterruptible<R, E, A>(io: RIO<R, E, A>): RIO<R, E, A> { ... }
```

# uninterruptibleMask (function)

Create an uninterruptible masked region

When the returned IO is evaluated an uninterruptible region will be created and , f will receive an InterruptMaskCutout that can be used to restore the
interruptible status of the region above the one currently executing (which is uninterruptible)

**Signature**

```ts
export function uninterruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], RIO<R, E, A>>): RIO<R, E, A> { ... }
```

# widenEnv (function)

Using WidenEnvFrom and WidenEnvTo encode contravariance of the R type param
RIO<R1, E, A> => RIO<R2, E, A> iff R2 extends R1
Degenerates from

**Signature**

```ts
export function widenEnv<T, R2>(input: WidenEnvFrom<T, R2>): WidenEnvTo<T, R2> { ... }
```

# widenErr (function)

Using WidenErrFrom and WidenErrTo to encode covariance of the E type param
RIO<R, E1, A> => RIO<R, E2, A> iff. E1 extends E2

Degenerates to never => never in the case the widening is invalid
Assumes that if this is in a hot code path it will be inlined as it is only type manipulation

**Signature**

```ts
export function widenErr<T, E2>(input: WidenErrFrom<T, E2>): WidenErrTo<T, E2> { ... }
```

# widenError (function)

Widen the error channel of an IO such that both E1 and E2 are acceptable as errors
If E1 or E2 are related this selects the ancestor, otherwise it selects E1 | E2

**Signature**

```ts
export function widenError<E2>(): <R, E1, A>(io: RIO<R, E1, A>) => RIO<R, Widen<E1, E2>, A> { ... }
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
