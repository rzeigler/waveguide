---
title: wave.ts
nav_order: 21
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
- [Fiber (interface)](#fiber-interface)
- [InterruptibleRegion (interface)](#interruptibleregion-interface)
- [Pure (interface)](#pure-interface)
- [Raised (interface)](#raised-interface)
- [Suspended (interface)](#suspended-interface)
- [InterruptMaskCutout (type alias)](#interruptmaskcutout-type-alias)
- [ReturnCovaryE (type alias)](#returncovarye-type-alias)
- [URI (type alias)](#uri-type-alias)
- [Wave (type alias)](#wave-type-alias)
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
- [after (function)](#after-function)
- [ap (function)](#ap-function)
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
- [covaryE (function)](#covarye-function)
- [covaryToE (function)](#covarytoe-function)
- [delay (function)](#delay-function)
- [encaseEither (function)](#encaseeither-function)
- [encaseOption (function)](#encaseoption-function)
- [flatten (function)](#flatten-function)
- [flip (function)](#flip-function)
- [foldExit (function)](#foldexit-function)
- [foldExitWith (function)](#foldexitwith-function)
- [forever (function)](#forever-function)
- [fork (function)](#fork-function)
- [fromPromise (function)](#frompromise-function)
- [getMonoid (function)](#getmonoid-function)
- [getSemigroup (function)](#getsemigroup-function)
- [interruptible (function)](#interruptible-function)
- [interruptibleMask (function)](#interruptiblemask-function)
- [interruptibleRegion (function)](#interruptibleregion-function)
- [lift (function)](#lift-function)
- [liftDelay (function)](#liftdelay-function)
- [makeFiber (function)](#makefiber-function)
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
- [pure (function)](#pure-function)
- [race (function)](#race-function)
- [raceFirst (function)](#racefirst-function)
- [raceFold (function)](#racefold-function)
- [raiseAbort (function)](#raiseabort-function)
- [raiseError (function)](#raiseerror-function)
- [raised (function)](#raised-function)
- [result (function)](#result-function)
- [run (function)](#run-function)
- [runToPromise (function)](#runtopromise-function)
- [runToPromiseExit (function)](#runtopromiseexit-function)
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
- [withRuntime (function)](#withruntime-function)
- [zip (function)](#zip-function)
- [zipWith (function)](#zipwith-function)

---

# AccessInterruptible (interface)

**Signature**

```ts
export interface AccessInterruptible<E, A> {
  readonly _tag: WaveTag.AccessInterruptible
  readonly f: FunctionN<[boolean], A>
}
```

# AccessRuntime (interface)

**Signature**

```ts
export interface AccessRuntime<E, A> {
  readonly _tag: WaveTag.AccessRuntime
  readonly f: FunctionN<[Runtime], A>
}
```

# Async (interface)

**Signature**

```ts
export interface Async<E, A> {
  readonly _tag: WaveTag.Async
  readonly op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>
}
```

# Chain (interface)

**Signature**

```ts
export interface Chain<E, Z, A> {
  readonly _tag: WaveTag.Chain
  readonly inner: Wave<E, Z>
  readonly bind: FunctionN<[Z], Wave<E, A>>
}
```

# Collapse (interface)

**Signature**

```ts
export interface Collapse<E1, E2, A1, A2> {
  readonly _tag: WaveTag.Collapse
  readonly inner: Wave<E1, A1>
  readonly failure: FunctionN<[Cause<E1>], Wave<E2, A2>>
  readonly success: FunctionN<[A1], Wave<E2, A2>>
}
```

# Completed (interface)

**Signature**

```ts
export interface Completed<E, A> {
  readonly _tag: WaveTag.Completed
  readonly exit: Exit<E, A>
}
```

# Fiber (interface)

**Signature**

```ts
export interface Fiber<E, A> {
  /**
   * The name of the fiber
   */
  readonly name: Option<string>
  /**
   * Send an interrupt signal to this fiber.
   *
   * The this will complete execution once the target fiber has halted.
   * Does nothing if the target fiber is already complete
   */
  readonly interrupt: Wave<never, void>
  /**
   * Await the result of this fiber
   */
  readonly wait: Wave<never, Exit<E, A>>
  /**
   * Join with this fiber.
   * This is equivalent to fiber.wait.chain(io.completeWith)
   */
  readonly join: Wave<E, A>
  /**
   * Poll for a fiber result
   */
  readonly result: Wave<E, Option<A>>
  /**
   * Determine if the fiber is complete
   */
  readonly isComplete: Wave<never, boolean>
}
```

# InterruptibleRegion (interface)

**Signature**

```ts
export interface InterruptibleRegion<E, A> {
  readonly _tag: WaveTag.InterruptibleRegion
  readonly inner: Wave<E, A>
  readonly flag: boolean
}
```

# Pure (interface)

**Signature**

```ts
export interface Pure<E, A> {
  readonly _tag: WaveTag.Pure
  readonly value: A
}
```

# Raised (interface)

**Signature**

```ts
export interface Raised<E, A> {
  readonly _tag: WaveTag.Raised
  readonly error: Cause<E>
}
```

# Suspended (interface)

**Signature**

```ts
export interface Suspended<E, A> {
  readonly _tag: WaveTag.Suspended
  readonly thunk: Lazy<Wave<E, A>>
}
```

# InterruptMaskCutout (type alias)

The type of a function that can restore outer interruptible state

**Signature**

```ts
export type InterruptMaskCutout<E, A> = FunctionN<[Wave<E, A>], Wave<E, A>>
```

# ReturnCovaryE (type alias)

**Signature**

```ts
export type ReturnCovaryE<T, E2> = T extends Wave<infer E, infer A>
  ? (E extends E2 ? Wave<E2, A> : Wave<E | E2, A>)
  : never
```

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# Wave (type alias)

A description of an effect to perform

**Signature**

```ts
export type Wave<E, A> =
  | Pure<E, A>
  | Raised<E, A>
  | Completed<E, A>
  | Suspended<E, A>
  | Async<E, A>
  | Chain<E, any, A> // eslint-disable-line @typescript-eslint/no-explicit-any
  | Collapse<any, E, any, A> // eslint-disable-line @typescript-eslint/no-explicit-any
  | InterruptibleRegion<E, A>
  | AccessInterruptible<E, A>
  | AccessRuntime<E, A>
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
export const accessInterruptible: Wave<never, boolean> = ...
```

# accessRuntime (constant)

Get the runtime of the current fiber

**Signature**

```ts
export const accessRuntime: Wave<never, Runtime> = ...
```

# instances (constant)

**Signature**

```ts
export const instances:  MonadThrow2<URI> = ...
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
export const never: Wave<never, never> = ...
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
export const raiseInterrupt: Wave<never, never> = ...
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
export const unit: Wave<never, void> = ...
```

# after (function)

Create an IO that produces void after ms milliseconds

**Signature**

```ts
export function after(ms: number): Wave<never, void> { ... }
```

# ap (function)

Applicative ap

**Signature**

```ts
export function ap<E, A, B>(ioa: Wave<E, A>, iof: Wave<E, FunctionN<[A], B>>): Wave<E, B> { ... }
```

# ap\_ (function)

Flipped argument form of ap

**Signature**

```ts
export function ap_<E, A, B>(iof: Wave<E, FunctionN<[A], B>>, ioa: Wave<E, A>): Wave<E, B> { ... }
```

# applyFirst (function)

Evaluate two IOs in sequence and produce the value produced by the first

**Signature**

```ts
export function applyFirst<E, A, B>(first: Wave<E, A>, second: Wave<E, B>): Wave<E, A> { ... }
```

# applySecond (function)

Evaluate two IOs in sequence and produce the value produced by the second

**Signature**

```ts
export function applySecond<E, A, B>(first: Wave<E, A>, second: Wave<E, B>): Wave<E, B> { ... }
```

# applySecondL (function)

Evaluate two IOs in sequence and produce the value of the second.
This is suitable for cases where second is recursively defined

**Signature**

```ts
export function applySecondL<E, A, B>(first: Wave<E, A>, second: Lazy<Wave<E, B>>): Wave<E, B> { ... }
```

# as (function)

Map the value produced by an IO to the constant b

**Signature**

```ts
export function as<E, A, B>(io: Wave<E, A>, b: B): Wave<E, B> { ... }
```

# asUnit (function)

Map the value produced by an IO to void

**Signature**

```ts
export function asUnit<E, A>(io: Wave<E, A>): Wave<E, void> { ... }
```

# async (function)

Wrap an impure callback in an IO

The provided function must accept a callback to report results to and return a cancellation action.
If your action is uncancellable for some reason, you should return an empty thunk and wrap the created IO
in uninterruptible

**Signature**

```ts
export function async<E, A>(op: FunctionN<[FunctionN<[Either<E, A>], void>], Lazy<void>>): Wave<E, A> { ... }
```

# asyncTotal (function)

Wrap an impure callback in IO

This is a variant of async where the effect cannot fail with a checked exception.

**Signature**

```ts
export function asyncTotal<A>(op: FunctionN<[FunctionN<[A], void>], Lazy<void>>): Wave<never, A> { ... }
```

# bimap (function)

Map over either the error or value produced by an IO

**Signature**

```ts
export function bimap<E1, E2, A, B>(io: Wave<E1, A>,
    leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): Wave<E2, B> { ... }
```

# bimapWith (function)

Curried form of bimap

**Signature**

```ts
export function bimapWith<E1, E2, A, B>(leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): FunctionN<[Wave<E1, A>], Wave<E2, B>> { ... }
```

# bracket (function)

Weaker form of bracketExit where release does not receive the exit status of use

**Signature**

```ts
export function bracket<E, A, B>(acquire: Wave<E, A>,
    release: FunctionN<[A], Wave<E, unknown>>,
    use: FunctionN<[A], Wave<E, B>>): Wave<E, B> { ... }
```

# bracketExit (function)

Resource acquisition and release construct.

Once acquire completes successfully, release is guaranteed to execute following the evaluation of the IO produced by use.
Release receives the exit state of use along with the resource.

**Signature**

```ts
export function bracketExit<E, A, B>(acquire: Wave<E, A>,
    release: FunctionN<[A, Exit<E, B>], Wave<E, unknown>>,
    use: FunctionN<[A], Wave<E, B>>): Wave<E, B> { ... }
```

# chain (function)

Produce an new IO that will use the value produced by inner to produce the next IO to evaluate

**Signature**

```ts
export function chain<E, A, B>(inner: Wave<E, A>, bind: FunctionN<[A], Wave<E, B>>): Wave<E, B> { ... }
```

# chainError (function)

Produce an new IO that will use the error produced by inner to produce a recovery program

**Signature**

```ts
export function chainError<E1, E2, A>(io: Wave<E1, A>, f: FunctionN<[E1], Wave<E2, A>>): Wave<E2, A> { ... }
```

# chainErrorWith (function)

Curriend form of chainError

**Signature**

```ts
export function chainErrorWith<E1, E2, A>(f: FunctionN<[E1], Wave<E2, A>>): (rio: Wave<E1, A>) => Wave<E2, A> { ... }
```

# chainTap (function)

Sequence a Wave and then produce an effect based on the produced value for observation.

Produces the result of the iniital Wave

**Signature**

```ts
export function chainTap<E, A>(inner: Wave<E, A>, bind: FunctionN<[A], Wave<E, unknown>>): Wave<E, A> { ... }
```

# chainTapWith (function)

**Signature**

```ts
export function chainTapWith<E, A>(bind: FunctionN<[A], Wave<E, unknown>>): (inner: Wave<E, A>) => Wave<E, A> { ... }
```

# chainWith (function)

Curried function first form of chain

**Signature**

```ts
export function chainWith<E, Z, A>(bind: FunctionN<[Z], Wave<E, A>>): (io: Wave<E, Z>) => Wave<E, A> { ... }
```

# completed (function)

An IO that is completed with the given exit

**Signature**

```ts
export function completed<E, A>(exit: Exit<E, A>): Wave<E, A> { ... }
```

# covaryE (function)

Perform a widening of Wave<E1, A> such that the result includes E2.

This encapsulates normal subtype widening, but will also widen to E1 | E2 as a fallback
Assumes that this function (which does nothing when compiled to js) will be inlined in hot code

**Signature**

```ts
export function covaryE<E1, A, E2>(wave: Wave<E1, A>): ReturnCovaryE<typeof wave, E2> { ... }
```

# covaryToE (function)

Type inference helper form of covaryToE

**Signature**

```ts
export function covaryToE<E2>(): <R, E1, A>(wave: Wave<E1, A>) => ReturnCovaryE<typeof wave, E2> { ... }
```

# delay (function)

Delay evaluation of inner by some amount of time

**Signature**

```ts
export function delay<E, A>(inner: Wave<E, A>, ms: number): Wave<E, A> { ... }
```

# encaseEither (function)

Lift an Either into an IO

**Signature**

```ts
export function encaseEither<E, A>(e: Either<E, A>): Wave<E, A> { ... }
```

# encaseOption (function)

Lift an Option into an IO

**Signature**

```ts
export function encaseOption<E, A>(o: Option<A>, onError: Lazy<E>): Wave<E, A> { ... }
```

# flatten (function)

Flatten a nested IO

**Signature**

```ts
export function flatten<E, A>(inner: Wave<E, Wave<E, A>>): Wave<E, A> { ... }
```

# flip (function)

Flip the error and success channels in an IO

**Signature**

```ts
export function flip<E, A>(io: Wave<E, A>): Wave<A, E> { ... }
```

# foldExit (function)

Fold the result of an IO into a new IO.

This can be thought of as a more powerful form of chain
where the computation continues with a new IO depending on the result of inner.

**Signature**

```ts
export function foldExit<E1, E2, A1, A2>(inner: Wave<E1, A1>,
    failure: FunctionN<[Cause<E1>], Wave<E2, A2>>,
    success: FunctionN<[A1], Wave<E2, A2>>): Wave<E2, A2> { ... }
```

# foldExitWith (function)

Curried form of foldExit

**Signature**

```ts
export function foldExitWith<E1, E2, A1, A2>(failure: FunctionN<[Cause<E1>], Wave<E2, A2>>,
    success: FunctionN<[A1], Wave<E2, A2>>):
    FunctionN<[Wave<E1, A1>], Wave<E2, A2>> { ... }
```

# forever (function)

Execute the provided IO forever (or until it errors)

**Signature**

```ts
export function forever<E, A>(io: Wave<E, A>): Wave<E, A> { ... }
```

# fork (function)

Fork the program described by IO in a separate fiber.

This fiber will begin executing once the current fiber releases control of the runloop.
If you need to begin the fiber immediately you should use applyFirst(forkIO, shifted)

**Signature**

```ts
export function fork<E, A>(io: Wave<E, A>, name?: string): Wave<never, Fiber<E, A>> { ... }
```

# fromPromise (function)

Create an IO from a Promise factory.

**Signature**

```ts
export function fromPromise<A>(thunk: Lazy<Promise<A>>): Wave<unknown, A> { ... }
```

# getMonoid (function)

**Signature**

```ts
export function getMonoid<E, A>(m: Monoid<A>): Monoid<Wave<E, A>> { ... }
```

# getSemigroup (function)

**Signature**

```ts
export function getSemigroup<E, A>(s: Semigroup<A>): Semigroup<Wave<E, A>> { ... }
```

# interruptible (function)

Create an interruptible region around the evalution of io

**Signature**

```ts
export function interruptible<E, A>(io: Wave<E, A>): Wave<E, A> { ... }
```

# interruptibleMask (function)

Create an interruptible masked region

Similar to uninterruptibleMask

**Signature**

```ts
export function interruptibleMask<E, A>(f: FunctionN<[InterruptMaskCutout<E, A>], Wave<E, A>>): Wave<E, A> { ... }
```

# interruptibleRegion (function)

Demarcate a region of interruptible state

**Signature**

```ts
export function interruptibleRegion<E, A>(inner: Wave<E, A>, flag: boolean): Wave<E, A> { ... }
```

# lift (function)

Lift a function on values to a function on IOs

**Signature**

```ts
export function lift<A, B>(f: FunctionN<[A], B>): <E>(io: Wave<E, A>) => Wave<E, B> { ... }
```

# liftDelay (function)

Curried form of delay

**Signature**

```ts
export function liftDelay(ms: number): <E, A>(io: Wave<E, A>) => Wave<E, A> { ... }
```

# makeFiber (function)

Implementation of wave/waver fork. Creates an IO that will fork a fiber in the background

**Signature**

```ts
export function makeFiber<E, A>(init: Wave<E, A>, name?: string): Wave<never, Fiber<E, A>> { ... }
```

# map (function)

Map the value produced by an IO

**Signature**

```ts
export function map<E, A, B>(base: Wave<E, A>, f: FunctionN<[A], B>): Wave<E, B> { ... }
```

# mapError (function)

Map the error produced by an IO

**Signature**

```ts
export function mapError<E1, E2, A>(io: Wave<E1, A>, f: FunctionN<[E1], E2>): Wave<E2, A> { ... }
```

# mapErrorWith (function)

Curried form of mapError

**Signature**

```ts
export function mapErrorWith<E1, E2>(f: FunctionN<[E1], E2>): <A>(io: Wave<E1, A>) => Wave<E2, A> { ... }
```

# onComplete (function)

Guarantee that once ioa begins executing the finalizer will execute.

**Signature**

```ts
export function onComplete<E, A>(ioa: Wave<E, A>, finalizer: Wave<E, unknown>): Wave<E, A> { ... }
```

# onInterrupted (function)

Guarantee that once ioa begins executing if it is interrupted finalizer will execute

**Signature**

```ts
export function onInterrupted<E, A>(ioa: Wave<E, A>, finalizer: Wave<E, unknown>): Wave<E, A> { ... }
```

# orAbort (function)

Convert an error into an unchecked error.

**Signature**

```ts
export function orAbort<E, A>(io: Wave<E, A>): Wave<never, A> { ... }
```

# parAp (function)

Parallel form of ap

**Signature**

```ts
export function parAp<E, A, B>(ioa: Wave<E, A>, iof: Wave<E, FunctionN<[A], B>>): Wave<E, B> { ... }
```

# parAp\_ (function)

Parallel form of ap\_

**Signature**

```ts
export function parAp_<E, A, B>(iof: Wave<E, FunctionN<[A], B>>, ioa: Wave<E, A>): Wave<E, B> { ... }
```

# parApplyFirst (function)

Execute two ios in parallel and take the result of the first.

**Signature**

```ts
export function parApplyFirst<E, A, B>(ioa: Wave<E, A>, iob: Wave<E, B>): Wave<E, A> { ... }
```

# parApplySecond (function)

Exeute two IOs in parallel and take the result of the second

**Signature**

```ts
export function parApplySecond<E, A, B>(ioa: Wave<E, A>, iob: Wave<E, B>): Wave<E, B> { ... }
```

# parZip (function)

Tuple the result of 2 ios executed in parallel

**Signature**

```ts
export function parZip<E, A, B>(ioa: Wave<E, A>, iob: Wave<E, B>): Wave<E, readonly [A, B]> { ... }
```

# parZipWith (function)

Zip the result of 2 ios executed in parallel together with the provided function.

**Signature**

```ts
export function parZipWith<E, A, B, C>(ioa: Wave<E, A>, iob: Wave<E, B>, f: FunctionN<[A, B], C>): Wave<E, C> { ... }
```

# pure (function)

An IO has succeeded

**Signature**

```ts
export function pure<A>(a: A): Wave<never, A> { ... }
```

# race (function)

Return the result of the first IO to complete successfully.

If an error occurs, fall back to the other IO.
If both error, then fail with the second errors

**Signature**

```ts
export function race<E, A>(io1: Wave<E, A>, io2: Wave<E, A>): Wave<E, A> { ... }
```

# raceFirst (function)

Return the reuslt of the first IO to complete or error successfully

**Signature**

```ts
export function raceFirst<E, A>(io1: Wave<E, A>, io2: Wave<E, A>): Wave<E, A> { ... }
```

# raceFold (function)

Race two fibers together and combine their results.

This is the primitive from which all other racing and timeout operators are built and you should favor those unless you have very specific needs.

**Signature**

```ts
export function raceFold<E1, E2, A, B, C>(first: Wave<E1, A>, second: Wave<E1, B>,
    onFirstWon: FunctionN<[Exit<E1, A>, Fiber<E1, B>], Wave<E2, C>>,
    onSecondWon: FunctionN<[Exit<E1, B>, Fiber<E1, A>], Wave<E2, C>>): Wave<E2, C> { ... }
```

# raiseAbort (function)

An IO that is failed with an unchecked error

**Signature**

```ts
export function raiseAbort(u: unknown): Wave<never, never> { ... }
```

# raiseError (function)

An IO that is failed with a checked error

**Signature**

```ts
export function raiseError<E>(e: E): Wave<E, never> { ... }
```

# raised (function)

An IO that is failed

Prefer raiseError or raiseAbort

**Signature**

```ts
export function raised<E>(e: Cause<E>): Wave<E, never> { ... }
```

# result (function)

Create an IO that traps all exit states of io.

Note that interruption will not be caught unless in an uninterruptible region

**Signature**

```ts
export function result<E, A>(io: Wave<E, A>): Wave<never, Exit<E, A>> { ... }
```

# run (function)

Run the given IO with the provided environment.

**Signature**

```ts
export function run<E, A>(io: Wave<E, A>, callback?: FunctionN<[Exit<E, A>], void>): Lazy<void> { ... }
```

# runToPromise (function)

Run an IO and return a Promise of its result

Allows providing an environment parameter directly

**Signature**

```ts
export function runToPromise<E, A>(io: Wave<E, A>): Promise<A> { ... }
```

# runToPromiseExit (function)

Run an IO returning a promise of an Exit.

The Promise will not reject.
Allows providing an environment parameter directly

**Signature**

```ts
export function runToPromiseExit<E, A>(io: Wave<E, A>): Promise<Exit<E, A>> { ... }
```

# shiftAfter (function)

Introduce a synchronous gap after an io that will allow other fibers to execute (if any are pending)

**Signature**

```ts
export function shiftAfter<E, A>(io: Wave<E, A>): Wave<E, A> { ... }
```

# shiftAsyncAfter (function)

Introduce asynchronous gap after an IO

**Signature**

```ts
export function shiftAsyncAfter<E, A>(io: Wave<E, A>): Wave<E, A> { ... }
```

# shiftAsyncBefore (function)

Introduce an asynchronous gap before IO

**Signature**

```ts
export function shiftAsyncBefore<E, A>(io: Wave<E, A>): Wave<E, A> { ... }
```

# shiftBefore (function)

Introduce a synchronous gap before io that will allow other fibers to execute (if any are pending)

**Signature**

```ts
export function shiftBefore<E, A>(io: Wave<E, A>): Wave<E, A> { ... }
```

# suspended (function)

Wrap a block of impure code that returns an IO into an IO

When evaluated this IO will run the given thunk to produce the next IO to execute.

**Signature**

```ts
export function suspended<E, A>(thunk: Lazy<Wave<E, A>>): Wave<E, A> { ... }
```

# sync (function)

Wrap a block of impure code in an IO

When evaluated the this will produce a value or throw

**Signature**

```ts
export function sync<A>(thunk: Lazy<A>): Wave<never, A> { ... }
```

# timeoutFold (function)

Execute an IO and produce the next IO to run based on whether it completed successfully in the alotted time or not

**Signature**

```ts
export function timeoutFold<E1, E2, A, B>(source: Wave<E1, A>,
    ms: number,
    onTimeout: FunctionN<[Fiber<E1, A>], Wave<E2, B>>,
    onCompleted: FunctionN<[Exit<E1, A>], Wave<E2, B>>): Wave<E2, B> { ... }
```

# timeoutOption (function)

Run source for a maximum amount of ms.

If it completes succesfully produce a some, if not interrupt it and produce none

**Signature**

```ts
export function timeoutOption<E, A>(source: Wave<E, A>, ms: number): Wave<E, Option<A>> { ... }
```

# to (function)

Curried form of as

**Signature**

```ts
export function to<B>(b: B): <E, A>(io: Wave<E, A>) => Wave<E, B> { ... }
```

# uninterruptible (function)

Create an uninterruptible region around the evaluation of io

**Signature**

```ts
export function uninterruptible<E, A>(io: Wave<E, A>): Wave<E, A> { ... }
```

# uninterruptibleMask (function)

Create an uninterruptible masked region

When the returned IO is evaluated an uninterruptible region will be created and , f will receive an InterruptMaskCutout that can be used to restore the
interruptible status of the region above the one currently executing (which is uninterruptible)

**Signature**

```ts
export function uninterruptibleMask<E, A>(f: FunctionN<[InterruptMaskCutout<E, A>], Wave<E, A>>): Wave<E, A> { ... }
```

# withRuntime (function)

Access the runtime then provide it to the provided function

**Signature**

```ts
export function withRuntime<E, A>(f: FunctionN<[Runtime], Wave<E, A>>): Wave<E, A> { ... }
```

# zip (function)

Zip the result of two IOs together into a tuple type

**Signature**

```ts
export function zip<E, A, B>(first: Wave<E, A>, second: Wave<E, B>): Wave<E, readonly [A, B]> { ... }
```

# zipWith (function)

Zip the result of two IOs together using the provided function

**Signature**

```ts
export function zipWith<E, A, B, C>(first: Wave<E, A>, second: Wave<E, B>, f: FunctionN<[A, B], C>): Wave<E, C> { ... }
```
