---
title: waver.ts
nav_order: 22
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [FiberR (interface)](#fiberr-interface)
- [InterruptMaskCutout (type alias)](#interruptmaskcutout-type-alias)
- [ReturnContravaryR (type alias)](#returncontravaryr-type-alias)
- [ReturnCovaryE (type alias)](#returncovarye-type-alias)
- [URI (type alias)](#uri-type-alias)
- [WaveR (type alias)](#waver-type-alias)
- [URI (constant)](#uri-constant)
- [accessInterruptible (constant)](#accessinterruptible-constant)
- [accessRuntime (constant)](#accessruntime-constant)
- [encaseEither (constant)](#encaseeither-constant)
- [instances (constant)](#instances-constant)
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
- [contravaryR (function)](#contravaryr-function)
- [contravaryToR (function)](#contravarytor-function)
- [covaryE (function)](#covarye-function)
- [covaryToE (function)](#covarytoe-function)
- [delay (function)](#delay-function)
- [encaseFiber (function)](#encasefiber-function)
- [encaseOption (function)](#encaseoption-function)
- [encaseWave (function)](#encasewave-function)
- [encaseWaveR (function)](#encasewaver-function)
- [env (function)](#env-function)
- [flatten (function)](#flatten-function)
- [flip (function)](#flip-function)
- [foldExit (function)](#foldexit-function)
- [foldExitWith (function)](#foldexitwith-function)
- [forever (function)](#forever-function)
- [fork (function)](#fork-function)
- [fromPromise (function)](#frompromise-function)
- [interruptible (function)](#interruptible-function)
- [interruptibleMask (function)](#interruptiblemask-function)
- [interruptibleRegion (function)](#interruptibleregion-function)
- [map (function)](#map-function)
- [mapError (function)](#maperror-function)
- [mapErrorWith (function)](#maperrorwith-function)
- [mapWith (function)](#mapwith-function)
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
- [shiftAfter (function)](#shiftafter-function)
- [shiftAsyncAfter (function)](#shiftasyncafter-function)
- [shiftAsyncBefore (function)](#shiftasyncbefore-function)
- [shiftBefore (function)](#shiftbefore-function)
- [timeoutFold (function)](#timeoutfold-function)
- [timeoutOption (function)](#timeoutoption-function)
- [to (function)](#to-function)
- [uninterruptible (function)](#uninterruptible-function)
- [uninterruptibleMask (function)](#uninterruptiblemask-function)
- [zip (function)](#zip-function)
- [zipWith (function)](#zipwith-function)

---

# FiberR (interface)

**Signature**

```ts
export interface FiberR<E, A> {
  readonly name: Option<string>
  readonly interrupt: WaveR<{}, never, void>
  readonly wait: WaveR<{}, never, Exit<E, A>>
  readonly join: WaveR<{}, E, A>
  readonly result: WaveR<{}, E, Option<A>>
  readonly isComplete: WaveR<{}, never, boolean>
}
```

# InterruptMaskCutout (type alias)

**Signature**

```ts
export type InterruptMaskCutout<R, E, A> = FunctionN<[WaveR<R, E, A>], WaveR<R, E, A>>
```

# ReturnContravaryR (type alias)

**Signature**

```ts
export type ReturnContravaryR<T, R2> = T extends WaveR<infer R, infer E, infer A>
  ? (R2 extends R ? WaveR<R2, E, A> : WaveR<R & R2, E, A>)
  : never
```

# ReturnCovaryE (type alias)

**Signature**

```ts
export type ReturnCovaryE<T, E2> = T extends WaveR<infer R, infer E, infer A>
  ? (E extends E2 ? WaveR<R, E2, A> : WaveR<R, E | E2, A>)
  : never
```

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# WaveR (type alias)

**Signature**

```ts
export type WaveR<R, E, A> = (r: R) => Wave<E, A>
```

# URI (constant)

**Signature**

```ts
export const URI = ...
```

# accessInterruptible (constant)

**Signature**

```ts
export const accessInterruptible: WaveR<{}, never, boolean> = ...
```

# accessRuntime (constant)

**Signature**

```ts
export const accessRuntime: WaveR<{}, never, Runtime> = ...
```

# encaseEither (constant)

**Signature**

```ts
export const  = ...
```

# instances (constant)

**Signature**

```ts
export const instances: MonadThrow3<URI> = ...
```

# never (constant)

**Signature**

```ts
export const never: WaveR<{}, never, never> = ...
```

# parInstances (constant)

**Signature**

```ts
export const parInstances: Applicative3<URI> = ...
```

# raiseInterrupt (constant)

**Signature**

```ts
export const raiseInterrupt: WaveR<{}, never, never> = ...
```

# shifted (constant)

**Signature**

```ts
export const shifted: WaveR<{}, never, void> = ...
```

# shiftedAsync (constant)

**Signature**

```ts
export const shiftedAsync: WaveR<{}, never, void> = ...
```

# unit (constant)

**Signature**

```ts
export const unit: WaveR<{}, never, void> = ...
```

# after (function)

**Signature**

```ts
export function after(ms: number): WaveR<{}, never, void> { ... }
```

# ap (function)

**Signature**

```ts
export function ap<R, E, A, B>(wa: WaveR<R, E, A>, wf: WaveR<R, E, FunctionN<[A], B>>): WaveR<R, E, B> { ... }
```

# ap\_ (function)

**Signature**

```ts
export function ap_<R, E, A, B>( wf: WaveR<R, E, FunctionN<[A], B>>, wa: WaveR<R, E, A>): WaveR<R, E, B> { ... }
```

# applyFirst (function)

**Signature**

```ts
export function applyFirst<R, E, A, B>(first: WaveR<R, E, A>, second: WaveR<R, E, B>): WaveR<R, E, A> { ... }
```

# applySecond (function)

**Signature**

```ts
export function applySecond<R, E, A, B>(first: WaveR<R, E, A>, second: WaveR<R, E, B>): WaveR<R, E, B> { ... }
```

# applySecondL (function)

Evaluate two IOs in sequence and produce the value of the second.
This is suitable for cases where second is recursively defined

**Signature**

```ts
export function applySecondL<R, E, A, B>(first: WaveR<R, E, A>, second: Lazy<WaveR<R, E, B>>): WaveR<R, E, B> { ... }
```

# as (function)

**Signature**

```ts
export function as<R, E, A, B>(w: WaveR<R, E, A>, b: B): WaveR<R, E, B> { ... }
```

# asUnit (function)

**Signature**

```ts
export function asUnit<R, E, A>(w: WaveR<R, E, A>): WaveR<R, E, void> { ... }
```

# bimap (function)

**Signature**

```ts
export function bimap<R, E1, E2, A, B>(io: WaveR<R, E1, A>, leftMap: FunctionN<[E1], E2>, rightMap: FunctionN<[A], B>): WaveR<R, E2, B> { ... }
```

# bimapWith (function)

**Signature**

```ts
export function bimapWith<E1, E2, A, B>(leftMap: FunctionN<[E1], E2>,
    rightMap: FunctionN<[A], B>): <R>(w: WaveR<R, E1, A>) => WaveR<R, E2, B> { ... }
```

# bracket (function)

**Signature**

```ts
export function bracket<R, E, A, B>(acquire: WaveR<R, E, A>, release: FunctionN<[A], WaveR<R, E, unknown>>, use: FunctionN<[A], WaveR<R, E, B>>): WaveR<R, E, B> { ... }
```

# bracketExit (function)

**Signature**

```ts
export function bracketExit<R, E, A, B>(acquire: WaveR<R, E, A>, release: FunctionN<[A, Exit<E, B>], WaveR<R, E, unknown>>, use: FunctionN<[A], WaveR<R, E, B>>): WaveR<R, E, B> { ... }
```

# chain (function)

**Signature**

```ts
export function chain<R, E, A, B>(inner: WaveR<R, E, A>, bind: FunctionN<[A], WaveR<R, E, B>>): WaveR<R, E, B> { ... }
```

# chainError (function)

**Signature**

```ts
export function chainError<R, E1, E2, A>(w: WaveR<R, E1, A>, f: FunctionN<[E1], WaveR<R, E2, A>>): WaveR<R, E2, A> { ... }
```

# chainErrorWith (function)

**Signature**

```ts
export function chainErrorWith<R, E1, E2, A>(f: FunctionN<[E1], WaveR<R, E2, A>>): FunctionN<[WaveR<R, E1, A>], WaveR<R, E2, A>> { ... }
```

# chainTap (function)

**Signature**

```ts
export function chainTap<R, E, A>(base: WaveR<R, E, A>, bind: FunctionN<[A], WaveR<R, E, unknown>>): WaveR<R, E, A> { ... }
```

# chainTapWith (function)

**Signature**

```ts
export function chainTapWith<R, E, A>(bind: FunctionN<[A], WaveR<R, E, unknown>>): (inner: WaveR<R, E, A>) => WaveR<R, E, A> { ... }
```

# chainWith (function)

**Signature**

```ts
export function chainWith<R, E, Z, A>(bind: FunctionN<[Z], WaveR<R, E, A>>): FunctionN<[WaveR<R, E, Z>], WaveR<R, E, A>> { ... }
```

# completed (function)

**Signature**

```ts
export function completed<E, A>(exit: Exit<E, A>): WaveR<{}, E, A> { ... }
```

# contravaryR (function)

Perform a widening of WaveR<R, E, A> such that the result includes R2.

This encapsulates normal subtype widening, but will also widen to R1 & R2 as a fallback.
Assumes that this function (which does nothing when compiled to js) will be inlined in hot code.

**Signature**

```ts
export function contravaryR<R, E, A, R2>(wave: WaveR<R, E, A>): ReturnContravaryR<typeof wave, R2> { ... }
```

# contravaryToR (function)

**Signature**

```ts
export function contravaryToR<R2>(): <R1, E, A>(wave: WaveR<R1, E, A>) => ReturnContravaryR<typeof wave, R2>  { ... }
```

# covaryE (function)

Perform a widening of WaveR<R, E1, A> such that the result includes E2.

This encapsulates normal subtype widening, but will also widen to E1 | E2 as a fallback
Assumes that this function (which does nothing when compiled to js) will be inlined in hot code

**Signature**

```ts
export function covaryE<R, E1, A, E2>(wave: WaveR<R, E1, A>): ReturnCovaryE<typeof wave, E2> { ... }
```

# covaryToE (function)

Type inference helper form of covaryToE

**Signature**

```ts
export function covaryToE<E2>(): <R, E1, A>(wave: WaveR<R, E1, A>) => ReturnCovaryE<typeof wave, E2> { ... }
```

# delay (function)

**Signature**

```ts
export function delay<R, E, A>(inner: WaveR<R, E, A>, ms: number): WaveR<R, E, A> { ... }
```

# encaseFiber (function)

Lift a fiber in the WaveR context

**Signature**

```ts
export function encaseFiber<E, A>(fiber: Fiber<E, A>): FiberR<E, A> { ... }
```

# encaseOption (function)

**Signature**

```ts
export function encaseOption<E, A>(o: Option<A>, onError: Lazy<E>): WaveR<{}, E, A> { ... }
```

# encaseWave (function)

**Signature**

```ts
export function encaseWave<E, A>(w: Wave<E, A>): WaveR<{}, E, A> { ... }
```

# encaseWaveR (function)

**Signature**

```ts
export function encaseWaveR<R, E, A>(w: Wave<E, A>): WaveR<R, E, A> { ... }
```

# env (function)

**Signature**

```ts
export function env<R>(): WaveR<R, never, R> { ... }
```

# flatten (function)

**Signature**

```ts
export function flatten<R, E, A>(inner: WaveR<R, E, WaveR<R, E, A>>): WaveR<R, E, A> { ... }
```

# flip (function)

**Signature**

```ts
export function flip<R, E, A>(wa: WaveR<R, E, A>): WaveR<R, A, E> { ... }
```

# foldExit (function)

**Signature**

```ts
export function foldExit<R, E1, E2, A1, A2>(
    inner: WaveR<R, E1, A1>,
    failure: FunctionN<[Cause<E1>], WaveR<R, E2, A2>>,
    success: FunctionN<[A1], WaveR<R, E2, A2>>): WaveR<R, E2, A2> { ... }
```

# foldExitWith (function)

**Signature**

```ts
export function foldExitWith<R, E1, E2, A1, A2>(failure: FunctionN<[Cause<E1>], WaveR<R, E2, A2>>,
    success: FunctionN<[A1], WaveR<R, E2, A2>>): FunctionN<[WaveR<R, E1, A1>], WaveR<R, E2, A2>> { ... }
```

# forever (function)

**Signature**

```ts
export function forever<R, E, A>(wa: WaveR<R, E, A>): WaveR<R, E, A> { ... }
```

# fork (function)

**Signature**

```ts
export function fork<R, E, A>(wa: WaveR<R, E, A>, name?: string): WaveR<R, never, FiberR<E, A>> { ... }
```

# fromPromise (function)

**Signature**

```ts
export function fromPromise<R, A>(thunk: FunctionN<[R], Promise<A>>): WaveR<R, unknown, A> { ... }
```

# interruptible (function)

**Signature**

```ts
export function interruptible<R, E, A>(wa: WaveR<R, E, A>): WaveR<R, E, A> { ... }
```

# interruptibleMask (function)

**Signature**

```ts
export function interruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], WaveR<R, E, A>>): WaveR<R, E, A> { ... }
```

# interruptibleRegion (function)

**Signature**

```ts
export function interruptibleRegion<R, E, A>(inner: WaveR<R, E, A>, flag: boolean): WaveR<R, E, A> { ... }
```

# map (function)

**Signature**

```ts
export function map<R, E, A, B>(base: WaveR<R, E, A>, f: FunctionN<[A], B>): WaveR<R, E, B> { ... }
```

# mapError (function)

**Signature**

```ts
export function mapError<R, E1, E2, A>(io: WaveR<R, E1, A>, f: FunctionN<[E1], E2>): WaveR<R, E2, A> { ... }
```

# mapErrorWith (function)

**Signature**

```ts
export function mapErrorWith<E1, E2>(f: FunctionN<[E1], E2>): <R, A>(w: WaveR<R, E1, A>) => WaveR<R, E2, A> { ... }
```

# mapWith (function)

**Signature**

```ts
export function mapWith<A, B>(f: FunctionN<[A], B>): <R, E>(wave: WaveR<R, E, A>) => WaveR<R, E, B> { ... }
```

# onComplete (function)

**Signature**

```ts
export function onComplete<R, E, A>(wa: WaveR<R, E, A>, finalizer: WaveR<R, E, unknown>): WaveR<R, E, A> { ... }
```

# onInterrupted (function)

**Signature**

```ts
export function onInterrupted<R, E, A>(wa: WaveR<R, E, A>, finalizer: WaveR<R, E, unknown>): WaveR<R, E, A> { ... }
```

# orAbort (function)

**Signature**

```ts
export function orAbort<R, E, A>(ioa: WaveR<R, E, A>): WaveR<R, never, A> { ... }
```

# parAp (function)

**Signature**

```ts
export function parAp<R, E, A, B>(ioa: WaveR<R, E, A>, iof: WaveR<R, E, FunctionN<[A], B>>): WaveR<R, E, B> { ... }
```

# parAp\_ (function)

**Signature**

```ts
export function parAp_<R, E, A, B>(iof: WaveR<R, E, FunctionN<[A], B>>, ioa: WaveR<R, E, A>): WaveR<R, E, B> { ... }
```

# parApplyFirst (function)

**Signature**

```ts
export function parApplyFirst<R, E, A, B>(ioa: WaveR<R, E, A>, iob: WaveR<R, E, B>): WaveR<R, E, A> { ... }
```

# parApplySecond (function)

**Signature**

```ts
export function parApplySecond<R, E, A, B>(ioa: WaveR<R, E, A>, iob: WaveR<R, E, B>): WaveR<R, E, B> { ... }
```

# parZip (function)

**Signature**

```ts
export function parZip<R, E, A, B>(ioa: WaveR<R, E, A>, iob: WaveR<R, E, B>): WaveR<R, E, readonly [A, B]> { ... }
```

# parZipWith (function)

**Signature**

```ts
export function parZipWith<R, E, A, B, C>(io1: WaveR<R, E, A>, io2: WaveR<R, E, B>, f: FunctionN<[A, B], C>): WaveR<R, E, C { ... }
```

# pure (function)

**Signature**

```ts
export function pure<A>(a: A): WaveR<{}, never, A> { ... }
```

# race (function)

**Signature**

```ts
export function race<R, E, A>(io1: WaveR<R, E, A>, io2: WaveR<R, E, A>): WaveR<R, E, A> { ... }
```

# raceFirst (function)

**Signature**

```ts
export function raceFirst<R, E, A>(io1: WaveR<R, E, A>, io2: WaveR<R, E, A>): WaveR<R, E, A> { ... }
```

# raceFold (function)

**Signature**

```ts
export function raceFold<R, E1, E2, A, B, C>(first: WaveR<R, E1, A>, second: WaveR<R, E1, B>,
    onFirstWon: FunctionN<[Exit<E1, A>, FiberR<E1, B>], WaveR<R, E2, C>>,
    onSecondWon: FunctionN<[Exit<E1, B>, FiberR<E1, A>], WaveR<R, E2, C>>): WaveR<R, E2, C> { ... }
```

# raiseAbort (function)

**Signature**

```ts
export function raiseAbort(u: unknown): WaveR<{}, never, never> { ... }
```

# raiseError (function)

**Signature**

```ts
export function raiseError<E>(e: E): WaveR<{}, E, never> { ... }
```

# raised (function)

**Signature**

```ts
export function raised<E>(e: Cause<E>): WaveR<{}, E, never> { ... }
```

# result (function)

**Signature**

```ts
export function result<R, E, A>(wa: WaveR<R, E, A>): WaveR<R, never, Exit<E, A>> { ... }
```

# shiftAfter (function)

**Signature**

```ts
export function shiftAfter<R, E, A>(wa: WaveR<R, E, A>): WaveR<R, E, A> { ... }
```

# shiftAsyncAfter (function)

**Signature**

```ts
export function shiftAsyncAfter<R, E, A>(io: WaveR<R, E, A>): WaveR<R, E, A> { ... }
```

# shiftAsyncBefore (function)

**Signature**

```ts
export function shiftAsyncBefore<R, E, A>(io: WaveR<R, E, A>): WaveR<R, E, A> { ... }
```

# shiftBefore (function)

**Signature**

```ts
export function shiftBefore<R, E, A>(wa: WaveR<R, E, A>): WaveR<R, E, A> { ... }
```

# timeoutFold (function)

**Signature**

```ts
export function timeoutFold<R, E1, E2, A, B>(source: WaveR<R, E1, A>, ms: number, onTimeout: FunctionN<[FiberR<E1, A>], WaveR<R, E2, B>>, onCompleted: FunctionN<[Exit<E1, A>], WaveR<R, E2, B>>): WaveR<R, E2, B> { ... }
```

# timeoutOption (function)

**Signature**

```ts
export function timeoutOption<R, E, A>(source: WaveR<R, E, A>, ms: number): WaveR<R, E, Option<A>> { ... }
```

# to (function)

**Signature**

```ts
export function to<B>(b: B): <R, E, A>(w: WaveR<R, E, A>) => WaveR<R, E, B> { ... }
```

# uninterruptible (function)

**Signature**

```ts
export function uninterruptible<R, E, A>(wa: WaveR<R, E, A>): WaveR<R, E, A> { ... }
```

# uninterruptibleMask (function)

**Signature**

```ts
export function uninterruptibleMask<R, E, A>(f: FunctionN<[InterruptMaskCutout<R, E, A>], WaveR<R, E, A>>): WaveR<R, E, A> { ... }
```

# zip (function)

**Signature**

```ts
export function zip<R, E, A, B>(first: WaveR<R, E, A>, second: WaveR<R, E, B>): WaveR<R, E, readonly [A, B]> { ... }
```

# zipWith (function)

**Signature**

```ts
export function zipWith<R, E, A, B, C>(first: WaveR<R, E, A>, second: WaveR<R, E, B>, f: FunctionN<[A, B], C>): WaveR<R, E, C> { ... }
```
