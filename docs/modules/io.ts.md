---
title: io.ts
nav_order: 6
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [AccessInterruptible (interface)](#accessinterruptible-interface)
- [AccessRuntime (interface)](#accessruntime-interface)
- [Async (interface)](#async-interface)
- [Chain (interface)](#chain-interface)
- [Collapse (interface)](#collapse-interface)
- [Completed (interface)](#completed-interface)
- [InterruptibleRegion (interface)](#interruptibleregion-interface)
- [Pure (interface)](#pure-interface)
- [Raised (interface)](#raised-interface)
- [Suspended (interface)](#suspended-interface)
- [IO (type alias)](#io-type-alias)
- [InterruptMaskCutout (type alias)](#interruptmaskcutout-type-alias)
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
- [runToPromise (function)](#runtopromise-function)
- [runToPromiseExit (function)](#runtopromiseexit-function)
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
export interface Chain<E, Z, A> {
  readonly _tag: 'chain'
  readonly inner: IO<E, Z>
  readonly bind: FunctionN<[Z], IO<E, A>>
}
```

# Collapse (interface)

**Signature**

```ts
export interface Collapse<E1, E2, A1, A2> {
  readonly _tag: 'collapse'
  readonly inner: IO<E1, A1>
  readonly failure: FunctionN<[Cause<E1>], IO<E2, A2>>
  readonly success: FunctionN<[A1], IO<E2, A2>>
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
export interface InterruptibleRegion<E, A> {
  readonly _tag: 'interrupt-region'
  readonly inner: IO<E, A>
  readonly flag: boolean
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
export interface Suspended<E, A> {
  readonly _tag: 'suspended'
  readonly thunk: Lazy<IO<E, A>>
}
```

# IO (type alias)

A description of an effect to perform

**Signature**

```ts
export type IO<E, A> =
  | Pure<A>
  | Raised<E>
  | Completed<E, A>
  | Suspended<E, A>
  | Async<E, A>
  | Chain<E, any, A>
  | Collapse<any, E, any, A>
  | InterruptibleRegion<E, A>
  | (boolean extends A ? AccessInterruptible : never)
  | (Runtime extends A ? AccessRuntime : never)
```

# InterruptMaskCutout (type alias)

**Signature**

```ts
export type InterruptMaskCutout<E, A> = FunctionN<[IO<E, A>], IO<E, A>>
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

**Signature**

```ts
export const accessInterruptible: IO<never, boolean> = ...
```

# accessRuntime (constant)

**Signature**

```ts
export const accessRuntime: IO<never, Runtime> = ...
```

# instances (constant)

**Signature**

```ts
export const instances: Monad2<URI> = ...
```

# never (constant)

**Signature**

```ts
export const never: IO<never, never> = ...
```

# parInstances (constant)

**Signature**

```ts
export const parInstances: Applicative2<URI> = ...
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

An IO that succeeds immediately with undefineds

**Signature**

```ts
export const unit: IO<never, void> = ...
```

# after (function)

**Signature**

```ts
export function after(ms: number): IO<never, void> { ... }
```

# ap (function)

**Signature**

```ts
export function ap<E, A, B>(ioa: IO<E, A>, iof: IO<E, FunctionN<[A], B>>): IO<E, B> { ... }
```

# apWith (function)

**Signature**

```ts
export function apWith<E, A>(ioa: IO<E, A>): <B>(iof: IO<E, FunctionN<[A], B>>) => IO<E, B> { ... }
```

# apWith\_ (function)

**Signature**

```ts
export function apWith_<E, A, B>(iof: IO<E, FunctionN<[A], B>>): FunctionN<[IO<E, A>], IO<E, B>> { ... }
```

# ap\_ (function)

**Signature**

```ts
export function ap_<E, A, B>(iof: IO<E, FunctionN<[A], B>>, ioa: IO<E, A>): IO<E, B> { ... }
```

# applyFirst (function)

Evaluate two IOs in sequence and produce the value produced by the first

**Signature**

```ts
export function applyFirst<E, A, B>(first: IO<E, A>, second: IO<E, B>): IO<E, A> { ... }
```

# applyOther (function)

**Signature**

```ts
export function applyOther<E, A>(first: IO<E, A>): <B>(second: IO<E, B>) => IO<E, B> { ... }
```

# applySecond (function)

**Signature**

```ts
export function applySecond<E, A, B>(first: IO<E, A>, second: IO<E, B>): IO<E, B> { ... }
```

# applyThis (function)

**Signature**

```ts
export function applyThis<E, A>(first: IO<E, A>): <B>(second: IO<E, B>) => IO<E, A> { ... }
```

# as (function)

Map the value produced by an IO to the constant b

**Signature**

```ts
export function as<E, A, B>(io: IO<E, A>, b: B): IO<E, B> { ... }
```

# asUnit (function)

Map the value produced by an IO to undefined

**Signature**

```ts
export function asUnit<E, A>(io: IO<E, A>): IO<E, void> { ... }
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

This is a variant of async where the effect cannot fail.

**Signature**

```ts
export function asyncTotal<A>(op: FunctionN<[FunctionN<[A], void>], Lazy<void>>): Async<never, A> { ... }
```

# bimap (function)

Map over either the error or value produced by an IO

**Signature**

```ts
export function bimap<E1, E2, A, B>(io: IO<E1, A>,
                                    leftMap: FunctionN<[E1], E2>,
                                    rightMap: FunctionN<[A], B>): IO<E2, B> { ... }
```

# bimapWith (function)

Data last form of bimap

**Signature**

```ts
export function bimapWith<E1, E2, A, B>(leftMap: FunctionN<[E1], E2>,
                                        rightMap: FunctionN<[A], B>): FunctionN<[IO<E1, A>], IO<E2, B>> { ... }
```

# bracket (function)

**Signature**

```ts
export function bracket<E, A, B>(acquire: IO<E, A>,
                                 release: FunctionN<[A], IO<E, unknown>>,
                                 use: FunctionN<[A], IO<E, B>>): IO<E, B> { ... }
```

# bracketExit (function)

**Signature**

```ts
export function bracketExit<E, A, B>(acquire: IO<E, A>,
                                     release: FunctionN<[A, Exit<E, B>], IO<E, unknown>>,
                                     use: FunctionN<[A], IO<E, B>>): IO<E, B> { ... }
```

# chain (function)

Produce an new IO that will use the value produced by inner to produce the next IO to evaluate

**Signature**

```ts
export function chain<E, Z, A>(inner: IO<E, Z>, bind: FunctionN<[Z], IO<E, A>>): Chain<E, Z, A> { ... }
```

# chainError (function)

Produce an new IO that will use the error produced by inner to produce a recovery program

**Signature**

```ts
export function chainError<E1, E2, A>(io: IO<E1, A>, f: FunctionN<[E1], IO<E2, A>>): IO<E2, A> { ... }
```

# chainErrorWith (function)

Data last form of chainError

**Signature**

```ts
export function chainErrorWith<E1, E2, A>(f: FunctionN<[E1], IO<E2, A>>): FunctionN<[IO<E1, A>], IO<E2, A>> { ... }
```

# chainWith (function)

**Signature**

```ts
export function chainWith<E, Z, A>(bind: FunctionN<[Z], IO<E, A>>): FunctionN<[IO<E, Z>], Chain<E, Z, A>> { ... }
```

# completed (function)

Create an IO that completes immediately with the provided exit status

**Signature**

```ts
export function completed<E, A>(exit: Exit<E, A>): Completed<E, A> { ... }
```

# delay (function)

**Signature**

```ts
export function delay<E, A>(inner: IO<E, A>, ms: number): IO<E, A> { ... }
```

# flatten (function)

Flatten a nested IO

**Signature**

```ts
export function flatten<E, A>(inner: IO<E, IO<E, A>>): IO<E, A> { ... }
```

# flip (function)

**Signature**

```ts
export function flip<E, A>(io: IO<E, A>): IO<A, E> { ... }
```

# foldExit (function)

**Signature**

```ts
export function foldExit<E1, E2, A1, A2>(inner: IO<E1, A1>,
                                         failure: FunctionN<[Cause<E1>], IO<E2, A2>>,
                                         success: FunctionN<[A1], IO<E2, A2>>): Collapse<E1, E2, A1, A2> { ... }
```

# foldExitWith (function)

**Signature**

```ts
export function foldExitWith<E1, E2, A1, A2>(failure: FunctionN<[Cause<E1>], IO<E2, A2>>,
                                             success: FunctionN<[A1], IO<E2, A2>>):
                                             FunctionN<[IO<E1, A1>], Collapse<E1, E2, A1, A2>> { ... }
```

# fork (function)

**Signature**

```ts
export function fork<E, A>(io: IO<E, A>, name?: string): IO<never, Fiber<E, A>> { ... }
```

# fromPromise (function)

**Signature**

```ts
export function fromPromise<A>(thunk: Lazy<Promise<A>>): IO<unknown, A> { ... }
```

# interruptible (function)

**Signature**

```ts
export function interruptible<E, A>(io: IO<E, A>): IO<E, A> { ... }
```

# interruptibleMask (function)

**Signature**

```ts
export function interruptibleMask<E, A>(f: FunctionN<[InterruptMaskCutout<E, A>], IO<E, A>>): IO<E, A> { ... }
```

# interruptibleRegion (function)

Demarcate a region of interruptible state

**Signature**

```ts
export function interruptibleRegion<E, A>(inner: IO<E, A>, flag: boolean): InterruptibleRegion<E, A> { ... }
```

# lift (function)

Lift a function on values to a function on IOs

**Signature**

```ts
export function lift<A, B>(f: FunctionN<[A], B>): <E>(io: IO<E, A>) => IO<E, B> { ... }
```

# liftAs (function)

**Signature**

```ts
export function liftAs<B>(b: B): <E, A>(io: IO<E, A>) => IO<E, B> { ... }
```

# liftDelay (function)

**Signature**

```ts
export function liftDelay(ms: number): <E, A>(io: IO<E, A>) => IO<E, A> { ... }
```

# map (function)

Map the value produced by an IO

**Signature**

```ts
export function map<E, A, B>(io: IO<E, A>, f: FunctionN<[A], B>): IO<E, B> { ... }
```

# mapError (function)

Map the error produced by an IO

**Signature**

```ts
export function mapError<E1, E2, A>(io: IO<E1, A>, f: FunctionN<[E1], E2>): IO<E2, A> { ... }
```

# mapErrorWith (function)

Lift a function on error values to a function on IOs

**Signature**

```ts
export function mapErrorWith<E1, E2>(f: FunctionN<[E1], E2>): <A>(io: IO<E1, A>) => IO<E2, A> { ... }
```

# onComplete (function)

**Signature**

```ts
export function onComplete<E, A>(ioa: IO<E, A>, finalizer: IO<E, unknown>): IO<E, A> { ... }
```

# onInterrupted (function)

**Signature**

```ts
export function onInterrupted<E, A>(ioa: IO<E, A>, finalizer: IO<E, unknown>): IO<E, A> { ... }
```

# parAp (function)

**Signature**

```ts
export function parAp<E, A, B>(ioa: IO<E, A>, iof: IO<E, FunctionN<[A], B>>): IO<E, B> { ... }
```

# parAp\_ (function)

**Signature**

```ts
export function parAp_<E, A, B>(iof: IO<E, FunctionN<[A], B>>, ioa: IO<E, A>): IO<E, B> { ... }
```

# parApplyFirst (function)

**Signature**

```ts
export function parApplyFirst<E, A, B>(ioa: IO<E, A>, iob: IO<E, B>): IO<E, A> { ... }
```

# parApplySecond (function)

**Signature**

```ts
export function parApplySecond<E, A, B>(ioa: IO<E, A>, iob: IO<E, B>): IO<E, B> { ... }
```

# parZip (function)

**Signature**

```ts
export function parZip<E, A, B>(ioa: IO<E, A>, iob: IO<E, B>): IO<E, readonly [A, B]> { ... }
```

# parZipWith (function)

**Signature**

```ts
export function parZipWith<E, A, B, C>(ioa: IO<E, A>, iob: IO<E, B>, f: FunctionN<[A, B], C>): IO<E, C> { ... }
```

# pure (function)

Create an IO that succeeds immediately with a value

**Signature**

```ts
export function pure<A>(a: A): Pure<A> { ... }
```

# race (function)

**Signature**

```ts
export function race<E, A>(io1: IO<E, A>, io2: IO<E, A>): IO<E, A> { ... }
```

# raceFirst (function)

**Signature**

```ts
export function raceFirst<E, A>(io1: IO<E, A>, io2: IO<E, A>): IO<E, A> { ... }
```

# raceFold (function)

**Signature**

```ts
export function raceFold<E1, E2, A, B, C>(first: IO<E1, A>, second: IO<E1, B>,
                                          onFirstWon: FunctionN<[Exit<E1, A>, Fiber<E1, B>], IO<E2, C>>,
                                          onSecondWon: FunctionN<[Exit<E1, B>, Fiber<E1, A>], IO<E2, C>>): IO<E2, C> { ... }
```

# raiseAbort (function)

Creates an IO that fails immediately with an abort

**Signature**

```ts
export function raiseAbort(u: unknown): Raised<never> { ... }
```

# raiseError (function)

Create an IO that fails immediately with an error

**Signature**

```ts
export function raiseError<E>(e: E): Raised<E> { ... }
```

# raised (function)

Create an IO that fails immediately with some Cause

**Signature**

```ts
export function raised<E>(e: Cause<E>): Raised<E> { ... }
```

# result (function)

**Signature**

```ts
export function result<E, A>(io: IO<E, A>): IO<never, Exit<E, A>> { ... }
```

# resultE (function)

**Signature**

```ts
export function resultE<E, A>(io: IO<E, A>): IO<E, Exit<E, A>> { ... }
```

# run (function)

**Signature**

```ts
export function run<E, A>(io: IO<E, A>, callback: FunctionN<[Exit<E, A>], void>): Lazy<void> { ... }
```

# runToPromise (function)

Run an IO returning a promise of the result.

The returned promise will resolve with a success value.
The returned promies will reject with an E, and unknown, or undefined in the case of raise, abort, or interrupt
respectively.
The returned promise may never complete if the provided IO never produces a value or error.

**Signature**

```ts
export function runToPromise<E, A>(io: IO<E, A>): Promise<A> { ... }
```

# runToPromiseExit (function)

Run an IO returning a promise of the Exit

The returned promise will never reject.

**Signature**

```ts
export function runToPromiseExit<E, A>(io: IO<E, A>): Promise<Exit<E, A>> { ... }
```

# shift (function)

**Signature**

```ts
export function shift<E, A>(io: IO<E, A>): IO<E, A> { ... }
```

# shiftAsync (function)

**Signature**

```ts
export function shiftAsync<E, A>(io: IO<E, A>): IO<E, A> { ... }
```

# suspended (function)

Wrap a block of impure code in an IO.

When evaluated this IO will run thunk to produce the next IO to execute.

**Signature**

```ts
export function suspended<E, A>(thunk: Lazy<IO<E, A>>): Suspended<E, A> { ... }
```

# sync (function)

Wrap a block of impure code in an IO

When evaluated the created IO will produce the value produced by the thunk

**Signature**

```ts
export function sync<A>(thunk: Lazy<A>): Suspended<never, A> { ... }
```

# timeoutFold (function)

**Signature**

```ts
export function timeoutFold<E1, E2, A, B>(source: IO<E1, A>,
                                          ms: number,
                                          onTimeout: FunctionN<[Fiber<E1, A>], IO<E2, B>>,
                                          onCompleted: FunctionN<[Exit<E1, A>], IO<E2, B>>): IO<E2, B> { ... }
```

# timeoutOption (function)

**Signature**

```ts
export function timeoutOption<E, A>(source: IO<E, A>, ms: number) { ... }
```

# uninterruptible (function)

**Signature**

```ts
export function uninterruptible<E, A>(io: IO<E, A>): IO<E, A> { ... }
```

# uninterruptibleMask (function)

**Signature**

```ts
export function uninterruptibleMask<E, A>(f: FunctionN<[InterruptMaskCutout<E, A>], IO<E, A>>): IO<E, A> { ... }
```

# withRuntime (function)

**Signature**

```ts
export function withRuntime<E, A>(f: FunctionN<[Runtime], IO<E, A>>): IO<E, A> { ... }
```

# zip (function)

Zip the result of two IOs together into a tuple type

**Signature**

```ts
export function zip<E, A, B>(first: IO<E, A>, second: IO<E, B>): IO<E, readonly [A, B]> { ... }
```

# zipWith (function)

Zip the result of two IOs together using the provided function

**Signature**

```ts
export function zipWith<E, A, B, C>(first: IO<E, A>, second: IO<E, B>, f: FunctionN<[A, B], C>): IO<E, C> { ... }
```
